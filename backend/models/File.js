// ============================================================
// models/File.js - MongoDB File Schema
// Stores info about uploaded lecture files and their AI analysis.
// ============================================================

const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx'],
      required: true,
    },
    fileSize: {
      type: Number, // in bytes
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    // Extracted raw text from the document
    extractedText: {
      type: String,
      default: '',
    },
    // AI-generated content stored here
    aiAnalysis: {
      summary: { type: String, default: '' },
      keyPoints: [{ type: String }],
      studyQuestions: [{ type: String }],
      processedAt: { type: Date },
    },
    // Track processing status
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'completed', 'failed'],
      default: 'uploaded',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('File', fileSchema);
