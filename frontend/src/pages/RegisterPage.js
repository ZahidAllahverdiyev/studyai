// ============================================================
// src/pages/RegisterPage.js
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import toast from 'react-hot-toast';

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 36 }}>
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: 'linear-gradient(135deg, #4f8ef7, #6c63ff)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 22, boxShadow: '0 4px 20px rgba(108,99,255,0.4)',
    }}>✦</div>
    <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.02em' }}>StudyAI</span>
  </div>
);

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

  @keyframes fadeIn  { from { opacity:0 } to { opacity:1 } }
  @keyframes slideUp { from { opacity:0; transform:translateY(28px) } to { opacity:1; transform:translateY(0) } }
  @keyframes shake   { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
  @keyframes glow    { from{box-shadow:0 0 0 0 rgba(108,99,255,0.4)} to{box-shadow:0 0 0 3px rgba(108,99,255,0.25)} }
  @keyframes codePop { 0%{opacity:0;transform:scale(0.85)} 100%{opacity:1;transform:scale(1)} }

  .reg-root {
    font-family: 'Sora', sans-serif;
    min-height: 100vh;
    background: #0a0b0f;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    animation: fadeIn 0.4s ease both;
    position: relative;
    overflow: hidden;
  }

  .reg-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 70% 20%, rgba(72,198,239,0.1) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 20% 80%, rgba(108,99,255,0.12) 0%, transparent 60%);
    pointer-events: none;
  }

  .reg-root::after {
    content: '';
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px);
    background-size: 56px 56px;
    pointer-events: none;
    mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent);
  }

  .reg-card {
    width: 100%;
    max-width: 440px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 44px 40px;
    position: relative;
    z-index: 1;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
    backdrop-filter: blur(12px);
  }

  .reg-title {
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    text-align: center;
    letter-spacing: -0.03em;
    margin-bottom: 6px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
    opacity: 0;
  }

  .reg-sub {
    font-size: 15px;
    color: rgba(232,234,240,0.5);
    text-align: center;
    margin-bottom: 32px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both;
    opacity: 0;
  }

  .reg-group {
    margin-bottom: 16px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
    opacity: 0;
  }
  .reg-group:nth-child(1) { animation-delay: 0.18s; }
  .reg-group:nth-child(2) { animation-delay: 0.24s; }
  .reg-group:nth-child(3) { animation-delay: 0.30s; }
  .reg-group:nth-child(4) { animation-delay: 0.36s; }

  .reg-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: rgba(232,234,240,0.7);
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  .reg-input {
    width: 100%;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    padding: 13px 16px;
    font-size: 15px;
    font-family: 'Sora', sans-serif;
    color: #e8eaf0;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .reg-input::placeholder { color: rgba(232,234,240,0.25); }
  .reg-input:focus {
    border-color: rgba(108,99,255,0.6);
    background: rgba(108,99,255,0.07);
    animation: glow 0.2s ease forwards;
  }

  .reg-btn {
    width: 100%;
    background: linear-gradient(135deg, #6c63ff, #48c6ef);
    color: #fff;
    border: none;
    border-radius: 12px;
    padding: 14px;
    font-size: 15px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    cursor: pointer;
    margin-top: 8px;
    transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
    box-shadow: 0 6px 24px rgba(108,99,255,0.35);
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.42s both;
    opacity: 0;
  }
  .reg-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(108,99,255,0.45); }
  .reg-btn:active:not(:disabled) { transform: translateY(0); }
  .reg-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .reg-footer {
    text-align: center;
    font-size: 14px;
    color: rgba(232,234,240,0.45);
    margin-top: 24px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.48s both;
    opacity: 0;
  }
  .reg-footer a {
    color: #a89dff;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  .reg-footer a:hover { color: #fff; }

  .reg-error {
    background: rgba(255,80,80,0.1);
    border: 1px solid rgba(255,80,80,0.25);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    color: #ff8080;
    margin-bottom: 20px;
    animation: shake 0.4s ease both;
  }

  /* Verify screen */
  .verify-icon {
    width: 64px; height: 64px;
    border-radius: 18px;
    background: linear-gradient(135deg, rgba(108,99,255,0.2), rgba(72,198,239,0.2));
    border: 1px solid rgba(108,99,255,0.3);
    display: flex; align-items: center; justify-content: center;
    font-size: 28px;
    margin: 0 auto 24px;
    animation: codePop 0.5s cubic-bezier(0.22,1,0.36,1) both;
  }

  .code-input {
    text-align: center;
    font-size: 32px !important;
    letter-spacing: 10px;
    font-weight: 800 !important;
    color: #fff !important;
  }

  .reg-back-btn {
    background: none;
    border: none;
    color: #a89dff;
    cursor: pointer;
    font-size: 14px;
    font-family: 'Sora', sans-serif;
    font-weight: 600;
    transition: color 0.2s;
    padding: 0;
  }
  .reg-back-btn:hover { color: #fff; }
`;

export default function RegisterPage() {
  const [step, setStep] = useState('register');
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

  const handleRegister = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password || !form.confirm)
      return setError('Please fill in all fields.');
    if (form.password.length < 6)
      return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirm)
      return setError('Passwords do not match.');

    setLoading(true);
    try {
      await api.post('/auth/register', { name: form.name, email: form.email, password: form.password });
      toast.success('Verification code sent to your email! 📧');
      setStep('verify');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async e => {
    e.preventDefault();
    if (!code || code.length !== 6) return setError('Please enter the 6-digit code.');
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

  if (step === 'verify') {
    return (
      <>
        <style>{css}</style>
        <div className="reg-root">
          <div className="reg-card">
            <Logo />
            <div className="verify-icon">📧</div>
            <h1 className="reg-title">Check your email</h1>
            <p className="reg-sub">
              We sent a 6-digit code to<br />
              <span style={{ color: '#a89dff', fontWeight: 600 }}>{form.email}</span>
            </p>

            {error && <div className="reg-error">⚠️ {error}</div>}

            <form onSubmit={handleVerify}>
              <div className="reg-group" style={{ animationDelay: '0.1s' }}>
                <label className="reg-label">Verification code</label>
                <input
                  className="reg-input code-input"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="------"
                  value={code}
                  onChange={e => { setCode(e.target.value.replace(/\D/g, '')); setError(''); }}
                  autoFocus
                />
              </div>
              <button className="reg-btn" type="submit" disabled={loading}>
                {loading ? '⏳ Verifying...' : '✓ Verify email'}
              </button>
            </form>

            <div className="reg-footer">
              Wrong email?{' '}
              <button className="reg-back-btn" onClick={() => { setStep('register'); setError(''); setCode(''); }}>
                Go back
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{css}</style>
      <div className="reg-root">
        <div className="reg-card">
          <Logo />
          <h1 className="reg-title">Create account</h1>
          <p className="reg-sub">Start your AI-powered learning journey</p>

          {error && <div className="reg-error">⚠️ {error}</div>}

          <form onSubmit={handleRegister}>
            <div className="reg-group">
              <label className="reg-label" htmlFor="name">Full name</label>
              <input className="reg-input" id="name" name="name" type="text"
                placeholder="Alex Johnson" value={form.name} onChange={handleChange} />
            </div>
            <div className="reg-group">
              <label className="reg-label" htmlFor="email">Email address</label>
              <input className="reg-input" id="email" name="email" type="email"
                placeholder="you@university.edu" value={form.email} onChange={handleChange} />
            </div>
            <div className="reg-group">
              <label className="reg-label" htmlFor="password">Password</label>
              <input className="reg-input" id="password" name="password" type="password"
                placeholder="At least 6 characters" value={form.password} onChange={handleChange} />
            </div>
            <div className="reg-group">
              <label className="reg-label" htmlFor="confirm">Confirm password</label>
              <input className="reg-input" id="confirm" name="confirm" type="password"
                placeholder="Repeat your password" value={form.confirm} onChange={handleChange} />
            </div>
            <button className="reg-btn" type="submit" disabled={loading}>
              {loading ? '⏳ Sending code...' : 'Continue →'}
            </button>
          </form>

          <div className="reg-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}