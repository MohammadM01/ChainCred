const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/verifyController');
router.post('/', ctrl.verify);
module.exports = router;
