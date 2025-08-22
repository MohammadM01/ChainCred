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
    const body = Buffer.isBuffer(filePathOrBuffer) ? filePathOrBuffer : fs.readFileSync(filePathOrBuffer);
    const timestamp = Date.now();
    const uniqueName = `${timestamp}-${objectName}`;

    if (process.env.GREENFIELD_USE_LOCAL === 'true') {
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads');
      if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

      const filePath = path.join(uploadsDir, uniqueName);
      fs.writeFileSync(filePath, body);

      const base = process.env.PUBLIC_BASE_URL || `http://localhost:${process.env.PORT || 5000}`;
      const publicUrl = `${base}/files/${encodeURIComponent(uniqueName)}`;

      const hash = crypto.createHash('sha256').update(body).digest('hex');
      return { url: publicUrl, hash };
    }

    // Real Greenfield SDK path (ESM). Node needs --experimental-specifier-resolution=node for subpath resolution
    const { Client, VisibilityType, RedundancyType } = await import('@bnb-chain/greenfield-js-sdk');
    const LongMod = await import('long');
    const Long = LongMod.default || LongMod;
    const { ReedSolomon } = await import('@bnb-chain/reed-solomon');
    const { ethers } = require('ethers');

    const grpcUrl = process.env.GNFD_GRPC_URL || 'https://gnfd-testnet-sp1.bnbchain.org';
    const chainId = process.env.GNFD_CHAIN_ID ? Number(process.env.GNFD_CHAIN_ID) : 5600;
    const bucketName = process.env.GREENFIELD_BUCKET_NAME;
    const privateKey = process.env.GREENFIELD_API_KEY;
    if (!bucketName || !privateKey) {
      throw new Error('GREENFIELD_BUCKET_NAME and GREENFIELD_API_KEY are required');
    }

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
    return { url, hash };
  } catch (error) {
    console.error('Mock Greenfield upload error:', error);
    throw new Error(`Mock Greenfield upload failed: ${error.message}`);
  }
};

module.exports = { uploadToGreenfield };
