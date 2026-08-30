import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  Avatar,
  Paper,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import LockResetRoundedIcon from '@mui/icons-material/LockResetRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';

import AuthShell from '../../components/AuthShell';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/errors';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [tokenEmail, setTokenEmail] = useState('');
  const [validationError, setValidationError] = useState('');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setValidating(false);
      setTokenValid(false);
      setValidationError('Missing password reset token. Please check your link.');
      return;
    }

    const checkToken = async () => {
      try {
        setValidating(true);
        const res = await authService.validateResetToken(token);
        if (res.valid) {
          setTokenValid(true);
          setTokenEmail(res.email || '');
        } else {
          setTokenValid(false);
          setValidationError(res.message || 'This reset link is invalid or expired.');
        }
      } catch (err) {
        setTokenValid(false);
        setValidationError(getApiErrorMessage(err) || 'This reset link is invalid or expired.');
      } finally {
        setValidating(false);
      }
    };

    checkToken();
  }, [token]);

  const validateForm = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      errors.newPassword = 'Password must be at least 8 characters';
    }

    if (!confirmPassword) {
      errors.confirmPassword = 'Confirm your new password';
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const errors = validateForm();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      await authService.resetPassword({
        token,
        newPassword,
      });
      setResetSuccess(true);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell
      title={
        validating
          ? 'Verifying Link...'
          : resetSuccess
          ? 'Password Reset Complete'
          : !tokenValid
          ? 'Link Expired'
          : 'Reset Password'
      }
      subtitle={
        validating
          ? 'Please wait while we verify your security token.'
          : resetSuccess
          ? 'Your new credentials are saved. You can now log in.'
          : !tokenValid
          ? 'This reset link cannot be used.'
          : tokenEmail
          ? `Choose a new secure password for ${tokenEmail}`
          : 'Choose a strong password with at least 8 characters.'
      }
      footer={
        <Typography variant="body2" color="text.secondary">
          Remember your credentials?{' '}
          <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Sign In
          </Link>
        </Typography>
      }
    >
      {validating ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <CircularProgress color="primary" />
        </Box>
      ) : resetSuccess ? (
        <Stack spacing={3} sx={{ textAlign: 'center', py: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(0,230,118,0.15)',
              color: '#00E676',
              mx: 'auto',
              boxShadow: '0 4px 20px rgba(0,230,118,0.3)',
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 38 }} />
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', mb: 1 }}>
              Password Updated Successfully
            </Typography>
            <Typography variant="body2" color="text.secondary">
              You can now sign in to your GymPilot account with your new password.
            </Typography>
          </Box>

          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2.5,
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(198,255,62,0.3)',
              '&:hover': { bgcolor: '#b3f520' },
            }}
          >
            Sign In Now
          </Button>
        </Stack>
      ) : !tokenValid ? (
        <Stack spacing={3} sx={{ textAlign: 'center', py: 2 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(255,82,82,0.15)',
              color: 'error.main',
              mx: 'auto',
            }}
          >
            <ErrorOutlineRoundedIcon sx={{ fontSize: 38 }} />
          </Avatar>

          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ color: 'text.primary', mb: 1 }}>
              Invalid or Expired Link
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {validationError || 'This password reset link is invalid or has already expired after 30 minutes.'}
            </Typography>
          </Box>

          <Button
            variant="contained"
            component={RouterLink}
            to="/forgot-password"
            size="large"
            sx={{
              py: 1.5,
              borderRadius: 2.5,
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 800,
            }}
          >
            Request a New Reset Link
          </Button>
        </Stack>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {submitError && (
              <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                {submitError}
              </Alert>
            )}

            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              autoFocus
              required
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setFormErrors((prev) => ({ ...prev, newPassword: '' }));
              }}
              error={Boolean(formErrors.newPassword)}
              helperText={formErrors.newPassword || 'Must be at least 8 characters'}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setFormErrors((prev) => ({ ...prev, confirmPassword: '' }));
              }}
              error={Boolean(formErrors.confirmPassword)}
              helperText={formErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={<LockResetRoundedIcon />}
              sx={{
                py: 1.5,
                bgcolor: 'primary.main',
                color: '#000',
                fontWeight: 800,
                borderRadius: 2.5,
                boxShadow: '0 4px 14px rgba(198,255,62,0.3)',
                '&:hover': { bgcolor: '#b3f520' },
              }}
            >
              {submitting ? 'Updating Password...' : 'Reset Password'}
            </Button>
          </Stack>
        </Box>
      )}
    </AuthShell>
  );
}
