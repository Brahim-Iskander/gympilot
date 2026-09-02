import { useState, useEffect, useRef } from 'react';
import { Navigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  Typography,
  Paper,
  Chip,
} from '@mui/material';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';

import AuthShell from '../../components/AuthShell';
import SEO from '../../components/SEO';
import FullScreenLoader from '../../components/FullScreenLoader';
import { useAuth } from '../../context/AuthContext';
import { getApiErrorMessage } from '../../utils/errors';

export default function VerifyEmail() {
  const { user, isAuthenticated, isVerified, onboardingCompleted, loading, verifyOtp, resendOtp, logout } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef([]);

  // Live 60-second cooldown timer for resend
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Focus the first empty slot on mount
  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  if (loading) {
    return <FullScreenLoader />;
  }

  // Not signed in? Redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Already verified? Redirect according to onboarding questionnaire status
  if (isVerified) {
    return <Navigate to={onboardingCompleted ? '/dashboard' : '/onboarding'} replace />;
  }

  const handleInputChange = (index, value) => {
    // Only accept numeric digit
    const digit = value.replace(/\D/g, '').slice(-1);
    const nextOtp = [...otp];
    nextOtp[index] = digit;
    setOtp(nextOtp);
    setError('');

    // Auto-advance to next input
    if (digit && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }

    // Auto-submit if all 6 digits entered
    if (digit && index === 5 && nextOtp.every((d) => d !== '')) {
      submitCode(nextOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowLeft' && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1].focus();
    } else if (e.key === 'ArrowRight' && index < 5 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text').trim();
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);

    if (digits.length > 0) {
      const nextOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        nextOtp[i] = digits[i] || '';
      }
      setOtp(nextOtp);
      setError('');

      const targetFocusIndex = Math.min(digits.length, 5);
      if (inputRefs.current[targetFocusIndex]) {
        inputRefs.current[targetFocusIndex].focus();
      }

      if (digits.length === 6) {
        submitCode(digits);
      }
    }
  };

  const submitCode = async (codeString) => {
    const code = codeString || otp.join('');
    if (code.length !== 6) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccessMsg('');

    try {
      await verifyOtp(code);
      // verifyOtp in AuthContext automatically navigates to /onboarding upon success
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await resendOtp();
      setSuccessMsg(res?.message || 'A new verification code has been sent to your email.');
      setCooldown(60);
      setOtp(['', '', '', '', '', '']);
      if (inputRefs.current[0]) {
        inputRefs.current[0].focus();
      }
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setResending(false);
    }
  };

  return (
    <>
      <SEO
        title="Verify Your Email — GymPilot"
        description="Enter the 6-digit verification code sent to your email address."
        path="/verify-email"
        noIndex
      />

      <AuthShell
        title="Verify Your Email"
        subtitle="Step 1 of 2: Confirm your account before beginning your fitness questionnaire."
        footer={
          <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
            <Typography variant="caption" color="text.secondary">
              Wrong email address?
            </Typography>
            <Button
              size="small"
              onClick={logout}
              startIcon={<LogoutRoundedIcon sx={{ fontSize: 16 }} />}
              sx={{ fontWeight: 700, fontSize: '0.8rem', color: 'text.secondary' }}
            >
              Sign Out
            </Button>
          </Stack>
        }
      >
        <Stack spacing={3} alignItems="center">
          {/* Header Icon */}
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              bgcolor: 'rgba(198, 255, 62, 0.12)',
              border: '1px solid rgba(198, 255, 62, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'primary.main',
            }}
          >
            <MarkEmailReadRoundedIcon sx={{ fontSize: 38 }} />
          </Box>

          {/* Instructions */}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              We sent a 6-digit verification code to:
            </Typography>
            <Chip
              label={user?.email || 'your email'}
              size="medium"
              sx={{
                fontWeight: 800,
                fontSize: '0.9rem',
                bgcolor: 'rgba(255,255,255,0.05)',
                color: 'text.primary',
                border: '1px solid',
                borderColor: 'divider',
                px: 1,
              }}
            />
          </Box>

          {/* Feedback alerts */}
          {error && (
            <Alert severity="error" sx={{ width: '100%', borderRadius: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {successMsg && (
            <Alert severity="success" sx={{ width: '100%', borderRadius: 2 }} onClose={() => setSuccessMsg('')}>
              {successMsg}
            </Alert>
          )}

          {/* 6-Digit OTP Inputs */}
          <Box
            onPaste={handlePaste}
            sx={{
              display: 'flex',
              gap: { xs: 1, sm: 1.5 },
              justifyContent: 'center',
              width: '100%',
              my: 1,
            }}
          >
            {otp.map((digit, idx) => (
              <Box
                key={idx}
                component="input"
                ref={(el) => (inputRefs.current[idx] = el)}
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={digit}
                onChange={(e) => handleInputChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                disabled={submitting}
                autoComplete="one-time-code"
                aria-label={`Digit ${idx + 1}`}
                sx={{
                  width: { xs: 44, sm: 54 },
                  height: { xs: 54, sm: 64 },
                  fontSize: { xs: '1.4rem', sm: '1.75rem' },
                  fontWeight: 900,
                  fontFamily: "'Courier New', Courier, monospace",
                  textAlign: 'center',
                  bgcolor: digit ? 'rgba(198, 255, 62, 0.06)' : 'rgba(255, 255, 255, 0.03)',
                  color: 'primary.main',
                  border: '2px solid',
                  borderColor: digit ? 'primary.main' : 'divider',
                  borderRadius: 3,
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  '&:focus': {
                    borderColor: 'primary.main',
                    boxShadow: '0 0 0 4px rgba(198, 255, 62, 0.15)',
                    bgcolor: 'rgba(198, 255, 62, 0.08)',
                  },
                }}
              />
            ))}
          </Box>

          {/* Action button */}
          <Button
            variant="contained"
            size="large"
            fullWidth
            onClick={() => submitCode()}
            disabled={submitting || otp.some((d) => !d)}
            endIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <ArrowForwardRoundedIcon />}
            sx={{
              py: 1.5,
              fontWeight: 800,
              fontSize: '1rem',
              borderRadius: 2.5,
            }}
          >
            {submitting ? 'Verifying Code...' : 'Verify & Continue to Questionnaire'}
          </Button>

          {/* Resend code section */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              width: '100%',
              borderRadius: 2.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'rgba(255, 255, 255, 0.02)',
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              Didn't receive the email? Check your spam folder or request a new code.
            </Typography>

            <Button
              variant="outlined"
              size="small"
              onClick={handleResend}
              disabled={cooldown > 0 || resending}
              startIcon={resending ? <CircularProgress size={16} color="inherit" /> : <RefreshRoundedIcon />}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              {resending
                ? 'Sending...'
                : cooldown > 0
                ? `Resend Code (${cooldown}s)`
                : 'Resend Verification Code'}
            </Button>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ textAlign: 'center' }}>
            ⏱️ Code expires in <strong>10 minutes</strong>. Maximum 5 verification attempts allowed.
          </Typography>
        </Stack>
      </AuthShell>
    </>
  );
}
