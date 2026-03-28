const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Qorunan route-lara yalnız daxil olmuş istifadəçilərin keçməsini təmin edir
const protect = async (req, res, next) => {
  try {
    // Authorization header-də Bearer token var mı yoxlanır
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authorized. Please log in.' });
    }

    // "Bearer <token>" formatından token ayrılır
    const token = authHeader.split(' ')[1];

    // Token-in etibarlı və vaxtının keçmədiyi yoxlanır
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // İstifadəçinin bazada hələ mövcud olduğu yoxlanır
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    // İstifadəçi məlumatı növbəti route-a ötürülür
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