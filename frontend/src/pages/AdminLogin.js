// ── frontend/src/pages/AdminLogin.js ─────────────────────────
// Bu faylı frontend/src/pages/ qovluğuna əlavə et
// npm install @simplewebauthn/browser   ← əvvəlcə bunu çalıştır

import React, { useState } from 'react';
import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import axios from 'axios';

const API = (path) => `${process.env.REACT_APP_API_URL}${path}`;

const AdminLogin = ({ onSuccess }) => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep]         = useState('login'); // 'login' | 'register-passkey'
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [info, setInfo]         = useState('');

  // ── Normal email+şifrə girişi ────────────────────────────────
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError(''); setInfo('');
    setLoading(true);
    try {
      const res = await axios.post(API('/api/auth/login'), { email, password });
      const { token, user } = res.data;

      if (user.role !== 'admin') {
        setError('Bu hesabın admin icazəsi yoxdur.');
        return;
      }

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      // Admin ilk dəfə girəndə biometrik qeydiyyat təklif et
      const hasPasskeys = await checkHasPasskeys(token);
      if (!hasPasskeys) {
        setStep('register-passkey');
      } else {
        onSuccess(user);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Giriş uğursuz oldu.');
    } finally {
      setLoading(false);
    }
  };

  // Passkey-ləri yoxla
  const checkHasPasskeys = async (token) => {
    try {
      const res = await axios.get(API('/api/webauthn/passkeys'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      return res.data.passkeys.length > 0;
    } catch {
      return false;
    }
  };

  // ── Biometrik Qeydiyyat (ilk dəfə) ───────────────────────────
  const handleRegisterPasskey = async () => {
    setError(''); setInfo('');
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      // 1. Server-dən seçimlər al
      const optRes = await axios.post(
        API('/api/webauthn/register-options'),
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 2. Brauzerdə Face ID / Touch ID aç
      const attResp = await startRegistration({ optionsJSON: optRes.data });

      // 3. Cavabı serverə göndər
      await axios.post(
        API('/api/webauthn/register-verify'),
        attResp,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setInfo('✅ Face ID / Touch ID uğurla qeydiyyatdan keçdi!');
      setTimeout(() => {
        const user = JSON.parse(localStorage.getItem('user'));
        onSuccess(user);
      }, 1200);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Biometrik ləğv edildi. Normal giriş edildi.');
        const user = JSON.parse(localStorage.getItem('user'));
        setTimeout(() => onSuccess(user), 1000);
      } else {
        setError(err.response?.data?.error || 'Qeydiyyat xətası.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Biometrik Giriş ───────────────────────────────────────────
  const handleBiometricLogin = async () => {
    setError(''); setInfo('');
    if (!email) {
      setError('Əvvəlcə email daxil edin.');
      return;
    }
    setLoading(true);
    try {
      // 1. Server-dən challenge al
      const optRes = await axios.post(API('/api/webauthn/login-options'), { email });

      // 2. Brauzerdə Face ID / Touch ID aç
      const authResp = await startAuthentication({ optionsJSON: optRes.data });

      // 3. Cavabı doğrulat
      const verifyRes = await axios.post(API('/api/webauthn/login-verify'), {
        ...authResp,
        email,
      });

      const { token, user } = verifyRes.data;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      onSuccess(user);
    } catch (err) {
      if (err.name === 'NotAllowedError') {
        setError('Biometrik ləğv edildi.');
      } else {
        setError(err.response?.data?.error || 'Biometrik giriş uğursuz.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Biometrik Qeydiyyat Ekranı ────────────────────────────────
  if (step === 'register-passkey') {
    return (
      <div style={styles.wrapper}>
        <div style={styles.card}>
          <div style={styles.icon}>🔐</div>
          <h2 style={styles.title}>Biometrik Qeydiyyat</h2>
          <p style={styles.subtitle}>
            Admin panelinə Face ID / Touch ID ilə giriş etmək istəyirsən?
            Cihazını indi qeydiyyatdan keçir.
          </p>

          {error && <div style={styles.error}>{error}</div>}
          {info  && <div style={styles.info}>{info}</div>}

          <button
            onClick={handleRegisterPasskey}
            disabled={loading}
            style={styles.biometricBtn}
          >
            {loading ? '⏳ Gözlə...' : '🪪 Face ID / Touch ID Qeydiyyatı'}
          </button>

          <button
            onClick={() => {
              const user = JSON.parse(localStorage.getItem('user'));
              onSuccess(user);
            }}
            style={styles.skipBtn}
          >
            Keç, şifrəylə davam et
          </button>
        </div>
      </div>
    );
  }

  // ── Normal Login Ekranı ───────────────────────────────────────
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <div style={styles.icon}>🛡️</div>
        <h2 style={styles.title}>
          StudyAI <span style={{ color: '#6366f1' }}>Admin</span>
        </h2>
        <p style={styles.subtitle}>Yalnız adminlər daxil ola bilər</p>

        {error && <div style={styles.error}>{error}</div>}
        {info  && <div style={styles.info}>{info}</div>}

        <form onSubmit={handlePasswordLogin} style={{ width: '100%' }}>
          <input
            type="email"
            placeholder="Admin email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Şifrə"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={styles.input}
          />
          <button
            type="submit"
            disabled={loading}
            style={styles.primaryBtn}
          >
            {loading ? '⏳ Gözlə...' : 'Daxil ol'}
          </button>
        </form>

        <div style={styles.divider}>
          <span>və ya</span>
        </div>

        <button
          onClick={handleBiometricLogin}
          disabled={loading}
          style={styles.biometricBtn}
        >
          {loading ? '⏳ Gözlə...' : '🪪  Face ID / Touch ID ilə Giriş'}
        </button>

        <p style={styles.hint}>
          Biometrik giriş üçün əvvəlcə şifrə ilə bir dəfə giriş et
        </p>
      </div>
    </div>
  );
};

// ── Stillər ──────────────────────────────────────────────────
const styles = {
  wrapper: {
    minHeight: '100vh',
    background: '#080c14',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'DM Mono', 'Fira Code', monospace",
  },
  card: {
    background: '#0f172a',
    border: '1px solid #1e2d40',
    borderRadius: '20px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '420px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
  },
  icon: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#f8fafc',
    margin: 0,
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '13px',
    color: '#475569',
    margin: 0,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    background: '#1e293b',
    border: '1px solid #334155',
    borderRadius: '10px',
    color: '#e2e8f0',
    fontSize: '14px',
    fontFamily: 'inherit',
    outline: 'none',
    marginBottom: '10px',
    boxSizing: 'border-box',
  },
  primaryBtn: {
    width: '100%',
    padding: '13px',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '700',
    fontFamily: 'inherit',
    cursor: 'pointer',
    marginTop: '4px',
    boxShadow: '0 0 20px rgba(99,102,241,0.35)',
  },
  biometricBtn: {
    width: '100%',
    padding: '13px',
    background: '#1e293b',
    color: '#a5b4fc',
    border: '1px solid #4f46e5',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  skipBtn: {
    background: 'none',
    border: 'none',
    color: '#475569',
    fontSize: '13px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    textDecoration: 'underline',
  },
  divider: {
    width: '100%',
    textAlign: 'center',
    color: '#334155',
    fontSize: '12px',
    position: 'relative',
  },
  error: {
    width: '100%',
    background: '#1a0a0a',
    border: '1px solid #7f1d1d',
    color: '#f87171',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
  },
  info: {
    width: '100%',
    background: '#0a1a0a',
    border: '1px solid #166534',
    color: '#4ade80',
    padding: '10px 14px',
    borderRadius: '8px',
    fontSize: '13px',
    textAlign: 'center',
  },
  hint: {
    fontSize: '11px',
    color: '#334155',
    margin: 0,
    textAlign: 'center',
  },
};

export default AdminLogin;
