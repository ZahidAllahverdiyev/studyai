// ── User.js modeline əlavə ediləcək sahələr ───────────────────
// Mövcud schema-na bu sahələri əlavə et:

/*
  // WebAuthn / Passkey sahələri
  passkeys: {
    type: [
      {
        credentialID:        { type: String, required: true },
        credentialPublicKey: { type: String, required: true },
        counter:             { type: Number, required: true },
        deviceType:          { type: String },
        backedUp:            { type: Boolean, default: false },
        transports:          { type: [String], default: [] },
        createdAt:           { type: Date, default: Date.now },
      }
    ],
    default: [],
    select: false,   // Təhlükəsizlik: default olaraq gizli
  },

  // Müvəqqəti challenge saxlama (login/register zamanı)
  webAuthnChallenge: {
    type: String,
    select: false,
  },
*/

// ── Tam nümunə: mövcud User.js-ə necə inteqrasiya et ─────────

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const passkeySchema = new mongoose.Schema({
  credentialID:        { type: String, required: true },
  credentialPublicKey: { type: String, required: true },
  counter:             { type: Number, required: true, default: 0 },
  deviceType:          { type: String, default: 'singleDevice' },
  backedUp:            { type: Boolean, default: false },
  transports:          { type: [String], default: [] },
  createdAt:           { type: Date, default: Date.now },
}, { _id: false });

const userSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatar:   { type: String, default: '/avatars/default.png' },
  role:     { type: String, enum: ['user', 'premium', 'admin'], default: 'user' },
  isVerified: { type: Boolean, default: false },

  // Email təsdiq
  verificationCode:     { type: String, select: false },
  verificationExpires:  { type: Date,   select: false },
  verificationAttempts: { type: Number, select: false },

  // Şifrə sıfırlama
  resetPasswordCode:     { type: String, select: false },
  resetPasswordExpires:  { type: Date,   select: false },
  resetPasswordAttempts: { type: Number, select: false },

  // İstifadəçi statistikası
  stats: {
    filesUploaded: { type: Number, default: 0 },
    quizzesToken:  { type: Number, default: 0 },
  },

  // ✅ YENİ — WebAuthn / Biometrik
  passkeys:         { type: [passkeySchema], default: [], select: false },
  webAuthnChallenge:{ type: String, select: false },

}, { timestamps: true });

// Şifrəni hashla
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Şifrə müqayisəsi
userSchema.methods.comparePassword = async function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model('User', userSchema);