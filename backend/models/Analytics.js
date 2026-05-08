const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Analytics = sequelize.define('Analytics', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  metric: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  value: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  dimensions: {
    type: DataTypes.JSONB, // e.g. { category: 'electronics', vendorId: '...' }
    defaultValue: {},
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
});

module.exports = Analytics;
