const fs = require('fs');
const crypto = require('crypto');
const greenfieldSDK = require('@bnb-chain/greenfield-js-sdk');
const { ethers } = require('ethers');

const uploadToGreenfield = async (filePathOrBuffer, objectName, isMetadata = false) => {
  try {
    const body = Buffer.isBuffer(filePathOrBuffer)
      ? filePathOrBuffer
      : fs.readFileSync(filePathOrBuffer);

    const uniqueName = `${Date.now()}-${objectName}`;

    const bucketName = process.env.GREENFIELD_BUCKET_NAME;
    const privateKey = process.env.GREENFIELD_API_KEY;
    const grpcUrl = process.env.GNFD_GRPC_URL;
    const chainId = process.env.GNFD_CHAIN_ID;
    const domain = process.env.PUBLIC_BASE_URL;

    if (!bucketName || !privateKey) {
      throw new Error('GREENFIELD_BUCKET_NAME and GREENFIELD_API_KEY are required');
    }

    const Client = greenfieldSDK.Client;
    const VisibilityType = greenfieldSDK.StorageEnums.VisibilityType;
    const client = Client.create(grpcUrl, chainId);

    // EVM wallet for signing
    const wallet = new ethers.Wallet(privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`);
    const address = wallet.address;

    // Generate off-chain auth key (required for upload)
    const offchainKey = await client.offchainauth.genOffChainAuthKeyPairAndUpload({
      sps: { address, endpoint: grpcUrl }, // simple SP info
      chainId,
      expirationMs: 5 * 24 * 60 * 60 * 1000,
      domain,
      address,
    }, wallet);

    // Check if bucket exists (now that headBucket method works)
    try {
      console.log('Checking if bucket exists...');
      await client.bucket.headBucket({ bucketName });
      console.log('Bucket exists, proceeding with upload...');
    } catch (bucketError) {
      console.log('Bucket does not exist, creating it first...');
      
      // Create bucket if it doesn't exist
      const createBucketTx = await client.bucket.createBucket({
        bucketName,
        creator: address,
        visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
        primarySpAddress: '0x89A1F4e9E821225c2FDC98d192eaf4D1261E0c420b', // Use the correct testnet SP address from DCellar
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
      
      console.log('Bucket created successfully');
    }

    // Now that we have the working SDK, use the correct methods
    console.log('Creating object with working SDK methods...');
    const createObjectTx = await client.object.createObject({
      bucketName,
      objectName: uniqueName,
      creator: address,
      visibility: VisibilityType.VISIBILITY_TYPE_PUBLIC_READ,
      contentType: isMetadata ? 'application/json' : 'application/pdf',
      payloadSize: body.length,
    });

    console.log('Object creation transaction created, simulating...');
    const sim = await createObjectTx.simulate({ denom: 'BNB' });
    
    console.log('Broadcasting object creation transaction...');
    const createRes = await createObjectTx.broadcast({
      denom: 'BNB',
      gasLimit: Number(sim?.gasLimit || 2_000_000),
      gasPrice: sim?.gasPrice || '5000000000',
      payer: address,
      granter: '',
    });

    console.log('Object creation transaction broadcasted:', createRes.transactionHash);

    // Upload object using the off-chain key and transaction hash
    console.log('Uploading object...');
    await client.object.uploadObject({
      bucketName,
      objectName: uniqueName,
      body,
      txnHash: createRes.transactionHash,
    }, {
      type: 'EDDSA',
      domain,
      seed: offchainKey.seedString,
      address,
    });
    
    console.log('Object uploaded successfully');

    // Use the storage provider endpoint for the public URL, not the gRPC URL
    const spEndpoint = 'https://gnfd-testnet-sp1.bnbchain.org';
    const url = `${spEndpoint}/view/${bucketName}/${encodeURIComponent(uniqueName)}`;
    const hash = crypto.createHash('sha256').update(body).digest('hex');

    console.log('Greenfield upload successful:', url);
    return { url, hash };

  } catch (error) {
    console.error('Greenfield upload error:', error);
    throw new Error(`Greenfield upload failed: ${error.message}`);
  }
};

module.exports = { uploadToGreenfield };
