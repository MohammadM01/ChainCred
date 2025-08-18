const express = require('express');
const router = express.Router();
router.use('/upload', require('./upload'));
router.use('/mint', require('./mint'));
router.use('/verify', require('./verify'));
module.exports = router;
