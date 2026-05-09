require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');

// ─── Environment Validation ───────────────────────────────────────────────────
const checkEnv = () => {
  const required = [
    'MONGO_URI',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'NODE_ENV',
    'CLOUDINARY_CLOUD_NAME',
    'CLOUDINARY_API_KEY',
    'CLOUDINARY_API_SECRET'
  ];

  const missing = required.filter(key => !process.env[key]);

  if (missing.length > 0) {
    console.error('❌ CRITICAL: Missing required environment variables:'.red.bold);
    missing.forEach(key => console.error(`   - ${key}`.red));
    if (process.env.NODE_ENV === 'production') {
      console.error('Exiting due to missing configuration in production mode.'.red.bold);
      process.exit(1);
    }
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

// ─── CORS first (so preflight OPTIONS doesn't hit rate limiter) ─────────────
const allowedOrigins = process.env.ALLOWED_ORIGINS 
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : [
      'http://localhost:5173', 
      'http://127.0.0.1:5173',
      'https://shopsphere-marketplace.vercel.app',
      'https://shopsphere-v1.vercel.app',
      'https://shopsphere-backend.onrender.com'
    ];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
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
      imgSrc: ["'self'", 'data:', 'https://images.unsplash.com', 'https://via.placeholder.com', 'https://res.cloudinary.com'],
      connectSrc: ["'self'", 'https://shopsphere-backend.onrender.com'],
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
  res.json({
    success: true,
    message: '🛒 ShopSphere API is running',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
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
  await connectMongoDB();
  await connectPostgres();

  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════════╗'.rainbow);
    console.log('║   🛒  ShopSphere Backend Started!        ║'.rainbow);
    console.log('╚══════════════════════════════════════════╝\n'.rainbow);
    console.log(`🚀 Server running on: http://localhost:${PORT}`.green.bold);
    console.log(`🔗 Health:   http://localhost:${PORT}/api/health`.cyan);
    console.log(`📦 Products: http://localhost:${PORT}/api/products`.cyan);
    console.log(`🔐 Auth:     http://localhost:${PORT}/api/auth`.cyan);
    console.log(`🛍️  Orders:   http://localhost:${PORT}/api/orders\n`.cyan);
  });
};

startServer();
