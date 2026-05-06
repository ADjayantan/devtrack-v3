const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config({ path: '../.env' });

// --- Fix SEC-04: Validate critical env vars at startup ---
const REQUIRED_ENV = ['MONGO_URI', 'JWT_SECRET'];
const missing = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET is short (< 32 chars). Use a longer random string in production.');
}

const app = express();

connectDB();

// --- Fix SEC-02: Security headers via helmet ---
app.use(helmet());

// --- Fix MAINT-01: Request logging via morgan ---
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- Fix SEC-03: Body size cap (10kb is generous for our payloads) ---
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/logs', require('./routes/logs'));
app.use('/api/roadmap', require('./routes/roadmap'));

// Health check (unauthenticated)
app.get('/api/health', (req, res) =>
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development' })
);

// 404 fallback
app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

// Centralized error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () =>
  console.log(`🚀 DevTrack API on port ${PORT} [${process.env.NODE_ENV || 'development'}]`)
);

// --- Fix PERF-03: Process-level crash guards ---
process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});
