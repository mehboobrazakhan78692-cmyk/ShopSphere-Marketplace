const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const colors = require('colors');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ShopSphere';
  const isProduction = process.env.NODE_ENV === 'production';

  try {
    const conn = await mongoose.connect(mongoUri, {
      maxPoolSize: isProduction ? 10 : 5,
      serverSelectionTimeoutMS: 5000, // Fail fast if Atlas is unreachable
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`❌ MongoDB Primary Connection Error: ${error.message}`.red.bold);
    
    // If Atlas fails and we have a local fallback URI, or if we are not in strict production
    if (!isProduction || process.env.ALLOW_LOCAL_FALLBACK === 'true') {
      console.log('⚠️ Attempting Local MongoDB fallback...'.yellow);
      try {
        const localUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/ShopSphere';
        const conn = await mongoose.connect(localUri);
        console.log(`✅ Fallback MongoDB Connected: ${conn.connection.host}`.yellow.bold);
      } catch (fallbackError) {
        console.error(`❌ Fallback MongoDB Error: ${fallbackError.message}`.red.bold);
        if (isProduction) process.exit(1);
      }
    } else {
      process.exit(1);
    }
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
