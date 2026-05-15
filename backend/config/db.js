const mongoose = require('mongoose');
const { Sequelize } = require('sequelize');
const colors = require('colors');

// ─── MongoDB Connection ───────────────────────────────────────────────────────
const connectMongoDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ShopSphere';
  const isProduction = process.env.NODE_ENV === 'production';

  const options = {
    maxPoolSize: isProduction ? 10 : 5,
    serverSelectionTimeoutMS: isProduction ? 15000 : 5000, // Extended for cold starts
    connectTimeoutMS: isProduction ? 20000 : 5000,         // Extended for Atlas on Render
    socketTimeoutMS: isProduction ? 45000 : 10000,
    family: 4 // Use IPv4
  };

  try {
    const conn = await mongoose.connect(mongoUri, options);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`.cyan.bold);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`.red.bold);
    
    // In production, throw so the caller (startServer) can handle it
    if (isProduction) {
      throw error;
    }
    
    // In development only, attempt local fallback
    console.log('⚠️ Attempting Local MongoDB fallback...'.yellow);
    try {
      const localUri = 'mongodb://127.0.0.1:27017/ShopSphere';
      await mongoose.disconnect().catch(() => {});
      const conn = await mongoose.connect(localUri, { ...options, serverSelectionTimeoutMS: 2000 });
      console.log(`✅ Fallback MongoDB Connected: ${conn.connection.host}`.yellow.bold);
    } catch (fallbackError) {
      console.error(`❌ Fallback MongoDB Error: ${fallbackError.message}`.red.bold);
      throw fallbackError;
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
  const isInternal = host.startsWith('dpg-') && !host.includes('.');
  
  if (isInternal) {
    console.log(`📡 Detected Render Internal PostgreSQL host: ${host} (SSL Disabled)`.cyan);
    return {};
  }
  
  // External or standard FQDNs usually require SSL on Render/Supabase/etc.
  if (host.includes('.') || host.includes('render.com')) {
    console.log(`🌐 Detected External PostgreSQL host: ${host} (SSL Enabled)`.cyan);
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

const initSequelize = (dbUrlOrConfig) => {
  const isString = typeof dbUrlOrConfig === 'string';
  const host = isString 
    ? (dbUrlOrConfig.match(/@([^/:]+)/)?.[1] || '')
    : (dbUrlOrConfig.host || '');

  const config = {
    dialect: 'postgres',
    logging: false,
    dialectOptions: getDialectOptions(host),
    pool: {
      max: isProduction ? 10 : 5,
      min: 0,
      acquire: 15000,  // 15s max wait for connection — prevents long hangs
      idle: 5000,
    },
    retry: {
      max: 1  // Only retry once — fail fast to not block server startup
    }
  };

  if (isString) {
    return new Sequelize(dbUrlOrConfig, config);
  } else {
    return new Sequelize(
      dbUrlOrConfig.database,
      dbUrlOrConfig.user,
      dbUrlOrConfig.password,
      { ...config, host: dbUrlOrConfig.host, port: dbUrlOrConfig.port }
    );
  }
};

// Use INTERNAL_DATABASE_URL if available (Render priority), else DATABASE_URL, else components
const primaryUrl = process.env.INTERNAL_DATABASE_URL || process.env.DATABASE_URL;

if (primaryUrl) {
  sequelize = initSequelize(primaryUrl);
} else {
  const host = process.env.PG_HOST || 'localhost';
  const portInput = process.env.PG_PORT;
  const port = (portInput && !isNaN(parseInt(portInput))) ? parseInt(portInput) : 5432;

  sequelize = initSequelize({
    database: process.env.PG_DB || 'shopsphere',
    user: process.env.PG_USER || 'postgres',
    password: process.env.PG_PASSWORD || 'postgres',
    host: host,
    port: port
  });
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
      await sequelize.sync(); 
      console.log(`✅ PostgreSQL Models Synced (production)`.green.bold);
    }
  } catch (error) {
    console.error(`❌ PostgreSQL Connection Error: ${error.message}`.red.bold);
    
    // Special handling for SSL mismatches to prevent crash if possible, or at least log clearly
    const isSSLError = error.message.includes('SSL') || 
                      error.message.includes('no pg_hba.conf entry') ||
                      error.message.includes('server does not support SSL');

    if (isSSLError) {
      console.error('⚠️  SSL Configuration Mismatch detected!'.yellow.bold);
      console.error('Please verify if you are using Internal vs External Render URL.'.yellow);
      console.error('Tip: Use INTERNAL_DATABASE_URL (dpg-xxx) for no-SSL, or set ssl.rejectUnauthorized=false'.yellow);
    }

    // NEVER exit in production due to PG failure
    // PostgreSQL is used for analytics/logs only — MongoDB handles products/users
    console.warn('⚠️  Continuing without PostgreSQL — analytics features may be limited.'.yellow.bold);
    console.warn('   MongoDB (products/users) remains fully operational.'.yellow);
  }
};

module.exports = { connectMongoDB, connectPostgres, sequelize };
