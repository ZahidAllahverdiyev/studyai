// ============================================================
// src/pages/ResultsPage.js - Quiz results with score breakdown
// ============================================================

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const GRADE_COLORS = {
  A: 'var(--green)', B: 'var(--teal)', C: 'var(--yellow)', D: 'var(--peach)', F: 'var(--red)',
};
const GRADE_MESSAGES = {
  A: 'Outstanding work! You clearly mastered this material. 🌟',
  B: 'Great job! You have a solid understanding. 📚',
  C: 'Good effort! Review the missed topics to improve. 💪',
  D: "You're getting there. Study the key points and try again. 🎯",
  F: "Don't give up! Review the lecture and retake the quiz. 🔄",
};

export default function ResultsPage() {
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = sessionStorage.getItem('quizResults');
    if (!stored) {
      navigate('/dashboard');
      return;
    }
    setResults(JSON.parse(stored));
  }, [navigate]);

  if (!results) return null;

  const gradeColor = GRADE_COLORS[results.grade] || 'var(--blue)';
  const formatTime = (s) => s > 60 ? `${Math.floor(s / 60)}m ${s % 60}s` : `${s}s`;

  return (
    <div style={{ maxWidth: 760 }}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Quiz Results</h1>
          <p className="page-subtitle">Here's how you did!</p>
        </div>
        <button className="btn btn-secondary" onClick={() => navigate('/dashboard')}>
          ← Dashboard
        </button>
      </div>

      {/* Score Hero */}
      <div className="results-hero">
        <div className="score-circle" style={{ background: `rgba(0,0,0,0)` }}>
          <div style={{
            width: 160, height: 160,
            borderRadius: '50%',
            border: `8px solid var(--surface2)`,
            position: 'absolute',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            borderRadius: '50%',
            background: `conic-gradient(${gradeColor} ${results.percentage * 3.6}deg, var(--surface2) 0deg)`,
            opacity: 0.3,
          }} />
          <div style={{ position: 'relative', textAlign: 'center' }}>
            <div className="score-percentage" style={{ color: gradeColor }}>
              {results.percentage}%
            </div>
            <div className="score-grade" style={{ color: gradeColor, fontWeight: 700, fontSize: 18 }}>
              Grade {results.grade}
            </div>
          </div>
        </div>

        <h2 style={{ fontFamily: 'Playfair Display', fontSize: 26, marginBottom: 8 }}>
          {GRADE_MESSAGES[results.grade]}
        </h2>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 40, justifyContent: 'center', marginTop: 24, flexWrap: 'wrap' }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: gradeColor }}>
              {results.score}/{results.total}
            </div>
            <div className="text-muted text-sm">Correct Answers</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--blue)' }}>
              {results.total - results.score}
            </div>
            <div className="text-muted text-sm">Incorrect Answers</div>
          </div>
          {results.timeTaken && (
            <div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--mauve)' }}>
                {formatTime(results.timeTaken)}
              </div>
              <div className="text-muted text-sm">Time Taken</div>
            </div>
          )}
        </div>
      </div>

      {/* Question Breakdown */}
      <div className="card">
        <h3 style={{ fontFamily: 'Playfair Display', marginBottom: 20 }}>
          Question Review
        </h3>
        {results.gradedQuestions?.map((q, i) => (
          <div key={i} className={`result-question ${q.isCorrect ? 'correct' : 'wrong'}`}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <div className="result-q-text">
                {q.isCorrect ? '✅' : '❌'} Q{i + 1}. {q.questionText}
              </div>
              <span className={`badge ${q.isCorrect ? 'badge-green' : 'badge-red'}`} style={{ flexShrink: 0 }}>
                {q.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <div className="result-answers">
              {!q.isCorrect && (
                <div className="result-wrong">
                  Your answer: {q.userAnswer || '(no answer)'}
                </div>
              )}
              <div className="result-correct">
                Correct answer: {q.correctAnswer}
              </div>
              {q.explanation && (
                <div className="result-explanation">
                  💡 {q.explanation}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary btn-lg" onClick={() => navigate('/upload')}>
          📤 Upload New Lecture
        </button>
        <button className="btn btn-secondary btn-lg" onClick={() => navigate('/dashboard')}>
          📊 View Dashboard
        </button>
      </div>
    </div>
  );
}
