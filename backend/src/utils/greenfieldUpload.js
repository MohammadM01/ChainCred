const { Client } = require('@bnb-chain/greenfield-js-sdk');
const fs = require('fs');
const path = require('path');

/**
 * Utility to upload files or buffers to BNB Greenfield testnet.
 * Initializes SDK with testnet URL and chain ID.
 * For Node.js: Uses ECDSA auth with private key from GREENFIELD_API_KEY (assume it's the private key).
 * MVP Assumption: Uses a pre-created bucket (e.g., 'chaincred-bucket'). Handle bucket creation if needed in production.
 * Uploads object and returns { url, hash }.
 * Error handling: Throws errors for MVP; log and return in production.
 * Note: Greenfield requires creating object on-chain first, then uploading payload.
 */
const uploadToGreenfield = async (filePathOrBuffer, objectName, isMetadata = false) => {
  const GREENFIELD_RPC = 'https://gnfd-testnet-fullnode-tendermint-ap.bnbchain.org'; // Testnet RPC
  const GREENFIELD_CHAIN_ID = '5600'; // Testnet chain ID
  const PRIVATE_KEY = process.env.GREENFIELD_API_KEY; // Treat as private key for ECDSA

  if (!PRIVATE_KEY) {
    throw new Error('GREENFIELD_API_KEY (private key) is required');
  }

  const client = Client.create(GREENFIELD_RPC, GREENFIELD_CHAIN_ID);

  const bucketName = 'chaincred-bucket'; // MVP: Assume pre-created bucket; add creation logic if needed

  let body;
  let contentType = 'application/octet-stream';
  if (Buffer.isBuffer(filePathOrBuffer)) {
    body = filePathOrBuffer;
    contentType = isMetadata ? 'application/json' : 'application/pdf';
  } else {
    // Assume filePath
    body = fs.readFileSync(filePathOrBuffer);
  }

  // Step 1: Create object on-chain (broadcast tx)
  const createObjectTx = await client.object.createObject({
    bucketName,
    objectName,
    creator: '0xYourCreatorAddress', // MVP: Replace with issuer wallet or derive from private key
    visibility: 'VISIBILITY_TYPE_PUBLIC_READ',
    fileType: contentType,
    redundancyType: 'REDUNDANCY_EC_TYPE',
    contentLength: body.length,
    expectCheckSums: [], // Compute if needed
  }, {
    type: 'ECDSA',
    privateKey: PRIVATE_KEY,
  });

  const simulateInfo = await createObjectTx.simulate({ denom: 'BNB' });
  const broadcastRes = await createObjectTx.broadcast({
    denom: 'BNB',
    gasLimit: Number(simulateInfo?.gasLimit),
    gasPrice: simulateInfo?.gasPrice || '5000000000',
    payer: '0xPayerAddress', // MVP: Use issuer or from env
    granter: '',
  });

  if (broadcastRes.code !== 0) {
    throw new Error('Failed to create object on Greenfield');
  }

  // Step 2: Upload the actual payload
  const uploadRes = await client.object.uploadObject({
    bucketName,
    objectName,
    body,
    txnHash: broadcastRes.transactionHash,
  }, {
    type: 'ECDSA',
    privateKey: PRIVATE_KEY,
  });

  if (uploadRes.code !== 0) {
    throw new Error('Failed to upload to Greenfield');
  }

  // Construct URL (public read assumed)
  const url = `https://gnfd-testnet-sp1.bnbchain.org/view/${bucketName}/${objectName}`; // Adjust based on SP

  // Hash: Compute SHA256 of body for verification
  const crypto = require('crypto');
  const hash = crypto.createHash('sha256').update(body).digest('hex');

  return { url, hash };
};

module.exports = { uploadToGreenfield };
