const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Order = require('../models/Order');

// @desc    Get vendor dashboard stats
// @route   GET /api/vendor/stats
// @access  Private/Vendor
const getVendorStats = asyncHandler(async (req, res) => {
  const products = await Product.find({ vendor: req.user._id });
  const productCount = products.length;
  
  // Find orders that contain this vendor's products
  const orders = await Order.find({ 'items.product': { $in: products.map(p => p._id) } });
  const orderCount = orders.length;

  // Calculate vendor-specific revenue
  let vendorRevenue = 0;
  orders.forEach(order => {
    order.items.forEach(item => {
      // Find items in the order that belong to this vendor
      const isVendorProduct = products.some(p => p._id.toString() === item.product.toString());
      if (isVendorProduct) {
        vendorRevenue += item.price * (item.quantity || item.qty || 0);
      }
    });
  });

  // Low stock alert (less than 10)
  const lowStockItems = products.filter(p => p.stock < 10);

  res.json({
    success: true,
    data: {
      stats: {
        products: productCount,
        orders: orderCount,
        revenue: vendorRevenue,
        lowStock: lowStockItems.length
      },
      lowStockItems: lowStockItems.slice(0, 5)
    }
  });
});

module.exports = { getVendorStats };
