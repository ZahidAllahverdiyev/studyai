// ============================================================
// src/pages/DashboardPage.js - Learning stats overview
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard')
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="loading-screen" style={{ minHeight: 'auto', paddingTop: 80 }}>
      <div className="spinner" />
    </div>
  );

  const stats = data?.stats || {};

  const scoreColor = (score) => {
    if (score >= 80) return 'var(--green)';
    if (score >= 60) return 'var(--yellow)';
    return 'var(--red)';
  };

 const getBakuGreeting = () => {
  const now = new Date();
  const bakuHour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Baku",
      hour: "2-digit",
      hour12: false,
    }).format(now)
  );

  if (bakuHour >= 5 && bakuHour < 12) return "Good Morning";
  if (bakuHour >= 12 && bakuHour < 18) return "Good Afternoon";
  return "Good Evening";
};

  return (
    <div>
      {/* Header */}
      <div className="page-header">
        <div>
         <h1 className="page-title">
  {getBakuGreeting()}, {user?.name?.split(" ")[0]} 👋
</h1>
          <p className="page-subtitle">Here's your learning progress at a glance.</p>
        </div>
        <Link to="/upload" className="btn btn-primary">
          📤 Upload Lecture
        </Link>
      </div>

      {/* Stats Row */}
      <div className="card-grid mb-6" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(137, 180, 250, 0.15)' }}>📄</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--blue)' }}>{stats.totalFiles || 0}</div>
            <div className="stat-label">Files Uploaded</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(166, 227, 161, 0.15)' }}>📝</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--green)' }}>{stats.totalQuizzes || 0}</div>
            <div className="stat-label">Quizzes Taken</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'rgba(203, 166, 247, 0.15)' }}>🏆</div>
          <div>
            <div className="stat-value" style={{ color: 'var(--mauve)' }}>
              {stats.averageScore || 0}%
            </div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
      </div>

      {/* Score Chart */}
      {data?.scoreHistory?.length > 0 && (
        <div className="card mb-6">
          <h3 style={{ fontFamily: 'Playfair Display', marginBottom: 4 }}>Score History</h3>
          <p className="text-muted text-sm mb-4">Your last {data.scoreHistory.length} quiz attempts</p>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.scoreHistory} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--surface2)" />
                <XAxis
                  dataKey="date"
                  tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)' }}
                  formatter={v => [`${v}%`, 'Score']}
                  labelFormatter={l => new Date(l).toLocaleDateString()}
                />
                <Line
                  type="monotone"
                  dataKey="percentage"
                  stroke="var(--blue)"
                  strokeWidth={2.5}
                  dot={{ fill: 'var(--blue)', strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Recent Files & Quizzes */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
        {/* Recent Files */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: 'Playfair Display' }}>Recent Files</h3>
            <Link to="/upload" className="btn btn-sm btn-secondary">View All</Link>
          </div>
          {data?.recentFiles?.length > 0 ? (
            data.recentFiles.slice(0,3).map(file => (
              <div key={file.id} className="file-item mb-2">
                <div className={`file-icon ${file.type}`}>
                  {file.type === 'pdf' ? '📕' : '📘'}
                </div>
                <div className="file-info">
                  <div className="file-name">{file.name}</div>
                  <div className="file-meta">
                    {new Date(file.uploadedAt).toLocaleDateString()}
                    {file.hasAnalysis && <span style={{ color: 'var(--green)', marginLeft: 8 }}>✓ Analyzed</span>}
                  </div>
                </div>
                {file.hasAnalysis ? (
                  <Link to={`/analysis/${file.id}`} className="btn btn-sm btn-secondary">View</Link>
                ) : (
                  <Link to={`/analysis/${file.id}`} className="btn btn-sm btn-primary">Analyze</Link>
                )}
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-icon">📄</div>
              <p>No files yet. Upload your first lecture!</p>
            </div>
          )}
        </div>

        {/* Recent Quizzes */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 style={{ fontFamily: 'Playfair Display' }}>Recent Quizzes</h3>
          </div>
          {data?.recentQuizzes?.length > 0 ? (
            data.recentQuizzes.slice(0,3).map(quiz => (
              <div key={quiz.id} className="file-item mb-2">
                <div className="file-icon" style={{ background: 'rgba(166, 227, 161, 0.15)' }}>
                  📝
                </div>
                <div className="file-info">
                  <div className="file-name">{quiz.title}</div>
                  <div className="file-meta">{quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}</div>
                </div>
                <div
                  className="stat-value"
                  style={{ fontSize: 18, color: scoreColor(quiz.bestScore) }}
                >
                  {quiz.bestScore}%
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state" style={{ padding: '32px 16px' }}>
              <div className="empty-icon">📝</div>
              <p>No quizzes yet. Analyze a file to get started!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
