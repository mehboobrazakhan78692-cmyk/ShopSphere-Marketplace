const Notification = require('../models/Notification');

/**
 * Send a notification to a user
 * @param {string} userId - ID of the user to notify
 * @param {string} title - Title of the notification
 * @param {string} message - Message body
 * @param {string} type - Notification type (order, inventory, system, promo)
 * @param {string} link - Optional link to a page
 */
const sendNotification = async (userId, title, message, type = 'system', link = '') => {
  try {
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      link
    });
    // In a real app, you might also trigger a WebSocket event or push notification here
  } catch (error) {
    console.error('Failed to send notification:', error);
  }
};

module.exports = { sendNotification };
