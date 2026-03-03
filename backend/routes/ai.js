const express = require('express');
const File = require('../models/File');
const { protect } = require('../middleware/auth');
const { analyzeLecture } = require('../utils/aiService');

const router = express.Router();
router.use(protect);

router.post('/analyze/:fileId', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    if (!file.extractedText || file.extractedText.length < 50) {
      return res.status(400).json({
        error: 'File has too little text to analyze. Please upload a file with more content.',
      });
    }

    // If already analyzed, return existing analysis
    if (file.aiAnalysis.summary && file.aiAnalysis.processedAt) {
      return res.json({
        message: 'Analysis loaded from cache.',
        analysis: file.aiAnalysis,
      });
    }

    file.status = 'processing';
    await file.save();

    // Call Gemini AI API
    const result = await analyzeLecture(file.extractedText);

    file.aiAnalysis = {
      summary: result.summary,
      keyPoints: result.keyPoints,
      studyQuestions: result.studyQuestions,
      processedAt: new Date(),
    };
    file.status = 'completed';
    await file.save();

    res.json({
      message: 'Analysis complete!',
      analysis: file.aiAnalysis,
    });
  } catch (err) {
    console.error('AI Analysis error:', err);
    await File.findByIdAndUpdate(req.params.fileId, { status: 'failed' });

    if (err.status === 429 || err.message?.includes('rate') || err.message?.includes('quota')) {
      return res.status(429).json({
        error: 'AI limit reached. Please wait 1 minutes and try again.',
      });
    }
    res.status(500).json({ error: 'AI analysis failed. Please try again.' });
  }
});

router.get('/analysis/:fileId', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, user: req.user._id })
      .select('aiAnalysis status originalName');

    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    res.json({
      fileName: file.originalName,
      status: file.status,
      analysis: file.aiAnalysis,
    });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching analysis.' });
  }
});

module.exports = router;