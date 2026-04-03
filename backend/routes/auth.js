const express = require('express');
const jwt = require('jsonwebtoken');
const https = require('https');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// ── Brevo ilə Email Göndərmə ──────────────────────────────────
// Brevo (əvvəlki adı Sendinblue) — transaksiya emailləri üçün istifadə edilir
const sendBrevoEmail = (to, subject, htmlContent) => {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({
      sender: { name: 'StudyAI', email: 'strikecraft100@gmail.com' },
      to: [{ email: to }],
      subject,
      htmlContent,
    });

    const req = https.request({
      hostname: 'api.brevo.com',
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
};

// Email şablonu — təsdiq kodu üçün
const verificationEmailHTML = (code) => `
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
`;

// Email şablonu — şifrə sıfırlama üçün
const resetEmailHTML = (code) => `
  <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
    <h2 style="color: #89b4fa;">StudyAI — Şifrə Sıfırlama 🔐</h2>
    <p>Şifrənizi sıfırlamaq üçün aşağıdakı kodu istifadə edin:</p>
    <div style="font-size: 36px; font-weight: bold; letter-spacing: 8px;
                background: #1e1e2e; color: #89b4fa; padding: 20px;
                text-align: center; border-radius: 12px; margin: 20px 0;">
      ${code}
    </div>
    <p style="color: #888;">Bu kod <strong>10 dəqiqə</strong> ərzində etibarlıdır.</p>
    <p style="color: #888;">Əgər bu sorğunu siz etməmisinizsə, bu emaili nəzərə almayın.</p>
  </div>
`;

// ── Yardımçı Funksiyalar ──────────────────────────────────────

// 6 rəqəmli təsadüfi təsdiq kodu yaradır
const generateCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// JWT token yaradır — istifadəçi ID-si ilə imzalanır
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// Token və istifadəçi məlumatlarını cavab olaraq göndərir
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
      role: user.role,
    },
  });
};

// ── QEYDİYYAT ────────────────────────────────────────────────
// Giriş məlumatlarını yoxlayan validasiya qaydaları
const registerValidation = [
  body('name').trim().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
];

router.post('/register', registerValidation, async (req, res) => {
  try {
    // Validasiya xətalarını yoxla
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { name, email, password } = req.body;

    // Email artıq qeydiyyatdan keçibsə və təsdiqlənibsə — xəta qaytar
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.isVerified) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // 6 rəqəmli kod yarat və 10 dəqiqəlik son tarix təyin et
    const code = generateCode();
    const expires = new Date(Date.now() + 10 * 60 * 1000);

    if (existingUser && !existingUser.isVerified) {
      // Əgər hesab var amma təsdiqlənməyibsə — yenilə
      existingUser.name = name;
      existingUser.password = password;
      existingUser.verificationCode = code;
      existingUser.verificationExpires = expires;
      existingUser.verificationAttempts = 0; // Cəhd sayını sıfırla
      await existingUser.save();
    } else {
      // Yeni istifadəçi yarat
      await User.create({
        name,
        email,
        password,
        verificationCode: code,
        verificationExpires: expires,
        verificationAttempts: 0,
      });
    }

    // Təsdiq kodunu emailə göndər
    await sendBrevoEmail(email, 'Your StudyAI verification code', verificationEmailHTML(code));

    res.status(200).json({ message: 'Verification code sent.', email });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// ── EMAİL TƏSDİQLƏMƏ ─────────────────────────────────────────
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    // İstifadəçini tap və gizli sahələri də gətir
    const user = await User.findOne({ email })
      .select('+verificationCode +verificationExpires +verificationAttempts');

    if (!user) {
      return res.status(400).json({ error: 'User not found.' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Email already verified.' });
    }

    // ✅ YENİ — Brute-force qoruması: 5 yanlış cəhddən sonra blok
    if (user.verificationAttempts >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Please register again.' });
    }

    // Yanlış kod — cəhd sayını artır
    if (user.verificationCode !== code) {
      user.verificationAttempts = (user.verificationAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    // Kodun vaxtı keçibsə
    if (user.verificationExpires < new Date()) {
      return res.status(400).json({ error: 'Code has expired. Please register again.' });
    }

    // Hesabı təsdiqlənmiş kimi işarələ və təsdiq məlumatlarını sil
    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpires = undefined;
    user.verificationAttempts = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Verification failed.' });
  }
});

// ── GİRİŞ ────────────────────────────────────────────────────
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/login', loginValidation, async (req, res) => {
  try {
    // Validasiya xətalarını yoxla
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ error: errors.array()[0].msg });
    }

    const { email, password } = req.body;

    // İstifadəçini tap — şifrə sahəsi default olaraq gizlidir, açıq istə
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Təsdiqlənməmiş hesabla girişi blok et
    if (!user.isVerified) {
      return res.status(401).json({ error: 'Please verify your email first.' });
    }

    // Şifrəni yoxla — bcrypt ilə müqayisə edilir
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

// ── ŞİFRƏ SIFIRLA — KOD GÖNDƏR ───────────────────────────────
// ✅ YENİ — İstifadəçi şifrəsini unutduqda bu marşrut istifadə olunur
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required.' });
    }

    // İstifadəçini tap — hesab yoxdursa eyni cavabı qaytar (təhlükəsizlik)
    const user = await User.findOne({ email, isVerified: true });
    if (!user) {
      // Hesabın mövcud olub olmadığını açıqlama — təhlükəsizlik üçün
      return res.status(200).json({ message: 'If this email exists, a code has been sent.' });
    }

    // Sıfırlama kodu yarat və saxla
    const code = generateCode();
    user.resetPasswordCode = code;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 dəqiqə
    user.resetPasswordAttempts = 0;
    await user.save();

    // Sıfırlama kodunu emailə göndər
    await sendBrevoEmail(email, 'StudyAI — Password Reset Code', resetEmailHTML(code));

    res.status(200).json({ message: 'If this email exists, a code has been sent.', email });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── ŞİFRƏ SIFIRLA — YENİ ŞİFRƏ TƏYİN ET ─────────────────────
