const Groq = require("groq-sdk");
const fs = require("fs");
const path = require("path");
const pdfParse = require("pdf-parse/lib/pdf-parse");
const mammoth = require("mammoth");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY || '' });

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
async function cleanTextForQuiz(rawText) {
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are a precise text editor. Clean the lecture text below so it is suitable for generating exam questions.

WHAT TO REMOVE:
- Author's personal notes (e.g. "I showed this in the image", "as I mentioned", "Mən şəkildəki izahı göstərmişəm", "see my diagram", "I recommend")
- Any word or phrase where the author refers to themselves ("Mən", "I", "me", "my diagram", "as I showed")
- Incomplete or broken sentences that do not state a clear fact

WHAT TO FIX:
- If a list mixes factual items with an author's personal note (e.g. "Qara, Yaşıl, Göy, Mən şəkildəki..."), remove only the personal part and keep the factual list ("Qara, Yaşıl, Göy")
- If the text contains a contradictory count (e.g. says "three types" but then lists four items), remove the count word and keep the list of items as-is

WHAT TO KEEP:
- Every factual claim, definition, number, comparison, and technical detail
- The original language of the text — do NOT translate

Return ONLY the cleaned text. No explanation, no preamble.

TEXT:
${rawText}`,
      },
    ],
  });

  return response.choices?.[0]?.message?.content?.trim() || rawText;
}

async function generateQuiz(text) {
  const trimmed = trimText(text);

  // ADDIM 1: Mətni quiz üçün təmizlə
  const cleanedText = await cleanTextForQuiz(trimmed);

  // ADDIM 2: Təmiz mətnlə quiz yarat
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 3000,
    messages: [
      {
        role: "user",
        content: `You are a seasoned academic professor with 20 years of experience designing university-level exams. Your mission is to create questions that test DEEP UNDERSTANDING — not memorization, not trivial recall.

LANGUAGE RULE: Detect the language of the lecture text and respond in that SAME language entirely.

ABSOLUTE RULE: Every question, answer option, and explanation must be grounded in the lecture text. Do not use outside knowledge.

═══════════════════════════════════════════════
QUESTION TYPE DISTRIBUTION — you must use ALL 5 types:
═══════════════════════════════════════════════

TYPE 1 — CONCEPTUAL UNDERSTANDING (3 questions)
Test whether the student truly understands the concept, not just memorized it.
Ask "Why?", "What is the purpose of?", "Under what conditions?", "What problem does X solve?"
Example: "Why is NTFS preferred over FAT32 for enterprise environments?"

TYPE 2 — COMPARISON (2 questions)  
Compare two concepts, technologies, or approaches covered in the lecture.
Example: "What is the key difference between TCP and UDP?"

TYPE 3 — PRACTICAL SCENARIO (3 questions)
Give a real-world situation and ask the student to choose the correct solution.
Format: "A company has [problem]. Which approach is most appropriate?"
Example: "A network administrator needs to share one printer across 50 users. What is the best method?"

TYPE 4 — CRITICAL FACT (2 questions)
The most important facts from the lecture — numbers, specifications, key names.
But NEVER ask trivial "how do you open X?" questions.

TYPE 5 — APPLICATION & PURPOSE (2 questions)
"What is the main function of X?", "Which problem does this technology solve?", "When would you use X over Y?"

═══════════════════════════════════════════════
STRICT PROHIBITIONS — never do these:
═══════════════════════════════════════════════
❌ NEVER ask "How do you open X?" — this is trivial and worthless
❌ NEVER ask "What is the abbreviation of X?" — this tests memory, not understanding
❌ NEVER create two similar questions — each question must cover a different topic
❌ NEVER use "All of the above" or "None of the above"
❌ NEVER write 12 questions in the same format — variety is mandatory
❌ NEVER embed the answer inside the question itself
❌ NEVER ask questions where multiple options could be correct

DISTRACTOR RULES:
- Wrong options must belong to the same category as the correct answer
- Wrong options must be plausible but clearly incorrect based on the lecture
- All options should be roughly equal in length

SELF-CHECK before outputting each question:
✓ Does this question require the student to THINK? (NO → rewrite)
✓ Is this fact explicitly in the lecture? (NO → delete)
✓ Is there ONLY ONE correct answer? (NO → rewrite)
✓ Does correctAnswer match EXACTLY one option string character for character? (NO → fix)
✓ Is this question different from all previous questions? (NO → replace)

STRICT OUTPUT FORMAT — respond ONLY with valid JSON, no extra text, no markdown:
{
  "questions": [
    {
      "questionText": "Question here?",
      "questionType": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option",
      "explanation": "Brief explanation citing the lecture"
    }
  ]
}

LECTURE TEXT:
${cleanedText}`
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

  // ADDIM 3: correctAnswer validasiyası
  // Model bəzən correctAnswer-i options-dakı mətndən fərqli yazır.
  // Bu kod avtomatik düzəldir və ya pozulmuş sualları silir.
  if (parsed?.questions) {
    parsed.questions = parsed.questions
      .map((q) => {
        const exactMatch = q.options.find((o) => o === q.correctAnswer);
        if (exactMatch) return q;

        const looseMatch = q.options.find(
          (o) => o.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()
        );
        if (looseMatch) {
          q.correctAnswer = looseMatch;
          return q;
        }

        console.warn("Dropping invalid question (correctAnswer not in options):", q.questionText);
        return null;
      })
      .filter(Boolean);
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