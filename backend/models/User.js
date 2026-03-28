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
    // Email təsdiqləmə üçün sahələr
    isVerified: { type: Boolean, default: false },
    verificationCode: { type: String, select: false },
    verificationExpires: { type: Date, select: false },
    // select: false - sorğularda default olaraq şifrə qaytarılmır
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
    // İstifadəçinin ümumi statistikası
    stats: {
      dailyAnalysisCount: { type: Number, default: 0 },
      lastAnalysisDate: { type: Date },
      totalFilesUploaded: { type: Number, default: 0 },
      totalQuizzesTaken: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalStudyTime: { type: Number, default: 0 }, // dəqiqə ilə
    },
  },
  { timestamps: true }
);

// Saxlamadan əvvəl şifrə avtomatik hash-lənir
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Daxil olarkən şifrəni müqayisə edir
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);