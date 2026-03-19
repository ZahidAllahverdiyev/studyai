// ============================================================
// routes/auth.js - Authentication Routes
// ============================================================

const express = require('express');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Email transporter ────────────────────────────────────────
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ── Helper: 6 rəqəmli kod yarat ─────────────────────────────
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ── Helper: JWT token yarat ──────────────────────────────────
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── Helper: token cavabı göndər ──────────────────────────────
const sendTokenResponse = (user, statusCode, res) => {
  const token = signToken(user._id);
  res.status(statusCode).json({
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      stats: user.stats,
    },
  });
};

// ── REGISTER ─────────────────────────────────────────────────
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/register', registerValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 dəqiqə

    if (existingUser && !existingUser.isVerified) {
      // Köhnə təsdiqlənməmiş hesabı yenilə
      existingUser.name = name;
      existingUser.password = password;
      existingUser.verificationCode = code;
      existingUser.verificationExpires = expires;
      await existingUser.save();
    } else {
      await User.create({
        name,
        email,
        password,
        verificationCode: code,
        verificationExpires: expires,
      });
    }

    // Email göndər
    await transporter.sendMail({
      from: `"StudyAI" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your StudyAI verification code',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2 style="color: #89b4fa;">Welcome to StudyAI! 🎓</h2>
          <p>Your verification code is:</p>
          <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                      background: #1e1e2e; color: #89b4fa; padding: 20px;
                      text-align: center; border-radius: 12px; margin: 20px 0;">
            ${code}
          </div>
          <p style="color: #888;">This code expires in <strong>10 minutes</strong>.</p>
        </div>
      `,
    });

    res.status(200).json({ message: 'Verification code sent.', email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ── VERIFY EMAIL ─────────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    const user = await User.findOne({ email })
      .select('+verificationCode +verificationExpires');

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified.' });
    }

    if (user.verificationCode !== code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    if (user.verificationExpires < new Date()) {
      return res.status(400).json({ error: 'Code has expired. Please register again.' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/login', loginValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first.' });
    }

    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// ── GET CURRENT USER ──────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        stats: user.stats,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user data.' });
  }
});

// ── UPDATE PROFILE ────────────────────────────────────────────
router.put('/profile', protect, async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Name is required.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.name = name.trim();
    await user.save();
    res.json({
      ok: true,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, stats: user.stats },
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ── CHANGE PASSWORD ───────────────────────────────────────────
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing fields.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const user = await User.findById(req.user._id).select('+password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    const ok = await user.comparePassword(currentPassword);
    if (!ok) return res.status(400).json({ error: 'Current password is wrong.' });
    user.password = newPassword;
    await user.save();
    res.json({ ok: true });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

// ── SET PRESET AVATAR ─────────────────────────────────────────
router.put('/avatar-preset', protect, async (req, res) => {
  try {
    const { avatar } = req.body;
    if (!avatar || typeof avatar !== 'string' || !avatar.startsWith('/avatars/')) {
      return res.status(400).json({ error: 'Invalid avatar.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ error: 'User not found.' });
    user.avatar = avatar;
    await user.save();
    res.json({ ok: true, avatar: user.avatar });
  } catch (err) {
    console.error('Avatar preset error:', err);
    res.status(500).json({ error: 'Failed to set avatar.' });
  }
});

module.exports = router;