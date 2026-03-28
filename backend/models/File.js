const mongoose = require('mongoose');

// Yüklənmiş fayl məlumatlarını saxlayan schema
const fileSchema = new mongoose.Schema(
  {
    // Faylın sahibi olan istifadəçi
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    // Yalnız pdf və docx formatları qəbul edilir
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    fileSize: { type: Number, required: true },
    filePath: { type: String, required: true },
    // Fayldan çıxarılmış mətn
    extractedText: { type: String, default: '' },
    // AI tərəfindən yaradılmış təhlil məlumatları
    aiAnalysis: {
      summary: { type: String, default: '' },
      keyPoints: [{ type: String }],
      studyQuestions: [{ type: String }],
      processedAt: { type: Date },
    },
    // Faylın işlənmə vəziyyəti
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('File', fileSchema);