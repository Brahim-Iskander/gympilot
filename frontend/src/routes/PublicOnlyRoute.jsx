import { Navigate } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import FullScreenLoader from '../components/FullScreenLoader';

/**
 * For Login/Register: authenticated users are sent to onboarding or dashboard
 * depending on whether they have finished setup.
 */
export default function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isVerified, onboardingCompleted, loading } = useAuth();

  if (loading) {
    return <FullScreenLoader />;
  }

  if (isAuthenticated) {
    if (!isVerified) {
      return <Navigate to="/verify-email" replace />;
    }
    return <Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }

  return children;
}
