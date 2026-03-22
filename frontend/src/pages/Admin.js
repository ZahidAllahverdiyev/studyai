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
  }, []);

  const fetchStats = async () => {
    const res = await axios.get(`${API}/api/admin/stats`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setStats(res.data);
  };

  const fetchUsers = async () => {
    const res = await axios.get(`${API}/api/admin/users`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUsers(res.data.users);
  };

  const fetchFiles = async () => {
    const res = await axios.get(`${API}/api/admin/files`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setFiles(res.data.files);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('Bu istifadəçini silmək istəyirsən?')) return;
    await axios.delete(`${API}/api/admin/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchUsers();
  };

  return (
    <div style={{ padding: '20px', color: 'white', background: '#0f172a', minHeight: '100vh' }}>
      <h1>🛡️ Admin Panel</h1>

      {/* Tablar */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {['stats', 'users', 'files'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px',
              background: activeTab === tab ? '#6366f1' : '#1e293b',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            {tab === 'stats' ? '📊 Statistika' : tab === 'users' ? '👥 İstifadəçilər' : '📁 Fayllar'}
          </button>
        ))}
      </div>

      {/* Statistika */}
      {activeTab === 'stats' && (
        <div style={{ display: 'flex', gap: '20px' }}>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', flex: 1 }}>
            <h2>👥 Ümumi İstifadəçilər</h2>
            <p style={{ fontSize: '48px', color: '#6366f1' }}>{stats.totalUsers}</p>
          </div>
          <div style={{ background: '#1e293b', padding: '20px', borderRadius: '12px', flex: 1 }}>
            <h2>📁 Ümumi Fayllar</h2>
            <p style={{ fontSize: '48px', color: '#6366f1' }}>{stats.totalFiles}</p>
          </div>
        </div>
      )}

      {/* İstifadəçilər */}
      {activeTab === 'users' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Ad</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Əməliyyat</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px' }}>{user.name}</td>
                <td style={{ padding: '12px' }}>{user.email}</td>
                <td style={{ padding: '12px' }}>
                  <span style={{
                    background: user.role === 'admin' ? '#6366f1' : '#334155',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '12px'
                  }}>
                    {user.role}
                  </span>
                </td>
                <td style={{ padding: '12px' }}>
                  <button
                    onClick={() => deleteUser(user._id)}
                    style={{
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      padding: '6px 12px',
                      borderRadius: '6px',
                      cursor: 'pointer'
                    }}
                  >
                    Sil
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Fayllar */}
      {activeTab === 'files' && (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#1e293b' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Fayl adı</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>İstifadəçi</th>
              <th style={{ padding: '12px', textAlign: 'left' }}>Tarix</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file._id} style={{ borderBottom: '1px solid #1e293b' }}>
                <td style={{ padding: '12px' }}>{file.originalName}</td>
                <td style={{ padding: '12px' }}>{file.user?.email}</td>
                <td style={{ padding: '12px' }}>{new Date(file.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default Admin;