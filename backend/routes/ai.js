const express = require("express");
const File = require("../models/File");
const { protect } = require("../middleware/auth");
const { analyzeLecture } = require("../utils/aiService");

const router = express.Router();
router.use(protect);

router.post("/chat/:fileId", async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || !message.trim()) {
      return res.status(400).json({ error: "Message is required." });
    }

    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.user._id,
    }).select("extractedText aiAnalysis originalName");

    if (!file) return res.status(404).json({ error: "File not found." });
    if (!file.extractedText || file.extractedText.length < 50) {
      return res.status(400).json({ error: "File text is too short." });
    }

    // ✅ Qısa context: AI summary varsa onu da əlavə edirik
    const context = file.aiAnalysis?.summary
      ? `SUMMARY:\n${file.aiAnalysis.summary}\n\nLECTURE TEXT:\n${file.extractedText}`
      : `LECTURE TEXT:\n${file.extractedText}`;

    const { chatWithLecture } = require("../utils/aiService");
    const answer = await chatWithLecture(context, message);

    return res.json({ answer });
  } catch (err) {
    console.error("Chat error:", err);
    return res.status(500).json({ error: "Chat failed." });
  }
});
// ✅ DOCX DOWNLOAD
router.get("/download/:fileId", async (req, res) => {
  try {
    const file = await File.findOne({
      _id: req.params.fileId,
      user: req.user._id,
    }).select("aiAnalysis originalName");

    if (!file?.aiAnalysis?.summary) {
      return res.status(404).json({ error: "Analysis not found." });
    }

    const { Document, Packer, Paragraph, HeadingLevel } = require("docx");

    const title = `${file.originalName} - StudyAI Notes`;
    const text = String(file.aiAnalysis.summary || "");

    const lines = text
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const children = [
      new Paragraph({ text: title, heading: HeadingLevel.HEADING_1 }),
      new Paragraph({ text: "" }),
    ];

    for (const line of lines) {
      if (line.startsWith("### ")) {
        children.push(
          new Paragraph({
            text: line.replace(/^###\s+/, ""),
            heading: HeadingLevel.HEADING_3,
          })
        );
        continue;
      }

      if (line.startsWith("## ")) {
        children.push(
          new Paragraph({
            text: line.replace(/^##\s+/, ""),
            heading: HeadingLevel.HEADING_2,
          })
        );
        continue;
      }

      if (line.startsWith("# ")) {
        children.push(
          new Paragraph({
            text: line.replace(/^#\s+/, ""),
            heading: HeadingLevel.HEADING_1,
          })
        );
        continue;
      }

      if (/^(-|•)\s+/.test(line)) {
        children.push(
          new Paragraph({
            text: line.replace(/^(-|•)\s+/, ""),
            bullet: { level: 0 },
          })
        );
        continue;
      }

      children.push(new Paragraph({ text: line }));
    }

    const doc = new Document({
      sections: [{ children }],
    });

    const buffer = await Packer.toBuffer(doc);

    const rawName = `${file.originalName || "studyai"}-notes.docx`;
    const fallback = "studyai-notes.docx";
    const encoded = encodeURIComponent(rawName);

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    return res.send(buffer);
  } catch (err) {
    console.error("DOCX download error:", err);
    return res.status(500).json({ error: "Failed to generate DOCX." });
  }
});

// ✅ ANALYZE
router.post("/analyze/:fileId", async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, user: req.user._id });
    if (!file) return res.status(404).json({ error: "File not found." });

    if (!file.extractedText || file.extractedText.length < 50) {
      return res.status(400).json({
        error: "File has too little text to analyze. Please upload a file with more content.",
      });
    }

    if (file.aiAnalysis.summary && file.aiAnalysis.processedAt) {
      return res.json({ message: "Analysis loaded from cache.", analysis: file.aiAnalysis });
    }

    file.status = "processing";
    await file.save();

    const result = await analyzeLecture(file.extractedText);

    file.aiAnalysis = {
      summary: result.summary,
      keyPoints: result.keyPoints,
      studyQuestions: result.studyQuestions,
      processedAt: new Date(),
    };
    file.status = "completed";
    await file.save();

    return res.json({ message: "Analysis complete!", analysis: file.aiAnalysis });
  } catch (err) {
    console.error("AI Analysis error FULL:", err);
    console.error("AI Analysis error MESSAGE:", err.message);
    console.error("AI Analysis error STATUS:", err.status);
    await File.findByIdAndUpdate(req.params.fileId, { status: "failed" });

    if (err.status === 429 || err.message?.includes("rate") || err.message?.includes("quota")) {
      return res.status(429).json({ error: "AI limit reached. Please wait 1 minutes and try again." });
    }
    return res.status(500).json({ error: "AI analysis failed. Please try again." });
  }
});

// ✅ GET ANALYSIS
router.get("/analysis/:fileId", async (req, res) => {
  try {
    const file = await File.findOne({ _id: req.params.fileId, user: req.user._id })
      .select("aiAnalysis status originalName");

    if (!file) return res.status(404).json({ error: "File not found." });

    return res.json({
      fileName: file.originalName,
      status: file.status,
      analysis: file.aiAnalysis,
    });
  } catch (err) {
    return res.status(500).json({ error: "Error fetching analysis." });
  }
});

module.exports = router;