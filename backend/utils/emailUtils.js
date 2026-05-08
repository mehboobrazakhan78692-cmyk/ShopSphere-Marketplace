const nodemailer = require('nodemailer');

/**
 * Generic function to send email
 * @param {Object} options - Email options (email, subject, message, html)
 */
const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    const message = {
      from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`📧 Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Email error: ${error.message}`);
    // We don't throw error to avoid breaking the main process (e.g. order creation)
    return null;
  }
};

/**
 * Send order confirmation email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 */
const sendOrderConfirmationEmail = async (order, user) => {
  const itemsHtml = order.items.map(item => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toFixed(2)}</td>
    </tr>
  `).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="color: #4CAF50; text-align: center;">Order Confirmed!</h2>
      <p>Hi ${user.name},</p>
      <p>Thank you for shopping with <strong>ShopSphere</strong>. Your order has been placed successfully and is being processed.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Order Details</h3>
        <p><strong>Order ID:</strong> #${order._id.toString().slice(-8).toUpperCase()}</p>
        <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Payment Method:</strong> ${order.paymentMethod}</p>
      </div>

      <table style="width: 100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #eee;">
            <th style="padding: 10px; text-align: left;">Product</th>
            <th style="padding: 10px; text-align: center;">Qty</th>
            <th style="padding: 10px; text-align: right;">Price</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal</td>
            <td style="padding: 10px; text-align: right;">₹${order.itemsPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Shipping</td>
            <td style="padding: 10px; text-align: right;">₹${order.shippingPrice.toFixed(2)}</td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Tax</td>
            <td style="padding: 10px; text-align: right;">₹${order.taxPrice.toFixed(2)}</td>
          </tr>
          <tr style="font-size: 1.2em; color: #4CAF50;">
            <td colspan="2" style="padding: 10px; text-align: right; font-weight: bold;">Total</td>
            <td style="padding: 10px; text-align: right; font-weight: bold;">₹${order.totalPrice.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <div style="margin-top: 20px;">
        <h3>Shipping Address</h3>
        <p>
          ${order.shippingAddress.street}<br>
          ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
          ${order.shippingAddress.country}
        </p>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="text-align: center; color: #888; font-size: 0.8em;">
        If you have any questions, please contact our support team.<br>
        &copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `Order Confirmation - #${order._id.toString().slice(-8).toUpperCase()}`,
    html,
  });
};

/**
 * Send order status update email
 * @param {Object} order - Order object
 * @param {Object} user - User object
 */
const sendOrderStatusUpdateEmail = async (order, user) => {
  const statusColors = {
    'placed': '#3498db',
    'confirmed': '#2ecc71',
    'shipped': '#f1c40f',
    'out-for-delivery': '#e67e22',
    'delivered': '#27ae60',
    'cancelled': '#e74c3c'
  };

  const color = statusColors[order.orderStatus] || '#333';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
      <h2 style="color: ${color}; text-align: center;">Order Status Updated</h2>
      <p>Hi ${user.name},</p>
      <p>Your order <strong>#${order._id.toString().slice(-8).toUpperCase()}</strong> status has been updated to <strong style="color: ${color}; text-transform: uppercase;">${order.orderStatus}</strong>.</p>
      
      ${order.trackingId ? `
      <div style="background: #f0f7ff; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 5px solid #3498db;">
        <h3 style="margin-top: 0; color: #3498db;">Tracking Information</h3>
        <p><strong>Carrier:</strong> ${order.carrier || 'N/A'}</p>
        <p><strong>Tracking ID:</strong> ${order.trackingId}</p>
      </div>
      ` : ''}

      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/orders/${order._id}" 
           style="background: #4CAF50; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">
          View Order Status
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="text-align: center; color: #888; font-size: 0.8em;">
        Thank you for choosing ShopSphere!<br>
        &copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: `Order Update: ${order.orderStatus.toUpperCase()} - #${order._id.toString().slice(-8).toUpperCase()}`,
    html,
  });
};

module.exports = {
  sendEmail,
  sendOrderConfirmationEmail,
  sendOrderStatusUpdateEmail
};
