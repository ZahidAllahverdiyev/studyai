// ── backend/routes/webauthn.js ────────────────────────────────
// Bu faylı backend/routes/ qovluğuna əlavə et

const express = require('express');
const router = express.Router();
const {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} = require('@simplewebauthn/server');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const jwt = require('jsonwebtoken');

// Sayt məlumatları — öz domeninlə dəyiş
const RP_NAME = 'StudyAI Admin';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';         // prod-da: stuadyai.one
const ORIGIN = process.env.WEBAUTHN_ORIGIN || 'http://localhost:3000'; // prod-da: https://stuadyai.one

// JWT token yarat
const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

// ── 1. QEYDIYYAT — Seçimlər (yalnız mövcud admin üçün) ────────
// Admin öz cihazını ilk dəfə qeydiyyatdan keçirəndə çağırılır
router.post('/register-options', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys');

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Yalnız adminlər biometrik qeydiyyat edə bilər.' });
    }

    // Artıq qeydiyyatdan keçmiş cihazlar
    const excludeCredentials = (user.passkeys || []).map((pk) => ({
      id: Buffer.from(pk.credentialID, 'base64url'),
      type: 'public-key',
    }));

    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: Buffer.from(user._id.toString()),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required', // Face ID / Touch ID məcburi
      },
    });

    // Challenge-i müvəqqəti saxla
    user.webAuthnChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    console.error('WebAuthn register-options error:', err);
    res.status(500).json({ error: 'Server xətası.' });
  }
});

// ── 2. QEYDIYYAT — Doğrulama ──────────────────────────────────
// Cihaz biometrik cavabı göndərir, server yoxlayır
router.post('/register-verify', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys +webAuthnChallenge');

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Yalnız adminlər.' });
    }

    if (!user.webAuthnChallenge) {
      return res.status(400).json({ error: 'Challenge tapılmadı. Yenidən cəhd edin.' });
    }

    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Biometrik doğrulama uğursuz oldu.' });
    }

    const { credential } = verification.registrationInfo;

    // Yeni passkey-i saxla
    const newPasskey = {
      credentialID: Buffer.from(credential.id).toString('base64url'),
      credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      deviceType: verification.registrationInfo.credentialDeviceType,
      backedUp: verification.registrationInfo.credentialBackedUp,
      transports: req.body.response?.transports || [],
      createdAt: new Date(),
    };

    user.passkeys = [...(user.passkeys || []), newPasskey];
    user.webAuthnChallenge = undefined;
    await user.save();

    res.json({ ok: true, message: 'Biometrik uğurla qeydiyyatdan keçdi!' });
  } catch (err) {
    console.error('WebAuthn register-verify error:', err);
    res.status(500).json({ error: 'Doğrulama xətası.' });
  }
});

// ── 3. GİRİŞ — Seçimlər ──────────────────────────────────────
// Admin login səhifəsindən email göndərilir, challenge qayıdır
router.post('/login-options', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email lazımdır.' });
    }

    const user = await User.findOne({ email, isVerified: true }).select('+passkeys');

    if (!user || user.role !== 'admin') {
      // Təhlükəsizlik: admin olub olmadığını açıqlama
      return res.status(400).json({ error: 'Biometrik giriş mövcud deyil.' });
    }

    if (!user.passkeys || user.passkeys.length === 0) {
      return res.status(400).json({ error: 'Bu hesab üçün biometrik qeydiyyat yoxdur.' });
    }

    const allowCredentials = user.passkeys.map((pk) => ({
      id: Buffer.from(pk.credentialID, 'base64url'),
      type: 'public-key',
      transports: pk.transports,
    }));

    const options = await generateAuthenticationOptions({
      rpID: RP_ID,
      userVerification: 'required',
      allowCredentials,
    });

    // Challenge-i saxla
    user.webAuthnChallenge = options.challenge;
    await user.save();

    res.json(options);
  } catch (err) {
    console.error('WebAuthn login-options error:', err);
    res.status(500).json({ error: 'Server xətası.' });
  }
});

// ── 4. GİRİŞ — Doğrulama ─────────────────────────────────────
// Biometrik cavabı yoxla və JWT token qaytar
router.post('/login-verify', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email, isVerified: true })
      .select('+passkeys +webAuthnChallenge');

    if (!user || user.role !== 'admin') {
      return res.status(401).json({ error: 'İcazə yoxdur.' });
    }

    if (!user.webAuthnChallenge) {
      return res.status(400).json({ error: 'Challenge tapılmadı.' });
    }

    // Uyğun passkey-i tap
    const credentialID = req.body.id;
    const passkey = user.passkeys.find(
      (pk) => pk.credentialID === credentialID
    );

    if (!passkey) {
      return res.status(400).json({ error: 'Bu cihaz tanınmır.' });
    }

    const verification = await verifyAuthenticationResponse({
      response: req.body,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      credential: {
        id: Buffer.from(passkey.credentialID, 'base64url'),
        publicKey: Buffer.from(passkey.credentialPublicKey, 'base64'),
        counter: passkey.counter,
        transports: passkey.transports,
      },
      requireUserVerification: true,
    });

    if (!verification.verified) {
      return res.status(401).json({ error: 'Biometrik doğrulama uğursuz.' });
    }

    // Counter-i yenilə (replay attack qoruması)
    passkey.counter = verification.authenticationInfo.newCounter;
    user.webAuthnChallenge = undefined;
    await user.save();

    // JWT token qaytar — normal login kimi
    const token = signToken(user._id);
    res.json({
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
  } catch (err) {
    console.error('WebAuthn login-verify error:', err);
    res.status(500).json({ error: 'Doğrulama xətası.' });
  }
});

// ── 5. PASSKEY SİL ────────────────────────────────────────────
// Admin öz qeydiyyatdan keçmiş cihazını silə bilər
router.delete('/passkey/:credentialID', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys');

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'İcazə yoxdur.' });
    }

    user.passkeys = (user.passkeys || []).filter(
      (pk) => pk.credentialID !== req.params.credentialID
    );
    await user.save();

    res.json({ ok: true, message: 'Cihaz silindi.' });
  } catch (err) {
    res.status(500).json({ error: 'Silmə xətası.' });
  }
});

// ── 6. PASSKEY-LƏRİ GÖSTƏR ───────────────────────────────────
// Adminin qeydiyyatdan keçmiş cihazlarını göstər
router.get('/passkeys', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys');

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'İcazə yoxdur.' });
    }

    const passkeys = (user.passkeys || []).map((pk) => ({
      credentialID: pk.credentialID,
      deviceType: pk.deviceType,
      createdAt: pk.createdAt,
      backedUp: pk.backedUp,
    }));

    res.json({ passkeys });
  } catch (err) {
    res.status(500).json({ error: 'Server xətası.' });
  }
});

module.exports = router;
