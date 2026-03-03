const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function trimText(text, maxChars = 15000) {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n\n[... text truncated ...]';
}

function parseJSON(raw) {
  const cleaned = raw
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  return JSON.parse(cleaned);
}

async function analyzeLecture(text) {
  const trimmed = trimText(text);

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are an expert academic text editor and educator. Your job is to take raw university lecture text and transform it into a clean, well-structured, easy-to-read study material.

LANGUAGE RULE:
Detect the language of the lecture text and write your ENTIRE response in that SAME language. Never mix languages.

STRICT CONTENT RULE:
Use ONLY information from the lecture text. Never add outside knowledge. Never invent examples or facts.

CRITICAL STARTING RULE:
NEVER begin the summary with introduction phrases like "This lecture covers...", "Information is given about...", "Bu mühazirədə...", "Bu mövzuda...", or any sentence that describes what the lecture is about. Start DIRECTLY with the first real concept.

SUMMARY TASK - HOW TO TRANSFORM THE TEXT:

STEP 1 - UNDERSTAND:
Read the entire lecture carefully. Identify all main topics, subtopics, definitions, principles, components, and classifications.

STEP 2 - CLEAN:
Remove filler sentences, unnecessary repetition, and redundant phrases. Keep every important fact, definition, term, and concept.

STEP 3 - RESTRUCTURE:
Organize the content logically. Group related ideas together. Each main topic gets its own paragraph.

STEP 4 - FORMAT PROPERLY:
This is very important for readability:
- When the text has a LIST of items (principles, components, types, steps, features etc.) — ALWAYS write them as a numbered list (1. 2. 3.) or with dashes (- item), NEVER as a long comma-separated sentence
- Each paragraph should start with the topic it covers
- Use short, clear sentences
- Keep technical terms but explain them simply

STEP 5 - FINAL CHECK:
The transformed text must be:
- More readable than the original
- Well organized with clear paragraphs and lists
- Complete — no important information missing
- NOT too short — the summary must cover ALL topics from the lecture
- If the original text is long, your summary should also be detailed and long
- Never sacrifice completeness for brevity
- Written in academic but simple language

STUDY QUESTIONS TASK:
Write exactly 5 open-ended questions based only on the lecture content. Questions must make students think deeply. Every question must be answerable from the lecture text only.

OUTPUT: Respond ONLY with valid JSON. Nothing before or after. No markdown.
{
  "summary": "Your transformed lecture text here with proper paragraphs and numbered lists where needed...",
  "studyQuestions": ["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]
}

LECTURE TEXT:
${trimmed}`
      }
    ],
    temperature: 0.5,
    max_tokens: 6000,
  });

  const raw = response.choices[0].message.content.trim();

  try {
    return parseJSON(raw);
  } catch {
    return {
      summary: raw,
      studyQuestions: ['Could not parse study questions. Please try again.'],
    };
  }
}

async function generateQuiz(text) {
  const trimmed = trimText(text);

  const response = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `You are an expert educator creating a university-level quiz.

LANGUAGE RULE:
Detect the language of the lecture text and respond in that SAME language entirely.

STRICT CONTENT RULE:
Use ONLY information explicitly written in the lecture text. Never add outside knowledge.

QUESTION CONSTRUCTION RULES:
Each question MUST have exactly 1 correct answer. This is non-negotiable.

To guarantee 1 correct answer, you MUST use these question types ONLY:
1. Definition: "What does X mean?" / "X nədir?"
2. NOT/EXCEPT: "Which of the following is NOT X?" / "Hansı X deyildir?"
3. Purpose/Function: "What is the purpose of X?" / "X-in məqsədi nədir?"
4. Identification: "Which of the following is an example of X?"
5. Comparison: "What is the main difference between X and Y?"
6. Consequence: "What happens when X occurs?"
7. Correct statement: "Which statement about X is TRUE/FALSE?"

STRICTLY FORBIDDEN question types (these always create multiple correct answers):
- "What are the components/features/types of X?" → NEVER use
- "What should be considered when doing X?" → NEVER use  
- "What are the characteristics of X?" → NEVER use
- "Which of the following are correct?" → NEVER use

STRICTLY FORBIDDEN answer options (in any language):
- "All of the above" / "Bütün variantlar" / "Hamısı"
- "None of the above" / "Heç biri"
- "Both A and B" / "A və B ikisi də"
- Any option that combines other options

OPTION QUALITY RULES:
- All 4 options must look plausible — no obviously silly/wrong options
- Each option must be a single, independent, specific answer
- Options should be similar in length and style

Generate exactly 12 questions covering different parts of the lecture.

OUTPUT: Respond ONLY with valid JSON. Nothing before or after. No markdown.
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
${trimmed}`
      }
    ],
    temperature: 0.3,
    max_tokens: 3000,
  });

  const raw = response.choices[0].message.content.trim();

  try {
    return parseJSON(raw);
  } catch {
    throw new Error('Failed to parse quiz from AI. Please try again.');
  }
}

module.exports = { analyzeLecture, generateQuiz };