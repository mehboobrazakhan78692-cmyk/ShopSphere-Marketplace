const express = require('express');
const router = express.Router();
const { getVendorStats } = require('../controllers/vendorController');
const { protect, vendor } = require('../middleware/authMiddleware');

router.get('/stats', protect, vendor, getVendorStats);

module.exports = router;
