// ============================================================
// routes/quiz.js - Quiz Generation and Attempt Routes
// POST /api/quiz/generate/:fileId  - Generate quiz from file
// GET  /api/quiz/:fileId           - Get quiz for a file
// POST /api/quiz/:quizId/submit    - Submit quiz answers
// GET  /api/quiz/results/:quizId   - Get quiz results
// ============================================================

const express = require('express');
const File = require('../models/File');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { generateQuiz } = require('../utils/aiService');

const router = express.Router();
router.use(protect);

// ── GENERATE QUIZ ─────────────────────────────────────────────
router.post('/generate/:fileId', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    if (!file.extractedText || file.extractedText.length < 50) {
      return res.status(400).json({ error: 'File has insufficient text to generate a quiz.' });
    }

    // Check if quiz already exists for this file
    const existingQuiz = await Quiz.findOne({ file: file._id, user: req.user._id });
    if (existingQuiz) {
      return res.json({
        message: 'Quiz loaded from cache.',
        quiz: formatQuizResponse(existingQuiz),
      });
    }

    // Generate quiz with AI
    const result = await generateQuiz(file.extractedText, file.originalName);

    // Save to database
    const quiz = await Quiz.create({
      user: req.user._id,
      file: file._id,
      title: `Quiz: ${file.originalName.replace(/\.(pdf|docx)$/i, '')}`,
      questions: result.questions,
    });

    res.status(201).json({
      message: 'Quiz generated successfully!',
      quiz: formatQuizResponse(quiz),
    });
  } catch (err) {
    console.error('Quiz generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate quiz.' });
  }
});

// ── GET QUIZ ──────────────────────────────────────────────────
router.get('/file/:fileId', async (req, res) => {
  try {
    const quiz = await Quiz.findOne({ file: req.params.fileId, user: req.user._id });
    if (!quiz) {
      return res.status(404).json({ error: 'No quiz found for this file.' });
    }
    res.json({ quiz: formatQuizResponse(quiz) });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching quiz.' });
  }
});

// ── SUBMIT QUIZ ───────────────────────────────────────────────
router.post('/:quizId/submit', async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    // answers = array of strings, one per question, indexed to match questions array

    const quiz = await Quiz.findOne({ _id: req.params.quizId, user: req.user._id });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found.' });
    }

    if (!answers || answers.length !== quiz.questions.length) {
      return res.status(400).json({ error: 'Please answer all questions.' });
    }

    // Grade the quiz
    let correct = 0;
    const gradedQuestions = quiz.questions.map((question, i) => {
      const userAnswer = (answers[i] || '').toString().trim().toLowerCase();
      const correctAnswer = question.correctAnswer.toString().trim().toLowerCase();

      let isCorrect = false;
      if (question.questionType === 'short-answer') {
        // For short answer, check if key words from correct answer appear in user's answer
        const keywords = correctAnswer.split(' ').filter(w => w.length > 3);
        isCorrect = keywords.some(kw => userAnswer.includes(kw));
      } else {
        isCorrect = userAnswer === correctAnswer;
      }

      if (isCorrect) correct++;

      return {
        questionText: question.questionText,
        questionType: question.questionType,
        options: question.options,
        userAnswer: answers[i],
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        isCorrect,
      };
    });

    const score = correct;
    const total = quiz.questions.length;
    const percentage = Math.round((correct / total) * 100);

    // Save this attempt
    quiz.attempts.push({ answers, score, percentage, timeTaken });
    if (percentage > quiz.bestScore) {
      quiz.bestScore = percentage;
    }
    await quiz.save();

    // Update user stats
    const user = await User.findById(req.user._id);
    const prevTotal = user.stats.totalQuizzesTaken;
    const prevAvg = user.stats.averageScore;
    const newAvg = prevTotal === 0 
      ? percentage 
      : Math.round((prevAvg * prevTotal + percentage) / (prevTotal + 1));
    
    await user.updateOne({
      $inc: { 'stats.totalQuizzesTaken': 1 },
      $set: { 'stats.averageScore': newAvg },
    });

    res.json({
      message: 'Quiz submitted!',
      results: {
        score,
        total,
        percentage,
        grade: getGrade(percentage),
        timeTaken,
        gradedQuestions,
      },
    });
  } catch (err) {
    console.error('Quiz submit error:', err);
    res.status(500).json({ error: 'Error submitting quiz.' });
  }
});

// ── GET ALL USER QUIZZES ──────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ user: req.user._id })
      .populate('file', 'originalName fileType')
      .select('-questions')
      .sort({ createdAt: -1 });
    res.json({ quizzes });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching quizzes.' });
  }
});

// ── Helper Functions ──────────────────────────────────────────
function getGrade(percentage) {
  if (percentage >= 90) return 'A';
  if (percentage >= 80) return 'B';
  if (percentage >= 70) return 'C';
  if (percentage >= 60) return 'D';
  return 'F';
}

function formatQuizResponse(quiz) {
  return {
    id: quiz._id,
    title: quiz.title,
    questionCount: quiz.questions.length,
    questions: quiz.questions.map(q => ({
      id: q._id,
      questionText: q.questionText,
      questionType: q.questionType,
      options: q.options,
      // Don't send correct answer to frontend during quiz!
    })),
    attempts: quiz.attempts.length,
    bestScore: quiz.bestScore,
    createdAt: quiz.createdAt,
  };
}

module.exports = router;
