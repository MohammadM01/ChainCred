const Certificate = require('../models/Certificate');
const User = require('../models/User');

/**
 * Certificate controller for ChainCred.
 * Handles fetching certificates for dashboards and verification.
 * NEW: Now serves PDFs directly from MongoDB instead of local files.
 */

// GET /api/certificates/student/:wallet
const getStudentCertificates = async (req, res) => {
  try {
    const { wallet } = req.params;
    
    if (!wallet) {
      return res.status(400).json({ success: false, error: 'Student wallet address is required' });
    }

    const certificates = await Certificate.find({ 
      studentWallet: wallet.toLowerCase() 
    }).sort({ createdAt: -1 });

    console.log(`Found ${certificates.length} certificates for student ${wallet}`);

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching student certificates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/certificates/institute/:wallet
const getInstituteCertificates = async (req, res) => {
  try {
    const { wallet } = req.params;
    
    if (!wallet) {
      return res.status(400).json({ success: false, error: 'Institute wallet address is required' });
    }

    const certificates = await Certificate.find({ 
      issuerWallet: wallet.toLowerCase() 
    }).sort({ createdAt: -1 });

    console.log(`Found ${certificates.length} certificates issued by institute ${wallet}`);

    res.json({
      success: true,
      data: certificates
    });
  } catch (error) {
    console.error('Error fetching institute certificates:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/certificates/:id
const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const certificate = await Certificate.findById(id);
    
    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    res.json({
      success: true,
      data: certificate
    });
  } catch (error) {
    console.error('Error fetching certificate by ID:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// NEW: GET /api/certificates/:id/pdf - Serve PDF directly from MongoDB
const getCertificatePDF = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);
    if (!certificate || !certificate.pdfBuffer) {
      return res.status(404).json({ success: false, error: 'PDF not found in database' });
    }
    res.set({
      'Content-Type': certificate.pdfContentType || 'application/pdf',
      'Content-Length': certificate.pdfBuffer.length,
      'Content-Disposition': `inline; filename="certificate-${certificate.certificateID}.pdf"`,
      'Cache-Control': 'public, max-age=3600',
    });
    res.send(certificate.pdfBuffer);
    console.log(`Served PDF for certificate ${certificate.certificateID} (${certificate.pdfBuffer.length} bytes)`);
  } catch (error) {
    console.error('Error serving PDF:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

const getCertificateMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findById(id);
    if (!certificate || !certificate.metadataBuffer) {
      return res.status(404).json({ success: false, error: 'Metadata not found in database' });
    }
    res.set({
      'Content-Type': certificate.metadataContentType || 'application/json',
      'Content-Length': certificate.metadataBuffer.length,
      'Content-Disposition': `inline; filename="metadata-${certificate.certificateID}.json"`,
      'Cache-Control': 'public, max-age=3600',
    });
    res.send(certificate.metadataBuffer);
    console.log(`Served metadata for certificate ${certificate.certificateID} (${certificate.metadataBuffer.length} bytes)`);
  } catch (error) {
    console.error('Error serving metadata:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
};

// GET /api/certificates/verify/:tokenId
const verifyCertificate = async (req, res) => {
  try {
    const { tokenId } = req.params;
    
    const certificate = await Certificate.findOne({ tokenId: parseInt(tokenId) });
    
    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    // Check if certificate is minted
    if (!certificate.tokenId || !certificate.txHash) {
      return res.status(400).json({ success: false, error: 'Certificate not yet minted on blockchain' });
    }

    res.json({
      success: true,
      data: {
        certificateID: certificate.certificateID,
        studentWallet: certificate.studentWallet,
        issuerWallet: certificate.issuerWallet,
        tokenId: certificate.tokenId,
        txHash: certificate.txHash,
        mintedAt: certificate.mintedAt,
        fileUrl: certificate.fileUrl,
        metadataUrl: certificate.metadataUrl,
        fileHash: certificate.fileHash,
        issuedDate: certificate.issuedDate,
        verified: true
      }
    });
  } catch (error) {
    console.error('Error verifying certificate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// DELETE /api/certificates/:id
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const { wallet } = req.body; // Student wallet for verification
    
    if (!id || !wallet) {
      return res.status(400).json({ success: false, error: 'Certificate ID and student wallet are required' });
    }

    // Find the certificate
    const certificate = await Certificate.findById(id);
    
    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    // Verify that the student owns this certificate
    if (certificate.studentWallet.toLowerCase() !== wallet.toLowerCase()) {
      return res.status(403).json({ success: false, error: 'You can only delete your own certificates' });
    }

    // Check if certificate is already minted on blockchain
    if (certificate.tokenId && certificate.txHash) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete certificates that are already minted on blockchain' 
      });
    }

    // Delete the certificate
    await Certificate.findByIdAndDelete(id);
    
    console.log(`Certificate ${id} deleted by student ${wallet}`);

    res.json({
      success: true,
      message: 'Certificate deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting certificate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getStudentCertificates,
  getInstituteCertificates,
  getCertificateById,
  getCertificatePDF,
  getCertificateMetadata,
  verifyCertificate,
  deleteCertificate
};
