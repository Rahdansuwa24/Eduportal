import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/authContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { AdminDashboard } from '@/pages/admin/adminDashboard';
import { WakaDashboard } from '@/pages/waka/wakaDashboard';
import { GuruDashboard } from '@/pages/guru/guruDashboard';
import { SiswaDashboard } from '@/pages/siswa/siswaDashboard';
import { LoginPage } from '@/pages/auth/LoginPage';

const defaultRoleTabs = {
  admin: 'users',
  waka: 'kurikulum',
  guru: 'presensi-guru',
  siswa: 'presensi'
};

// Component Pembungkus Protected Route berdasarkan Role
const ProtectedRoute = ({ allowedRole, children }) => {
  const { isAuthenticated, currentRole } = useAuth();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const tabFromUrl = queryParams.get('tab');

  const [activeTab, setActiveTab] = useState(tabFromUrl || defaultRoleTabs[allowedRole] || 'users');

  useEffect(() => {
    if (tabFromUrl) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab(defaultRoleTabs[allowedRole] || 'users');
    }
  }, [tabFromUrl, allowedRole]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (currentRole !== allowedRole) {
    return <Navigate to={`/${currentRole}`} replace />;
  }

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {children({ activeTab })}
    </DashboardLayout>
  );
};

// Halaman Redirect Cerdas di Route Root `/`
const RootRedirect = () => {
  const { isAuthenticated, currentRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={`/${currentRole}`} replace />;
};

// Halaman Login Route `/login`
const LoginRoute = () => {
  const { isAuthenticated, currentRole } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={`/${currentRole}`} replace />;
  }
  return <LoginPage />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route Public Login */}
          <Route path="/login" element={<LoginRoute />} />

          {/* Route Dashboard Admin (/admin) */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRole="admin">
                {({ activeTab }) => <AdminDashboard activeTab={activeTab} />}
              </ProtectedRoute>
            }
          />

          {/* Route Dashboard Waka Kurikulum (/waka) */}
          <Route
            path="/waka"
            element={
              <ProtectedRoute allowedRole="waka">
                {({ activeTab }) => <WakaDashboard activeTab={activeTab} />}
              </ProtectedRoute>
            }
          />

          {/* Route Dashboard Guru (/guru) */}
          <Route
            path="/guru"
            element={
              <ProtectedRoute allowedRole="guru">
                {({ activeTab }) => <GuruDashboard activeTab={activeTab} />}
              </ProtectedRoute>
            }
          />

          {/* Route Dashboard Siswa (/siswa) */}
          <Route
            path="/siswa"
            element={
              <ProtectedRoute allowedRole="siswa">
                {({ activeTab }) => <SiswaDashboard activeTab={activeTab} />}
              </ProtectedRoute>
            }
          />

          {/* Redirect Root `/` ke Route Role Aktif */}
          <Route path="/" element={<RootRedirect />} />

          {/* Wildcard Fallback / 404 */}
          <Route path="*" element={<RootRedirect />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
