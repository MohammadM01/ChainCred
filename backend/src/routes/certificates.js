const express = require('express');
const router = express.Router();
const {
  getStudentCertificates,
  getInstituteCertificates,
  getCertificateById,
  getCertificatePDF,
  getCertificateMetadata,
  verifyCertificate,
  deleteCertificate
} = require('../controllers/certificateController');

// Get all certificates for a student
router.get('/student/:wallet', getStudentCertificates);

// Get all certificates issued by an institute
router.get('/institute/:wallet', getInstituteCertificates);

// Get a specific certificate by ID
router.get('/:id', getCertificateById);

// Get PDF content for a certificate (NEW: serves PDFs from MongoDB)
router.get('/:id/pdf', getCertificatePDF);

// Get metadata content for a certificate (NEW: serves metadata from MongoDB)
router.get('/:id/metadata', getCertificateMetadata);

// Verify a certificate by tokenId
router.get('/verify/:tokenId', verifyCertificate);

// Delete a certificate by ID
router.delete('/:id', deleteCertificate);

module.exports = router;
