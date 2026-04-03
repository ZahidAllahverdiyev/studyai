import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  .login-root { font-family:'Sora',sans-serif; min-height:100vh; background:#0a0b0f; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn 0.4s ease both; position:relative; overflow:hidden; }
  .login-root::before { content:''; position:absolute; inset:0; background: radial-gradient(ellipse 70% 50% at 30% 20%, rgba(108,99,255,0.13) 0%, transparent 60%), radial-gradient(ellipse 50% 40% at 80% 80%, rgba(72,198,239,0.08) 0%, transparent 60%); pointer-events:none; }
  .login-root::after { content:''; position:absolute; inset:0; background-image: linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px); background-size:56px 56px; pointer-events:none; mask-image:radial-gradient(ellipse 80% 80% at 50% 50%, black, transparent); }
  .login-card { width:100%; max-width:420px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:24px; padding:44px 40px; position:relative; z-index:1; animation:slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both; backdrop-filter:blur(12px); }
  .login-title { font-size:26px; font-weight:800; color:#fff; text-align:center; letter-spacing:-0.03em; margin-bottom:6px; animation:slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.1s both; opacity:0; }
  .login-sub { font-size:15px; color:rgba(232,234,240,0.5); text-align:center; margin-bottom:32px; animation:slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.15s both; opacity:0; }
  .login-group { margin-bottom:18px; animation:slideUp 0.6s cubic-bezier(0.22,1,0.36,1) both; opacity:0; }
  .login-group:nth-child(1) { animation-delay:0.2s; }
  .login-group:nth-child(2) { animation-delay:0.27s; }
  .login-label { display:block; font-size:13px; font-weight:600; color:rgba(232,234,240,0.7); margin-bottom:8px; letter-spacing:0.02em; }
  .login-input { width:100%; background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:12px; padding:13px 16px; font-size:15px; font-family:'Sora',sans-serif; color:#e8eaf0; outline:none; transition:border-color 0.2s,background 0.2s; box-sizing:border-box; }
  .login-input::placeholder { color:rgba(232,234,240,0.25); }
  .login-input:focus { border-color:rgba(108,99,255,0.6); background:rgba(108,99,255,0.07); animation:glow 0.2s ease forwards; }
  .login-btn { width:100%; background:linear-gradient(135deg,#6c63ff,#48c6ef); color:#fff; border:none; border-radius:12px; padding:14px; font-size:15px; font-weight:700; font-family:'Sora',sans-serif; cursor:pointer; margin-top:8px; transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s; box-shadow:0 6px 24px rgba(108,99,255,0.35); animation:slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.34s both; opacity:0; }
  .login-btn:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 10px 32px rgba(108,99,255,0.45); }
  .login-btn:active:not(:disabled) { transform:translateY(0); }
  .login-btn:disabled { opacity:0.6; cursor:not-allowed; }
  .login-footer { text-align:center; font-size:14px; color:rgba(232,234,240,0.45); margin-top:20px; animation:slideUp 0.6s cubic-bezier(0.22,1,0.36,1) 0.4s both; opacity:0; }
  .login-footer a { color:#a89dff; text-decoration:none; font-weight:600; transition:color 0.2s; }
  .login-footer a:hover { color:#fff; }
  .login-error { background:rgba(255,80,80,0.1); border:1px solid rgba(255,80,80,0.25); border-radius:10px; padding:12px 14px; font-size:14px; color:#ff8080; margin-bottom:20px; animation:shake 0.4s ease both; }
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
    if (!form.email || !form.password) return setError('Please fill in all fields.');
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
      <style>{css}</style>
      <div className="login-root">
        <div className="login-card">
          <Logo />
          <h1 className="login-title">Welcome back</h1>
          <p className="login-sub">Sign in to continue learning</p>

          {error && <div className="login-error">⚠️ {error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-group">
              <label className="login-label" htmlFor="email">Email address</label>
              <input className="login-input" id="email" name="email" type="email"
                placeholder="you@university.edu" value={form.email}
                onChange={handleChange} autoComplete="email" />
            </div>
            <div className="login-group">
              <label className="login-label" htmlFor="password">Password</label>
              <input className="login-input" id="password" name="password" type="password"
                placeholder="••••••••" value={form.password}
                onChange={handleChange} autoComplete="current-password" />
            </div>
            <div style={{ textAlign: 'right', marginBottom: 8 }}>
              <Link to="/forgot-password" style={{ fontSize: 13, color: '#a89dff', textDecoration: 'none', fontWeight: 600 }}>
                Forgot password?
              </Link>
            </div>
            <button className="login-btn" type="submit" disabled={loading}>
              {loading ? '⏳ Signing in...' : 'Sign in →'}
            </button>
          </form>

          <div className="login-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one free</Link>
          </div>
        </div>
      </div>
    </>
  );
}