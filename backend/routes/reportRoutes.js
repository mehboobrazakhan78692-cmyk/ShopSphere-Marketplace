const express = require('express');
const router = express.Router();
const { getSalesReport, getUserAnalytics, getSystemLogs } = require('../controllers/reportController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);

router.get('/sales', getSalesReport);
router.get('/analytics', getUserAnalytics);
router.get('/logs', getSystemLogs);

module.exports = router;
