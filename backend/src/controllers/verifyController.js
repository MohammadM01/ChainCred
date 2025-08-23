const Certificate = require('../models/Certificate');
const { verify, getTokenURI } = require('../utils/opbnbInteract');
const crypto = require('crypto');
const axios = require('axios'); // For fetching metadata; install if needed
const User = require('../models/User'); // Added for user names

/**
 * Verify controller for ChainCred (public).
 * Verifies by certificateID or studentWallet.
 * Flow: Fetch from DB, check chain ownership/tokenURI, fetch metadata from Greenfield, recompute/match hash.
 * Returns { valid, details }.
 * Note: Uses axios to fetch metadata; add npm install axios if not present.
 * For MVP: Assumes public read on Greenfield URLs.
 */

// GET /api/verify
const verifyCertificate = async (req, res) => {
  try {
    const { certificateID, studentWallet, issuerWallet, tokenId } = req.query;

    if (!certificateID && !studentWallet && !tokenId) {
      return res.status(400).json({ success: false, error: 'certificateID, studentWallet, or tokenId is required' });
    }

    let certificate;
    if (certificateID) {
      certificate = await Certificate.findOne({ certificateID });
    } else if (studentWallet) {
      certificate = await Certificate.findOne({ studentWallet: studentWallet.toLowerCase() });
    } else if (tokenId) {
      certificate = await Certificate.findOne({ tokenId: parseInt(tokenId) });
    }

    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found' });
    }

    const { studentWallet: dbStudent, fileHash, issuedDate } = certificate;
    
    // For MVP: Allow verification of unminted certificates
    // In production, you might want to require tokenId
    if (certificate.tokenId) {
      // Certificate is minted - perform blockchain verification
      try {
        // Check on-chain ownership
        const isOwner = await verify(dbStudent, certificate.tokenId);
        if (!isOwner) {
          return res.json({ success: true, data: { valid: false, details: 'Ownership mismatch on chain' } });
        }

        // Check tokenURI matches metadataUrl (if available)
        if (certificate.metadataUrl && !certificate.metadataUrl.includes('mongodb://')) {
          const chainMetadataUrl = await getTokenURI(certificate.tokenId);
          if (chainMetadataUrl !== certificate.metadataUrl) {
            return res.json({ success: true, data: { valid: false, details: 'Metadata URL mismatch on chain' } });
          }
        }
      } catch (blockchainError) {
        console.error('Blockchain verification error:', blockchainError);
        // Continue with database verification even if blockchain check fails
      }
    }

    // Fetch metadata from MongoDB buffer instead of external URL
    let fetchedMetadata;
    if (certificate.metadataBuffer) {
      try {
        fetchedMetadata = JSON.parse(certificate.metadataBuffer.toString());
      } catch (parseError) {
        console.error('Error parsing metadata buffer:', parseError);
        return res.status(500).json({ success: false, error: 'Invalid metadata format' });
      }
    } else {
      // Fallback: create basic metadata from certificate fields
      fetchedMetadata = {
        certificateID: certificate.certificateID,
        studentWallet: dbStudent,
        issuerWallet: certificate.issuerWallet,
        fileHash: fileHash,
        issuedDateISO: issuedDate.toISOString(),
        note: 'Metadata generated from certificate fields'
      };
    }

    // Get user names for better UX
    const studentUser = await User.findOne({ wallet: dbStudent.toLowerCase() });
    const issuerUser = await User.findOne({ wallet: certificate.issuerWallet.toLowerCase() });

    // Recompute hash to verify certificate integrity
    const recomputedID = crypto
      .createHash('sha256')
      .update(dbStudent + certificate.issuerWallet + fileHash + issuedDate.toISOString())
      .digest('hex');

    const valid = recomputedID === certificate.certificateID && recomputedID === fetchedMetadata.certificateID;

    // Add user names to the response
    const responseData = {
      valid,
      details: valid ? 'Certificate verified' : 'Hash mismatch',
      metadata: {
        ...fetchedMetadata,
        studentName: studentUser?.name || 'Unknown Student',
        issuerName: issuerUser?.name || 'Unknown Institute'
      },
      certificateID: certificate.certificateID,
      studentWallet: dbStudent,
      issuerWallet: certificate.issuerWallet,
      issuedDate: issuedDate.toISOString(),
      pdfUrl: `/api/certificates/${certificate._id}/pdf`, // Path only - frontend will add BASE_URL
      metadataUrl: `/api/certificates/${certificate._id}/metadata`, // Path only - frontend will add BASE_URL
      status: certificate.status || 'pending',
      tokenId: certificate.tokenId || null
    };

    res.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { verifyCertificate };
