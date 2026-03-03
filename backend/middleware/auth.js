// ============================================================
// middleware/auth.js - JWT Authentication Middleware
// Protects routes so only logged-in users can access them.
// ============================================================

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  try {
    // 1. Check if Authorization header exists with Bearer token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized. Please log in.' });
    }

    // 2. Extract the token from "Bearer <token>"
    const token = authHeader.split(' ')[1];

    // 3. Verify token is valid and not expired
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 4. Find user in DB to make sure they still exist
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    // 5. Attach user to request so routes can access it
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token. Please log in again.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    return res.status(500).json({ error: 'Authentication error.' });
  }
};

module.exports = { protect };
