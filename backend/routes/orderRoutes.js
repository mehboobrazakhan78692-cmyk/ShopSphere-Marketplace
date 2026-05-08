const express = require('express');
const router = express.Router();
const { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, deleteOrder, getVendorOrders } = require('../controllers/orderController');
const { protect, admin, vendor } = require('../middleware/authMiddleware');

router.route('/').post(protect, createOrder).get(protect, admin, getAllOrders);
router.get('/vendor-orders', protect, vendor, getVendorOrders);
router.get('/myorders', protect, getMyOrders);
router.route('/:id').get(protect, getOrderById).delete(protect, admin, deleteOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);

module.exports = router;
