const rateLimit = require('express-rate-limit');

// Strict limiter for auth routes: 10 requests per 15 min per IP
// Prevents brute-force attacks on login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: 'Too many requests from this IP. Please wait 15 minutes and try again.',
  },
  skipSuccessfulRequests: true, // Only count failed requests toward the limit
});

// General API limiter: 200 requests per 15 min per IP
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests. Please slow down.' },
});

module.exports = { authLimiter, apiLimiter };
