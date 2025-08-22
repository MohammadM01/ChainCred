const multer = require('multer');
const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { uploadToGreenfield } = require('../utils/greenfieldUpload');
const { generateMetadata } = require('../utils/generateMetadata');
const ethers = require('ethers');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

/**
 * Upload controller for ChainCred (institute only).
 * Handles PDF upload via multipart/form-data.
 * Flow: Check role, save PDF locally, generate metadata, save metadata JSON locally, save to DB.
 * Returns { metadataUrl, fileHash, certificateID }.
 * Multer config: In-memory storage for buffer handling.
 * Security: Role check from DB; validate addresses.
 * Note: Assumes file is PDF; add validation if needed for MVP.
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

    // Generate unique certificate ID
    const certificateID = crypto.randomBytes(32).toString('hex');
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Save PDF file locally
    const pdfFileName = `${certificateID}.pdf`;
    const pdfFilePath = path.join(uploadsDir, pdfFileName);
    fs.writeFileSync(pdfFilePath, req.file.buffer);
    
    // Generate local file URL
    const fileUrl = `${req.protocol}://${req.get('host')}/files/${pdfFileName}`;
    const fileHash = crypto.createHash('sha256').update(req.file.buffer).digest('hex');

    // Generate metadata
    const metadata = generateMetadata(studentWallet.toLowerCase(), issuerWallet.toLowerCase(), fileUrl, fileHash, certificateID);

    // Save metadata JSON locally
    const metadataFileName = `${certificateID}.json`;
    const metadataFilePath = path.join(uploadsDir, metadataFileName);
    const metadataBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    fs.writeFileSync(metadataFilePath, metadataBuffer);
    
    // Generate local metadata URL
    const metadataUrl = `${req.protocol}://${req.get('host')}/files/${metadataFileName}`;

    // Save to DB
    const certificate = new Certificate({
      certificateID: metadata.certificateID,
      studentWallet: studentWallet.toLowerCase(),
      issuerWallet: issuerWallet.toLowerCase(),
      fileUrl,
      metadataUrl,
      fileHash,
      issuedDate: new Date(metadata.issuedDateISO),
      status: 'pending'
    });
    await certificate.save();

    console.log('Certificate saved to database:', certificate._id);
    console.log('PDF saved locally:', pdfFilePath);
    console.log('Metadata saved locally:', metadataFilePath);

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
