const SystemLog = require('../models/SystemLog');
const Analytics = require('../models/Analytics');
const Sale = require('../models/Sale');

/**
 * Log a system event to PostgreSQL
 */
const logSystem = async (level, module, message, metadata = {}) => {
  try {
    await SystemLog.create({
      level,
      module,
      message,
      metadata
    });
  } catch (error) {
    console.error('Postgres Logging Error (SystemLog):', error.message);
  }
};

/**
 * Log a user analytics event to PostgreSQL
 */
const logAnalytics = async (metric, value, dimensions = {}) => {
  try {
    await Analytics.create({
      metric,
      value,
      dimensions
    });
  } catch (error) {
    console.error('Postgres Logging Error (Analytics):', error.message);
  }
};

/**
 * Record a sale in PostgreSQL
 */
const recordSale = async (order, products = []) => {
  try {
    const categories = [...new Set(order.items.map(item => {
      const product = products.find(p => p._id.toString() === item.product.toString());
      return product ? product.category : 'unknown';
    }))];

    await Sale.create({
      orderId: order._id.toString(),
      userId: order.user.toString(),
      amount: order.totalPrice,
      tax: order.taxPrice,
      shipping: order.shippingPrice,
      itemsCount: order.items.reduce((acc, item) => acc + item.quantity, 0),
      paymentMethod: order.paymentMethod,
      categories
    });
  } catch (error) {
    console.error('Postgres Recording Error (Sale):', error.message);
  }
};

module.exports = { logSystem, logAnalytics, recordSale };
