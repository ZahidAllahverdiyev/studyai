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
        content: `You are an expert academic educator and language editor.

YOUR FIRST PRIORITY — LANGUAGE CLEANUP:
- The lecture text may be a poor machine translation with broken sentences, grammar errors, and awkward phrasing
- Before doing anything else, mentally rewrite every sentence into clean, natural, fluent language
- Fix all grammar, spelling, and sentence structure errors
- Reorder sentences if the logic flow is broken
- NEVER preserve bad grammar or awkward phrasing — always rewrite cleanly

LANGUAGE RULE: 
- Look at the lecture text carefully and detect its language
- If the lecture is in Azerbaijani, respond ENTIRELY in Azerbaijani
- If the lecture is in Russian, respond ENTIRELY in Russian  
- If the lecture is in English, respond ENTIRELY in English
- NEVER respond in a different language than the lecture
- NEVER mix languages in your response

CONTENT RULES:
- Use ONLY the facts and information from the lecture. Never add outside knowledge.
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
    // DÜZƏLIŞ 1: temperature 0.3 → 0.1
    // Faktual suallar üçün modelin "yaradıcılığı" azaldılır.
    // Yüksək temperature modeli mətndə olmayan faktlar "icad etməyə" sövq edir.
    temperature: 0.1,
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are a strict academic assessment expert. Your only job is to extract factual questions directly from the lecture text below.

LANGUAGE RULE: Detect the language of the lecture text and respond in that SAME language entirely.

═══════════════════════════════════════════════
CRITICAL RULE — READ THIS FIRST:
You are NOT allowed to use your general knowledge.
Every question, every answer option, and every explanation MUST come directly from the lecture text.
If a fact is not explicitly written in the lecture, do NOT include it.
═══════════════════════════════════════════════

YOUR TASK:
Create exactly 12 multiple-choice questions based ONLY on what is written in the lecture text.

QUESTION RULES:
1. Every question must have EXACTLY ONE correct answer.
2. The correct answer must be a specific fact explicitly stated in the lecture.
3. NEVER ask about lists or enumerations (e.g. "which of the following are types of X") — these always produce ambiguous answers.
4. NEVER create questions where more than one option could be correct.
5. NEVER use "All of the above", "None of the above", or "Both A and B".
6. Cover different topics — never ask two similar questions.

DISTRACTOR (WRONG OPTIONS) RULES:
- Wrong options must be from the SAME CATEGORY as the correct answer.
  Example: if the correct answer is a speed value like "7200 RPM", wrong options must also be speed values like "4800 RPM", "5400 RPM", "10000 RPM".
  Example: if the correct answer is a year like "2001", wrong options must also be years.
- Wrong options should represent COMMON STUDENT MISCONCEPTIONS about the topic — not random guesses.
- NEVER invent facts that contradict the lecture — wrong options should be plausible but clearly incorrect based on the lecture.

EXPLANATION RULES:
- The explanation must quote or closely paraphrase the exact sentence from the lecture that proves the correct answer.
- Also briefly explain why the wrong options are incorrect.
- Keep explanations under 3 sentences.

SELF-CHECK BEFORE OUTPUTTING:
For each question, verify:
✓ Is this fact explicitly written in the lecture? (If NO → delete the question)
✓ Is there only ONE correct answer among the 4 options? (If NO → rewrite)
✓ Does the correctAnswer field match EXACTLY one of the strings in the options array? (If NO → fix)
✓ Are all wrong options from the same category as the correct answer? (If NO → replace)

STRICT OUTPUT FORMAT — respond ONLY with valid JSON, no extra text, no markdown:
{
  "questions": [
    {
      "questionText": "Question here?",
      "questionType": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option — must match one of the options above character for character",
      "explanation": "Explanation citing the lecture"
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

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("Failed to parse quiz from AI. Please try again.");
  }

  // DÜZƏLIŞ 2: Cavab validasiyası əlavə edildi
  // Model bəzən correctAnswer-i options içindəki mətndən fərqli yazır.
  // Bu kod hər sualı yoxlayır və uyğunsuzluqları avtomatik düzəldir.
  if (parsed?.questions) {
    parsed.questions = parsed.questions
      .map((q) => {
        // correctAnswer options-dan birindəmi?
        const exactMatch = q.options.find((o) => o === q.correctAnswer);
        if (exactMatch) return q; // Uyğundur, dəyişmə

        // Tam uyğun deyilsə, case-insensitive yoxla
        const looseMatch = q.options.find(
          (o) => o.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
        );
        if (looseMatch) {
          q.correctAnswer = looseMatch; // Düzəlt
          return q;
        }

        // Heç biri uyğun deyilsə, bu sualı sil (pozulmuş sual)
        console.warn("Dropping invalid question (correctAnswer not in options):", q.questionText);
        return null;
      })
      .filter(Boolean); // null-ları sil
  }

  return parsed;
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
        content: `You are a helpful and knowledgeable AI tutor — like ChatGPT.

LANGUAGE RULE: Always respond in the same language as the student's question.

YOUR ROLE:
- Answer any question the student asks using your full knowledge
- If the lecture context is relevant, use it to give more specific answers
- If the question is not in the lecture, still answer it from your general knowledge
- Be clear, natural, and educational — like a smart friend explaining something
- Use examples and analogies where helpful
- Never say "this is not in the lecture" — just answer

LECTURE CONTEXT (use as additional reference):
${ctx}`,
      },
      {
        role: "user",
        content: userMessage,
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