const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const colors = require('colors');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectMongoDB = async () => {
  if (process.env.NODE_ENV === 'production' && !process.env.MONGO_URI) {
    console.error('❌ CRITICAL: MONGO_URI is not defined in production!'.red.bold);
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ShopSphere', {
      maxPoolSize: process.env.NODE_ENV === 'production' ? 10 : 5,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`❌ MongoDB Error: ${error.message}`.red.bold);
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

// ─── PostgreSQL Connection ────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.PG_DB || (isProduction ? null : 'shopsphere'),
  process.env.PG_USER || (isProduction ? null : 'postgres'),
  process.env.PG_PASSWORD || (isProduction ? null : 'postgres'),
  {
    host: process.env.PG_HOST || (isProduction ? null : 'localhost'),
    port: process.env.PG_PORT || 5432,
    dialect: 'postgres',
    logging: false,
    dialectOptions: isProduction ? {
      ssl: {
        require: true,
        rejectUnauthorized: false // Common for managed DBs like RDS/Heroku, adjust as needed
      }
    } : {},
    pool: {
      max: isProduction ? 20 : 10,
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

    if (process.env.NODE_ENV !== 'production') {
      await sequelize.sync({ alter: true });
      console.log(`✅ PostgreSQL Models Synced (alter: true)`.green.bold);
    } else {
      // In production, sync is safer without 'alter' if migrations are used, 
      // but here we keep it simple while avoiding dangerous changes.
      await sequelize.sync(); 
      console.log(`✅ PostgreSQL Models Synced (production)`.green.bold);
    }
  } catch (error) {
    console.warn(`⚠️  PostgreSQL Error: ${error.message}`.yellow);
    if (process.env.NODE_ENV === 'production') {
      console.error('❌ CRITICAL: PostgreSQL is required in production!'.red.bold);
      process.exit(1);
    }
  }
};

module.exports = { connectMongoDB, connectPostgres, sequelize };
