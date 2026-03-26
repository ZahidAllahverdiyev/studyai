// ============================================================
// src/pages/DashboardPage.js
// ============================================================

const isMobile = window.innerWidth <= 768;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const css = `
  @keyframes fadeInUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes countUp {
    from { opacity:0; transform:scale(0.8); }
    to   { opacity:1; transform:scale(1); }
  }

  .dash-root { animation: fadeInUp 0.5s ease both; }

  .dash-stat-card {
    animation: fadeInUp 0.5s ease both;
  }
  .dash-stat-card:nth-child(1) { animation-delay: 0.05s; }
  .dash-stat-card:nth-child(2) { animation-delay: 0.12s; }
  .dash-stat-card:nth-child(3) { animation-delay: 0.19s; }

  .dash-upload-btn {
    background: linear-gradient(135deg, #6c63ff, #48c6ef) !important;
    box-shadow: 0 4px 20px rgba(108,99,255,0.35) !important;
    padding: 11px 22px !important;
    font-size: 14px !important;
    border-radius: 11px !important;
    color: #fff !important;
    font-weight: 700 !important;
    display: inline-flex !important;
    align-items: center !important;
    gap: 8px !important;
    text-decoration: none !important;
    transition: transform 0.2s, box-shadow 0.2s !important;
    border: none !important;
    font-family: 'Sora', sans-serif !important;
  }
  .dash-upload-btn:hover { transform: translateY(-2px) !important; box-shadow: 0 8px 28px rgba(108,99,255,0.45) !important; }

  .dash-section-title {
    font-size: 16px;
    font-weight: 700;
    color: #e8eaf0;
    letter-spacing: -0.01em;
  }

  .dash-file-btn {
    font-size: 12px !important;
    padding: 6px 12px !important;
    border-radius: 8px !important;
    font-weight: 600 !important;
    white-space: nowrap !important;
    flex-shrink: 0 !important;
  }

  .score-badge {
    font-size: 20px;
    font-weight: 800;
    letter-spacing: -0.02em;
    min-width: 52px;
    text-align: right;
    flex-shrink: 0;
  }

  .custom-tooltip {
    background: rgba(20,21,28,0.95);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 10px;
    padding: 10px 14px;
    font-family: 'Sora', sans-serif;
    font-size: 13px;
    color: #e8eaf0;
    backdrop-filter: blur(8px);
  }
  .custom-tooltip .label { color: rgba(232,234,240,0.45); margin-bottom: 4px; font-size: 12px; }
  .custom-tooltip .value { font-weight: 700; font-size: 16px; color: #a89dff; }
`;

const getBakuGreeting = () => {
  const now = new Date();
  const h = Number(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Baku', hour: '2-digit', hour12: false,
    }).format(now)
  );
  if (h >= 5 && h < 12) return 'Good Morning';
  if (h >= 12 && h < 18) return 'Good Afternoon';
  return 'Good Evening';
};

