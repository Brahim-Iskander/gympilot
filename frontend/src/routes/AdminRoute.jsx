import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';

/**
 * Route guard for Admin & Coach Control Center:
 * - If user is not authenticated -> /login
 * - If user is COACH and accesses /admin/coach-chat -> allow
 * - If user is COACH and accesses other admin routes -> redirect to /admin/coach-chat
 * - If user is ADMIN -> allow all
 * - If neither -> redirect to /dashboard
 */
export default function AdminRoute({ children }) {
  const { isAuthenticated, isAdmin, isCoach, isStaff, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isStaff) {
    return <Navigate to="/dashboard" replace />;
  }

  // If coach attempts to access pages other than coach desk, redirect to /admin/coach-chat
  if (isCoach && !isAdmin && location.pathname !== '/admin/coach-chat') {
    return <Navigate to="/admin/coach-chat" replace />;
  }

  return children;
}
