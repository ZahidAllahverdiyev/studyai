// ============================================================
// src/pages/ForgotPasswordPage.js
// 3 addımlı şifrə sıfırlama:
// Addım 1 — Email daxil et
// Addım 2 — Emailə gələn kodu daxil et
// Addım 3 — Yeni şifrə təyin et
// ============================================================

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const API = process.env.REACT_APP_API_URL || 'https://studyai-backend.onrender.com/api';

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

  .fp-root {
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

  .fp-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse 70% 50% at 30% 20%, rgba(108,99,255,0.13) 0%, transparent 60%),
      radial-gradient(ellipse 50% 40% at 80% 80%, rgba(72,198,239,0.08) 0%, transparent 60%);
    pointer-events: none;
  }

  .fp-root::after {
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

  .fp-card {
    width: 100%;
    max-width: 420px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 24px;
    padding: 44px 40px;
    position: relative;
    z-index: 1;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both;
    backdrop-filter: blur(12px);
  }

  .fp-steps {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-bottom: 32px;
  }

  .fp-step {
    width: 32px;
    height: 4px;
    border-radius: 4px;
    background: rgba(255,255,255,0.1);
    transition: background 0.3s;
  }

  .fp-step.active {
    background: linear-gradient(90deg, #6c63ff, #48c6ef);
  }

  .fp-title {
    font-size: 26px;
    font-weight: 800;
    color: #fff;
    text-align: center;
    letter-spacing: -0.03em;
    margin-bottom: 6px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both;
    opacity: 0;
  }

  .fp-sub {
    font-size: 15px;
    color: rgba(232,234,240,0.5);
    text-align: center;
    margin-bottom: 32px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both;
    opacity: 0;
  }

  .fp-group {
    margin-bottom: 18px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.2s both;
    opacity: 0;
  }

  .fp-label {
    display: block;
    font-size: 13px;
    font-weight: 600;
    color: rgba(232,234,240,0.7);
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  .fp-input {
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
  .fp-input::placeholder { color: rgba(232,234,240,0.25); }
  .fp-input:focus {
    border-color: rgba(108,99,255,0.6);
    background: rgba(108,99,255,0.07);
    animation: glow 0.2s ease forwards;
  }

  .fp-code-row {
    display: flex;
    gap: 10px;
    justify-content: center;
    margin-bottom: 18px;
  }

  .fp-code-input {
    width: 48px;
    height: 56px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px;
    font-size: 22px;
    font-weight: 700;
    font-family: 'Sora', sans-serif;
    color: #e8eaf0;
    text-align: center;
    outline: none;
    transition: border-color 0.2s, background 0.2s;
  }
  .fp-code-input:focus {
    border-color: rgba(108,99,255,0.6);
    background: rgba(108,99,255,0.07);
    animation: glow 0.2s ease forwards;
  }

  .fp-btn {
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
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.28s both;
    opacity: 0;
  }
  .fp-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 32px rgba(108,99,255,0.45); }
  .fp-btn:active:not(:disabled) { transform: translateY(0); }
  .fp-btn:disabled { opacity: 0.6; cursor: not-allowed; }

  .fp-footer {
    text-align: center;
    font-size: 14px;
    color: rgba(232,234,240,0.45);
    margin-top: 24px;
    animation: slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.34s both;
    opacity: 0;
  }
  .fp-footer a {
    color: #a89dff;
    text-decoration: none;
    font-weight: 600;
    transition: color 0.2s;
  }
  .fp-footer a:hover { color: #fff; }

  .fp-error {
    background: rgba(255,80,80,0.1);
    border: 1px solid rgba(255,80,80,0.25);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    color: #ff8080;
    margin-bottom: 20px;
    animation: shake 0.4s ease both;
  }

  .fp-success {
    background: rgba(72,198,100,0.1);
    border: 1px solid rgba(72,198,100,0.25);
    border-radius: 10px;
    padding: 12px 14px;
    font-size: 14px;
    color: #72e892;
    margin-bottom: 20px;
    text-align: center;
  }
`;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();

  // Addım: 1 = email, 2 = kod, 3 = yeni şifrə
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ── Addım 1: Email göndər ─────────────────────────────────
  const handleSendCode = async e => {
    e.preventDefault();
    if (!email) return setError('Please enter your email.');
    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/auth/forgot-password`, { email });
      toast.success('Verification code sent!');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code.');
    } finally {
      setLoading(false);
    }
  };

  // ── Kod inputları üçün — hər rəqəm ayrı xanada ───────────
  const handleCodeChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // Yalnız rəqəm qəbul et
    const newCode = [...code];
    newCode[index] = value.slice(-1); // Yalnız son simvolu saxla
    setCode(newCode);
    setError('');

    // Avtomatik növbəti xanaya keç
    if (value && index < 5) {
      document.getElementById(`code-${index + 1}`)?.focus();
    }
  };

  // Backspace ilə əvvəlki xanaya qayıt
  const handleCodeKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus();
    }
  };

  // ── Addım 2: Kodu təsdiqlə ───────────────────────────────
  const handleVerifyCode = async e => {
    e.preventDefault();
    const fullCode = code.join('');
    if (fullCode.length !== 6) return setError('Please enter the full 6-digit code.');
    setStep(3);
    setError('');
  };

  // ── Addım 3: Yeni şifrəni saxla ──────────────────────────
  const handleResetPassword = async e => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return setError('Please fill in all fields.');
    if (newPassword.length < 6) return setError('Password must be at least 6 characters.');
    if (newPassword !== confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    setError('');
    try {
      await axios.post(`${API}/auth/reset-password`, {
        email,
        code: code.join(''),
        newPassword,
      });
      toast.success('Password reset successfully! 🎉');
      navigate('/login');
    } catch (err) {
      // Kod yanlışdırsa 2-ci addıma qayıt
      if (err.response?.data?.error?.toLowerCase().includes('invalid')) {
        setStep(2);
        setCode(['', '', '', '', '', '']);
      }
      setError(err.response?.data?.error || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>
      <div className="fp-root">
        <div className="fp-card">
          <Logo />

          {/* Addım göstəricisi */}
          <div className="fp-steps">
            {[1, 2, 3].map(s => (
              <div key={s} className={`fp-step ${step >= s ? 'active' : ''}`} />
            ))}
          </div>

          {/* ── ADDIM 1: Email ── */}
          {step === 1 && (
            <>
              <h1 className="fp-title">Forgot password?</h1>
              <p className="fp-sub">Enter your email and we'll send a reset code</p>
              {error && <div className="fp-error">⚠️ {error}</div>}
              <form onSubmit={handleSendCode}>
                <div className="fp-group">
                  <label className="fp-label">Email address</label>
                  <input
                    className="fp-input"
                    type="email"
                    placeholder="you@university.edu"
                    value={email}
                    onChange={e => { setEmail(e.target.value); setError(''); }}
                    autoComplete="email"
                  />
                </div>
                <button className="fp-btn" type="submit" disabled={loading}>
                  {loading ? '⏳ Sending...' : 'Send reset code →'}
                </button>
              </form>
            </>
          )}

          {/* ── ADDIM 2: Kod ── */}
          {step === 2 && (
            <>
              <h1 className="fp-title">Check your email</h1>
              <p className="fp-sub">We sent a 6-digit code to <strong style={{ color: '#a89dff' }}>{email}</strong></p>
              {error && <div className="fp-error">⚠️ {error}</div>}
              <form onSubmit={handleVerifyCode}>
                <div className="fp-code-row">
                  {code.map((digit, i) => (
                    <input
                      key={i}
                      id={`code-${i}`}
                      className="fp-code-input"
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleCodeChange(i, e.target.value)}
                      onKeyDown={e => handleCodeKeyDown(i, e)}
                      autoFocus={i === 0}
                    />
                  ))}
                </div>
                <button className="fp-btn" type="submit" disabled={code.join('').length !== 6}>
                  Verify code →
                </button>
              </form>
              <div className="fp-footer">
                Didn't receive it?{' '}
                <a href="#" onClick={e => { e.preventDefault(); setStep(1); setCode(['','','','','','']); }}>
                  Try again
                </a>
              </div>
            </>
          )}

          {/* ── ADDIM 3: Yeni şifrə ── */}
          {step === 3 && (
            <>
              <h1 className="fp-title">New password</h1>
              <p className="fp-sub">Choose a strong password for your account</p>
              {error && <div className="fp-error">⚠️ {error}</div>}
              <form onSubmit={handleResetPassword}>
                <div className="fp-group">
                  <label className="fp-label">New password</label>
                  <input
                    className="fp-input"
                    type="password"
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={e => { setNewPassword(e.target.value); setError(''); }}
                  />
                </div>
                <div className="fp-group">
                  <label className="fp-label">Confirm password</label>
                  <input
                    className="fp-input"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={e => { setConfirmPassword(e.target.value); setError(''); }}
                  />
                </div>
                <button className="fp-btn" type="submit" disabled={loading}>
                  {loading ? '⏳ Resetting...' : 'Reset password →'}
                </button>
              </form>
            </>
          )}

          <div className="fp-footer">
            Remember your password?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </>
  );
}