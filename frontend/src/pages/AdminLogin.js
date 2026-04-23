import React, { useState } from 'react';
import { startRegistration, startAuthentication } from '@simplewebauthn/browser';
import axios from 'axios';

const API = (path) => `${process.env.REACT_APP_API_URL}${path}`;

const AdminLogin = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const res = await axios.post(API('/api/auth/login'), { email, password });
      const { token, user } = res.data;
      if (user.role !== 'admin') {
        setError('Bu hesabin admin icazesi yoxdur.');
        setLoading(false);
        return;
      }
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      try {
        const pkRes = await axios.get(API('/api/webauthn/passkeys'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (pkRes.data.passkeys.length > 0) {
          onSuccess(user);
        } else {
          setStep('register-passkey');
        }
      } catch {
        onSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Giris ugursuz oldu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterPasskey = async () => {
    setError(''); setInfo('');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const optRes = await axios.post(
        API('/api/webauthn/register-options'),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const attResp = await startRegistration({ optionsJSON: optRes.data });
      await axios.post(
        API('/api/webauthn/register-verify'),
        attResp,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setInfo('Face ID / Touch ID ugurla qeydiyyatdan kecdi!');
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        onSuccess(user);
      }, 1200);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        const user = JSON.parse(localStorage.getItem('user'));
        onSuccess(user);
      } else {
        setError(err.message || err.name || 'Qeydiyyat xetasi.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricLogin = async () => {
    setError(''); setInfo('');
    if (!email) { setError('Evvelce email daxil edin.'); return; }
    setLoading(true);
    try {
      const optRes = await axios.post(API('/api/webauthn/login-options'), { email });
      const authResp = await startAuthentication({ optionsJSON: optRes.data });
      const verifyRes = await axios.post(API('/api/webauthn/login-verify'), { ...authResp, email });
      const { token, user } = verifyRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onSuccess(user);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Biometrik legv edildi.');
      } else {
        setError(err.response?.data?.error || 'Biometrik giris ugursuz.');
      }
    } finally {
      setLoading(false);
    }
  };

  const s = {
    wrapper: { minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Mono', monospace" },
    card: { background: '#0f172a', border: '1px solid #1e2d40', borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '420px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' },
    icon: { fontSize: '48px', marginBottom: '8px' },
    title: { fontSize: '24px', fontWeight: '800', color: '#f8fafc', margin: 0 },
    subtitle: { fontSize: '13px', color: '#475569', margin: 0, textAlign: 'center' },
    input: { width: '100%', padding: '12px 16px', background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#e2e8f0', fontSize: '14px', fontFamily: 'inherit', outline: 'none', marginBottom: '10px', boxSizing: 'border-box' },
    primaryBtn: { width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: '700', fontFamily: 'inherit', cursor: 'pointer', marginTop: '4px' },
    biometricBtn: { width: '100%', padding: '13px', background: '#1e293b', color: '#a5b4fc', border: '1px solid #4f46e5', borderRadius: '10px', fontSize: '14px', fontWeight: '600', fontFamily: 'inherit', cursor: 'pointer' },
    skipBtn: { background: 'none', border: 'none', color: '#475569', fontSize: '13px', cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'underline' },
    error: { width: '100%', background: '#1a0a0a', border: '1px solid #7f1d1d', color: '#f87171', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' },
    info: { width: '100%', background: '#0a1a0a', border: '1px solid #166534', color: '#4ade80', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' },
    hint: { fontSize: '11px', color: '#334155', margin: 0, textAlign: 'center' },
    divider: { width: '100%', textAlign: 'center', color: '#334155', fontSize: '12px' },
  };

  if (step === 'register-passkey') {
    return (
      <div style={s.wrapper}>
        <div style={s.card}>
          <div style={s.icon}>🔐</div>
          <h2 style={s.title}>Biometrik Qeydiyyat</h2>
          <p style={s.subtitle}>Admin panelinə Face ID / Touch ID ilə giriş etmək istəyirsən? Cihazını indi qeydiyyatdan keçir.</p>
          {error && <div style={s.error}>{error}</div>}
          {info && <div style={s.info}>{info}</div>}
          <button onClick={handleRegisterPasskey} disabled={loading} style={s.biometricBtn}>
            {loading ? 'Gozle...' : '🪪 Face ID / Touch ID Qeydiyyatı'}
          </button>
          <button onClick={() => { const user = JSON.parse(localStorage.getItem('user')); onSuccess(user); }} style={s.skipBtn}>
            Keç, şifrəylə davam et
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={s.wrapper}>
      <div style={s.card}>
        <div style={s.icon}>🛡️</div>
        <h2 style={s.title}>StudyAI <span style={{ color: '#6366f1' }}>Admin</span></h2>
        <p style={s.subtitle}>Yalnız adminlər daxil ola bilər</p>
        {error && <div style={s.error}>{error}</div>}
        {info && <div style={s.info}>{info}</div>}
        <form onSubmit={handlePasswordLogin} style={{ width: '100%' }}>
          <input type="email" placeholder="Admin email" value={email} onChange={(e) => setEmail(e.target.value)} required style={s.input} />
          <input type="password" placeholder="Şifrə" value={password} onChange={(e) => setPassword(e.target.value)} required style={s.input} />
          <button type="submit" disabled={loading} style={s.primaryBtn}>{loading ? 'Gozle...' : 'Daxil ol'}</button>
        </form>
        <div style={s.divider}>— və ya —</div>
        <button onClick={handleBiometricLogin} disabled={loading} style={s.biometricBtn}>
          {loading ? 'Gozle...' : '🪪 Face ID / Touch ID ilə Giriş'}
        </button>
        <p style={s.hint}>Biometrik giriş üçün əvvəlcə şifrə ilə bir dəfə giriş et</p>
      </div>
    </div>
  );
};

export default AdminLogin;