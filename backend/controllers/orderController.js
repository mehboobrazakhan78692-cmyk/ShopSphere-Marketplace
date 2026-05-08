const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { sendNotification } = require('../utils/notificationUtils');
const { sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } = require('../utils/emailUtils');
const { recordSale } = require('../utils/postgresLogger');

// @desc    Create order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;
  if (!items || items.length === 0) { res.status(400); throw new Error('No order items'); }
  const order = await Order.create({ user: req.user._id, items, shippingAddress, paymentMethod, itemsPrice, taxPrice, shippingPrice, totalPrice });
  
  // ─── Inventory Tracking ───────────────────────────────────────────────────
  const InventoryLog = require('../models/InventoryLog');
  
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) continue;

    const prevStock = product.stock;
    const orderQty = item.quantity || item.qty || 0;

    if (prevStock < orderQty) {
      console.warn(`Insufficient stock for product ${product.name}`);
    }

    product.stock = Math.max(0, product.stock - orderQty);
    product.sold = (product.sold || 0) + orderQty;
    await product.save();

    // Create Audit Log (Optional but good)
    try {
      await InventoryLog.create({
        product: product._id,
        type: 'outward',
        quantity: orderQty,
        previousStock: prevStock,
        newStock: product.stock,
        referenceId: order._id,
        comment: `Order #${order._id.toString().slice(-8).toUpperCase()} placed`,
      });
    } catch (err) {
      console.error('InventoryLog Error:', err.message);
    }

    // Low Stock Alert
    if (product.stock <= (product.lowStockThreshold || 5)) {
      sendNotification(
        product.vendor,
        '⚠️ Low Stock Alert!',
        `Product "${product.name}" is low on stock (${product.stock} left).`,
        'inventory',
        `/seller/products`
      ).catch(e => console.error('Notification Error:', e.message));
    }
  }

  // ─── Background Tasks ─────────────────────────────────────────────────────
  // We run these without blocking the response
  (async () => {
    try {
      // Send notification to customer
      await sendNotification(
        req.user._id, 
        'Order Placed Successfully!', 
        `Your order #${order._id.toString().slice(-8).toUpperCase()} has been placed.`,
        'order',
        `/orders/${order._id}`
      );

      // Send email to customer
      await sendOrderConfirmationEmail(order, req.user);

      // Record sale in Postgres
      const products = await Product.find({ _id: { $in: items.map(i => i.product) } });
      await recordSale(order, products);
    } catch (bgErr) {
      console.error('Order Background Tasks Error:', bgErr.message);
    }
  })();

  res.status(201).json({ success: true, data: order });
});

// @desc    Get my orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) { res.status(404); throw new Error('Order not found'); }
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403); throw new Error('Not authorized');
  }
  res.json({ success: true, data: order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({}).populate('user', 'name email').sort({ createdAt: -1 });
  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const { status, paymentStatus, trackingId, carrier, comment } = req.body;

  if (status) {
    order.orderStatus = status;
    order.statusHistory.push({
      status,
      comment: comment || `Order status updated to ${status}`,
      timestamp: Date.now()
    });

    if (status === 'delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }
  }

  if (paymentStatus) {
    order.paymentStatus = paymentStatus;
    if (paymentStatus === 'paid') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }
  }

  if (trackingId) order.trackingId = trackingId;
  if (carrier) order.carrier = carrier;

  const updatedOrder = await order.save();

  // Send status update notification
  await sendNotification(
    order.user,
    `Order ${order.orderStatus.toUpperCase()}`,
    `Your order #${order._id.toString().slice(-8).toUpperCase()} is now ${order.orderStatus}. Tracking: ${order.trackingId || 'N/A'}`,
    'order',
    `/orders/${order._id}`
  );

  // Send email to customer
  await sendOrderStatusUpdateEmail(order, order.user);

  // If status is delivered or payment is paid, ensure it's recorded/updated if needed
  // For now, recording on creation is sufficient for reports
  
  res.json({ success: true, data: updatedOrder });
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Admin
const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  await order.deleteOne();
  res.json({ success: true, message: 'Order removed' });
});

// @desc    Get orders for a vendor
// @route   GET /api/orders/vendor
// @access  Private/Vendor
const getVendorOrders = asyncHandler(async (req, res) => {
  // Find all products owned by this vendor
  const products = await Product.find({ vendor: req.user._id });
  const productIds = products.map(p => p._id.toString());

  // Find orders that contain at least one of these products
  const allOrders = await Order.find({ 'items.product': { $in: productIds } })
    .populate('user', 'name email')
    .sort({ createdAt: -1 });

  // Filter out items in the orders that don't belong to this vendor
  const vendorOrders = allOrders.map(order => {
    const orderObj = order.toObject();
    orderObj.items = orderObj.items.filter(item => productIds.includes(item.product.toString()));
    return orderObj;
  });

  res.json({ success: true, count: vendorOrders.length, data: vendorOrders });
});

module.exports = { createOrder, getMyOrders, getOrderById, getAllOrders, updateOrderStatus, deleteOrder, getVendorOrders };
