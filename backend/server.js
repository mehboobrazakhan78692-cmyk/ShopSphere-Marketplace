require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const colors = require('colors');
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

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const xss = require('xss-clean');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const csrfProtection = require('./middleware/csrfMiddleware');

const app = express();

// ─── CORS first (so preflight OPTIONS doesn't hit rate limiter) ─────────────
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));

// ─── Body parsers ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Security Middleware ──────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow inline scripts in dev
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
