# 🧠 StudyAI — AI-Powered Student Learning Assistant

A full-stack web application that helps students learn smarter by using AI to analyze lecture files and generate quizzes.

---

## 🗂 Project Structure

```
studyai/
├── backend/                    ← Node.js + Express API server
│   ├── models/
│   │   ├── User.js             ← User accounts + password hashing
│   │   ├── File.js             ← Uploaded files + AI analysis
│   │   └── Quiz.js             ← Quizzes + attempt tracking
│   ├── routes/
│   │   ├── auth.js             ← /api/auth (register, login, me)
│   │   ├── files.js            ← /api/files (upload, list, delete)
│   │   ├── ai.js               ← /api/ai (analyze lecture)
│   │   ├── quiz.js             ← /api/quiz (generate, submit)
│   │   └── dashboard.js        ← /api/dashboard (stats)
│   ├── middleware/
│   │   └── auth.js             ← JWT protection middleware
│   ├── utils/
│   │   ├── fileParser.js       ← PDF + DOCX text extraction
│   │   └── openaiService.js    ← All OpenAI API calls
│   ├── uploads/                ← Uploaded files stored here
│   ├── .env.example            ← Copy to .env and fill in values
│   ├── package.json
│   └── server.js               ← Entry point
│
└── frontend/                   ← React app
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── context/
    │   │   └── AuthContext.js  ← Global auth state
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── DashboardPage.js
    │   │   ├── UploadPage.js
    │   │   ├── AnalysisPage.js
    │   │   ├── QuizPage.js
    │   │   └── ResultsPage.js
    │   ├── components/
    │   │   └── Layout.js       ← Sidebar + shell
    │   ├── utils/
    │   │   └── api.js          ← Axios with auto JWT token
    │   ├── App.js              ← Routes
    │   ├── index.js            ← React entry
    │   └── index.css           ← All styles
    └── package.json
```

---

## ✅ Prerequisites

Before starting, install:

1. **Node.js** (v18+): https://nodejs.org
2. **MongoDB**: Either:
   - **Local**: https://www.mongodb.com/try/download/community
   - **Free Cloud (easier)**: https://www.mongodb.com/atlas (sign up, create free cluster, copy connection string)
3. **Anthropic API Key (FREE)**: https://console.anthropic.com
   - Sign up → click **"Get API Keys"** → **"Create Key"**
   - New accounts get **free credits** to start!

---

## 🚀 Installation & Setup

### Step 1 — Set up the Backend

```bash
# Navigate to the backend folder
cd studyai/backend

# Install all dependencies
npm install

# Copy the example env file and fill in your values
cp .env.example .env
```

Now open `backend/.env` and fill in:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/studyai
JWT_SECRET=make_this_a_long_random_string_like_abc123xyz456
ANTHROPIC_API_KEY=sk-ant-your-actual-anthropic-key-here
```

> 💡 **Using MongoDB Atlas (cloud)?** Your URI looks like:
> `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/studyai`

### Step 2 — Start the Backend

```bash
# Still in the backend folder
npm run dev
```

You should see:
```
✅ Connected to MongoDB
🚀 Server running on http://localhost:5000
```

### Step 3 — Set up the Frontend

Open a **new terminal** window:

```bash
# Navigate to the frontend folder
cd studyai/frontend

# Install all dependencies
npm install
```

### Step 4 — Start the Frontend

```bash
npm start
```

Your browser will open at **http://localhost:3000** 🎉

---

## 🔑 API Endpoints Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Login |
| GET | /api/auth/me | Get current user |

### Files
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/files/upload | Upload PDF/DOCX |
| GET | /api/files | List all user files |
| GET | /api/files/:id | Get one file |
| DELETE | /api/files/:id | Delete file |

### AI Analysis
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/analyze/:fileId | Analyze file with AI |
| GET | /api/ai/analysis/:fileId | Get existing analysis |

### Quiz
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/quiz/generate/:fileId | Generate 12-question quiz |
| GET | /api/quiz/file/:fileId | Get quiz for a file |
| POST | /api/quiz/:quizId/submit | Submit answers |
| GET | /api/quiz | List all user quizzes |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/dashboard | Get learning stats |

---

## 🔒 Security Features

- **Passwords**: Hashed with bcrypt (12 rounds) — never stored as plain text
- **JWT**: All protected routes require a valid token in the `Authorization: Bearer <token>` header
- **Rate Limiting**: Max 100 API requests per 15 minutes per IP
- **Helmet**: Secure HTTP headers on all responses
- **File Validation**: Only PDF/DOCX files under 10MB accepted
- **Input Validation**: All inputs validated with express-validator
- **User Isolation**: Every database query is scoped to the logged-in user

---

## 🎨 How the App Works (Flow)

```
1. Register / Login
        ↓
2. Upload a PDF or DOCX lecture file
        ↓
3. Click "Analyze with AI"
   → Backend extracts text from file
   → Sends text to OpenAI GPT-3.5
   → Returns: Summary + Key Points + Study Questions
        ↓
4. Click "Start Quiz"
   → Backend asks AI to generate 12 questions
   → Mix of multiple choice, true/false, and short answer
        ↓
5. Answer questions interactively
        ↓
6. See your results with:
   → Score and grade
   → Correct/incorrect breakdown
   → Explanations for each answer
        ↓
7. Dashboard tracks all your progress over time
```

---

## 🛠 Troubleshooting

**"MongoDB connection failed"**
→ Make sure MongoDB is running locally (`mongod`) or your Atlas URI is correct.

**"AI analysis failed"**
→ Check your `ANTHROPIC_API_KEY` in `.env`. Make sure you copied it correctly from console.anthropic.com.

**"Only PDF and DOCX files are allowed"**
→ Make sure your file is actually a PDF or DOCX (not .doc).

**Frontend can't connect to backend**
→ Make sure both are running. Backend on port 5000, frontend on 3000.

---

## 🌐 Deploying to Production

**Backend** → Deploy to [Railway](https://railway.app) or [Render](https://render.com) (free tier)

**Frontend** → Deploy to [Vercel](https://vercel.com) or [Netlify](https://netlify.com) (free tier)

**Database** → Use [MongoDB Atlas](https://mongodb.com/atlas) (free M0 tier)

Don't forget to set environment variables in your deployment platform!
