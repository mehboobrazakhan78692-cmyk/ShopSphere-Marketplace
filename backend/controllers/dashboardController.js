const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

// @desc    Get admin dashboard stats
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getDashboardStats = asyncHandler(async (req, res) => {
  const productCount = await Product.countDocuments();
  const orderCount = await Order.countDocuments();
  const userCount = await User.countDocuments();
  
  // Total Revenue calculation
  const orders = await Order.find({ isPaid: true });
  const totalRevenue = orders.reduce((acc, item) => acc + item.totalPrice, 0);

  // Recent orders
  const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name');

  // Category distribution (simulated or aggregated)
  const categories = await Product.aggregate([
    { $group: { _id: '$category', count: { $sum: 1 } } }
  ]);

  res.json({
    success: true,
    data: {
      stats: {
        products: productCount,
        orders: orderCount,
        users: userCount,
        revenue: totalRevenue
      },
      recentOrders,
      categories
    }
  });
});

module.exports = { getDashboardStats };
