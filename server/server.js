const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

// Validate critical env vars at startup
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

// Trust Render's reverse proxy so req.ip reflects the real client IP.
app.set('trust proxy', 1);

connectDB();

app.use(helmet());
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));

// CORS — always allow localhost for dev, and CLIENT_URL for production.
// Both origins are listed explicitly so the server works out-of-the-box
// even if CLIENT_URL is not yet set on Render.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173', // vite preview port
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, Postman, mobile apps)
      if (!origin) return callback(null, true);
      const allowed = allowedOrigins.some((o) =>
        typeof o === 'string' ? o === origin : o.test(origin)
      );
      if (allowed) return callback(null, true);
      console.warn(`CORS blocked origin: ${origin}`);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// Routes
app.use('/api/auth',       require('./routes/auth'));
app.use('/api/logs',       require('./routes/logs'));
app.use('/api/roadmap',    require('./routes/roadmap'));
app.use('/api/activities', require('./routes/activities'));

// Health check (unauthenticated — used by Render's health check ping)
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

process.on('unhandledRejection', (reason) => {
  console.error('🔥 Unhandled Rejection:', reason);
  server.close(() => process.exit(1));
});

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});
