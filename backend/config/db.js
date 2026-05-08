const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const colors = require('colors');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`.red.bold);
    // Don't exit - app continues without MongoDB in dev
  }
};

// ─── PostgreSQL Connection ────────────────────────────────────────────────────
const sequelize = new Sequelize(
  process.env.PG_DB || 'shopsphere',
  process.env.PG_USER || 'postgres',
  process.env.PG_PASSWORD || 'postgres',
  {
    host: process.env.PG_HOST || 'localhost',
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  }
);

const connectPostgres = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ PostgreSQL Connected`.green.bold);
    
    // Import models to ensure they are registered for sync
    require('../models/Analytics');
    require('../models/SystemLog');
    require('../models/Sale');

    await sequelize.sync({ alter: true });
    console.log(`✅ PostgreSQL Models Synced`.green.bold);
  } catch (error) {
    console.warn(`⚠️  PostgreSQL not available: ${error.message}`.yellow);
    // Don't crash — PostgreSQL is optional in this dev setup
  }
};

module.exports = { connectMongoDB, connectPostgres, sequelize };
