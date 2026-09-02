import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { authService } from '../services/authService';
import { onboardingService } from '../services/onboardingService';
import { fitnessDataService } from '../services/fitnessDataService';
import { AUTH_EXPIRED_EVENT, TOKEN_STORAGE_KEY } from '../constants';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  // `loading` stays true until the persisted token has been validated against /auth/me,
  // so protected content never flashes while the session is being restored.
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadOnboardingStatus = useCallback(async () => {
    try {
      const data = await onboardingService.get();
      const completed = Boolean(data.completed);
      setOnboardingCompleted(completed);
      return completed;
    } catch {
      setOnboardingCompleted(false);
      return false;
    }
  }, []);

  // Restore the session on first load: validate the stored JWT via GET /auth/me.
  useEffect(() => {
    let active = true;

    async function restoreSession() {
      const token = localStorage.getItem(TOKEN_STORAGE_KEY);

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authService.getMe();
        if (!active) return;
        // /auth/me returns the user object directly (not wrapped in { user }).
        setUser(data?.user ?? data ?? null);
        await loadOnboardingStatus();
      } catch {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        if (active) {
          setUser(null);
          setOnboardingCompleted(false);
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    restoreSession();

    return () => {
      active = false;
    };
  }, [loadOnboardingStatus]);

  // React to tokens invalidated elsewhere (e.g. a 401 "session expired" response).
  useEffect(() => {
    const handleExpired = () => {
      setUser(null);
      setOnboardingCompleted(false);
    };
    window.addEventListener(AUTH_EXPIRED_EVENT, handleExpired);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, handleExpired);
  }, []);

  const persistSession = useCallback((data) => {
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    setUser(data.user);
    try {
      fitnessDataService.clearUserCache();
    } catch (e) {}
  }, []);

  const redirectAfterAuth = useCallback(
    async (authUser, isNewAccount = false) => {
      const targetUser = authUser || user;
      if (isNewAccount || (targetUser && !targetUser.isVerified)) {
        setOnboardingCompleted(false);
        navigate('/verify-email', { replace: true });
        return;
      }
      const completed = await loadOnboardingStatus();
      navigate(completed ? '/dashboard' : '/onboarding', { replace: true });
    },
    [loadOnboardingStatus, navigate, user],
  );

  const login = useCallback(
    async (email, password) => {
      const data = await authService.login({ email, password });
      persistSession(data);
      if (!data.user?.isVerified) {
        setOnboardingCompleted(false);
        navigate('/verify-email', { replace: true });
        return;
      }
      const completed = await loadOnboardingStatus();
      navigate(completed ? '/dashboard' : '/onboarding', { replace: true });
    },
    [persistSession, loadOnboardingStatus, navigate],
  );

  const register = useCallback(
    async (payload) => {
      const data = await authService.register(payload);
      persistSession(data);
      setOnboardingCompleted(false);
      navigate('/verify-email', { replace: true });
    },
    [persistSession, navigate],
  );

  const verifyOtp = useCallback(
    async (code) => {
      const updatedUser = await authService.verifyOtp({ code });
      setUser(updatedUser);
      navigate('/onboarding', { replace: true });
      return updatedUser;
    },
    [navigate],
  );

  const resendOtp = useCallback(async () => {
    return await authService.resendOtp();
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    try {
      fitnessDataService.clearUserCache();
    } catch (e) {}
    setUser(null);
    setOnboardingCompleted(false);
    navigate('/', { replace: true });
  }, [navigate]);

  const updateUser = useCallback((nextUser) => {
    setUser(nextUser);
  }, []);

  const value = useMemo(() => {
    const roles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : ['USER']);
    const upperRoles = roles.map((r) => String(r).toUpperCase());

    const isAdmin = Boolean(user?.isAdmin || user?.role === 'ADMIN' || upperRoles.includes('ADMIN'));
    const isCoach = Boolean(user?.isCoach || user?.role === 'COACH' || upperRoles.includes('COACH'));
    const isSeller = Boolean(user?.isSeller || user?.role === 'SELLER' || upperRoles.includes('SELLER'));
    const isStaff = isAdmin || isCoach || isSeller;
    const isVerified = Boolean(user?.isVerified);

    return {
      user,
      isAuthenticated: Boolean(user),
      isVerified,
      isAdmin,
      isCoach,
      isSeller,
      isStaff,
      roles: upperRoles,
      onboardingCompleted,
      setOnboardingCompleted,
      loading,
      login,
      register,
      verifyOtp,
      resendOtp,
      logout,
      updateUser,
    };
  }, [user, onboardingCompleted, loading, login, register, verifyOtp, resendOtp, logout, updateUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
