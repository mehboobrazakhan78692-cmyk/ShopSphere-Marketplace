const asyncHandler = require('express-async-handler');
const { sequelize } = require('../config/db');
const Sale = require('../models/Sale');
const Analytics = require('../models/Analytics');
const SystemLog = require('../models/SystemLog');
const { Op } = require('sequelize');

// @desc    Get sales report
// @route   GET /api/reports/sales
// @access  Private/Admin
const getSalesReport = asyncHandler(async (req, res) => {
  const { period = 'daily' } = req.query;
  
  let groupFormat;
  if (period === 'daily') groupFormat = 'YYYY-MM-DD';
  else if (period === 'monthly') groupFormat = 'YYYY-MM';
  else groupFormat = 'YYYY-WW';

  const sales = await Sale.findAll({
    attributes: [
      [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'date'],
      [sequelize.fn('sum', sequelize.col('amount')), 'totalSales'],
      [sequelize.fn('count', sequelize.col('id')), 'orderCount'],
    ],
    group: [sequelize.fn('date_trunc', 'day', sequelize.col('createdAt'))],
    order: [[sequelize.fn('date_trunc', 'day', sequelize.col('createdAt')), 'DESC']],
    limit: 30
  });

  const categoryPerformance = await Sale.findAll({
    attributes: [
      [sequelize.literal('unnest(categories)'), 'category'],
      [sequelize.fn('sum', sequelize.col('amount')), 'revenue'],
      [sequelize.fn('count', sequelize.col('id')), 'count']
    ],
    group: ['category'],
    order: [[sequelize.fn('sum', sequelize.col('amount')), 'DESC']]
  });

  res.json({
    success: true,
    data: {
      timeline: sales,
      categories: categoryPerformance
    }
  });
});

// @desc    Get user analytics
// @route   GET /api/reports/analytics
// @access  Private/Admin
const getUserAnalytics = asyncHandler(async (req, res) => {
  const registrations = await Analytics.count({
    where: { metric: 'user_registration' }
  });

  const logins = await Analytics.count({
    where: { metric: 'user_login' }
  });

  const topUsersBySpend = await Sale.findAll({
    attributes: [
      'userId',
      [sequelize.fn('sum', sequelize.col('amount')), 'totalSpent'],
      [sequelize.fn('count', sequelize.col('id')), 'orderCount']
    ],
    group: ['userId'],
    order: [[sequelize.fn('sum', sequelize.col('amount')), 'DESC']],
    limit: 10
  });

  res.json({
    success: true,
    data: {
      stats: { registrations, logins },
      topCustomers: topUsersBySpend
    }
  });
});

// @desc    Get system logs
// @route   GET /api/reports/logs
// @access  Private/Admin
const getSystemLogs = asyncHandler(async (req, res) => {
  const { level, module } = req.query;
  const where = {};
  if (level) where.level = level;
  if (module) where.module = module;

  const logs = await SystemLog.findAll({
    where,
    order: [['createdAt', 'DESC']],
    limit: 100
  });

  res.json({ success: true, data: logs });
});

module.exports = { getSalesReport, getUserAnalytics, getSystemLogs };
