// ============================================================
// src/pages/LoginPage.js
// ============================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const styles = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(24px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes iconPop {
    0%   { transform: scale(0.5) rotate(-10deg); opacity: 0; }
    70%  { transform: scale(1.15) rotate(4deg); opacity: 1; }
    100% { transform: scale(1) rotate(0deg); opacity: 1; }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px); }
    60%     { transform: translateX(-6px); }
    80%     { transform: translateX(6px); }
  }
  @keyframes inputFocusGlow {
    from { box-shadow: 0 0 0 0px rgba(137,180,250,0.4); }
    to   { box-shadow: 0 0 0 3px rgba(137,180,250,0.4); }
  }

  .auth-page { animation: fadeIn 0.4s ease both; }

  .auth-card {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  .auth-logo-icon {
    animation: iconPop 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
    display: inline-block;
  }

  .auth-header h1 {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.15s both;
    opacity: 0;
  }

  .auth-header p {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.2s both;
    opacity: 0;
  }

  .form-group {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both;
    opacity: 0;
  }
  .form-group:nth-child(1) { animation-delay: 0.25s; }
  .form-group:nth-child(2) { animation-delay: 0.32s; }

  .btn-primary {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.38s both;
    opacity: 0;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
  .btn-primary:active:not(:disabled) { transform: translateY(0px); }

  .auth-footer {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.44s both;
    opacity: 0;
  }

  .error-banner { animation: shake 0.4s ease both; }

  .form-group input:focus {
    animation: inputFocusGlow 0.2s ease forwards;
  }
`;

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.email || !form.password) {
      return setError('Please fill in all fields.');
    }
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success('Welcome back! 🎉');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-icon">⚡</div>
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to continue learning</p>
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@university.edu"
                value={form.email}
                onChange={handleChange}
                autoComplete="email"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? '⏳ Signing In...' : '→ Sign In'}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </div>
        </div>
      </div>
    </>
  );
}