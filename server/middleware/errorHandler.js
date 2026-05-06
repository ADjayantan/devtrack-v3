// Fix BUG-01: The original handler always said "email already exists" for ANY 11000 error.
// A duplicate daily log date also triggers 11000. Now we extract the actual field name.
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Mongoose duplicate key — extract which field caused it
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const fieldMessages = {
      email: 'An account with that email already exists.',
      date: 'You already have a log entry for this date.',
    };
    message = fieldMessages[field] || `Duplicate value for ${field}.`;
    statusCode = 400;
  }

  // Mongoose validation error — collect all field messages
  if (err.name === 'ValidationError') {
    message = Object.values(err.errors)
      .map((e) => e.message)
      .join(', ');
    statusCode = 400;
  }

  // Mongoose bad ObjectId (e.g. GET /api/logs/notanid)
  if (err.name === 'CastError') {
    message = 'Invalid resource ID.';
    statusCode = 400;
  }

  // JWT errors (in case they slip through without being caught in middleware)
  if (err.name === 'JsonWebTokenError') {
    message = 'Invalid token.';
    statusCode = 401;
  }
  if (err.name === 'TokenExpiredError') {
    message = 'Token expired. Please log in again.';
    statusCode = 401;
  }

  // Never leak stack traces to the client in production
  res.status(statusCode).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
