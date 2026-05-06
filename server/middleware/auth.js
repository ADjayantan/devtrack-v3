const jwt = require('jsonwebtoken');

// Attaches req.userId and req.userRole from a verified JWT
const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Authentication required. Please log in.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    req.userRole = decoded.role || 'user';
    next();
  } catch (err) {
    // Distinguish between expired and malformed tokens for better client handling
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please log in again.', expired: true });
    }
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

// Middleware factory: restrict access to specific roles
// Usage: router.delete('/users/:id', protect, requireRole('admin'), handler)
const requireRole = (...roles) => (req, res, next) => {
  if (!roles.includes(req.userRole)) {
    return res.status(403).json({ message: 'You do not have permission to perform this action.' });
  }
  next();
};

module.exports = { protect, requireRole };
