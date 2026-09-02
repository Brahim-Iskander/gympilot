import { useState, useEffect } from 'react';
import { Link as RouterLink, Navigate, useSearchParams } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
  Chip,
  Card,
  Collapse,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';

import AuthShell from '../../components/AuthShell';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { getApiErrorMessage } from '../../utils/errors';
import { validateRegisterForm } from '../../utils/validation';
import { referralService } from '../../services/referralService';

const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const [searchParams] = useSearchParams();
  const initialRef = (searchParams.get('ref') || searchParams.get('referral') || '').trim();

  const { register, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Referral code state
  const [referralCode, setReferralCode] = useState(initialRef);
  const [referralInfo, setReferralInfo] = useState(null);
  const [showReferralInput, setShowReferralInput] = useState(Boolean(initialRef));

  useEffect(() => {
    if (initialRef) {
      referralService.validateReferralCode(initialRef)
        .then((res) => {
          if (res?.valid) {
            setReferralInfo(res);
          }
        })
        .catch(() => { });
    }
  }, [initialRef]);

  // Already signed in? PublicOnlyRoute handles redirect; keep a safe fallback.
  if (!loading && isAuthenticated) {
    return <Navigate to="/onboarding" replace />;
  }

  const handleChange = (field) => (event) => {
    setValues((current) => ({ ...current, [field]: event.target.value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const nextErrors = validateRegisterForm(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');
    try {
      await register({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        password: values.password,
        referralCode: referralCode ? referralCode.trim().toUpperCase() : undefined,
      });
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  const passwordVisibilityProps = {
    endAdornment: (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setShowPassword((visible) => !visible)}
          edge="end"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
        </IconButton>
      </InputAdornment>
    ),
  };

  return (
    <>
      <SEO
        title="Create Free Account"
        description="Join GymPilot today. Create your free account to track workouts, monitor strength progress, set goals, and hit new personal records."
        path="/register"
      />
      <AuthShell
        title={t('auth.createAccount')}
        subtitle={t('auth.registerSubtitle')}
        footer={
          <Typography variant="body2" color="text.secondary">
            {t('auth.alreadyAccount')}{' '}
            <Link component={RouterLink} to="/login" sx={{ color: 'primary.main', fontWeight: 600 }}>
              {t('auth.signIn')}
            </Link>
          </Typography>
        }
      >
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            {formError && (
              <Alert severity="error" variant="outlined">
                {formError}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2.5}>
              <TextField
                label={t('auth.firstName')}
                autoComplete="given-name"
                required
                fullWidth
                value={values.firstName}
                onChange={handleChange('firstName')}
                error={Boolean(errors.firstName)}
                helperText={errors.firstName}
              />
              <TextField
                label={t('auth.lastName')}
                autoComplete="family-name"
                required
                fullWidth
                value={values.lastName}
                onChange={handleChange('lastName')}
                error={Boolean(errors.lastName)}
                helperText={errors.lastName}
              />
            </Stack>

            <TextField
              label={t('auth.email')}
              type="email"
              autoComplete="email"
              required
              fullWidth
              value={values.email}
              onChange={handleChange('email')}
              error={Boolean(errors.email)}
              helperText={errors.email}
            />

            <TextField
              label={t('auth.password')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              fullWidth
              value={values.password}
              onChange={handleChange('password')}
              error={Boolean(errors.password)}
              helperText={errors.password ?? t('auth.passwordHint')}
              InputProps={passwordVisibilityProps}
            />

            <TextField
              label={t('auth.confirmPassword')}
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              fullWidth
              value={values.confirmPassword}
              onChange={handleChange('confirmPassword')}
              error={Boolean(errors.confirmPassword)}
              helperText={errors.confirmPassword}
              InputProps={passwordVisibilityProps}
            />

            {/* Referral Reward Banner / Input */}
            {referralInfo?.valid ? (
              <Card
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(198, 255, 62, 0.08)',
                  border: '1px solid rgba(198, 255, 62, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 2,
                      bgcolor: 'rgba(198, 255, 62, 0.2)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <CardGiftcardRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Friend Referral Applied! <CelebrationRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Invited by <strong>{referralInfo.referrerName}</strong> (+10 bonus points)
                    </Typography>
                  </Box>
                </Stack>
                <Chip
                  label="+10 PTS"
                  size="small"
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                  }}
                />
              </Card>
            ) : (
              <Box>
                {!showReferralInput ? (
                  <Button
                    size="small"
                    onClick={() => setShowReferralInput(true)}
                    startIcon={<CardGiftcardRoundedIcon sx={{ fontSize: 16 }} />}
                    sx={{ color: 'text.secondary', textTransform: 'none', px: 0, '&:hover': { color: 'primary.main' } }}
                  >
                    Have a referral or invite code?
                  </Button>
                ) : (
                  <Collapse in={showReferralInput}>
                    <TextField
                      label="Referral / Invite Code (Optional)"
                      placeholder="e.g. ALEX8392"
                      fullWidth
                      size="small"
                      value={referralCode}
                      onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                      helperText="Enter a friend's code to unlock 10 bonus points on registration"
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <CardGiftcardRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Collapse>
                )}
              </Box>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              disabled={submitting}
              startIcon={<PersonAddAlt1RoundedIcon />}
            >
              {submitting ? t('auth.creatingAccount') : t('auth.createAccount')}
            </Button>
          </Stack>
        </Box>
      </AuthShell>
    </>
  );
}