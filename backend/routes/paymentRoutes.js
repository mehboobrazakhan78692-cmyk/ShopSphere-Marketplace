const express = require('express');
const router = express.Router();
const { createCheckoutSession, processCOD, refundOrder } = require('../controllers/paymentController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/create-session', protect, createCheckoutSession);
router.post('/cod', protect, processCOD);
router.post('/refund/:id', protect, admin, refundOrder);

module.exports = router;
