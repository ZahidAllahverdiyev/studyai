// ============================================================
// models/User.js - MongoDB User Schema
// Defines the structure of user documents in the database.
// ============================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    
    isVerified: {
  type: Boolean,
  default: false,
},
verificationCode: {
  type: String,
  select: false,
},
verificationExpires: {
  type: Date,
  select: false,
},
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      // select: false means password won't be returned in queries by default
      select: false,
    },

    avatar: {
  type: String,
  default: "",
},
    role: {
  type: String,
  enum: ['user', 'admin', 'premium'],
  default: 'user',
},
    stats: {
      dailyAnalysisCount: { type: Number, default: 0 },
      lastAnalysisDate: { type: Date },
      totalFilesUploaded: { type: Number, default: 0 },
      totalQuizzesTaken: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
      totalStudyTime: { type: Number, default: 0 }, // in minutes
    },
  },
  {
    timestamps: true, // automatically adds createdAt and updatedAt
  }
);

// ── Hash password before saving ──────────────────────────────
// This "pre-save hook" runs automatically before every save()
userSchema.pre('save', async function (next) {
  // Only hash if password was modified (not on other updates)
  if (!this.isModified('password')) return next();

  // bcrypt with 12 rounds is strong and reasonably fast
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// ── Method to compare passwords on login ─────────────────────
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
