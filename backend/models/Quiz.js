const mongoose = require('mongoose');

// Hər bir sual üçün schema
const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  // Sual tipi: çoxseçimli, doğru-yanlış, və ya qısa cavab
  questionType: {
    type: String,
    enum: ['multiple-choice', 'true-false', 'short-answer'],
    required: true,
  },
  options: [{ type: String }], // Yalnız çoxseçimli suallar üçün
  correctAnswer: { type: String, required: true },
  explanation: { type: String, default: '' },
});

// İstifadəçinin quiz cəhdi üçün schema
const attemptSchema = new mongoose.Schema({
  answers: [{ type: String }], // İstifadəçinin cavabları
  score: { type: Number },
  percentage: { type: Number },
  timeTaken: { type: Number }, // Saniyə ilə
  completedAt: { type: Date, default: Date.now },
});

// Quiz-in əsas schema-sı
const quizSchema = new mongoose.Schema(
  {
    // Quizin sahibi olan istifadəçi
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    // Quizin yaradıldığı fayl
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
  { timestamps: true }
);

module.exports = mongoose.model('Quiz', quizSchema);