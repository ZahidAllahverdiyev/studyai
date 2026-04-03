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
Then write exactly 5 study questions. These questions must follow these strict rules:

1. DO NOT use any fact, sentence, or concept from the lecture text above
2. Use ONLY your own general knowledge about this subject area
3. Each question must push the student to research, think deeply, or explore something new
4. Questions must be open-ended — no yes/no questions
5. Cover different angles: real-world application, historical context, comparison with alternatives, future implications, common misconceptions
6. Write in the same language as the lecture
7. Do not number or prefix the questions — one per line only

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
- If a list mixes factual items with an author's personal note, remove only the personal part and keep the factual list
- If the text contains a contradictory count, remove the count word and keep the list of items as-is

WHAT TO KEEP:
- Every factual claim, definition, number, comparison, technical detail, purpose, and use case
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

  // Step 1: Clean text
  const cleanedText = await cleanTextForQuiz(trimmed);

  // Step 2: Generate quiz
  const response = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    max_tokens: 4000,
    messages: [
      {
        role: "user",
        content: `You are a university professor with 20 years of experience writing high-quality exams. You deeply understand the difference between a MEANINGFUL question and a TRIVIAL question.

LANGUAGE RULE: Detect the language of the lecture text and write ALL output in that exact same language.

SOURCE RULE: Every question and every answer option must come directly from the lecture text. Do not use outside knowledge.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT MAKES A GOOD QUESTION:
A good question forces the student to think. It tests whether they UNDERSTAND the material — not whether they memorized a sentence.

Ask about:
- The PURPOSE or FUNCTION of something ("What problem does X solve?", "Why is X used?")
- The DIFFERENCE between two things ("How does X differ from Y?")
- The CONSEQUENCE or RESULT ("What happens when X is used instead of Y?")
- A REAL SCENARIO ("A system administrator needs to do X — which tool is appropriate?")
- A KEY CHARACTERISTIC that sets something apart

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT MAKES A BAD QUESTION — NEVER DO THESE:
✗ "How do you open X?" — trivial, meaningless
✗ "What command opens X?" — trivial, meaningless  
✗ "What is the shortcut to open X?" — trivial, meaningless
✗ "What is the abbreviation of X?" — tests memory, not understanding
✗ Asking the same type of question repeatedly
✗ Using identical wrong options across multiple questions (e.g. never reuse "A: Manage system config, B: Manage security, C: Manage services" in more than one question)
✗ Using "All of the above" or "None of the above"
✗ Writing a question where the answer is obvious from the question text itself
✗ Two questions about the same topic

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUESTION MIX — write exactly 12 questions in this distribution:

3 × PURPOSE/FUNCTION questions
  → "What is the main purpose of X?"
  → "Which problem does X solve?"
  → Each must have a unique, specific correct answer — not a generic one

2 × COMPARISON questions  
  → "What is the key difference between X and Y?"
  → "Why would an administrator choose X over Y?"

3 × SCENARIO/APPLICATION questions
  → Describe a real situation, ask which tool/method/approach is correct
  → Example: "A company needs to schedule automatic backups every night. Which tool is most appropriate?"

2 × CHARACTERISTIC questions
  → About a specific feature, requirement, or limitation of a technology
  → Must test a non-obvious fact from the lecture

2 × OPEN FACT questions (maximum)
  → Only for the most important specific facts (numbers, names, versions)
  → NEVER about how to open or launch a program

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ANSWER OPTIONS RULES:
- Each question must have exactly 4 options (A, B, C, D)
- Wrong options must be from the SAME CATEGORY as the correct answer
  → If correct answer is a tool name, wrong options must also be tool names from the lecture
  → If correct answer is a purpose/function, wrong options must also be purposes/functions — but each one unique and specific, not generic filler text
- Every question must have completely different options from all other questions
- Options should be roughly equal in length
- The correct answer must be explicitly stated in the lecture

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BEFORE WRITING EACH QUESTION, ASK YOURSELF:
1. Would a student who read the lecture but didn't memorize every line get this wrong? (If NO → the question is too trivial, rewrite it)
2. Is there only ONE clearly correct answer? (If NO → rewrite)
3. Have I already asked something similar? (If YES → pick a different topic)
4. Are all 4 options completely different from the options I used in previous questions? (If NO → replace the repeated options)
5. Does correctAnswer match EXACTLY one of the option strings, character for character? (If NO → fix it)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT — respond ONLY with valid JSON, no markdown, no extra text:
{
  "questions": [
    {
      "questionText": "Question here?",
      "questionType": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact text of correct option — must match one of the options above character for character",
      "explanation": "One or two sentences from the lecture that prove this answer is correct"
    }
  ]
}

LECTURE TEXT:
${cleanedText}`,
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

  // Validate and fix correctAnswer matching
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