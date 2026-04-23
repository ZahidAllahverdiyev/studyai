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

const RP_NAME = 'StudyAI Admin';
const RP_ID = process.env.WEBAUTHN_RP_ID || 'localhost';
const ORIGIN = ['https://stuadyai.one', 'https://www.stuadyai.one'];

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });

router.post('/register-options', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys');
    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Yalniz adminler.' });
    }
    const excludeCredentials = (user.passkeys || []).map((pk) => ({
      id: Buffer.from(pk.credentialID, 'base64url'),
      type: 'public-key',
    }));
    const options = await generateRegistrationOptions({
      rpName: RP_NAME,
      rpID: RP_ID,
      userID: user._id.toString(),
      userName: user.email,
      userDisplayName: user.name,
      attestationType: 'none',
      excludeCredentials,
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'required',
      },
    });
    await User.updateOne(
      { _id: user._id },
      { $set: { webAuthnChallenge: options.challenge } }
    );
    res.json(options);
  } catch (err) {
    console.error('register-options error:', err);
    res.status(500).json({ error: 'Server xetasi.' });
  }
});

router.post('/register-verify', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys +webAuthnChallenge');
    if (user.role !== 'admin') return res.status(403).json({ error: 'Yalniz adminler.' });
    if (!user.webAuthnChallenge) return res.status(400).json({ error: 'Challenge tapilmadi.' });
    const verification = await verifyRegistrationResponse({
      response: req.body,
      expectedChallenge: user.webAuthnChallenge,
      expectedOrigin: ORIGIN,
      expectedRPID: RP_ID,
      requireUserVerification: true,
    });
    if (!verification.verified || !verification.registrationInfo) {
      return res.status(400).json({ error: 'Dorulama ugursuz.' });
    }
    const { credential } = verification.registrationInfo;
    const newPasskey = {
      credentialID: Buffer.from(credential.id).toString('base64url'),
      credentialPublicKey: Buffer.from(credential.publicKey).toString('base64'),
      counter: credential.counter,
      deviceType: verification.registrationInfo.credentialDeviceType,
      backedUp: verification.registrationInfo.credentialBackedUp,
      transports: req.body.response?.transports || [],
      createdAt: new Date(),
    };
    await User.updateOne(
      { _id: user._id },
      {
        $push: { passkeys: newPasskey },
        $unset: { webAuthnChallenge: '' },
      }
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('register-verify error:', err);
    res.status(500).json({ error: 'Dorulama xetasi.' });
  }
});

router.post('/login-options', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email lazimdir.' });
    const user = await User.findOne({ email, isVerified: true }).select('+passkeys');
    if (!user || user.role !== 'admin' || !user.passkeys || user.passkeys.length === 0) {
      return res.status(400).json({ error: 'Biometrik giris movcud deyil.' });
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
    await User.updateOne(
      { _id: user._id },
      { $set: { webAuthnChallenge: options.challenge } }
    );
    res.json(options);
  } catch (err) {
    console.error('login-options error:', err);
    res.status(500).json({ error: 'Server xetasi.' });
  }
});

router.post('/login-verify', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email, isVerified: true }).select('+passkeys +webAuthnChallenge');
    if (!user || user.role !== 'admin') return res.status(401).json({ error: 'Icaze yoxdur.' });
    if (!user.webAuthnChallenge) return res.status(400).json({ error: 'Challenge tapilmadi.' });
    const credentialID = req.body.id;
    const passkey = user.passkeys.find((pk) => pk.credentialID === credentialID);
    if (!passkey) return res.status(400).json({ error: 'Bu cihaz taninmir.' });
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
    if (!verification.verified) return res.status(401).json({ error: 'Biometrik dorulama ugursuz.' });
    await User.updateOne(
      { _id: user._id, 'passkeys.credentialID': passkey.credentialID },
      {
        $set: { 'passkeys.$.counter': verification.authenticationInfo.newCounter },
        $unset: { webAuthnChallenge: '' },
      }
    );
    const token = signToken(user._id);
    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, avatar: user.avatar, stats: user.stats, role: user.role },
    });
  } catch (err) {
    console.error('login-verify error:', err);
    res.status(500).json({ error: 'Dorulama xetasi.' });
  }
});

router.delete('/passkey/:credentialID', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys');
    if (user.role !== 'admin') return res.status(403).json({ error: 'Icaze yoxdur.' });
    await User.updateOne(
      { _id: user._id },
      { $pull: { passkeys: { credentialID: req.params.credentialID } } }
    );
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: 'Silme xetasi.' });
  }
});

router.get('/passkeys', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('+passkeys');
    if (user.role !== 'admin') return res.status(403).json({ error: 'Icaze yoxdur.' });
    const passkeys = (user.passkeys || []).map((pk) => ({
      credentialID: pk.credentialID,
      deviceType: pk.deviceType,
      createdAt: pk.createdAt,
      backedUp: pk.backedUp,
    }));
    res.json({ passkeys });
  } catch (err) {
    res.status(500).json({ error: 'Server xetasi.' });
  }
});

module.exports = router;