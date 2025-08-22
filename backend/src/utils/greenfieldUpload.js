const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Greenfield upload utility with two modes:
 * - Local fallback: GREENFIELD_USE_LOCAL=true saves under backend/uploads and serves via /files
 * - Real SDK: uses @bnb-chain/greenfield-js-sdk to create bucket/object and upload with PUBLIC_READ
 */
const uploadToGreenfield = async (filePathOrBuffer, objectName, isMetadata = false) => {
  try {
    // Debug environment variables
    console.log('Environment check:', {
      GREENFIELD_USE_LOCAL: process.env.GREENFIELD_USE_LOCAL,
      GREENFIELD_BUCKET_NAME: process.env.GREENFIELD_BUCKET_NAME ? 'SET' : 'NOT SET',
      GREENFIELD_API_KEY: process.env.GREENFIELD_API_KEY ? 'SET' : 'NOT SET',
      PORT: process.env.PORT,
      PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL
    });

    const body = Buffer.isBuffer(filePathOrBuffer) ? filePathOrBuffer : fs.readFileSync(filePathOrBuffer);
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${objectName}`;

    // Check if we should use local fallback (default to true if not set)
    const useLocal = process.env.GREENFIELD_USE_LOCAL !== 'false';
    
    if (useLocal) {
      console.log('Using local fallback for file upload');
      
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
        console.log('Created uploads directory:', uploadsDir);
      }

      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, body);
      console.log('File saved locally:', filePath);

      const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const publicUrl = `${base}/files/${encodeURIComponent(uniqueName)}`;

      const hash = crypto.createHash('sha256').update(body).digest('hex');
      console.log('Local upload successful:', { url: publicUrl, hash });
      
      return { url: publicUrl, hash };
    }

    // Only try to use real Greenfield SDK if not using local fallback
    console.log('Attempting real Greenfield SDK upload...');
    
    // Check if required environment variables are set
    const bucketName = process.env.GREENFIELD_BUCKET_NAME;
    const privateKey = process.env.GREENFIELD_API_KEY;
    
    if (!bucketName || !privateKey) {
      throw new Error('GREENFIELD_BUCKET_NAME and GREENFIELD_API_KEY are required for real Greenfield upload');
    }

    // Real Greenfield SDK path (ESM). Node needs --experimental-specifier-resolution=node for subpath resolution
    const { Client, VisibilityType, RedundancyType } = await import('@bnb-chain/greenfield-js-sdk');
    const LongMod = await import('long');
    const Long = LongMod.default || LongMod;
    const { ReedSolomon } = await import('@bnb-chain/reed-solomon');
    const { ethers } = require('ethers');

    const grpcUrl = process.env.GNFD_GRPC_URL || 'https://gnfd-testnet-sp1.bnbchain.org';
    const chainId = process.env.GNFD_CHAIN_ID ? Number(process.env.GNFD_CHAIN_ID) : 5600;

    const client = Client.create(grpcUrl, chainId);

    // Pick an SP (prefer sp1)
    const spList = await client.sp.getStorageProviders();
    const sps = spList?.body?.sps || [];
    if (!sps.length) throw new Error('No storage providers available');
    const sp = sps.find((s) => (s.endpoint || '').includes('gnfd-testnet-sp1')) || sps[0];

    // EVM signer
    const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
    const address = wallet.address;

    // Off-chain auth keypair upload
    const offchain = await client.offchainauth.genOffChainAuthKeyPairAndUpload({
      sps: { address: sp.operatorAddress, endpoint: sp.endpoint },
      chainId,
      expirationMs: 5 * 24 * 60 * 60 * 1000,
      domain: process.env.PUBLIC_BASE_URL || 'http://localhost',
      address,
    }, wallet);

    // Ensure bucket exists (PUBLIC_READ)
    try {
      await client.bucket.headBucket({ bucketName });
    } catch (_) {
      const createBucketTx = await client.bucket.createBucket({
        bucketName,
        creator: address,
        visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
        chargedReadQuota: Long.fromString('0'),
        primarySpAddress: sp.operatorAddress,
        paymentAddress: address,
      });
      const sim = await createBucketTx.simulate({ denom: 'BNB' });
      await createBucketTx.broadcast({
        denom: 'BNB',
        gasLimit: Number(sim?.gasLimit || 2_000_000),
        gasPrice: sim?.gasPrice || '5000000000',
        payer: address,
        granter: '',
      });
    }

    // Prepare checksums
    const rs = new ReedSolomon();
    const expectChecksumsBase64 = rs.encode(new Uint8Array(body));
    const expectChecksums = expectChecksumsBase64.map((b64) => Uint8Array.from(Buffer.from(b64, 'base64')));

    const contentType = isMetadata ? 'application/json' : 'application/pdf';

    const createObjectTx = await client.object.createObject({
      bucketName,
      objectName: uniqueName,
      creator: address,
      visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      contentType,
      redundancyType: RedundancyType.REDUNDANCY_EC_TYPE,
      payloadSize: Long.fromInt(body.length),
      expectChecksums,
    });
    const sim2 = await createObjectTx.simulate({ denom: 'BNB' });
    const createRes = await createObjectTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(sim2?.gasLimit || 2_000_000),
      gasPrice: sim2?.gasPrice || '5000000000',
      payer: address,
      granter: '',
    });

    await client.object.uploadObject({
      bucketName,
      objectName: uniqueName,
      body,
      txnHash: createRes.transactionHash,
    }, {
      type: 'EDDSA',
      domain: process.env.PUBLIC_BASE_URL || 'http://localhost',
      seed: offchain.seedString,
      address,
    });

    const baseEndpoint = (sp.endpoint || grpcUrl).replace(/\/$/, '');
    const url = `${baseEndpoint}/view/${bucketName}/${encodeURIComponent(uniqueName)}`;
    const hash = crypto.createHash('sha256').update(body).digest('hex');
    
    console.log('Real Greenfield upload successful:', { url, hash });
    return { url, hash };
  } catch (error) {
    console.error('Greenfield upload error:', error);
    
    // Always try to use local storage as a fallback
    console.log('Falling back to local storage due to Greenfield SDK error...');
    
    try {
      const body = Buffer.isBuffer(filePathOrBuffer) ? filePathOrBuffer : fs.readFileSync(filePathOrBuffer);
      const timestamp = Date.now();
      const uniqueName = `${timestamp}-${objectName}`;
      
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, body);

      const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const publicUrl = `${base}/files/${encodeURIComponent(uniqueName)}`;

      const hash = crypto.createHash('sha256').update(body).digest('hex');
      console.log('Fallback local upload successful:', { url: publicUrl, hash });
      
      return { url: publicUrl, hash };
    } catch (fallbackError) {
      console.error('Fallback local upload also failed:', fallbackError);
      throw new Error(`Both Greenfield and local upload failed. Greenfield error: ${error.message}, Local error: ${fallbackError.message}`);
    }
  }
};

module.exports = { uploadToGreenfield };
