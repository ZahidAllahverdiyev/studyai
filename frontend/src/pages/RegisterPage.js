// ============================================================
// src/pages/RegisterPage.js
// ============================================================

import React, { useState } from 'react';
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
  .form-group:nth-child(2) { animation-delay: 0.30s; }
  .form-group:nth-child(3) { animation-delay: 0.35s; }
  .form-group:nth-child(4) { animation-delay: 0.40s; }

  .btn-primary {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.46s both;
    opacity: 0;
    transition: transform 0.15s ease, opacity 0.15s ease;
  }
  .btn-primary:hover:not(:disabled) { transform: translateY(-2px); }
  .btn-primary:active:not(:disabled) { transform: translateY(0px); }

  .auth-footer {
    animation: fadeSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) 0.52s both;
    opacity: 0;
  }

  .error-banner { animation: shake 0.4s ease both; }

  .form-group input:focus {
    box-shadow: 0 0 0 3px rgba(137,180,250,0.35);
    transition: box-shadow 0.2s ease;
  }
`;

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm) {
      return setError('Please fill in all fields.');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters.');
    }
    if (form.password !== form.confirm) {
      return setError('Passwords do not match.');
    }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password);
      toast.success('Account created! Welcome to StudyAI 🎓');
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
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
            <div className="auth-logo-icon">🎓</div>
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Start your AI-powered learning journey</p>
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name" name="name" type="text"
                placeholder="Alex Johnson"
                value={form.name} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email" name="email" type="email"
                placeholder="you@university.edu"
                value={form.email} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password" name="password" type="password"
                placeholder="At least 6 characters"
                value={form.password} onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirm">Confirm Password</label>
              <input
                id="confirm" name="confirm" type="password"
                placeholder="Repeat your password"
                value={form.confirm} onChange={handleChange}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? '⏳ Creating Account...' : '→ Create Account'}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}