// ── frontend/src/pages/Admin.js ───────────────────────────────
// Mövcud Admin.js-i bu versiya ilə əvəz et
// AdminLogin komponenti əlavə edilib — admin panel qorunur

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AdminLogin from './AdminLogin';

const api = (path) => `${process.env.REACT_APP_API_URL}${path}`;
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

const Admin = () => {
  const [authed, setAuthed]       = useState(false);
  const [checking, setChecking]   = useState(true);
  const [users, setUsers]         = useState([]);
  const [files, setFiles]         = useState([]);
  const [stats, setStats]         = useState({});
  const [activeTab, setActiveTab] = useState('stats');
  const [roleLoading, setRoleLoading] = useState(null);

  // Mövcud token varsa yoxla
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) { setChecking(false); return; }
      try {
        const res = await axios.get(api('/api/auth/me'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.user.role === 'admin') {
          setAuthed(true);
        }
      } catch {
        localStorage.removeItem('token');
      } finally {
        setChecking(false);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authed) return;
    fetchStats();
    fetchUsers();
    fetchFiles();
  }, [authed]); // eslint-disable-line

  const fetchStats = async () => {
    try {
      const res = await axios.get(api('/api/admin/stats'), { headers: headers() });
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(api('/api/admin/users'), { headers: headers() });
      setUsers(res.data.users);
    } catch (err) { console.error(err); }
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get(api('/api/admin/files'), { headers: headers() });
      setFiles(res.data.files);
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Bu istifadəçini silmək istəyirsən?')) return;
    await axios.delete(api(`/api/admin/users/${id}`), { headers: headers() });
    fetchUsers();
  };

  const changeRole = async (id, newRole) => {
    setRoleLoading(id);
    try {
      await axios.patch(api(`/api/admin/users/${id}/role`), { role: newRole }, { headers: headers() });
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: newRole } : u));
    } catch {
      alert('Rol dəyişdirilmədi.');
    } finally {
      setRoleLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setAuthed(false);
  };

  const ROLE_COLORS = {
    admin:   { bg: '#1a0a2e', color: '#c084fc', border: '#7c3aed' },
    premium: { bg: '#1a1a0a', color: '#fbbf24', border: '#d97706' },
    user:    { bg: '#0f1923', color: '#64748b', border: '#334155' },
  };

  // Yüklənir
  if (checking) {
    return (
      <div style={{ minHeight: '100vh', background: '#080c14', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#475569', fontFamily: 'monospace', fontSize: '14px' }}>⏳ Yüklənir...</div>
      </div>
    );
  }

  // Giriş edilməyib — AdminLogin göstər
  if (!authed) {
    return <AdminLogin onSuccess={() => setAuthed(true)} />;
  }

  // ── Admin Panel ───────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      background: '#080c14',
      color: '#e2e8f0',
      fontFamily: "'DM Mono', 'Fira Code', monospace",
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #0f172a 0%, #0d1117 100%)',
        borderBottom: '1px solid #1e2d40',
        padding: '18px 36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: 36, height: 36, borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px', boxShadow: '0 0 20px rgba(99,102,241,0.4)',
          }}>🛡️</div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.3px' }}>
              StudyAI <span style={{ color: '#6366f1' }}>Admin</span>
            </div>
            <div style={{ fontSize: '11px', color: '#475569', marginTop: '1px' }}>Control Panel</div>
          </div>
        </div>

        <button onClick={handleLogout} style={{
          background: '#1a0a0a',
          color: '#f87171',
          border: '1px solid #7f1d1d',
          padding: '7px 16px',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '12px',
          fontWeight: '600',
          fontFamily: 'inherit',
        }}>
          Çıxış
        </button>
      </div>

      <div style={{ padding: '32px 36px' }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', gap: '2px',
          background: '#0f172a',
          border: '1px solid #1e2d40',
          padding: '4px', borderRadius: '12px',
          marginBottom: '32px', width: 'fit-content',
        }}>
          {[
            { id: 'stats', label: 'Statistika', icon: '◈' },
            { id: 'users', label: 'İstifadəçilər', icon: '◉' },
            { id: 'files', label: 'Fayllar', icon: '◎' },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
              padding: '8px 18px',
              background: activeTab === tab.id
                ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                : 'transparent',
              color: activeTab === tab.id ? 'white' : '#64748b',
              border: 'none', borderRadius: '9px', cursor: 'pointer',
              fontWeight: '600', fontSize: '13px',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
              display: 'flex', alignItems: 'center', gap: '6px',
              boxShadow: activeTab === tab.id ? '0 0 16px rgba(99,102,241,0.35)' : 'none',
            }}>
              <span>{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
            {[
              { label: 'Ümumi İstifadəçilər', value: stats.totalUsers ?? 0, icon: '◉', color: '#6366f1' },
              { label: 'Ümumi Fayllar', value: stats.totalFiles ?? 0, icon: '◎', color: '#8b5cf6' },
            ].map((s, i) => (
              <div key={i} style={{
                background: '#0f172a',
                border: '1px solid #1e2d40',
                borderRadius: '16px',
                padding: '28px',
                position: 'relative',
                overflow: 'hidden',
              }}>
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 80, height: 80, borderRadius: '50%',
                  background: s.color, opacity: 0.07,
                }} />
                <div style={{ fontSize: '22px', marginBottom: '12px' }}>{s.icon}</div>
                <div style={{ fontSize: '13px', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '48px', fontWeight: '800', color: s.color, lineHeight: 1 }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div style={{ background: '#0f172a', border: '1px solid #1e2d40', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#080c14' }}>
                  {['Ad', 'Email', 'Rol', 'Rol Dəyiş', 'Tarix', 'Əməliyyat'].map(h => (
                    <th key={h} style={{
                      padding: '14px 20px', textAlign: 'left',
                      fontSize: '11px', color: '#475569',
                      textTransform: 'uppercase', letterSpacing: '1px',
                      borderBottom: '1px solid #1e2d40', fontFamily: 'inherit',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user, idx) => {
                  const rc = ROLE_COLORS[user.role] || ROLE_COLORS.user;
                  return (
                    <tr key={user._id} style={{ borderBottom: idx < users.length - 1 ? '1px solid #1e2d40' : 'none' }}
                      onMouseEnter={e => e.currentTarget.style.background = '#111827'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <td style={{ padding: '14px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: 32, height: 32, borderRadius: '10px',
                            background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
                            border: '1px solid #4f46e5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '700', color: '#a5b4fc',
                          }}>{user.name?.charAt(0).toUpperCase()}</div>
                          <span style={{ fontSize: '14px', color: '#cbd5e1', fontWeight: '500' }}>{user.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>{user.email}</td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          background: rc.bg, color: rc.color, border: `1px solid ${rc.border}`,
                          padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', fontFamily: 'inherit',
                        }}>{user.role || 'user'}</span>
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <select value={user.role || 'user'} disabled={roleLoading === user._id}
                          onChange={(e) => changeRole(user._id, e.target.value)}
                          style={{ background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', borderRadius: '8px', padding: '6px 10px', fontSize: '13px', fontFamily: 'inherit', cursor: 'pointer', outline: 'none' }}>
                          <option value="user">user</option>
                          <option value="premium">premium</option>
                          <option value="admin">admin</option>
                        </select>
                        {roleLoading === user._id && <span style={{ marginLeft: 8, fontSize: 12, color: '#6366f1' }}>...</span>}
                      </td>
                      <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                        {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <button onClick={() => deleteUser(user._id)} style={{
                          background: '#1a0a0a', color: '#f87171', border: '1px solid #7f1d1d',
                          padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px',
                          fontWeight: '600', fontFamily: 'inherit',
                        }}
                          onMouseEnter={e => e.currentTarget.style.background = '#7f1d1d'}
                          onMouseLeave={e => e.currentTarget.style.background = '#1a0a0a'}
                        >Sil</button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Files Tab */}
        {activeTab === 'files' && (
          <div style={{ background: '#0f172a', border: '1px solid #1e2d40', borderRadius: '16px', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#080c14' }}>
                  {['Fayl adı', 'İstifadəçi', 'Tarix'].map(h => (
                    <th key={h} style={{ padding: '14px 20px', textAlign: 'left', fontSize: '11px', color: '#475569', textTransform: 'uppercase', letterSpacing: '1px', borderBottom: '1px solid #1e2d40', fontFamily: 'inherit' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {files.map((file, idx) => (
                  <tr key={file._id} style={{ borderBottom: idx < files.length - 1 ? '1px solid #1e2d40' : 'none' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#111827'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={{ padding: '14px 20px', fontSize: '14px', color: '#cbd5e1' }}>
                      <span style={{ marginRight: 8, opacity: 0.5 }}>◎</span>{file.originalName}
                    </td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#64748b' }}>{file.user?.email || '—'}</td>
                    <td style={{ padding: '14px 20px', fontSize: '13px', color: '#475569' }}>
                      {new Date(file.createdAt).toLocaleDateString('az-AZ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;