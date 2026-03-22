const express = require('express');
const router = express.Router();
const User = require('../models/User');
const File = require('../models/File');
const { protect } = require('../middleware/auth');

// Admin yoxlaması middleware
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Bütün istifadəçiləri gətir
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// İstifadəçini sil
router.delete('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// İstifadəçini blokla
router.patch('/users/:id/block', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isBlocked: true },
      { new: true }
    );
    res.json({ user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Bütün faylları gətir
router.get('/files', protect, adminOnly, async (req, res) => {
  try {
    const files = await File.find().populate('user', 'name email');
    res.json({ files });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Statistika
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalFiles = await File.countDocuments();
    res.json({ totalUsers, totalFiles });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;