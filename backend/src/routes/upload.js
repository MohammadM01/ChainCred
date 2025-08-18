const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/uploadController');
router.post('/', ctrl.upload);
module.exports = router;
