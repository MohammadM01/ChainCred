const express = require('express');
const { register, verifyWallet } = require('../controllers/authController');
const router = express.Router();

/**
 * Auth routes.
 * POST /api/auth/register
 * POST /api/auth/verify-wallet
 */
router.post('/register', register);
router.post('/verify-wallet', verifyWallet);

module.exports = router;
