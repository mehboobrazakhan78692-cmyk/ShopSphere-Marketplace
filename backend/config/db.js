const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const colors = require('colors');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ShopSphere';
  const isProduction = process.env.NODE_ENV === 'production';

  const options = {
    maxPoolSize: isProduction ? 10 : 5,
    serverSelectionTimeoutMS: isProduction ? 5000 : 3000,
    connectTimeoutMS: isProduction ? 10000 : 3000,
    family: 4 // Use IPv4
  };

  try {
    const conn = await mongoose.connect(mongoUri, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`❌ MongoDB Primary Connection Error: ${error.message}`.red.bold);
    
    // If Atlas fails and we have a local fallback URI, or if we are not in strict production
    if (!isProduction || process.env.ALLOW_LOCAL_FALLBACK === 'true') {
      console.log('⚠️ Attempting Local MongoDB fallback...'.yellow);
      try {
        const localUri = process.env.MONGO_URI_LOCAL || 'mongodb://127.0.0.1:27017/ShopSphere';
        // Disconnect before attempting fallback to avoid hanging states
        await mongoose.disconnect().catch(() => {});
        const conn = await mongoose.connect(localUri, { ...options, serverSelectionTimeoutMS: 2000 });
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

// Helper to determine SSL settings based on hostname
const getDialectOptions = (host) => {
  if (!isProduction) return {};
  if (!host) return {};
  
  // Render internal database hostnames start with 'dpg-' and have no dots
  // dpg-xxx-a (internal) vs dpg-xxx-a.oregon-postgres.render.com (external)
  if (host.startsWith('dpg-') && !host.includes('.')) {
    return {};
  }
  
  // External or standard FQDNs usually require SSL on Render/Supabase/etc.
  if (host.includes('.') || host.includes('render.com')) {
    return {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    };
  }
  
  return {};
};

let sequelize;

if (process.env.DATABASE_URL) {
  // Use connection string if available
  const dbUrl = process.env.DATABASE_URL;
  // Extract host for SSL logic
  const hostMatch = dbUrl.match(/@([^/:]+)/);
  const host = hostMatch ? hostMatch[1] : '';
  
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: getDialectOptions(host),
    pool: {
      max: isProduction ? 25 : 10,
      min: 2,
      acquire: 60000,
      idle: 10000,
    },
    retry: {
      max: 3
    }
  });
} else {
  // Fallback to individual variables
  const host = process.env.PG_HOST || 'localhost';
  const portInput = process.env.PG_PORT;
  const port = (portInput && !isNaN(parseInt(portInput))) ? parseInt(portInput) : 5432;

  sequelize = new Sequelize(
    process.env.PG_DB || 'shopsphere',
    process.env.PG_USER || 'postgres',
    process.env.PG_PASSWORD || 'postgres',
    {
      host: host,
      port: port,
      dialect: 'postgres',
      logging: false,
      dialectOptions: getDialectOptions(host),
      pool: {
        max: isProduction ? 25 : 10,
        min: 2,
        acquire: 60000,
        idle: 10000,
      },
      retry: {
        max: 3
      }
    }
  );
}

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
      // In production, sync is safer without 'alter'
      await sequelize.sync(); 
      console.log(`✅ PostgreSQL Models Synced (production)`.green.bold);
    }
  } catch (error) {
    console.error(`❌ PostgreSQL Connection Error: ${error.message}`.red.bold);
    if (process.env.NODE_ENV === 'production') {
      console.error('CRITICAL: PostgreSQL is mandatory in production!'.red.bold);
      process.exit(1);
    } else {
      console.warn('⚠️  Continuing without PostgreSQL in development...'.yellow);
    }
  }
};

module.exports = { connectMongoDB, connectPostgres, sequelize };
