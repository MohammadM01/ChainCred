const crypto = require('crypto');

/**
 * Generates JSON metadata for a certificate.
 * Uses provided certificateID instead of generating it.
 * issuedDateISO is current date in ISO format.
 * Returns metadata object ready for JSON.stringify and upload.
 * For ChainCred MVP: Keeps it simple, no extra fields.
 */
const generateMetadata = (studentWallet, issuerWallet, fileUrl, fileHash, certificateID) => {
  const issuedDateISO = new Date().toISOString();

  const metadata = {
    studentWallet,
    issuerWallet,
    fileUrl,
    fileHash,
    issuedDateISO,
    certificateID,
  };

  return metadata;
};

module.exports = { generateMetadata };
