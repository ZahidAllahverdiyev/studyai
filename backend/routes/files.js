// ============================================================
// routes/files.js - File Upload and Management Routes
// POST /api/files/upload  - Upload a PDF or DOCX file
// GET  /api/files         - Get all user's files
// GET  /api/files/:id     - Get one file
// DELETE /api/files/:id   - Delete a file
// ============================================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { protect } = require('../middleware/auth');
const { extractTextFromFile } = require('../utils/fileParser');

const router = express.Router();

// All file routes require authentication
router.use(protect);

// ── Multer Configuration ─────────────────────────────────────
// Multer handles multipart/form-data (file uploads)

// Make sure the uploads directory exists
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create a unique filename: timestamp-userid-originalname
    const uniqueSuffix = Date.now() + '-' + req.user._id;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // Only accept PDF and DOCX files
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and DOCX files are allowed.'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB default
  },
});

// ── UPLOAD FILE ───────────────────────────────────────────────
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : 'docx';

    // Extract text from the uploaded file
    let extractedText = '';
    try {
      extractedText = await extractTextFromFile(req.file.path, fileType);
    } catch (parseErr) {
      console.error('Text extraction error:', parseErr.message);
      // Don't fail the upload if text extraction fails
    }

    // Save file record to database
    const file = await File.create({
      user: req.user._id,
      originalName: Buffer.from(req.file.originalname, 'latin1').toString('utf8'),
      filename: req.file.filename,
      fileType,
      fileSize: req.file.size,
      filePath: req.file.path,
      extractedText,
      status: extractedText ? 'completed' : 'uploaded',
    });

    // Update user's file count
    await req.user.updateOne({ $inc: { 'stats.totalFilesUploaded': 1 } });

    res.status(201).json({
      message: 'File uploaded successfully!',
      file: {
        id: file._id,
        originalName: file.originalName,
        fileType: file.fileType,
        fileSize: file.fileSize,
        status: file.status,
        hasText: !!extractedText,
        createdAt: file.createdAt,
      },
    });
  } catch (err) {
    console.error('Upload error:', err);
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

// ── GET ALL FILES ─────────────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id })
      .select('-extractedText -filePath') // Don't send large fields
      .sort({ createdAt: -1 });

    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching files.' });
  }
});

// ── GET ONE FILE ──────────────────────────────────────────────
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }
    res.json({ file });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching file.' });
  }
});

// ── DELETE FILE ───────────────────────────────────────────────
router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Delete physical file from disk
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    await file.deleteOne();
    res.json({ message: 'File deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting file.' });
  }
});

module.exports = router;
