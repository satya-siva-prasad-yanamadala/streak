import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import GymPage from './pages/GymPage';
import MoneyPage from './pages/MoneyPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedLayout({ children }) {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', gap:12, color:'var(--text-muted)' }}>
        <div className="spinner" style={{ width:32, height:32, borderWidth:3 }} />
        Loading Streak...
      </div>
    );
  }

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <Header onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="page-content">{children}</main>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/"          element={user ? <Navigate to="/dashboard" replace /> : <LandingPage />} />
      <Route path="/auth"      element={user ? <Navigate to="/dashboard" replace /> : <AuthPage />} />
      <Route path="/dashboard" element={<ProtectedLayout><DashboardPage /></ProtectedLayout>} />
      <Route path="/gym"       element={<ProtectedLayout><GymPage /></ProtectedLayout>} />
      <Route path="/money"     element={<ProtectedLayout><MoneyPage /></ProtectedLayout>} />
      <Route path="/profile"   element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />
      <Route path="*"          element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
