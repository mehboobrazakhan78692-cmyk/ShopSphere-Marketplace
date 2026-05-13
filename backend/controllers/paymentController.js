const asyncHandler = require('express-async-handler');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key_123');
const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const { sendNotification } = require('../utils/notificationUtils');

// @desc    Create Stripe Checkout Session
// @route   POST /api/payments/create-session
// @access  Private
const createCheckoutSession = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId).populate('items.product');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const lineItems = order.items.map((item) => ({
    price_data: {
      currency: 'inr',
      product_data: {
        name: item.name,
        images: [item.image],
      },
      unit_amount: item.price * 100, // Stripe expects amounts in paise
    },
    quantity: item.quantity,
  }));

  // Add tax/shipping if any
  if (order.shippingPrice > 0) {
    lineItems.push({
      price_data: {
        currency: 'inr',
        product_data: { name: 'Shipping' },
        unit_amount: order.shippingPrice * 100,
      },
      quantity: 1,
    });
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    line_items: lineItems,
    mode: 'payment',
    success_url: `${(process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : (process.env.FRONTEND_URL || 'http://localhost:5173'))}/order-success?id=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${(process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : (process.env.FRONTEND_URL || 'http://localhost:5173'))}/checkout?orderId=${order._id}`,
    metadata: { orderId: order._id.toString() },
  });

  res.json({ success: true, url: session.url });
});

// @desc    Confirm Payment (Post-redirect)
// @route   POST /api/payments/confirm-payment
// @access  Private
const confirmPayment = asyncHandler(async (req, res) => {
  const { orderId, sessionId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // If sessionId is provided, verify it with Stripe (in test mode)
  if (sessionId && order.paymentMethod === 'Stripe') {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === 'paid') {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.paymentStatus = 'paid';
        order.paymentResult = {
          id: session.payment_intent,
          status: session.payment_status,
          email_address: session.customer_details.email,
        };
        await order.save();
      }
    } catch (err) {
      console.error('Stripe Session Verification Failed:', err.message);
      // Even if verification fails in test mode, we might want to check the order status
    }
  } else if (order.paymentMethod === 'COD') {
    // COD is already handled but we ensure it's pending
    order.paymentStatus = 'pending';
    await order.save();
  }

  res.json({ success: true, data: order });
});

// @desc    Process Cash on Delivery
// @route   POST /api/payments/cod
// @access  Private
const processCOD = asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.paymentMethod = 'COD';
  order.paymentStatus = 'pending'; // Payment pending until delivery
  order.isPaid = false;
  
  await order.save();

  // Fire-and-forget notification — don't block the response
  sendNotification(
    order.user,
    'Order Confirmed (COD)',
    `Your order #${order._id.toString().slice(-8).toUpperCase()} has been placed via Cash on Delivery.`,
    'order',
    `/orders/${order._id}`
  ).catch(err => console.error('Notification error:', err.message));

  res.json({ success: true, message: 'COD Order Confirmed', data: order });
});

// @desc    Refund Order
// @route   POST /api/payments/refund/:id
// @access  Private/Admin
const refundOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!order.isPaid) {
    res.status(400);
    throw new Error('Unpaid orders cannot be refunded');
  }

  // If Stripe payment, call Stripe API
  if (order.paymentMethod === 'Stripe' && order.paymentResult?.id) {
    try {
      await stripe.refunds.create({
        payment_intent: order.paymentResult.id,
      });
    } catch (err) {
      res.status(500);
      throw new Error(`Stripe Refund Failed: ${err.message}`);
    }
  }

  order.isRefunded = true;
  order.refundedAt = Date.now();
  order.paymentStatus = 'refunded';
  order.orderStatus = 'Cancelled';

  // Replenish Stock
  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      const prevStock = product.stock;
      product.stock += item.quantity;
      product.sold -= item.quantity;
      await product.save();

      await InventoryLog.create({
        product: product._id,
        type: 'return',
        quantity: item.quantity,
        previousStock: prevStock,
        newStock: product.stock,
        referenceId: order._id,
        comment: `Refund for order #${order._id.toString().slice(-8).toUpperCase()}`,
      });
    }
  }

  await order.save();

  await sendNotification(
    order.user,
    'Order Refunded',
    `Your refund for order #${order._id.toString().slice(-8).toUpperCase()} has been processed.`,
    'order',
    `/orders/${order._id}`
  );

  res.json({ success: true, message: 'Order refunded successfully', data: order });
});

module.exports = { createCheckoutSession, confirmPayment, processCOD, refundOrder };