const scoreColor = (score) => {
  if (score >= 80) return '#4ade80';
  if (score >= 60) return '#facc15';
  return '#f87171';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip">
      <div className="label">{new Date(label).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
      <div className="value">{payload[0].value}%</div>
    </div>
  );
};

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
    <div className="loading-screen" style={{ minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  );

  const stats = data?.stats || {};

  return (
    <>
      <style>{css}</style>
      <div className="dash-root">

        {/* Header */}
        <div
  className="page-header"
  style={{
    flexDirection: isMobile ? 'column' : 'row',
    alignItems: isMobile ? 'stretch' : 'flex-start'
  }}
>
          <div>
            <h1 className="page-title">
              {getBakuGreeting()}, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p className="page-subtitle">Here's your learning progress at a glance.</p>
          </div>
          <Link
  to="/upload"
  className="dash-upload-btn"
  style={{
    width: isMobile ? '100%' : 'auto',
    justifyContent: 'center'
  }}
>
            ↑ Upload Lecture
          </Link>
        </div>

        {/* Stats */}
        <div
  className="card-grid mb-6"
  style={{
    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)'
  }}
>
          <div className="stat-card dash-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(108,99,255,0.15)' }}>📄</div>
            <div>
              <div className="stat-value" style={{ color: '#a89dff' }}>{stats.totalFiles || 0}</div>
              <div className="stat-label">Files Uploaded</div>
            </div>
          </div>
          <div className="stat-card dash-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(72,198,239,0.15)' }}>📝</div>
            <div>
              <div className="stat-value" style={{ color: '#48c6ef' }}>{stats.totalQuizzes || 0}</div>
              <div className="stat-label">Quizzes Taken</div>
            </div>
          </div>
          <div className="stat-card dash-stat-card">
            <div className="stat-icon" style={{ background: 'rgba(250,204,21,0.12)' }}>🏆</div>
            <div>
              <div className="stat-value" style={{ color: '#facc15' }}>{stats.averageScore || 0}%</div>
              <div className="stat-label">Average Score</div>
            </div>
          </div>
        </div>

        {/* Chart */}
        {data?.scoreHistory?.length > 0 && (
          <div className="card mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="dash-section-title">Score History</div>
                <div className="text-muted text-sm" style={{ marginTop: 3 }}>
                  Your last {data.scoreHistory.length} quiz attempts
                </div>
              </div>
              <div style={{
                background: 'rgba(108,99,255,0.12)',
                border: '1px solid rgba(108,99,255,0.2)',
                borderRadius: 8, padding: '4px 12px',
                fontSize: 12, fontWeight: 600, color: '#a89dff',
              }}>
                {stats.averageScore || 0}% avg
              </div>
            </div>
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.scoreHistory} margin={{ top: 5, right: 8, left: -20, bottom: 5 }}>
                  <defs>
                    <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#6c63ff" />
                      <stop offset="100%" stopColor="#48c6ef" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={d => new Date(d).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                    tick={{ fill: 'rgba(232,234,240,0.35)', fontSize: 11, fontFamily: 'Sora' }}
                    axisLine={false} tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: 'rgba(232,234,240,0.35)', fontSize: 11, fontFamily: 'Sora' }}
                    axisLine={false} tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone" dataKey="percentage"
                    stroke="url(#lineGrad)" strokeWidth={2.5}
                    dot={{ fill: '#6c63ff', strokeWidth: 0, r: 4 }}
                    activeDot={{ r: 6, fill: '#a89dff' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Recent Files & Quizzes */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>

          {/* Recent Files */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="dash-section-title">Recent Files</div>
              <Link to="/upload" className="btn btn-secondary btn-sm">View All</Link>
            </div>
            {data?.recentFiles?.length > 0 ? (
              data.recentFiles.slice(0, 3).map(file => (
                <div key={file.id} className="file-item mb-2">
                  <div className={`file-icon ${file.type}`}>
                    {file.type === 'pdf' ? '📕' : '📘'}
                  </div>
                  <div className="file-info">
                    <div className="file-name">{file.name}</div>
                    <div className="file-meta">
                      {new Date(file.uploadedAt).toLocaleDateString()}
                      {file.hasAnalysis && (
                        <span style={{ color: '#4ade80', marginLeft: 8 }}>✓ Analyzed</span>
                      )}
                    </div>
                  </div>
                  <Link
                    to={`/analysis/${file.id}`}
                    className={`btn dash-file-btn ${file.hasAnalysis ? 'btn-secondary' : 'btn-primary'}`}
                  >
                    {file.hasAnalysis ? 'View' : 'Analyze'}
                  </Link>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📄</div>
                <p>No files yet. Upload your first lecture!</p>
              </div>
            )}
          </div>

          {/* Recent Quizzes */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <div className="dash-section-title">Recent Quizzes</div>
            </div>
            {data?.recentQuizzes?.length > 0 ? (
              data.recentQuizzes.slice(0, 3).map(quiz => (
                <div key={quiz.id} className="file-item mb-2">
                  <div className="file-icon" style={{ background: 'rgba(108,99,255,0.12)' }}>📝</div>
                  <div className="file-info">
                    <div className="file-name">{quiz.title}</div>
                    <div className="file-meta">
                      {quiz.attempts} attempt{quiz.attempts !== 1 ? 's' : ''}
                    </div>
                  </div>
                  <div className="score-badge" style={{ color: scoreColor(quiz.bestScore) }}>
                    {quiz.bestScore}%
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <div className="empty-icon">📝</div>
                <p>No quizzes yet. Analyze a file to get started!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}