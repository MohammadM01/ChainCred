const crypto = require('crypto');

/**
 * Generates JSON metadata for a certificate.
 * Computes certificateID as SHA256(studentWallet + issuerWallet + fileHash + issuedDateISO).
 * issuedDateISO is current date in ISO format.
 * Returns metadata object ready for JSON.stringify and upload.
 * For ChainCred MVP: Keeps it simple, no extra fields.
 */
const generateMetadata = (studentWallet, issuerWallet, fileUrl, fileHash) => {
  const issuedDateISO = new Date().toISOString();

  const certificateID = crypto
    .createHash('sha256')
    .update(studentWallet + issuerWallet + fileHash + issuedDateISO)
    .digest('hex');

  const metadata = {
    studentWallet,
    issuerWallet,
    fileUrl,
    issuedDateISO,
    certificateID,
  };

  return metadata;
};

module.exports = { generateMetadata };
