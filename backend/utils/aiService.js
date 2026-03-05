// ============================================================
// backend/utils/aiService.js - Groq AI + Text extraction helpers
// ============================================================

const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");

// Text extraction deps
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/** Limit very long text so model doesn't choke */
function trimText(text, maxChars = 15000) {
  if (!text) return "";
  const t = String(text);
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars) + "\n\n[... text truncated ...]";
}

/** Remove markdown fences and parse JSON safely */
function parseJSON(raw) {
  const cleaned = String(raw || "")
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  return JSON.parse(cleaned);
}

/** Extract raw text from uploaded PDF/DOCX file path */
async function extractTextFromFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();

  if (!fs.existsSync(filePath)) {
    throw new Error("File not found on disk.");
  }

  if (ext === ".pdf") {
    const dataBuffer = fs.readFileSync(filePath);
    const data = await pdfParse(dataBuffer);
    return (data.text || "").trim();
  }

  if (ext === ".docx") {
    const result = await mammoth.extractRawText({ path: filePath });
    return (result.value || "").trim();
  }

  throw new Error("Unsupported file type. Only PDF and DOCX are supported.");
}

/** AI: Create study summary + 5 questions */
async function analyzeLecture(text) {
  const trimmed = trimText(text);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are an expert academic text editor and educator. Your job is to take raw university lecture text and transform it into clean, well-structured, easy-to-read study material.

LANGUAGE RULE:
Detect the language of the lecture text and write your ENTIRE response in that SAME language. Never mix languages.

STRICT CONTENT RULE:
Use ONLY information from the lecture text. Never add outside knowledge. Never invent examples or facts.

CRITICAL STARTING RULE:
NEVER begin the summary with introduction phrases like "This lecture covers...", "Information is given about...", "Bu mühazirədə...", "Bu mövzuda...".
Start DIRECTLY with the first real concept.

SUMMARY TASK:
- Your goal is to create a FULL STUDY NOTES (konspekt), not a short summary.
- Rewrite the ENTIRE lecture in simple, easy-to-read language.
- Keep EVERY topic, subtopic, definition, and fact from the original.
- Do NOT skip or shorten any section — if the lecture is 10 pages, your output must also be long and detailed.
- Simplify complex academic sentences into plain language a first-year student can understand.
- Remove only repeated sentences and useless filler words.
- Use bullet points and numbered lists for components, steps, types, and features.
- Use clear section headings for each topic.
- Do NOT shorten the content — your goal is clarity, not brevity.

STUDY QUESTIONS TASK:
Write exactly 5 open-ended questions based ONLY on lecture content.

OUTPUT RULES:
Return ONLY valid JSON. No markdown, no code fences, no extra text.
CRITICAL: Your entire response must start with { and end with }. 
Do NOT use backtick-json or backticks anywhere. RAW JSON ONLY.

LECTURE TEXT:
${trimmed}`,
      },
    ],
    temperature: 0.4,
    max_tokens: 8000,
  });

  const raw = response.choices?.[0]?.message?.content?.trim() || "";

  try {
    return parseJSON(raw);
  } catch {
    // Fallback so frontend doesn't crash
    return {
      summary: raw,
      studyQuestions: ["Could not parse study questions. Please try again."],
    };
  }
}

/** AI: Generate 12 MCQ quiz questions */
async function generateQuiz(text) {
  const trimmed = trimText(text);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: `You are an expert educator creating a university-level quiz.

LANGUAGE RULE:
Detect the language of the lecture text and respond in that SAME language entirely.

STRICT CONTENT RULE:
Use ONLY information explicitly written in the lecture text. Never add outside knowledge.

QUESTION CONSTRUCTION RULES:
Each question MUST have exactly 1 correct answer.

Allowed question types only:
1. Definition
2. NOT/EXCEPT
3. Purpose/Function
4. Identification
5. Comparison
6. Consequence
7. True/False statement

Forbidden question types:
- "What are the components/features/types of X?"
- "Which of the following are correct?"
- any question that could have multiple correct answers.

Forbidden answer options:
- All of the above / None of the above / Both A and B / combined options

Generate exactly 12 questions covering different parts of the lecture.

OUTPUT: Respond ONLY with valid JSON. Nothing before/after.
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
    temperature: 0.3,
    max_tokens: 3000,
  });

  const raw = response.choices?.[0]?.message?.content?.trim() || "";

  try {
    return parseJSON(raw);
  } catch (e) {
    throw new Error("Failed to parse quiz from AI. Please try again.");
  }
}

/** AI: Chat tutor that MUST use lecture context only */
async function chatWithLecture(context, userMessage) {
  const ctx = trimText(context, 15000);

  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful tutor. Answer ONLY using the provided lecture context. If the answer is not in the lecture, say you cannot find it in the lecture.",
      },
      {
        role: "user",
        content: `LECTURE CONTEXT:
${ctx}

QUESTION:
${userMessage}`,
      },
    ],
    temperature: 0.2,
    max_tokens: 900,
  });

  return response.choices?.[0]?.message?.content?.trim() || "";
}

module.exports = {
  extractTextFromFile,
  analyzeLecture,
  generateQuiz,
  chatWithLecture,
};