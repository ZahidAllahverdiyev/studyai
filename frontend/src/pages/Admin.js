import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('stats');

  const token = localStorage.getItem('token');
  const API = process.env.REACT_APP_API_URL;

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchFiles();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchStats = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data.users);
    } catch (err) { console.error(err); }
  };

  const fetchFiles = async () => {
    try {
      const res = await axios.get(`${API}/api/admin/files`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFiles(res.data.files);
    } catch (err) { console.error(err); }
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Bu istifadəçini silmək istəyirsən?')) return;
    await axios.delete(`${API}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#0f172a',
      color: '#e2e8f0',
      fontFamily: 'Inter, sans-serif',
      padding: '0',
    },
    header: {
      background: '#1e293b',
      borderBottom: '1px solid #334155',
      padding: '20px 32px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    headerTitle: {
      fontSize: '22px',
      fontWeight: '600',
      color: '#f1f5f9',
      margin: 0,
    },
    badge: {
      background: '#6366f1',
      color: 'white',
      fontSize: '11px',
      padding: '3px 10px',
      borderRadius: '20px',
      fontWeight: '500',
    },
    content: {
      padding: '32px',
    },
    tabs: {
      display: 'flex',
      gap: '4px',
      background: '#1e293b',
      padding: '6px',
      borderRadius: '12px',
      marginBottom: '28px',
      width: 'fit-content',
    },
    tab: (active) => ({
      padding: '8px 20px',
      background: active ? '#6366f1' : 'transparent',
      color: active ? 'white' : '#94a3b8',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontWeight: '500',
      fontSize: '14px',
      transition: 'all 0.2s',
    }),
    statGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '28px',
    },
    statCard: {
      background: '#1e293b',
      border: '1px solid #334155',
      borderRadius: '16px',
      padding: '24px',
    },
    statLabel: {
      fontSize: '13px',
      color: '#64748b',
      marginBottom: '8px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    statValue: {
      fontSize: '40px',
      fontWeight: '700',
      color: '#6366f1',
      lineHeight: 1,
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      background: '#1e293b',
      borderRadius: '16px',
      overflow: 'hidden',
      border: '1px solid #334155',
    },
    th: {
      padding: '14px 20px',
      textAlign: 'left',
      fontSize: '12px',
      color: '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: '1px solid #334155',
      background: '#0f172a',
    },
    td: {
      padding: '14px 20px',
      fontSize: '14px',
      borderBottom: '1px solid #1e293b',
      color: '#cbd5e1',
    },
    roleBadge: (role) => ({
      background: role === 'admin' ? '#312e81' : '#1e293b',
      color: role === 'admin' ? '#a5b4fc' : '#64748b',
      border: `1px solid ${role === 'admin' ? '#4f46e5' : '#334155'}`,
      padding: '3px 10px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '500',
    }),
    deleteBtn: {
      background: '#7f1d1d',
      color: '#fca5a5',
      border: '1px solid #991b1b',
      padding: '6px 14px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '13px',
      fontWeight: '500',
    },
    avatar: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      background: '#312e81',
      color: '#a5b4fc',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '13px',
      fontWeight: '600',
      marginRight: '10px',
    },
    nameCell: {
      display: 'flex',
      alignItems: 'center',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={{ fontSize: '22px' }}>🛡️</span>
        <h1 style={styles.headerTitle}>Admin Panel</h1>
        <span style={styles.badge}>StudyAI</span>
      </div>

      <div style={styles.content}>
        <div style={styles.tabs}>
          {[
            { id: 'stats', label: '📊 Statistika' },
            { id: 'users', label: '👥 İstifadəçilər' },
            { id: 'files', label: '📁 Fayllar' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={styles.tab(activeTab === tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'stats' && (
          <div style={styles.statGrid}>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Ümumi İstifadəçilər</div>
              <div style={styles.statValue}>{stats.totalUsers ?? 0}</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statLabel}>Ümumi Fayllar</div>
              <div style={styles.statValue}>{stats.totalFiles ?? 0}</div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Ad</th>
                <th style={styles.th}>Email</th>
                <th style={styles.th}>Role</th>
                <th style={styles.th}>Tarix</th>
                <th style={styles.th}>Əməliyyat</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td style={styles.td}>
                    <div style={styles.nameCell}>
                      <div style={styles.avatar}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      {user.name}
                    </div>
                  </td>
                  <td style={styles.td}>{user.email}</td>
                  <td style={styles.td}>
                    <span style={styles.roleBadge(user.role)}>{user.role || 'user'}</span>
                  </td>
                  <td style={styles.td}>
                    {new Date(user.createdAt).toLocaleDateString('az-AZ')}
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => deleteUser(user._id)} style={styles.deleteBtn}>
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'files' && (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Fayl adı</th>
                <th style={styles.th}>İstifadəçi</th>
                <th style={styles.th}>Tarix</th>
              </tr>
            </thead>
            <tbody>
              {files.map(file => (
                <tr key={file._id}>
                  <td style={styles.td}>📄 {file.originalName}</td>
                  <td style={styles.td}>{file.user?.email || '—'}</td>
                  <td style={styles.td}>
                    {new Date(file.createdAt).toLocaleDateString('az-AZ')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Admin;