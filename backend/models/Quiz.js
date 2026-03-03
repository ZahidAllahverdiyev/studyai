// ============================================================
// models/Quiz.js - MongoDB Quiz Schema
// Stores generated quizzes and user attempts/results.
// ============================================================

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    required: true,
  },
  options: [{ type: String }], // Only for multiple-choice
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const attemptSchema = new mongoose.Schema({
  answers: [{ type: String }], // User's answers indexed by question
  score: { type: Number },
  percentage: { type: Number },
  timeTaken: { type: Number }, // seconds
  completedAt: { type: Date, default: Date.now },
});

const quizSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    file: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'File',
      required: true,
    },
    title: { type: String, required: true },
    questions: [questionSchema],
    attempts: [attemptSchema],
    bestScore: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Quiz', quizSchema);
