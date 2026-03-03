// ============================================================
// routes/dashboard.js - Dashboard Statistics Route
// GET /api/dashboard - Returns learning stats for the user
// ============================================================

const express = require('express');
const File = require('../models/File');
const Quiz = require('../models/Quiz');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user stats
    const user = await User.findById(userId);

    // Get recent files
    const recentFiles = await File.find({ user: userId })
      .select('originalName fileType status createdAt aiAnalysis')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get recent quizzes with results
    const recentQuizzes = await Quiz.find({ user: userId })
      .populate('file', 'originalName')
      .select('title bestScore attempts createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Score distribution for chart
    const allQuizzes = await Quiz.find({ user: userId }).select('attempts');
    const scoreHistory = allQuizzes
      .flatMap(q => q.attempts)
      .sort((a, b) => new Date(a.completedAt) - new Date(b.completedAt))
      .slice(-10) // last 10 attempts
      .map(a => ({
        percentage: a.percentage,
        date: a.completedAt,
      }));

    res.json({
      stats: {
        totalFiles: user.stats.totalFilesUploaded,
        totalQuizzes: user.stats.totalQuizzesTaken,
        averageScore: user.stats.averageScore,
      },
      recentFiles: recentFiles.map(f => ({
        id: f._id,
        name: f.originalName,
        type: f.fileType,
        status: f.status,
        hasAnalysis: !!f.aiAnalysis?.summary,
        uploadedAt: f.createdAt,
      })),
      recentQuizzes: recentQuizzes.map(q => ({
        id: q._id,
        title: q.title,
        fileName: q.file?.originalName,
        bestScore: q.bestScore,
        attempts: q.attempts.length,
        createdAt: q.createdAt,
      })),
      scoreHistory,
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Error loading dashboard.' });
  }
});

module.exports = router;
