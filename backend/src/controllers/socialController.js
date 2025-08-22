const Connection = require('../models/Connection');
const Certificate = require('../models/Certificate');
const ethers = require('ethers');

// Helper to normalize wallet
const norm = (w) => (w || '').toLowerCase();

// POST /api/social/connect
// body: { requesterWallet, recipientWallet }
const sendConnectionRequest = async (req, res) => {
  try {
    const { requesterWallet, recipientWallet } = req.body;
    if (!ethers.isAddress(requesterWallet) || !ethers.isAddress(recipientWallet)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet' });
    }
    const reqW = norm(requesterWallet);
    const recW = norm(recipientWallet);
    if (reqW === recW) {
      return res.status(400).json({ success: false, error: 'Cannot connect to self' });
    }

    // Check any existing relationship in either direction
    const existing = await Connection.findOne({
      $or: [
        { requesterWallet: reqW, recipientWallet: recW },
        { requesterWallet: recW, recipientWallet: reqW },
      ],
    });

    if (existing) {
      // If the other side sent a pending request to me, accept it instead of creating a duplicate
      if (existing.status === 'pending' && existing.requesterWallet === recW && existing.recipientWallet === reqW) {
        existing.status = 'accepted';
        await existing.save();
        return res.json({ success: true, data: existing, note: 'Reciprocal request auto-accepted' });
      }
      // Otherwise, return the existing relationship (pending/accepted/rejected)
      return res.json({ success: true, data: existing, note: 'Existing relationship' });
    }

    // Create new pending request
    const created = await Connection.create({ requesterWallet: reqW, recipientWallet: recW, status: 'pending' });
    res.json({ success: true, data: created });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

// POST /api/social/respond
// body: { requesterWallet, recipientWallet, accept: boolean }
const respondToRequest = async (req, res) => {
  try {
    const { requesterWallet, recipientWallet, accept } = req.body;
    if (!ethers.isAddress(requesterWallet) || !ethers.isAddress(recipientWallet)) {
      return res.status(400).json({ success: false, error: 'Invalid wallet' });
    }

    const reqW = norm(requesterWallet);
    const recW = norm(recipientWallet);

    const conn = await Connection.findOne({ requesterWallet: reqW, recipientWallet: recW, status: 'pending' });
    if (!conn) return res.status(404).json({ success: false, error: 'Request not found' });

    conn.status = accept ? 'accepted' : 'rejected';
    await conn.save();

    // If there is a duplicate pending request in the opposite direction, clean it up
    if (accept) {
      await Connection.deleteMany({ requesterWallet: recW, recipientWallet: reqW, status: 'pending' });
    }

    res.json({ success: true, data: conn });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

// GET /api/social/requests?wallet=0x...
const listRequests = async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!ethers.isAddress(wallet)) return res.status(400).json({ success: false, error: 'Invalid wallet' });
    const w = norm(wallet);

    const incoming = await Connection.find({ recipientWallet: w, status: 'pending' }).lean();
    const outgoing = await Connection.find({ requesterWallet: w, status: 'pending' }).lean();

    res.json({ success: true, data: { incoming, outgoing } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

// GET /api/social/connections?wallet=0x...
const listConnections = async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!ethers.isAddress(wallet)) return res.status(400).json({ success: false, error: 'Invalid wallet' });
    const w = norm(wallet);

    const accepted = await Connection.find({
      $or: [
        { requesterWallet: w, status: 'accepted' },
        { recipientWallet: w, status: 'accepted' },
      ],
    }).lean();

    // Unique peers
    const peerSet = new Set(
      accepted.map((c) => (c.requesterWallet === w ? c.recipientWallet : c.requesterWallet))
    );

    res.json({ success: true, data: { connections: Array.from(peerSet) } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

// GET /api/social/suggestions?wallet=0x...
// Suggest students sharing issuers, excluding any with existing/pending relationships
const listSuggestions = async (req, res) => {
  try {
    const { wallet } = req.query;
    if (!ethers.isAddress(wallet)) return res.status(400).json({ success: false, error: 'Invalid wallet' });
    const w = norm(wallet);

    // Collect wallets to exclude: any with a Connection in either direction (pending/accepted)
    const relations = await Connection.find({
      $or: [
        { requesterWallet: w },
        { recipientWallet: w },
      ],
      status: { $in: ['pending', 'accepted'] },
    }).lean();
    const excluded = new Set([w]);
    relations.forEach((r) => {
      excluded.add(r.requesterWallet === w ? r.recipientWallet : r.requesterWallet);
    });

    const myCerts = await Certificate.find({ studentWallet: w }).lean();
    const myIssuers = new Set(myCerts.map((c) => c.issuerWallet));

    const suggested = await Certificate.aggregate([
      { $match: { studentWallet: { $ne: w } } },
      { $group: { _id: '$studentWallet', issuers: { $addToSet: '$issuerWallet' }, certs: { $addToSet: '$certificateID' } } },
    ]);

    const scored = suggested
      .filter((s) => !excluded.has(s._id))
      .map((s) => {
        const commonIssuers = s.issuers.filter((x) => myIssuers.has(x));
        return { wallet: s._id, commonIssuerCount: commonIssuers.length, totalCerts: s.certs.length };
      })
      .filter((x) => x.commonIssuerCount > 0)
      .sort((a, b) => b.commonIssuerCount - a.commonIssuerCount)
      .slice(0, 20);

    res.json({ success: true, data: { suggestions: scored } });
  } catch (e) {
    res.status(500).json({ success: false, error: e.message });
  }
};

module.exports = {
  sendConnectionRequest,
  respondToRequest,
  listRequests,
  listConnections,
  listSuggestions,
};
