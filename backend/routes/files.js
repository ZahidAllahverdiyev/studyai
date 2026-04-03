// ============================================================
// routes/files.js - Fayl Yükləmə və İdarəetmə Marşrutları
//
// POST   /api/files/upload  - PDF və ya DOCX faylı yüklə
// GET    /api/files         - İstifadəçinin bütün fayllarını gətir
// GET    /api/files/:id     - Tək bir faylı gətir
// DELETE /api/files/:id     - Faylı sil
// ============================================================

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const File = require('../models/File');
const { protect } = require('../middleware/auth');
const { extractTextFromFile } = require('../utils/fileParser');

const router = express.Router();

// Bütün fayl marşrutları autentifikasiya tələb edir — token olmadan keçid yoxdur
router.use(protect);

// Yükləmə qovluğunu yoxla, yoxdursa yarat
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true }); // recursive: alt qovluqları da yaradır
}

// Multer üçün saxlama konfiqurasiyası — faylı hara və hansı adla saxlayacağını müəyyən edir
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Faylı uploads/ qovluğuna yaz
  },
  filename: (req, file, cb) => {
    // Unikal fayl adı: vaxt damğası + istifadəçi ID + orijinal uzantı
    const uniqueSuffix = Date.now() + '-' + req.user._id;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uniqueSuffix}${ext}`);
  },
});

// Yalnız PDF və DOCX fayllarına icazə ver — digər formatlar rədd edilir
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Faylı qəbul et
  } else {
    cb(new Error('Only PDF and DOCX files are allowed.'), false); // Faylı rədd et
  }
};

// Multer instansiyası — saxlama, filtr və ölçü limiti ilə
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // Default: 10MB
  },
});

// ── FAYL YÜKLƏ ────────────────────────────────────────────────
// POST /api/files/upload
// upload.single('file') — formdan gələn 'file' sahəsini oxuyur
router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    // Fayl göndərilməyibsə xəta qaytar
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    // Fayl uzantısına görə növünü müəyyən et (pdf və ya docx)
    const ext = path.extname(req.file.originalname).toLowerCase().replace('.', '');
    const fileType = ext === 'pdf' ? 'pdf' : 'docx';

    // Fayl adının kodlaşdırmasını düzəlt — xüsusi simvollar düzgün görünsün
    const originalName = decodeURIComponent(escape(req.file.originalname));

    // Fayldan mətn çıxar — uğursuz olsa upload dayandırılmır
    let extractedText = '';
    try {
      extractedText = await extractTextFromFile(req.file.path, fileType);
    } catch (parseErr) {
      console.error('Text extraction error:', parseErr.message);
    }

    // Fayl məlumatlarını verilənlər bazasına yaz
    const file = await File.create({
      user: req.user._id,
      originalName,
      filename: req.file.filename,
      fileType,
      fileSize: req.file.size,
      filePath: req.file.path,
      extractedText,
      status: extractedText ? 'completed' : 'uploaded', // Mətn varsa 'completed', yoxsa 'uploaded'
    });

    // İstifadəçinin yükləmə statistikasını artır
    await req.user.updateOne({ $inc: { 'stats.totalFilesUploaded': 1 } });

    // Uğurlu cavab — həssas məlumatları (filePath, extractedText) göndərmirik
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
    // Multer-in fayl ölçüsü xətasını ayrıca idarə et
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
    }
    res.status(500).json({ error: err.message || 'File upload failed.' });
  }
});

// ── BÜTÜN FAYLLAR ─────────────────────────────────────────────
// GET /api/files
// Yalnız bu istifadəçiyə aid faylları gətir, ən yenidən başla
router.get('/', async (req, res) => {
  try {
    const files = await File.find({ user: req.user._id })
      .select('-extractedText -filePath') // Böyük sahələri göndərmə — lazımsız yük yaradar
      .sort({ createdAt: -1 });           // Ən son yüklənən əvvəl

    res.json({ files });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching files.' });
  }
});

// ── TEK FAYL ──────────────────────────────────────────────────
// GET /api/files/:id
// ID-yə görə faylı tap — yalnız sahibi görə bilər
router.get('/:id', async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.id, user: req.user._id })
      .select('-extractedText -filePath'); // Həssas məlumatları göndərmə
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }
    res.json({ file });
  } catch (err) {
    res.status(500).json({ error: 'Error fetching file.' });
  }
});

// ── FAYLI SİL ─────────────────────────────────────────────────
// DELETE /api/files/:id
// Həm diskdəki faylı, həm də verilənlər bazası qeydini sil
router.delete('/:id', async (req, res) => {
  try {
    // Faylı tap və sahibliyini yoxla
    const file = await File.findOne({ _id: req.params.id, user: req.user._id });
    if (!file) {
      return res.status(404).json({ error: 'File not found.' });
    }

    // Diskdə fayl varsa sil
    if (fs.existsSync(file.filePath)) {
      fs.unlinkSync(file.filePath);
    }

    // Verilənlər bazasından sil
    await file.deleteOne();

    // İstifadəçinin statistikasını azalt
    await req.user.updateOne({ $inc: { 'stats.totalFilesUploaded': -1 } });

    res.json({ message: 'File deleted successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting file.' });
  }
});

module.exports = router;