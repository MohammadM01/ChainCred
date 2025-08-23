const mongoose = require('mongoose');

/**
 * Certificate model for ChainCred.
 * Stores credential details: certificateID (hash), wallets, URLs from Greenfield, hash, date, and tokenId from opBNB.
 * Used in upload, mint, and verify flows.
 * Validation: All fields required except tokenId (added during mint).
 * 
 * NEW: PDFs are now stored directly in MongoDB as Buffer for easier deployment
 */
const certificateSchema = new mongoose.Schema({
  certificateID: {
    type: String,
    required: true,
    unique: true,
  },
  studentWallet: {
    type: String,
    required: true,
    lowercase: true,
  },
  issuerWallet: {
    type: String,
    required: true,
    lowercase: true,
  },
  fileUrl: {
    type: String,
    required: false, // Made optional since we now store PDFs in MongoDB
  },
  pdfBuffer: {
    type: Buffer,
    required: true, // NEW: Store PDF data directly in MongoDB
  },
  pdfContentType: {
    type: String,
    default: 'application/pdf', // NEW: Store content type
  },
  metadataUrl: {
    type: String,
    required: false, // Made optional since we now store metadata in MongoDB
  },
  metadataBuffer: {
    type: Buffer,
    required: true, // NEW: Store metadata directly in MongoDB
  },
  metadataContentType: {
    type: String,
    default: 'application/json', // NEW: Store metadata content type
  },
  fileHash: {
    type: String,
    required: true,
  },
  issuedDate: {
    type: Date,
    required: true,
  },
  tokenId: {
    type: Number,
    default: null, // Updated during mint
  },
  txHash: {
    type: String,
    default: null, // Transaction hash from minting
  },
  mintedAt: {
    type: Date,
    default: null, // When the certificate was minted
  },
  status: {
    type: String,
    enum: ['pending', 'minted', 'verified'],
    default: 'pending'
  },
}, { timestamps: true });

module.exports = mongoose.model('Certificate', certificateSchema);
