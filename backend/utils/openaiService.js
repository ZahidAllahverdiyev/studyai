// ============================================================
// utils/openaiService.js - All AI calls go through here
// This keeps AI logic in one place - easy to swap providers.
// ============================================================

const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Trim text to avoid exceeding token limits (~3000 words max)
function trimText(text, maxChars = 12000) {
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + '\n\n[... text truncated for processing ...]';
}

/**
 * Generate summary, key points, and study questions from lecture text.
 */
async function analyzeLecture(text) {
  const trimmed = trimText(text);

  const prompt = `You are an expert academic tutor. Analyze the following lecture content and provide:

1. SUMMARY: A comprehensive 3-5 paragraph summary of the main topic and concepts.
2. KEY POINTS: Exactly 8-10 bullet points of the most important facts, concepts, or ideas.
3. STUDY QUESTIONS: 5 open-ended study questions to help the student review the material.

Format your response as valid JSON with this exact structure:
{
  "summary": "paragraph text here...",
  "keyPoints": ["point 1", "point 2", ...],
  "studyQuestions": ["question 1?", "question 2?", ...]
}

LECTURE CONTENT:
${trimmed}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 2000,
  });

  const content = response.choices[0].message.content.trim();
  
  // Parse the JSON response
  try {
    // Handle cases where model wraps in ```json ... ```
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    // Fallback if JSON parsing fails
    return {
      summary: content,
      keyPoints: ['Could not parse key points. Please try again.'],
      studyQuestions: ['Could not parse study questions. Please try again.'],
    };
  }
}

/**
 * Generate a 10+ question quiz from lecture text.
 */
async function generateQuiz(text, title) {
  const trimmed = trimText(text);

  const prompt = `You are an expert educator. Create a comprehensive quiz based on the following lecture content.

Generate EXACTLY 12 questions with this mix:
- 6 multiple-choice questions (4 options each, one correct)
- 3 true/false questions
- 3 short-answer questions

Format as valid JSON:
{
  "questions": [
    {
      "questionText": "Question here?",
      "questionType": "multiple-choice",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Option A",
      "explanation": "Brief explanation why this is correct"
    },
    {
      "questionText": "True or False: Statement here.",
      "questionType": "true-false",
      "options": ["True", "False"],
      "correctAnswer": "True",
      "explanation": "Brief explanation"
    },
    {
      "questionText": "Short answer question here?",
      "questionType": "short-answer",
      "options": [],
      "correctAnswer": "Expected answer keywords",
      "explanation": "What a good answer should include"
    }
  ]
}

LECTURE CONTENT:
${trimmed}`;

  const response = await openai.chat.completions.create({
    model: 'gpt-3.5-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 3000,
  });

  const content = response.choices[0].message.content.trim();
  
  try {
    const cleaned = content.replace(/```json\n?|\n?```/g, '').trim();
    return JSON.parse(cleaned);
  } catch {
    throw new Error('Failed to parse quiz from AI response. Please try again.');
  }
}

module.exports = { analyzeLecture, generateQuiz };
