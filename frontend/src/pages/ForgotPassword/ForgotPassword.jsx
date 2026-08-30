import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Link,
  Stack,
  TextField,
  Typography,
  Paper,
  Avatar,
} from '@mui/material';
import MarkEmailReadRoundedIcon from '@mui/icons-material/MarkEmailReadRounded';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';

import AuthShell from '../../components/AuthShell';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/errors';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validateEmail = (value) => {
    if (!value || !value.trim()) {
      return 'Email is required';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const error = validateEmail(email);
    if (error) {
      setEmailError(error);
      return;
    }

    setSubmitting(true);
    setFormError('');
    try {
      await authService.forgotPassword(email.trim().toLowerCase());
      setSubmittedEmail(email.trim().toLowerCase());
    } catch (err) {
      setFormError(getApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setSubmittedEmail('');
    setEmail('');
    setFormError('');
  };

  return (
    <AuthShell
      title={submittedEmail ? 'Check Your Inbox' : 'Forgot Password'}
      subtitle={
        submittedEmail
          ? 'Password reset instructions have been dispatched.'
          : 'Enter your account email and we will send you a secure link to reset your password.'
      }
      footer={
        <Typography variant="body2" color="text.secondary">
          Remember your password?{' '}
          <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
            Sign In
          </Link>
        </Typography>
      }
    >
      {submittedEmail ? (
        <Stack spacing={3} sx={{ textAlign: 'center', py: 1 }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(198,255,62,0.15)',
              color: 'primary.main',
              mx: 'auto',
              boxShadow: '0 4px 20px rgba(198,255,62,0.3)',
            }}
          >
            <MarkEmailReadRoundedIcon sx={{ fontSize: 36 }} />
          </Avatar>

          <Box>
            <Typography variant="body1" sx={{ color: 'text.primary', fontWeight: 600, mb: 1 }}>
              Email sent to <span style={{ color: '#C6FF3E' }}>{submittedEmail}</span>
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Click the secure link inside the email to set a new password. The reset link is valid for{' '}
              <strong>30 minutes</strong>.
            </Typography>
          </Box>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 2.5,
              bgcolor: 'background.default',
              borderColor: 'divider',
              textAlign: 'left',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 700 }}>
              DIDN'T RECEIVE THE EMAIL?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              • Check your spam or promotions folder.<br />
              • Make sure you typed the correct email address.<br />
              • Wait a couple of minutes before requesting another link.
            </Typography>
          </Paper>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Button
              variant="outlined"
              onClick={handleResetForm}
              sx={{ borderRadius: 2.5, fontWeight: 600 }}
            >
              Try Another Email
            </Button>
            <Button
              variant="contained"
              component={RouterLink}
              to="/login"
              sx={{
                borderRadius: 2.5,
                bgcolor: 'primary.main',
                color: '#000',
                fontWeight: 800,
              }}
            >
              Back to Login
            </Button>
          </Stack>
        </Stack>
      ) : (
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {formError && (
              <Alert severity="error" variant="outlined" sx={{ borderRadius: 2 }}>
                {formError}
              </Alert>
            )}

            <TextField
              label="Email Address"
              type="email"
              autoComplete="email"
              autoFocus
              required
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailError('');
              }}
              error={Boolean(emailError)}
              helperText={emailError}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={<SendRoundedIcon />}
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
              {submitting ? 'Sending Reset Link...' : 'Send Reset Link'}
            </Button>

            <Button
              component={RouterLink}
              to="/login"
              variant="text"
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ color: 'text.secondary', fontWeight: 600 }}
            >
              Return to Login
            </Button>
          </Stack>
        </Box>
      )}
    </AuthShell>
  );
}
