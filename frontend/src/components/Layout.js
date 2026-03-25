import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/upload',    icon: '↑',  label: 'Upload Files' },
  { to: '/settings',  icon: '◈',  label: 'Settings' },
  { to: '/profile',   icon: '◉',  label: 'Profile' },
];

// All colors use CSS variables — works for both dark and light mode
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  body {
    font-family: 'Sora', sans-serif;
    background: var(--bg);
    color: var(--text);
  }

  .app-layout {
    display: flex;
    min-height: 100vh;
    font-family: 'Sora', sans-serif;
    background: var(--bg);
  }

  /* ── SIDEBAR ── */
  .sidebar {
    width: 230px;
    min-width: 230px;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex;
    flex-direction: column;
    padding: 24px 14px;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 50;
    transition: transform 0.3s cubic-bezier(0.22,1,0.36,1);
  }

  .sidebar-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 4px 8px;
    margin-bottom: 32px;
    text-decoration: none;
  }
  .sidebar-logo-icon {
    width: 38px; height: 38px;
    border-radius: 11px;
    background: var(--grad);
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; color: #fff; font-weight: 900;
    box-shadow: 0 4px 20px rgba(124,111,255,0.4);
    flex-shrink: 0;
  }
  .sidebar-logo-text {
    font-size: 19px; font-weight: 800;
    color: var(--text);
    letter-spacing: -0.03em;
  }

  .sidebar-nav {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 3px;
  }

  .nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 10px;
    font-size: 14px; font-weight: 500;
    color: var(--subtext);
    text-decoration: none;
    transition: background 0.2s, color 0.2s;
    cursor: pointer;
    position: relative;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active {
    background: rgba(124,111,255,0.12);
    color: var(--purple);
    font-weight: 700;
    border: 1px solid rgba(124,111,255,0.2);
  }
  .nav-item.active::before {
    content: '';
    position: absolute; left: 0; top: 20%; bottom: 20%;
    width: 3px; border-radius: 0 3px 3px 0;
    background: var(--grad);
  }
  .nav-icon { font-size: 16px; width: 20px; text-align: center; flex-shrink: 0; }

  .sidebar-footer { margin-top: auto; }

  .theme-btn {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 10px;
    padding: 9px 14px;
    font-size: 13px; font-weight: 600;
    font-family: 'Sora', sans-serif;
    color: var(--subtext);
    cursor: pointer; margin-bottom: 10px;
    transition: background 0.2s, color 0.2s;
    text-align: left;
    display: flex; align-items: center; gap: 8px;
  }
  .theme-btn:hover { background: var(--surface3); color: var(--text); }

  .user-chip {
    display: flex; align-items: center; gap: 10px;
    padding: 10px 12px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 12px;
  }
  .user-avatar {
    width: 34px; height: 34px; border-radius: 9px;
    background: var(--grad);
    display: flex; align-items: center; justify-content: center;
    font-size: 14px; font-weight: 700; color: #fff; flex-shrink: 0;
    box-shadow: 0 2px 10px rgba(124,111,255,0.35);
  }
  .user-info { flex: 1; overflow: hidden; }
  .user-name {
    font-size: 13px; font-weight: 700; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .user-email {
    font-size: 11px; color: var(--muted);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .logout-btn {
    background: none; border: none; color: var(--muted);
    cursor: pointer; font-size: 16px; padding: 4px;
    border-radius: 6px; transition: color 0.2s, background 0.2s;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .logout-btn:hover { color: var(--red); background: rgba(245,110,110,0.12); }

  /* ── MAIN ── */
  .main-content {
    margin-left: 230px;
    flex: 1; min-height: 100vh;
    padding: 40px 44px;
    background: var(--bg);
  }

  /* ── MOBILE HEADER ── */
  .mobile-header {
    display: none;
    position: fixed;
    top: 0; left: 0; right: 0; z-index: 60;
    align-items: center; justify-content: space-between;
    padding: 14px 20px;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
    backdrop-filter: blur(12px);
  }
  .hamburger-btn {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 8px; color: var(--text);
    width: 36px; height: 36px;
    cursor: pointer; font-size: 16px;
    display: flex; align-items: center; justify-content: center;
    transition: background 0.2s;
  }
  .hamburger-btn:hover { background: var(--surface3); }
  .mobile-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.6); z-index: 40; backdrop-filter: blur(2px);
  }

  @media (max-width: 768px) {
    .sidebar { transform: translateX(-100%); }
    .sidebar.mobile-open { transform: translateX(0); }
    .desktop-only { display: none !important; }
    .mobile-header { display: flex; }
    .mobile-overlay { display: block; }
    .main-content { margin-left: 0; padding: 80px 20px 32px; }
  }

  /* ── GLOBAL PAGE STYLES ── */
  .page-header {
    display: flex; align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 36px; gap: 16px; flex-wrap: wrap;
  }
  .page-title {
    font-size: 28px; font-weight: 800;
    color: var(--text); letter-spacing: -0.03em; margin-bottom: 4px;
  }
  .page-subtitle { font-size: 14px; color: var(--subtext); }

  .card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px; padding: 28px;
  }
  .card-grid { display: grid; gap: 16px; }
  .mb-6 { margin-bottom: 24px; }
  .mb-4 { margin-bottom: 16px; }
  .mb-2 { margin-bottom: 8px; }

  .stat-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px; padding: 24px;
    display: flex; align-items: center; gap: 16px;
    transition: border-color 0.2s, transform 0.2s;
    position: relative; overflow: hidden;
  }
  .stat-card::before {
    content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
    background: var(--grad); opacity: 0; transition: opacity 0.2s;
  }
  .stat-card:hover { border-color: var(--border2); transform: translateY(-2px); }
  .stat-card:hover::before { opacity: 1; }

  .stat-icon {
    width: 48px; height: 48px; border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    font-size: 22px; flex-shrink: 0;
  }
  .stat-value {
    font-size: 28px; font-weight: 800;
    letter-spacing: -0.03em; line-height: 1;
  }
  .stat-label { font-size: 13px; color: var(--subtext); margin-top: 4px; font-weight: 500; }

  .chart-container { height: 220px; }

  .file-item {
    display: flex; align-items: center; gap: 12px;
    padding: 12px; border-radius: 12px; transition: background 0.2s;
  }
  .file-item:hover { background: var(--surface2); }
  .file-icon {
    width: 40px; height: 40px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 18px; flex-shrink: 0;
  }
  .file-icon.pdf  { background: rgba(245,110,110,0.12); }
  .file-icon.docx { background: rgba(61,217,235,0.12); }
  .file-info { flex: 1; overflow: hidden; }
  .file-name {
    font-size: 14px; font-weight: 600; color: var(--text);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }
  .file-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }

  .empty-state {
    text-align: center; padding: 40px 20px;
    color: var(--subtext); font-size: 14px;
  }
  .empty-icon { font-size: 36px; margin-bottom: 12px; opacity: 0.4; }

  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    border: none; border-radius: 10px;
    font-family: 'Sora', sans-serif; font-weight: 600;
    cursor: pointer; text-decoration: none;
    transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
    white-space: nowrap;
  }
  .btn:hover:not(:disabled) { transform: translateY(-1px); }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }

  .btn-primary {
    background: var(--grad); color: #fff;
    box-shadow: 0 4px 16px rgba(124,111,255,0.3);
    padding: 10px 20px; font-size: 14px;
  }
  .btn-primary:hover:not(:disabled) { box-shadow: 0 8px 24px rgba(124,111,255,0.45); }

  .btn-secondary {
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--subtext);
    padding: 10px 20px; font-size: 14px;
  }
  .btn-secondary:hover { background: var(--surface3); color: var(--text); }

  .btn-sm { padding: 7px 14px; font-size: 13px; border-radius: 8px; }
  .btn-lg { padding: 14px 28px; font-size: 15px; }
  .w-full { width: 100%; }

  .flex { display: flex; }
  .items-center { align-items: center; }
  .justify-between { justify-content: space-between; }
  .text-muted { color: var(--subtext); }
  .text-sm { font-size: 13px; }

  .loading-screen {
    display: flex; align-items: center; justify-content: center; min-height: 100vh;
    background: var(--bg);
  }
  .spinner {
    width: 36px; height: 36px;
    border: 3px solid rgba(124,111,255,0.2);
    border-top-color: var(--purple);
    border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .error-banner {
    background: rgba(245,110,110,0.1);
    border: 1px solid rgba(245,110,110,0.25);
    border-radius: 10px; padding: 12px 14px;
    font-size: 14px; color: var(--red); margin-bottom: 20px;
  }

  .form-group { margin-bottom: 18px; }
  .form-group label {
    display: block; font-size: 13px; font-weight: 600;
    color: var(--subtext); margin-bottom: 8px; letter-spacing: 0.02em;
  }
  .form-group input, .form-group select, .form-group textarea {
    width: 100%; background: var(--surface2);
    border: 1px solid var(--border); border-radius: 12px;
    padding: 13px 16px; font-size: 15px;
    font-family: 'Sora', sans-serif; color: var(--text);
    outline: none; transition: border-color 0.2s, background 0.2s;
    box-sizing: border-box;
  }
  .form-group input::placeholder { color: var(--muted); }
  .form-group input:focus {
    border-color: var(--purple);
    background: rgba(124,111,255,0.06);
    box-shadow: 0 0 0 3px rgba(124,111,255,0.1);
  }
`;

export default function Layout() {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <>
      <style>{css}</style>
      <div className="app-layout">

        {/* Mobile Header */}
        <header className="mobile-header">
          <div className="sidebar-logo">
            <div className="sidebar-logo-icon">✦</div>
            <span className="sidebar-logo-text">StudyAI</span>
          </div>
          <button className="hamburger-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </header>

        {menuOpen && <div className="mobile-overlay" onClick={() => setMenuOpen(false)} />}

        {/* Sidebar */}
        <aside className={`sidebar ${menuOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-logo desktop-only">
            <div className="sidebar-logo-icon">✦</div>
            <span className="sidebar-logo-text">StudyAI</span>
          </div>

          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? '☀️' : '🌙'}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="user-chip">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Log out">↩</button>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="main-content" onClick={() => setMenuOpen(false)}>
          <Outlet />
        </main>
      </div>
    </>
  );
}