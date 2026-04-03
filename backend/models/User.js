const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// İstifadəçi məlumatlarını saxlayan schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },

    // ── Email Təsdiqləmə ──────────────────────────────────────
    // İstifadəçi qeydiyyatdan sonra emailini təsdiqləməlidir
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },         // Təsdiq kodu
    verificationExpires: { type: Date, select: false },        // Kodun son tarixi
    verificationAttempts: { type: Number, default: 0, select: false }, // Yanlış cəhd sayı

    // ── Şifrə Sıfırlama ───────────────────────────────────────
    // İstifadəçi şifrəsini unutduqda bu sahələr istifadə olunur
    resetPasswordCode: { type: String, select: false },        // Sıfırlama kodu
    resetPasswordExpires: { type: Date, select: false },       // Kodun son tarixi
    resetPasswordAttempts: { type: Number, default: 0, select: false }, // Yanlış cəhd sayı

    // ── Şifrə ─────────────────────────────────────────────────
    // select: false — sorğularda default olaraq şifrə qaytarılmır
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },

    avatar: { type: String, default: '' },

    // İstifadəçi rolu: adi, admin, və ya premium
    role: {
      type: String,
      enum: ['user', 'admin', 'premium'],
      default: 'user',
    },

    // ── Statistika ────────────────────────────────────────────
    // İstifadəçinin ümumi fəaliyyət statistikası
    stats: {
      dailyAnalysisCount: { type: Number, default: 0 },
      lastAnalysisDate: { type: Date },
      totalFilesUploaded: { type: Number, default: 0 },
      totalQuizzesTaken: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalStudyTime: { type: Number, default: 0 }, // dəqiqə ilə
    },
  },
  { timestamps: true } // createdAt və updatedAt avtomatik əlavə olunur
);

// ── Middleware ────────────────────────────────────────────────
// Saxlamadan əvvəl şifrə dəyişilibsə avtomatik hash-lənir
// bcrypt cost factor 12 — təhlükəsizlik və performans balansı
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Metodlar ─────────────────────────────────────────────────
// Daxil olarkən daxil edilən şifrəni hash ilə müqayisə edir
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);