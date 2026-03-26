const express = require("express");
const fs = require("fs/promises");
const fsSync = require("fs");
const path = require("path");
const multer = require("multer");

const { protect } = require("../middleware/auth");
const User = require("../models/User");
const File = require("../models/File");
const Quiz = require("../models/Quiz");

const router = express.Router();

// ── Avatar upload config ──────────────────────────────────────
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, "../uploads/avatars");
    if (!fsSync.existsSync(dir)) fsSync.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `avatar_${req.user._id}_${Date.now()}${ext}`);
  },
});

const avatarUpload = multer({
  storage: avatarStorage,
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    allowed.includes(file.mimetype)
      ? cb(null, true)
      : cb(new Error("Only jpg/png/webp allowed"));
  },
});

// POST /api/users/avatar
router.post("/avatar", protect, avatarUpload.single("avatar"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findById(req.user._id);

    // Köhnə custom avatarı sil
    if (user.avatar && user.avatar.includes("/uploads/avatars/")) {
      const oldPath = path.join(__dirname, "../", user.avatar);
      if (fsSync.existsSync(oldPath)) fsSync.unlinkSync(oldPath);
    }

    user.avatar = avatarUrl;
    await user.save();

    res.json({ avatar: avatarUrl });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Reset ─────────────────────────────────────────────────────
router.delete("/reset", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    const files = await File.find({ user: userId }).select("filePath");

    for (const f of files) {
      if (!f.filePath) continue;
      try {
        await fs.unlink(f.filePath);
      } catch (e) {}
    }

    await File.deleteMany({ user: userId });
    await Quiz.deleteMany({ user: userId });

    await User.updateOne(
      { _id: userId },
      {
        $set: {
          "stats.totalFilesUploaded": 0,
          "stats.totalQuizzesTaken": 0,
          "stats.averageScore": 0,
          "stats.totalStudyTime": 0,
        },
      }
    );

    return res.json({ ok: true });
  } catch (err) {
    console.error("RESET_ERROR:", err);
    return res.status(500).json({ error: "Reset failed." });
  }
});

module.exports = router;