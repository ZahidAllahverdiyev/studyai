// ============================================================
// src/App.js - Root component with routing
// ============================================================

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import AnalysisPage from './pages/AnalysisPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import QuizPage from './pages/QuizPage';
import ResultsPage from './pages/ResultsPage';
import Layout from './components/Layout';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import AdminPage from './pages/Admin';

// Qorunan route — giriş etməyibsə login-ə yönləndir
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

// Admin route — yalnız admin rolu olan istifadəçilər üçün
function AdminRoute({ children }) {
  return children;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      {/* Admin səhifəsi — yalnız adminlər */}
      <Route path="/admin" element={
        <AdminRoute>
          <AdminPage />
        </AdminRoute>
      } />

      {/* Açıq səhifələr — giriş etməyən istifadəçilər üçün */}
      {/* Giriş etmişsə dashboard-a yönləndir */}
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

      {/* Şifrə sıfırlama — giriş tələb etmir, PrivateRoute xaricindədir */}
      <Route path="/forgot-password" element={user ? <Navigate to="/dashboard" /> : <ForgotPasswordPage />} />

      {/* Qorunan səhifələr — giriş tələb edir */}
      <Route element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/analysis/:fileId" element={<AnalysisPage />} />
        <Route path="/quiz/:fileId" element={<QuizPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: { background: 'var(--surface)', color: 'var(--text)', border: '1px solid var(--surface2)' },
              success: { iconTheme: { primary: 'var(--green)', secondary: 'var(--surface)' } },
              error: { iconTheme: { primary: 'var(--red)', secondary: 'var(--surface)' } },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </AuthProvider>
  );
}