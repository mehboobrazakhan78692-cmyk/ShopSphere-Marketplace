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
 * Send welcome email on registration
 * @param {Object} user - User object
 */
const sendWelcomeEmail = async (user) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 28px; font-weight: 800;">Welcome to ShopSphere!</h1>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">We're thrilled to have you join our multi-vendor marketplace. At ShopSphere, we connect you with the best sellers from around the country.</p>
      
      <div style="background: #f8fafc; padding: 25px; border-radius: 12px; margin: 30px 0; border: 1px solid #f1f5f9;">
        <h3 style="margin-top: 0; color: #1e293b; font-size: 18px;">Getting Started</h3>
        <ul style="color: #64748b; padding-left: 20px; line-height: 1.8;">
          <li>Browse millions of products across categories</li>
          <li>Enjoy secure payments and fast delivery</li>
          <li>Track your orders in real-time</li>
          <li>Manage your wishlist and reviews</li>
        </ul>
      </div>

      <div style="text-align: center; margin: 40px 0;">
        <a href="${(process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : (process.env.FRONTEND_URL || 'http://localhost:5173'))}" 
           style="background: #0284c7; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          Start Shopping Now
        </a>
      </div>

      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      <p style="text-align: center; color: #94a3b8; font-size: 13px;">
        This is an automated message, please do not reply.<br>
        &copy; ${new Date().getFullYear()} ShopSphere Inc. 123 E-Commerce Way.
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Welcome to ShopSphere!',
    html,
  });
};

/**
 * Send password reset email
 * @param {Object} user - User object
 * @param {String} resetUrl - URL with reset token
 */
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e2e8f0; padding: 40px; border-radius: 16px; background-color: #ffffff;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; font-weight: 800;">Password Reset Request</h1>
      </div>
      
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">Hi ${user.name},</p>
      <p style="color: #475569; font-size: 16px; line-height: 1.6;">You are receiving this email because a password reset request was made for your account.</p>
      
      <div style="text-align: center; margin: 40px 0;">
        <a href="${resetUrl}" 
           style="background: #ef4444; color: #ffffff; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
          Reset Password
        </a>
      </div>

      <p style="color: #64748b; font-size: 14px; line-height: 1.6;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">The link will expire in 10 minutes.</p>

      <hr style="border: 0; border-top: 1px solid #f1f5f9; margin: 30px 0;">
      <p style="text-align: center; color: #94a3b8; font-size: 13px;">
        &copy; ${new Date().getFullYear()} ShopSphere. All rights reserved.
      </p>
    </div>
  `;

  await sendEmail({
    email: user.email,
    subject: 'Password Reset Request',
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
        <a href="${(process.env.NODE_ENV === 'production' ? process.env.FRONTEND_URL : (process.env.FRONTEND_URL || 'http://localhost:5173'))}/orders/${order._id}" 
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
  sendOrderStatusUpdateEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail
};
