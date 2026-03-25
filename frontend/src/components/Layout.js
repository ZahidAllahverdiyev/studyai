import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

// SVG Icon components
const Icons = {
  Dashboard: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  Upload: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
    </svg>
  ),
  Settings: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  Profile: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Sun: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  ),
  Menu: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
    </svg>
  ),
  Close: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Logout: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

const navItems = [
  { to: '/dashboard', Icon: Icons.Dashboard, label: 'Dashboard' },
  { to: '/upload',    Icon: Icons.Upload,    label: 'Upload Files' },
  { to: '/settings',  Icon: Icons.Settings,  label: 'Settings' },
  { to: '/profile',   Icon: Icons.Profile,   label: 'Profile' },
];

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
  .nav-icon {
    width: 20px; height: 20px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

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
    cursor: pointer; padding: 4px;
    border-radius: 6px; transition: color 0.2s, background 0.2s;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .logout-btn:hover { color: var(--red); background: rgba(245,110,110,0.12); }

  .main-content {
    margin-left: 230px;
    flex: 1; min-height: 100vh;
    padding: 40px 44px;
    background: var(--bg);
  }

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
    cursor: pointer;
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
            {menuOpen ? <Icons.Close /> : <Icons.Menu />}
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
            {navItems.map(({ to, Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setMenuOpen(false)}
              >
                <span className="nav-icon"><Icon /></span>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="sidebar-footer">
            <button className="theme-btn" onClick={toggleTheme}>
              {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </button>
            <div className="user-chip">
              <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              <div className="user-info">
                <div className="user-name">{user?.name}</div>
                <div className="user-email">{user?.email}</div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Log out">
                <Icons.Logout />
              </button>
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