const express = require("express");
const fs = require("fs/promises");

const { protect } = require("../middleware/auth");
const User = require("../models/User");
const File = require("../models/File");
const Quiz = require("../models/Quiz");

const router = express.Router();

router.delete("/reset", protect, async (req, res) => {
  try {
    const userId = req.user._id;

    // 1) User-in bütün fayllarını tap (diskdən silmək üçün)
    const files = await File.find({ user: userId }).select("filePath");

    // 2) Diskdəki faylları sil (yoxdursa problem deyil)
    for (const f of files) {
      if (!f.filePath) continue;
      try {
        await fs.unlink(f.filePath);
      } catch (e) {
        // fayl tapılmadısa, keç
      }
    }

    // 3) DB-dən sil
    await File.deleteMany({ user: userId });
    await Quiz.deleteMany({ user: userId });

    // 4) User stats 0
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