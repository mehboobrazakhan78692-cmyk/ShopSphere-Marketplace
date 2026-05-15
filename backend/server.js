require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');

// ─── Environment Validation ───────────────────────────────────────────────────
const checkEnv = () => {
  // Core required for basic operation
  const coreRequired = [
    'MONGO_URI',
    'JWT_SECRET',
  ];

  // Optional variables — warn but never crash
  const optional = [
    'JWT_REFRESH_SECRET',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET',
    'STRIPE_SECRET_KEY',
    'FRONTEND_URL',
  ];

  const missingCore = coreRequired.filter(key => !process.env[key]);
  const missingOptional = optional.filter(key => !process.env[key]);

  if (missingCore.length > 0) {
    console.error('\n❌ CRITICAL: Missing CORE environment variables:'.red.bold);
    missingCore.forEach(key => console.error(`   - ${key}`.red));
    // Only exit for truly core variables (MongoDB + JWT)
    if (process.env.NODE_ENV === 'production') {
      console.error('\n⚠️  Core variables missing — server may not function correctly.'.yellow);
      // Do NOT exit — let it start and handle errors gracefully
    }
  }

  if (missingOptional.length > 0) {
    console.warn('\n⚠️  Optional environment variables not set (features may be limited):'.yellow);
    missingOptional.forEach(key => console.warn(`   - ${key}`.yellow));
  }

  if (missingCore.length === 0 && missingOptional.length === 0) {
    console.log('✅ All environment variables configured'.green);
  } else if (missingCore.length === 0) {
    console.log('✅ Core environment validation passed (some optional vars missing)'.green);
  }
};

checkEnv();

const { connectMongoDB, connectPostgres } = require('./config/db');
const errorHandler = require('./middleware/errorMiddleware');

// ─── Routes ──────────────────────────────────────────────────────────────────
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const vendorRoutes = require('./routes/vendorRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const reportRoutes = require('./routes/reportRoutes');
const uploadRoutes = require('./routes/uploadRoutes');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrfMiddleware');

const app = express();

// Trust proxy for Render/Vercel (needed for rate limit and helmet)
app.set('trust proxy', 1);

// ─── CORS configuration ──────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'https://shopsphere-marketplace.vercel.app',
  'https://shopsphere-v1.vercel.app'
];

// Add frontend URL from env if available
if (process.env.FRONTEND_URL) {
  const url = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash
  if (!allowedOrigins.includes(url)) {
    allowedOrigins.push(url);
  }
}

// Add manually specified origins
if (process.env.ALLOWED_ORIGINS) {
  process.env.ALLOWED_ORIGINS.split(',').forEach(origin => {
    const trimmed = origin.trim().replace(/\/$/, '');
    if (trimmed && !allowedOrigins.includes(trimmed)) {
      allowedOrigins.push(trimmed);
    }
  });
}

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is allowed or matches a trusted subdomain
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.endsWith('.vercel.app') || 
                     origin.endsWith('.onrender.com');
                      
    if (isAllowed) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-ShopSphere-CSRF', 'X-Requested-With'],
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      imgSrc: ["'self'", 'data:', 'blob:', 'https://images.unsplash.com', 'https://via.placeholder.com', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", 'https://*.onrender.com', 'https://*.vercel.app'],
    },
  },
  crossOriginEmbedderPolicy: false,
}));
app.use(mongoSanitize());
app.use(xss());
app.use(cookieParser());

// CSRF Protection
app.use(csrfProtection);

// Rate Limiting — generous for dev, tighten for production
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 100 : 1000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.method === 'OPTIONS', // don't count preflight
});

// Stricter limiter for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 200,
  message: { success: false, message: 'Too many auth attempts, try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const mongoState = mongoose.connection.readyState;
  const mongoStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoState] || 'unknown';

  res.json({
    success: true,
    status: 'ok',
    message: '🛒 ShopSphere API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    uptime: Math.floor(process.uptime()) + 's',
    database: {
      mongodb: mongoStatus,
      mongoConnected: mongoState === 1,
    },
    config: {
      hasMongo: !!process.env.MONGO_URI,
      hasJWT: !!process.env.JWT_SECRET,
      hasStripe: !!process.env.STRIPE_SECRET_KEY,
      hasFrontendUrl: !!process.env.FRONTEND_URL,
    },
  });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/vendor', vendorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/upload', uploadRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // MongoDB is mandatory — if it fails, we cannot serve products/users
    await connectMongoDB();
    console.log('✅ MongoDB initialization complete'.green);
  } catch (mongoErr) {
    console.error('❌ MongoDB initialization failed, cannot start server.'.red.bold);
    process.exit(1);
  }

  // PostgreSQL is optional — analytics only. Never block startup.
  const pgTimeout = new Promise((resolve) => setTimeout(() => {
    console.warn('⚠️  PostgreSQL connection timed out — skipping PG initialization'.yellow);
    resolve();
  }, 12000)); // 12 second max wait

  await Promise.race([connectPostgres(), pgTimeout]);

  // Start HTTP server regardless of PG state
  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════╗'.rainbow);
    console.log('║   🛒  ShopSphere Backend Started!        ║'.rainbow);
    console.log('╚══════════════════════════════════════════╝\n'.rainbow);
    console.log(`🚀 Server running on port: ${PORT}`.green.bold);
    console.log(`🔗 Health:   /api/health`.cyan);
    console.log(`📦 Products: /api/products`.cyan);
    console.log(`🔐 Auth:     /api/auth`.cyan);
    console.log(`🛍️  Orders:   /api/orders\n`.cyan);
  });
};

startServer().catch((err) => {
  console.error('❌ Fatal server startup error:', err.message);
  process.exit(1);
});