// ✅ YENİ — Kod doğrulandıqdan sonra yeni şifrə təyin edilir
router.post('/reset-password', async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    // İstifadəçini tap və sıfırlama sahələrini gətir
    const user = await User.findOne({ email })
      .select('+resetPasswordCode +resetPasswordExpires +resetPasswordAttempts');

    if (!user || !user.resetPasswordCode) {
      return res.status(400).json({ error: 'Invalid or expired reset request.' });
    }

    // Brute-force qoruması — 5 yanlış cəhddən sonra blok
    if (user.resetPasswordAttempts >= 5) {
      return res.status(429).json({ error: 'Too many attempts. Please request a new code.' });
    }

    // Yanlış kod — cəhd sayını artır
    if (user.resetPasswordCode !== code) {
      user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
      await user.save();
      return res.status(400).json({ error: 'Invalid code.' });
    }

    // Kodun vaxtı keçibsə
    if (user.resetPasswordExpires < new Date()) {
      return res.status(400).json({ error: 'Code has expired. Please request a new one.' });
    }

    // Yeni şifrəni təyin et və sıfırlama məlumatlarını sil
    user.password = newPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;
    user.resetPasswordAttempts = undefined;
    await user.save();

    res.json({ ok: true, message: 'Password reset successfully.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error.' });
  }
});

// ── CARİ İSTİFADƏÇİ ──────────────────────────────────────────
// Token ilə cari istifadəçinin məlumatlarını gətir
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
        role: user.role,
      },
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching user data.' });
  }
});

// ── PROFİL YENİLƏ ─────────────────────────────────────────────
// İstifadəçinin adını yeniləmək üçün
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

// ── ŞİFRƏ DƏYİŞ ──────────────────────────────────────────────
// Köhnə şifrəni yoxlayıb yenisini təyin edir
router.put('/password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing fields.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }

    // Şifrəni müqayisə etmək üçün +password sahəsini açıq istə
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

// ── AVATAR SEÇ ────────────────────────────────────────────────
// İstifadəçi hazır avatarlardan birini seçir
router.put('/avatar-preset', protect, async (req, res) => {
  try {
    const { avatar } = req.body;

    // Avatar yolunun düzgün formatda olduğunu yoxla
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