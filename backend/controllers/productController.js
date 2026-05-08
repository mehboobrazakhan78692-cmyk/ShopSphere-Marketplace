const asyncHandler = require('express-async-handler');
const NodeCache = require('node-cache');
const Product = require('../models/Product');
const { sendNotification } = require('../utils/notificationUtils');

const productCache = new NodeCache({ stdTTL: 120, checkperiod: 60 }); // 2 minute cache

// @desc    Get all products (with filters)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, sort, page = 1, limit = 20, featured, minPrice, maxPrice, brand, rating } = req.query;
  
  // Create unique cache key based on query params
  const cacheKey = `products_${JSON.stringify(req.query)}`;
  const cachedData = productCache.get(cacheKey);
  if (cachedData) {
    return res.json({ ...cachedData, fromCache: true });
  }

  const query = { isActive: true };

  // Category Filter
  if (category && category !== 'All') query.category = category;
  
  // Featured Filter
  if (featured) query.isFeatured = true;

  // Search Logic (Text Search with Relevance Scoring)
  if (search) {
    query.$text = { $search: search };
  }

  // Brand Filter
  if (brand) query.brand = brand;

  // Rating Filter (Minimum Rating)
  if (rating) query.rating = { $gte: Number(rating) };

  // Price Range Filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = Number(minPrice);
    if (maxPrice) query.price.$lte = Number(maxPrice);
  }

  const sortOptions = {
    latest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating: { rating: -1 },
    popular: { sold: -1 },
  };

  const skip = (Number(page) - 1) * Number(limit);
  
  // If text search, sort by text score by default if no sort specified
  let projection = {};
  let currentSort = sortOptions[sort] || sortOptions.latest;
  
  if (search && !sort) {
    projection = { score: { $meta: 'textScore' } };
    currentSort = { score: { $meta: 'textScore' } };
  }

  const total = await Product.countDocuments(query);
  const products = await Product.find(query, projection)
    .sort(currentSort)
    .skip(skip)
    .limit(Number(limit))
    .lean();

  const responseData = {
    success: true,
    count: products.length,
    total,
    totalPages: Math.ceil(total / Number(limit)),
    currentPage: Number(page),
    data: products,
  };

  // Save to cache
  productCache.set(cacheKey, responseData);

  res.json(responseData);
});

// @desc    Get search suggestions
// @route   GET /api/products/suggestions
// @access  Public
const getSuggestions = asyncHandler(async (req, res) => {
  const { q } = req.query;
  if (!q) return res.json({ success: true, data: [] });

  // Find products matching the prefix or containing the word
  const suggestions = await Product.find(
    { 
      isActive: true,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { category: { $regex: q, $options: 'i' } },
        { brand: { $regex: q, $options: 'i' } }
      ]
    },
    { name: 1, category: 1, _id: 1 }
  ).limit(8);

  res.json({ success: true, data: suggestions });
});

// @desc    Get all products for a vendor
// @route   GET /api/products/vendor
// @access  Private/Vendor
const getVendorProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendor: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: products.length, data: products });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).lean();
  if (!product) { res.status(404); throw new Error('Product not found'); }
  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Private/Vendor
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create({ ...req.body, vendor: req.user._id });
  productCache.flushAll(); // Invalidate all product cache on new product
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Vendor
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized to update this product');
  }
  const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

  // Check for low stock
  if (updated.stock > 0 && updated.stock < 5) {
    sendNotification(updated.vendor, 'Low Stock Alert!', `Product "${updated.name}" is running low (${updated.stock} left).`, 'inventory', `/seller/products`).catch(() => {});
  } else if (updated.stock === 0) {
    sendNotification(updated.vendor, 'Out of Stock!', `Product "${updated.name}" is now out of stock.`, 'inventory', `/seller/products`).catch(() => {});
  }

  productCache.flushAll(); // Invalidate cache on update
  res.json({ success: true, data: updated });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Vendor|Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  if (product.vendor.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  await product.deleteOne();
  productCache.flushAll(); // Invalidate cache on delete
  res.json({ success: true, message: 'Product removed' });
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);
  if (!product) { res.status(404); throw new Error('Product not found'); }
  const alreadyReviewed = product.reviews.find((r) => r.user.toString() === req.user._id.toString());
  if (alreadyReviewed) { res.status(400); throw new Error('Product already reviewed'); }
  const review = { user: req.user._id, name: req.user.name, rating: Number(rating), comment };
  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.rating = product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;
  await product.save();
  res.status(201).json({ success: true, message: 'Review added' });
});

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct, addReview, getVendorProducts, getSuggestions };
