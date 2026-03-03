// ============================================================
// src/pages/AnalysisPage.js - Shows AI analysis of a file
// ============================================================

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function AnalysisPage() {
  const { fileId } = useParams();
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);

  useEffect(() => {
    // Load file info and existing analysis
    api.get(`/ai/analysis/${fileId}`)
      .then(res => {
        setFile({ name: res.data.fileName, status: res.data.status });
        if (res.data.analysis?.summary) {
          setAnalysis(res.data.analysis);
        }
      })
      .catch(() => toast.error('File not found'))
      .finally(() => setLoading(false));
  }, [fileId]);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const res = await api.post(`/ai/analyze/${fileId}`);
      setAnalysis(res.data.analysis);
      toast.success('AI analysis complete! ✨');
    } catch (err) {
      const msg = err.response?.data?.error || 'Analysis failed.';
      toast.error(msg);
      if (msg.includes('little text')) {
        // Navigate back to upload
        setTimeout(() => navigate('/upload'), 2000);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGenerateQuiz = async () => {
    setGeneratingQuiz(true);
    try {
      await api.post(`/quiz/generate/${fileId}`);
      toast.success('Quiz generated! 🎯');
      navigate(`/quiz/${fileId}`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate quiz.');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-screen" style={{ minHeight: 'auto', paddingTop: 80 }}>
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%', padding: '0 24px' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Analysis</h1>
          <p className="page-subtitle">
            📄 {file?.name || 'Lecture File'}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/upload')}
          >
            ← Back
          </button>
          {analysis && (
            <button
              className="btn btn-primary"
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
            >
              {generatingQuiz ? '⏳ Generating Quiz...' : '📝 Take Quiz'}
            </button>
          )}
        </div>
      </div>

      {/* Analyze Prompt (if not yet analyzed) */}
      {!analysis && !analyzing && (
        <div className="card" style={{ textAlign: 'center', padding: '60px 32px' }}>
          <div style={{ fontSize: 64, marginBottom: 20 }}>🤖</div>
          <h2 style={{ fontFamily: 'Playfair Display', marginBottom: 12 }}>
            Ready to Analyze This Lecture?
          </h2>
          <p className="text-muted mb-6" style={{ maxWidth: 480, margin: '0 auto 24px' }}>
            Our AI will read your lecture and generate a comprehensive summary,
            extract key points, and create study questions — all in seconds.
          </p>
          <button className="btn btn-primary btn-lg" onClick={handleAnalyze}>
            🧠 Analyze with AI
          </button>
        </div>
      )}

      {/* Loading Animation */}
      {analyzing && (
        <div className="card">
          <div className="ai-loading">
            <div className="ai-loading-dots">
              <span /><span /><span />
            </div>
            <h3 style={{ fontFamily: 'Playfair Display' }}>Analyzing Your Lecture...</h3>
            <p className="text-muted text-sm">
              The AI is reading through your file, extracting knowledge, and preparing your study materials.
              This usually takes 15–30 seconds.
            </p>
          </div>
        </div>
      )}

      {/* Analysis Results */}
      {analysis && (
        <>
          {/* Summary */}
          <div className="card mb-4">
            <div className="analysis-section">
              <div className="analysis-section-title">
                📖 Summary
              </div>
              <p className="summary-text">{analysis.summary}</p>
            </div>
          </div>

          {/* Key Points */}
          {analysis.keyPoints?.length > 0 && (
            <div className="card mb-4">
              <div className="analysis-section">
                <div className="analysis-section-title">
                  ⚡ Key Points ({analysis.keyPoints.length})
                </div>
                {analysis.keyPoints.map((point, i) => (
                  <div key={i} className="key-point">
                    <span className="key-point-num">{String(i + 1).padStart(2, '0')}</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Study Questions */}
          {analysis.studyQuestions?.length > 0 && (
            <div className="card mb-4">
              <div className="analysis-section">
                <div className="analysis-section-title">
                  🤔 Study Questions
                </div>
                {analysis.studyQuestions.map((q, i) => (
                  <div key={i} className="study-question">
                    <strong style={{ color: 'var(--mauve)', marginRight: 8 }}>Q{i + 1}.</strong>
                    {q}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CTA to Quiz */}
          <div className="card" style={{
            background: 'linear-gradient(135deg, rgba(137,180,250,0.08), rgba(203,166,247,0.08))',
            textAlign: 'center',
            padding: '40px 32px',
          }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <h3 style={{ fontFamily: 'Playfair Display', marginBottom: 8 }}>
              Ready to Test Your Knowledge?
            </h3>
            <p className="text-muted mb-4">
              Take an AI-generated quiz with 12 questions to see how well you understood the material.
            </p>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleGenerateQuiz}
              disabled={generatingQuiz}
            >
              {generatingQuiz ? '⏳ Generating Quiz...' : '🚀 Start Quiz'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
