import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';

/**
 * Blocks access for unauthenticated visitors.
 * Authenticated users who have not finished onboarding are sent to /onboarding.
 * While the persisted session is being restored we show a loader instead of
 * redirecting, so a refresh on /dashboard never bounces the user to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isVerified, onboardingCompleted, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!isVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (!onboardingCompleted) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}
