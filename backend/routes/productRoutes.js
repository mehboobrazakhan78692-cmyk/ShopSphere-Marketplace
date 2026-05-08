const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addReview,
  getVendorProducts,
  getSuggestions,
} = require('../controllers/productController');
const { protect, vendor } = require('../middleware/authMiddleware');

router.get('/suggestions', getSuggestions);
router.route('/').get(getProducts).post(protect, vendor, createProduct);
router.get('/vendor-list', protect, vendor, getVendorProducts);
router.route('/:id').get(getProductById).put(protect, vendor, updateProduct).delete(protect, vendor, deleteProduct);
router.route('/:id/reviews').post(protect, addReview);

module.exports = router;
