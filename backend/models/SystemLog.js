const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const SystemLog = sequelize.define('SystemLog', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  level: {
    type: DataTypes.ENUM('info', 'warn', 'error', 'fatal'),
    defaultValue: 'info',
  },
  module: {
    type: DataTypes.STRING, // e.g. 'AUTH', 'ORDER', 'PAYMENT'
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
  },
}, {
  timestamps: true,
  updatedAt: false, // Logs are immutable
});

module.exports = SystemLog;
