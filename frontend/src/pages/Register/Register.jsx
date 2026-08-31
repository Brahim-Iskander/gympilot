import { useState } from 'react';
import { Link as RouterLink, Navigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Grid,
  IconButton,
  InputAdornment,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded';

import AuthShell from '../../components/AuthShell';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { getApiErrorMessage } from '../../utils/errors';
import { validateRegisterForm } from '../../utils/validation';

const INITIAL_VALUES = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
};

export default function Register() {
  const { register, isAuthenticated, loading } = useAuth();
  const { t } = useLanguage();
  const [values, setValues] = useState(INITIAL_VALUES);
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

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

          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
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
            </Grid>
            <Grid item xs={12} sm={6}>
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
            </Grid>
          </Grid>

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
