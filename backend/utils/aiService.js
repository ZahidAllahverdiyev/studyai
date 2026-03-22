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
- IMPORTANT: The lecture text may contain poor machine translation or awkward phrasing. Rewrite all content in clean, natural, academically proper language while preserving the original meaning and facts.
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
        content: `You are a world-class university professor and assessment expert with 20 years of experience creating high-stakes examinations.

LANGUAGE RULE: Detect the language of the lecture text and respond in that SAME language entirely.

YOUR MISSION:
Create 12 multiple-choice questions that genuinely test whether a student has deeply understood the lecture.

ABSOLUTE RULES — NEVER VIOLATE:
1. Every question must have EXACTLY ONE correct answer. No exceptions.
2. NEVER ask about lists, categories, or enumerations from the lecture (e.g. "which interfaces", "which types", "which features", "which advantages"). These always produce ambiguous answers.
3. NEVER create questions where multiple options could be considered correct or partially correct.
4. All 4 options must be plausible — a student who hasn't studied should struggle to choose.
5. NEVER use "All of the above", "None of the above", "Both A and B".
6. Use ONLY information explicitly stated in the lecture. Never add outside knowledge.
7. Cover DIFFERENT topics — never ask two similar questions.
8. The correct answer must be ONE specific, unambiguous fact from the lecture.

GOOD QUESTION TYPES (use these):
- "What replaced X?" → one specific answer
- "What is the main disadvantage of X?" → one specific answer  
- "In what year was X introduced?" → one specific answer
- "What does X measure?" → one specific answer
- "Why is X used instead of Y?" → one specific answer
- "What happens when X occurs?" → one specific answer

BAD QUESTION TYPES (never use these):
- "Which of the following are types of X?" → multiple correct answers possible
- "What are the advantages of X?" → multiple correct answers possible
- "Which interfaces does X support?" → multiple correct answers possible
- "What are the features of X?" → multiple correct answers possible

QUESTION TYPE DISTRIBUTION:
- 4 questions: Specific factual (dates, measurements, names — non-obvious details)
- 4 questions: Conceptual (why/how something works)
- 2 questions: Comparative (specific difference between two concepts)
- 2 questions: Cause-effect (what causes what, what results from what)

DISTRACTOR RULES:
- Wrong options must reflect common misconceptions, not obviously wrong guesses.
- Wrong options must be from the same category as the correct answer.
- Example: if correct answer is "5400 RPM", wrong options should also be RPM values, not random words.

EXPLANATION RULES:
- Each explanation must directly quote or closely reference the lecture text.
- Explain WHY the correct answer is right AND why the others are wrong.

STRICT OUTPUT FORMAT — respond ONLY with valid JSON, no extra text:
{
  "questions": [
    {
      "questionText": "Question here?",
      "questionType": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option",
      "explanation": "Specific explanation citing the lecture"
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