const multer = require('multer');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { smartUpload } = require('../utils/smartUpload');
const { generateMetadata } = require('../utils/generateMetadata');
const { ethers } = require('ethers');
const crypto = require('crypto');

/**
 * Upload controller for ChainCred (institute only).
 * Handles PDF upload via multipart/form-data.
 * Flow: Check role, store PDF in MongoDB, generate metadata, upload metadata JSON, save to DB.
 * Returns { metadataUrl, fileHash, certificateID }.
 * Multer config: In-memory storage for buffer handling.
 * Security: Role check from DB; validate addresses.
 * Note: PDFs are now stored directly in MongoDB for easier deployment.
 */

const upload = multer({ storage: multer.memoryStorage() });

// POST /api/upload
const uploadCertificate = async (req, res) => {
  try {
    // Assume issuerWallet is from authenticated user; for MVP, passed in body
    const { studentWallet, issuerWallet } = req.body;

    if (!req.file || !studentWallet || !issuerWallet) {
      return res.status(400).json({ success: false, error: 'File, studentWallet, and issuerWallet are required' });
    }

    if (!ethers.isAddress(studentWallet) || !ethers.isAddress(issuerWallet)) {
      return res.status(400).json({ success: false, error: 'Invalid EVM wallet addresses' });
    }

    // Check if issuer has 'institute' role
    const issuer = await User.findOne({ wallet: issuerWallet.toLowerCase() });
    if (!issuer || issuer.role !== 'institute') {
      return res.status(403).json({ success: false, error: 'Only institutes can upload' });
    }

    // Get student user info for name
    const student = await User.findOne({ wallet: studentWallet.toLowerCase() });
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    // Validate that uploaded file is a PDF
    if (req.file.mimetype !== 'application/pdf') {
      return res.status(400).json({ success: false, error: 'Only PDF files are allowed' });
    }

    // Generate file hash and certificate ID
    const fileHash = crypto.createHash('md5').update(req.file.buffer).digest('hex');
    const certificateID = crypto.createHash('sha256').update(`${studentWallet}${issuerWallet}${fileHash}${Date.now()}`).digest('hex');

    // Generate metadata with names
    const metadata = generateMetadata(
      studentWallet.toLowerCase(),
      issuerWallet.toLowerCase(),
      `mongodb://${certificateID}`, // Placeholder URL since PDF is now in MongoDB
      fileHash,
      student.name,
      issuer.name
    );

    // Store metadata directly in MongoDB instead of using smartUpload
    const metadataBuffer = Buffer.from(JSON.stringify(metadata));
    const metadataUrl = `mongodb://${certificateID}`; // Placeholder URL for backward compatibility

    const certificate = new Certificate({
      certificateID: metadata.certificateID,
      studentWallet: studentWallet.toLowerCase(),
      issuerWallet: issuerWallet.toLowerCase(),
      fileUrl: `mongodb://${certificateID}`, // Placeholder URL for backward compatibility
      pdfBuffer: req.file.buffer, // NEW: Store PDF data directly in MongoDB
      pdfContentType: req.file.mimetype,
      metadataUrl, // Placeholder URL for backward compatibility
      metadataBuffer, // NEW: Store metadata directly in MongoDB
      metadataContentType: 'application/json',
      fileHash,
      issuedDate: new Date(metadata.issuedDateISO),
      status: 'pending'
    });
    await certificate.save();

    console.log('Certificate saved to database with PDF buffer:', certificate._id);

    res.json({
      success: true,
      data: { metadataUrl, fileHash, certificateID: metadata.certificateID },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { upload, uploadCertificate };
