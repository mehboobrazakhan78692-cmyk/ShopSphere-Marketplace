const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Sale = sequelize.define('Sale', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  orderId: {
    type: DataTypes.STRING, // MongoDB Order ID
    allowNull: false,
  },
  userId: {
    type: DataTypes.STRING, // MongoDB User ID
    allowNull: false,
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  tax: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  shipping: {
    type: DataTypes.FLOAT,
    defaultValue: 0,
  },
  itemsCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  paymentMethod: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  categories: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
  },
}, {
  timestamps: true,
});

module.exports = Sale;
