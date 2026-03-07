// ============================================================
// backend/utils/aiService.js
// ============================================================

const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse/lib/pdf-parse");
const mammoth = require("mammoth");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function trimText(text, maxChars = 12000) {
  if (!text) return "";
  const t = String(text);
  return t.length <= maxChars ? t : t.slice(0, maxChars) + "\n\n[... text truncated ...]";
}

async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (!fs.existsSync(filePath)) throw new Error("File not found on disk.");
  if (ext === ".pdf") {
    const data = await pdfParse(fs.readFileSync(filePath));
    return (data.text || "").trim();
  }
  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return (result.value || "").trim();
  }
  throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
}

async function analyzeLecture(text) {
  const trimmed = trimText(text);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You are an expert academic educator. Your task is to create detailed study notes from the lecture text below.

LANGUAGE RULE: Detect the language of the lecture and write your ENTIRE response in that SAME language.

CONTENT RULES:
- Use ONLY information from the lecture text. Never add outside knowledge.
- Start DIRECTLY with the first concept. NEVER start with "This lecture covers..." or similar intro phrases.
- Cover EVERY topic, definition, and fact from the original text.
- Use ## for section headings, - for bullet points.
- Be detailed and thorough — your notes should be as long as needed.

After the notes, add a line that says exactly: ===QUESTIONS===
Then write exactly 5 open-ended study questions, one per line, without numbering or prefixes.

LECTURE TEXT:
${trimmed}`,
      },
    ],
  });

  const raw = response.choices?.[0]?.message?.content?.trim() || "";

  const separator = raw.indexOf("===QUESTIONS===");
  
  let summary = "";
  let studyQuestions = [];

  if (separator !== -1) {
    summary = raw.slice(0, separator).trim();
    studyQuestions = raw
      .slice(separator + "===QUESTIONS===".length)
      .split("\n")
      .map((q) => q.replace(/^[\d\-\.\)\s]+/, "").trim())
      .filter((q) => q.length > 5)
      .slice(0, 5);
  } else {
    summary = raw;
  }

  return { summary, keyPoints: [], studyQuestions };
}

async function generateQuiz(text) {
  const trimmed = trimText(text);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.3,
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are an expert educator creating a university-level quiz.

LANGUAGE RULE: Detect the language of the lecture text and respond in that SAME language entirely.

RULES:
- Use ONLY information from the lecture text.
- Each question must have exactly 1 correct answer.
- No "All of the above" / "None of the above" options.
- Generate exactly 12 questions.

Respond ONLY with valid JSON in this exact format, nothing else:
{
  "questions": [
    {
      "questionText": "Question here?",
      "questionType": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Why this is correct"
    }
  ]
}

LECTURE TEXT:
${trimmed}`,
      },
    ],
  });

  const raw = response.choices?.[0]?.message?.content?.trim() || "";
  console.log("Quiz raw:", raw.substring(0, 500));
  const cleaned = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  try {
    return JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse quiz from AI. Please try again.");
  }
}

async function chatWithLecture(context, userMessage) {
  const ctx = trimText(context, 12000);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.2,
    max_tokens: 900,
    messages: [
      {
        role: "system",
        content:
          "You are a helpful tutor. Answer ONLY using the provided lecture context. If the answer is not in the lecture, say you cannot find it in the lecture.",
      },
      {
        role: "user",
        content: `LECTURE CONTEXT:\n${ctx}\n\nQUESTION:\n${userMessage}`,
      },
    ],
  });

  return response.choices?.[0]?.message?.content?.trim() || "";
}

module.exports = {
  extractTextFromFile,
  analyzeLecture,
  generateQuiz,
  chatWithLecture,
};