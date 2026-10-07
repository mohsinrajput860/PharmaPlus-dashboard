import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import LoginPage         from './pages/LoginPage.jsx';
import DashboardPage     from './pages/DashboardPage.jsx';
import MachinesPage      from './pages/MachinesPage.jsx';
import MachineDetailPage from './pages/MachineDetailPage.jsx';
import TrialRequestsPage from './pages/TrialRequestsPage.jsx';
import ApprovedTrialsPage from './pages/ApprovedTrialsPage.jsx';
import ExpiredTrialsPage  from './pages/ExpiredTrialsPage.jsx';
import ActiveLicensesPage from './pages/ActiveLicensesPage.jsx';
import ExpiringSoonPage   from './pages/ExpiringSoonPage.jsx';
import AllMachinesPage    from './pages/AllMachinesPage.jsx';
import RevokedPage        from './pages/RevokedPage.jsx';
import Layout            from './components/Layout.jsx';

function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
function PublicRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
        <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route index                element={<DashboardPage />} />
          {/* Free Trial */}
          <Route path="trial-requests"  element={<TrialRequestsPage />} />
          <Route path="trial-approved"  element={<ApprovedTrialsPage />} />
          <Route path="trial-expired"   element={<ExpiredTrialsPage />} />
          {/* License */}
          <Route path="active"          element={<ActiveLicensesPage />} />
          <Route path="expiring-soon"   element={<ExpiringSoonPage />} />
          <Route path="all-machines"    element={<AllMachinesPage />} />
          <Route path="revoked"         element={<RevokedPage />} />
          {/* Machine detail */}
          <Route path="machines"        element={<MachinesPage />} />
          <Route path="machines/:hwid"  element={<MachineDetailPage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
