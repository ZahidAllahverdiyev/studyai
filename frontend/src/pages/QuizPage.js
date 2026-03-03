// ============================================================
// src/pages/QuizPage.js - Interactive quiz experience
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

const TYPE_LABELS = {
  'multiple-choice': { label: 'Multiple Choice', color: 'var(--blue)', badge: 'badge-blue' },
  'true-false': { label: 'True / False', color: 'var(--green)', badge: 'badge-green' },
  'short-answer': { label: 'Short Answer', color: 'var(--mauve)', badge: 'badge-mauve' },
};

export default function QuizPage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Try to load existing quiz, or generate one
    api.get(`/quiz/file/${fileId}`)
      .then(res => {
        setQuiz(res.data.quiz);
        setAnswers(new Array(res.data.quiz.questions.length).fill(''));
      })
      .catch(async () => {
        // No quiz yet — generate it
        setGenerating(true);
        try {
          const res = await api.post(`/quiz/generate/${fileId}`);
          setQuiz(res.data.quiz);
          setAnswers(new Array(res.data.quiz.questions.length).fill(''));
        } catch (err) {
          toast.error(err.response?.data?.error || 'Failed to generate quiz.');
          navigate(`/analysis/${fileId}`);
        } finally {
          setGenerating(false);
        }
      })
      .finally(() => setLoading(false));
  }, [fileId, navigate]);

  const currentQuestion = quiz?.questions[currentIndex];
  const isLast = currentIndex === (quiz?.questions.length ?? 0) - 1;
  const answeredCount = answers.filter(a => a !== '').length;

  const setAnswer = (value) => {
    setAnswers(prev => {
      const updated = [...prev];
      updated[currentIndex] = value;
      return updated;
    });
  };

  const handleSubmit = async () => {
    if (answeredCount < quiz.questions.length) {
      const unanswered = quiz.questions.length - answeredCount;
      if (!window.confirm(`You have ${unanswered} unanswered question(s). Submit anyway?`)) return;
    }

    setSubmitting(true);
    const timeTaken = Math.round((Date.now() - startTime.current) / 1000);
    try {
      const res = await api.post(`/quiz/${quiz.id}/submit`, {
        answers,
        timeTaken,
      });
      // Store results in sessionStorage and navigate
      sessionStorage.setItem('quizResults', JSON.stringify(res.data.results));
      navigate('/results');
    } catch (err) {
      toast.error('Failed to submit quiz.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || generating) {
    return (
      <div className="card">
        <div className="ai-loading">
          <div className="ai-loading-dots"><span /><span /><span /></div>
          <h3 style={{ fontFamily: 'Playfair Display' }}>
            {generating ? 'Generating Your Quiz...' : 'Loading Quiz...'}
          </h3>
          <p className="text-muted text-sm">
            {generating ? 'AI is crafting 12 personalized questions from your lecture.' : ''}
          </p>
        </div>
      </div>
    );
  }

  if (!quiz) return null;

  const typeInfo = TYPE_LABELS[currentQuestion.questionType];

  return (
    <div className="quiz-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Quiz Time</h1>
          <p className="page-subtitle">{quiz.title}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="quiz-progress-header">
        <span className="text-sm text-muted">
          Question {currentIndex + 1} of {quiz.questions.length}
        </span>
        <span className="text-sm text-muted">
          {answeredCount}/{quiz.questions.length} answered
        </span>
      </div>
      <div className="progress-bar-bg mb-6">
        <div
          className="progress-bar-fill"
          style={{ width: `${((currentIndex + 1) / quiz.questions.length) * 100}%` }}
        />
      </div>

      {/* Question Card */}
      <div className="question-card" key={currentIndex}>
        {/* Type Badge */}
        <div className="question-type-badge">
          <span className={`badge ${typeInfo.badge}`}>
            {typeInfo.label}
          </span>
        </div>

        {/* Question Text */}
        <div className="question-text">{currentQuestion.questionText}</div>

        {/* Answer Input */}
        {currentQuestion.questionType === 'short-answer' ? (
          <div>
            <textarea
              className="short-answer-input"
              placeholder="Type your answer here..."
              value={answers[currentIndex]}
              onChange={e => setAnswer(e.target.value)}
            />
          </div>
        ) : (
          <div>
            {currentQuestion.options.map((option, i) => {
              const letters = ['A', 'B', 'C', 'D', 'E'];
              const isSelected = answers[currentIndex] === option;
              return (
                <button
                  key={i}
                  className={`option-btn ${isSelected ? 'selected' : ''}`}
                  onClick={() => setAnswer(option)}
                >
                  <span className="option-letter">{letters[i]}</span>
                  {option}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="quiz-nav mt-6">
        <button
          className="btn btn-secondary"
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(i => i - 1)}
        >
          ← Previous
        </button>

        {/* Jump to unanswered */}
        <div className="flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {quiz.questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                border: '2px solid',
                borderColor: i === currentIndex ? 'var(--blue)' : answers[i] ? 'var(--green)' : 'var(--surface2)',
                background: i === currentIndex ? 'rgba(137,180,250,0.15)' : answers[i] ? 'rgba(166,227,161,0.1)' : 'transparent',
                color: i === currentIndex ? 'var(--blue)' : answers[i] ? 'var(--green)' : 'var(--muted)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>

        {isLast ? (
          <button
            className="btn btn-success"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? '⏳ Submitting...' : '✓ Submit Quiz'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() => setCurrentIndex(i => i + 1)}
          >
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
