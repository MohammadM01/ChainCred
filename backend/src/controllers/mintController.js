const User = require('../models/User');
const Certificate = require('../models/Certificate');
const { mint } = require('../utils/opbnbInteract');
const ethers = require('ethers');

/**
 * Mint controller for ChainCred (institute only).
 * Mints soulbound NFT on opBNB testnet.
 * Flow: Check role, mint via utils, update DB with tokenId.
 * Returns { txHash, tokenId }.
 * Security: Role check; validate addresses and metadataUrl.
 * Assumption: issuerWallet matches authenticated user.
 */

// POST /api/mint
const mintCertificate = async (req, res) => {
  try {
    const { studentWallet, metadataUrl, issuerWallet } = req.body;

    if (!studentWallet || !metadataUrl || !issuerWallet) {
      return res.status(400).json({ success: false, error: 'studentWallet, metadataUrl, and issuerWallet are required' });
    }

    if (!ethers.isAddress(studentWallet) || !ethers.isAddress(issuerWallet)) {
      return res.status(400).json({ success: false, error: 'Invalid EVM wallet addresses' });
    }

    // Check if issuer has 'institute' role
    const issuer = await User.findOne({ wallet: issuerWallet.toLowerCase() });
    if (!issuer || issuer.role !== 'institute') {
      return res.status(403).json({ success: false, error: 'Only institutes can mint' });
    }

    // Mint on opBNB
    const mintResult = await mint(studentWallet, metadataUrl);

    // Update DB with tokenId
    const certificate = await Certificate.findOneAndUpdate(
      { metadataUrl },
      { tokenId: mintResult.tokenId },
      { new: true }
    );

    if (!certificate) {
      return res.status(404).json({ success: false, error: 'Certificate not found for update' });
    }

    res.json({ success: true, data: { txHash: mintResult.txHash, tokenId: mintResult.tokenId } });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { mintCertificate };
