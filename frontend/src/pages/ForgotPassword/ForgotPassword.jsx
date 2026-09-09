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
import SEO from '../../components/SEO';
import { authService } from '../../services/authService';
import { getApiErrorMessage } from '../../utils/errors';
import { useLanguage } from '../../i18n';

export default function ForgotPassword() {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [submittedEmail, setSubmittedEmail] = useState('');

  const validateEmail = (value) => {
    if (!value || !value.trim()) {
      return t('auth.email') + ' ' + t('common.required').toLowerCase();
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) {
      return t('common.error');
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
    <>
      <SEO
        title={t('auth.forgotPasswordTitle')}
        description={t('auth.forgotPasswordSubtitle')}
        path="/forgot-password"
      />
      <AuthShell
        title={submittedEmail ? t('auth.checkYourInbox') : t('auth.forgotPasswordTitle')}
        subtitle={
          submittedEmail
            ? t('auth.resetInstructions')
            : t('auth.forgotPasswordSubtitle')
        }
        footer={
          <Typography variant="body2" color="text.secondary">
            {t('auth.rememberPassword')}{' '}
            <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {t('auth.signIn')}
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
                {t('auth.emailSentTo', { email: submittedEmail })}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {t('auth.resetInstructions')}
              </Typography>
            </Box>

            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="outlined"
                onClick={handleResetForm}
                sx={{ borderRadius: 2.5, fontWeight: 600 }}
              >
                {t('auth.tryAnotherEmail')}
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
                {t('auth.backToSignIn')}
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
                label={t('auth.email')}
                type="email"
                autoComplete="email"
                autoFocus
                required
                placeholder="alex@example.com"
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
                {submitting ? t('auth.sendingResetLink') : t('auth.sendResetLink')}
              </Button>

              <Button
                component={RouterLink}
                to="/login"
                variant="text"
                startIcon={<ArrowBackRoundedIcon />}
                sx={{ color: 'text.secondary', fontWeight: 600 }}
              >
                {t('auth.backToSignIn')}
              </Button>
            </Stack>
          </Box>
        )}
      </AuthShell>
    </>
  );
}
