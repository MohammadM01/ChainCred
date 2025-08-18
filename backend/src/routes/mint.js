const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/mintController');
router.post('/', ctrl.mint);
module.exports = router;
