import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './pages/admin/AdminLayout';
import CadetDashboard from './pages/CadetDashboard';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(() => {
    const token = localStorage.getItem('token');
    const stored = localStorage.getItem('user');
    if (token && stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else setUser(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const onLogin = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const onLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <span style={{ color: 'var(--gold)' }}>Loading…</span>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={user.role === 'admin' || user.role === 'campus' ? '/admin/upload' : '/cadet'} replace /> : <Login onLogin={onLogin} />} />
      <Route path="/login" element={user ? <Navigate to={user.role === 'admin' || user.role === 'campus' ? '/admin/upload' : '/cadet'} replace /> : <Login onLogin={onLogin} />} />
      <Route path="/admin" element={user && (user.role === 'admin' || user.role === 'campus') ? <AdminLayout user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />}>
        <Route index element={<Navigate to="upload" replace />} />
        <Route path="upload" element={<AdminSemesters />} />
        <Route path="semesters" element={<Navigate to="/admin/upload" replace />} />
        <Route path="semesters/:id" element={<AdminSemesterView />} />
        <Route path="accounts" element={user?.role === 'admin' ? <AdminAccounts /> : <Navigate to="/admin/upload" replace />} />
      </Route>
      <Route path="/cadet" element={user?.role === 'cadet' ? <CadetDashboard user={user} onLogout={onLogout} /> : <Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// Lazy-load admin pages to avoid circular dependency
import AdminSemesters from './pages/admin/AdminSemesters';
import AdminSemesterView from './pages/admin/AdminSemesterView';
import AdminAccounts from './pages/admin/AdminAccounts';

export default App;
