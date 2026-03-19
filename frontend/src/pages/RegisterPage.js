// ============================================================
// src/pages/RegisterPage.js
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [step, setStep] = useState('register'); // 'register' | 'verify'
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { verifyEmail } = useAuth();
  const navigate = useNavigate();

  const handleChange = e => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  // ── Addım 1: Qeydiyyat ──────────────────────────────────────
  const handleRegister = async e => {
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
      await api.post('/auth/register', {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      toast.success('Verification code sent to your email! 📧');
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Addım 2: Kod təsdiqləmə ──────────────────────────────────
  const handleVerify = async e => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      return setError('Please enter the 6-digit code.');
    }

    setLoading(true);
    try {
      await verifyEmail(form.email, code);
toast.success('Account created! Welcome to StudyAI 🎓');
navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  // ── Verify ekranı ────────────────────────────────────────────
  if (step === 'verify') {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo-icon">📧</div>
            <h1 className="auth-title">Check Your Email</h1>
            <p className="auth-subtitle">
              We sent a 6-digit code to <strong>{form.email}</strong>
            </p>
          </div>

          {error && <div className="error-banner">⚠️ {error}</div>}

          <form onSubmit={handleVerify}>
            <div className="form-group">
              <label htmlFor="code">Verification Code</label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={code}
                onChange={e => {
                  setCode(e.target.value.replace(/\D/g, ''));
                  setError('');
                }}
                style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '8px', fontWeight: '700' }}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full"
              disabled={loading}
            >
              {loading ? '⏳ Verifying...' : '✓ Verify Email'}
            </button>
          </form>

          <div className="auth-footer">
            Wrong email?{' '}
            <button
              onClick={() => { setStep('register'); setError(''); setCode(''); }}
              style={{ background: 'none', border: 'none', color: 'var(--blue)', cursor: 'pointer', fontSize: '14px' }}
            >
              Go back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Register ekranı ──────────────────────────────────────────
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo-icon">🎓</div>
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start your AI-powered learning journey</p>
        </div>

        {error && <div className="error-banner">⚠️ {error}</div>}

        <form onSubmit={handleRegister}>
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
            {loading ? '⏳ Sending Code...' : '→ Continue'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}