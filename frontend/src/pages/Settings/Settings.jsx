import { useEffect, useState, useRef } from 'react';
import {
  Alert,
  Box,
  Button,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import NotificationsRoundedIcon from '@mui/icons-material/NotificationsRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PaletteRoundedIcon from '@mui/icons-material/PaletteRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import VisibilityOffRoundedIcon from '@mui/icons-material/VisibilityOffRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import LanguageSelector from '../../components/LanguageSelector';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { useThemeMode } from '../../context/ThemeContext';
import { useLanguage } from '../../i18n';
import { authService } from '../../services/authService';
import { onboardingService } from '../../services/onboardingService';
import { getApiErrorMessage } from '../../utils/errors';
import {
  DAY_OPTIONS,
  EQUIPMENT_OPTIONS,
  EXPERIENCE_OPTIONS,
  GOAL_OPTIONS,
  SEX_OPTIONS,
  formFromOnboarding,
} from '../Onboarding/constants';
import TagInput from '../Onboarding/components/TagInput';
import { Avatar, Badge, Card, LoadingSpinner, SectionHeader } from '../../components/ui';

const staticCardSx = {
  '&:hover': {
    transform: 'none',
    boxShadow: 'none',
    borderColor: 'divider',
  },
};

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { mode, setMode } = useThemeMode();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('account');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const sections = [
    { id: 'account', label: t('settings.account'), icon: <PersonRoundedIcon /> },
    { id: 'training', label: t('settings.trainingProfile'), icon: <FitnessCenterRoundedIcon /> },
    { id: 'appearance', label: `${t('settings.appearance')} & ${t('settings.language')}`, icon: <PaletteRoundedIcon /> },
    { id: 'notifications', label: t('settings.notifications'), icon: <NotificationsRoundedIcon /> },
    { id: 'security', label: t('settings.security'), icon: <SecurityRoundedIcon /> },
  ];

  const NOTIFICATION_ITEMS = [
    { key: 'workoutReminders', label: 'Workout reminders', desc: 'Get reminded before scheduled workouts' },
    { key: 'goalReminders', label: 'Goal reminders', desc: 'Notifications about approaching goal deadlines' },
    { key: 'achievementNotifications', label: 'Achievement notifications', desc: 'Celebrate when you unlock new achievements' },
    { key: 'weeklySummary', label: 'Weekly progress summary', desc: 'Receive a weekly training recap' },
    { key: 'nutritionReminders', label: 'Nutrition reminders', desc: 'Reminders to log meals and track macros' },
  ];

  const [account, setAccount] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });
  const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
  const [avatarFile, setAvatarFile] = useState(undefined); // undefined means untouched, null means removed, string means new base64
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  const [accountSaving, setAccountSaving] = useState(false);
  const [accountMessage, setAccountMessage] = useState({ type: '', text: '' });

  const [training, setTraining] = useState(null);
  const [trainingSaving, setTrainingSaving] = useState(false);
  const [trainingMessage, setTrainingMessage] = useState({ type: '', text: '' });
  const [trainingErrors, setTrainingErrors] = useState({});

  const [notifications, setNotifications] = useState({
    workoutReminders: true,
    goalReminders: true,
    achievementNotifications: true,
    weeklySummary: true,
    nutritionReminders: false,
  });

  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [securitySaving, setSecuritySaving] = useState(false);
  const [securityMessage, setSecurityMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    setAccount({
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      email: user?.email || '',
    });
    setAvatarPreview(user?.avatar || null);
    setAvatarFile(undefined);
  }, [user]);

  const handleAvatarSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setAvatarError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarError('Image size must be less than 2MB.');
      return;
    }

    setAvatarError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
      setAvatarFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview(null);
    setAvatarFile('');
    setAvatarError('');
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await onboardingService.get();
        if (!active) return;
        setTraining(formFromOnboarding(data));
      } catch (err) {
        if (active) setLoadError(getApiErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

  const fullName = [account.firstName, account.lastName].filter(Boolean).join(' ');

  const setTrainingField = (field, value) => {
    setTraining((current) => ({ ...current, [field]: value }));
    setTrainingErrors((current) => ({ ...current, [field]: undefined }));
  };

  const validateTraining = () => {
    const errors = {};
    const age = Number(training.age);
    if (!training.age || !Number.isInteger(age) || age < 13 || age > 100) {
      errors.age = 'Age must be 13–100.';
    }
    if (!training.sex) errors.sex = 'Required.';
    const height = Number(training.heightCm);
    if (!training.heightCm || Number.isNaN(height) || height < 100 || height > 250) {
      errors.heightCm = 'Height must be 100–250 cm.';
    }
    const weight = Number(training.weightKg);
    if (!training.weightKg || Number.isNaN(weight) || weight < 30 || weight > 300) {
      errors.weightKg = 'Weight must be 30–300 kg.';
    }
    if (!training.goal) errors.goal = 'Required.';
    if (!training.experienceLevel) errors.experienceLevel = 'Required.';
    const months = Number(training.trainingMonths);
    if (training.trainingMonths === '' || !Number.isInteger(months) || months < 0) {
      errors.trainingMonths = 'Enter months of training (0+).';
    }
    const days = Number(training.daysPerWeek);
    if (!Number.isInteger(days) || days < 2 || days > 6) {
      errors.daysPerWeek = 'Choose 2–6 days.';
    }
    if (!training.preferredDays?.length) {
      errors.preferredDays = 'Select at least one day.';
    } else if (training.preferredDays.length !== days) {
      errors.preferredDays = `Select exactly ${days} days.`;
    }
    const minutes = Number(training.minutesPerSession);
    if (!Number.isInteger(minutes) || minutes < 20 || minutes > 180) {
      errors.minutesPerSession = '20–180 minutes.';
    }
    if (!training.equipment) errors.equipment = 'Required.';
    return errors;
  };

  const handleSaveAccount = async () => {
    setAccountMessage({ type: '', text: '' });
    if (!account.firstName.trim() || !account.lastName.trim()) {
      setAccountMessage({ type: 'error', text: 'First and last name are required.' });
      return;
    }
    setAccountSaving(true);
    try {
      const payload = {
        firstName: account.firstName.trim(),
        lastName: account.lastName.trim(),
      };
      if (avatarFile !== undefined) {
        payload.avatar = avatarFile;
      }
      const updated = await authService.updateProfile(payload);
      updateUser(updated);
      setAvatarFile(undefined);
      setAccountMessage({ type: 'success', text: 'Account and profile picture updated.' });
    } catch (err) {
      setAccountMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setAccountSaving(false);
    }
  };

  const handleSaveTraining = async () => {
    setTrainingMessage({ type: '', text: '' });
    const errors = validateTraining();
    setTrainingErrors(errors);
    if (Object.keys(errors).length > 0) {
      setTrainingMessage({ type: 'error', text: 'Please fix the highlighted fields.' });
      return;
    }

    setTrainingSaving(true);
    try {
      const payload = {
        age: Number(training.age),
        sex: training.sex,
        heightCm: Number(training.heightCm),
        weightKg: Number(training.weightKg),
        goal: training.goal,
        experienceLevel: training.experienceLevel,
        trainingMonths: Number(training.trainingMonths),
        daysPerWeek: Number(training.daysPerWeek),
        preferredDays: training.preferredDays,
        minutesPerSession: Number(training.minutesPerSession),
        equipment: training.equipment,
        currentRoutine: training.currentRoutine?.trim() || null,
        strengthLevels: training.strengthLevels?.trim() || null,
        likedExercises: training.likedExercises?.length ? training.likedExercises : null,
        dislikedExercises: training.dislikedExercises?.length ? training.dislikedExercises : null,
        injuries: training.injuries?.trim() || null,
        cannotDoExercises: training.cannotDoExercises?.length ? training.cannotDoExercises : null,
      };
      const updated = await onboardingService.updateProfile(payload);
      setTraining(formFromOnboarding(updated));
      setTrainingMessage({ type: 'success', text: 'Training profile saved.' });
    } catch (err) {
      setTrainingMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setTrainingSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setSecurityMessage({ type: '', text: '' });
    if (!security.currentPassword || !security.newPassword) {
      setSecurityMessage({ type: 'error', text: 'Fill in all password fields.' });
      return;
    }
    if (security.newPassword.length < 8) {
      setSecurityMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (security.newPassword !== security.confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSecuritySaving(true);
    try {
      await authService.changePassword({
        currentPassword: security.currentPassword,
        newPassword: security.newPassword,
      });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setSecurityMessage({ type: 'success', text: 'Password updated.' });
    } catch (err) {
      setSecurityMessage({ type: 'error', text: getApiErrorMessage(err) });
    } finally {
      setSecuritySaving(false);
    }
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'account':
        return (
          <Stack spacing={3}>
            {/* Hidden file input for photo upload */}
            <input
              type="file"
              ref={avatarInputRef}
              accept="image/jpeg,image/png,image/webp"
              onChange={handleAvatarSelect}
              style={{ display: 'none' }}
            />

            {/* Profile Avatar Card */}
            <Box
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'action.hover',
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'flex-start', sm: 'center' },
                gap: 2.5,
              }}
            >
              <Avatar
                src={avatarPreview || user?.avatar}
                name={fullName}
                size="xxl"
                sx={{
                  border: '2px solid',
                  borderColor: 'primary.main',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                }}
              />
              <Box sx={{ flex: 1 }}>
                <Typography variant="subtitle1" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                  Profile Photo
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  Supports JPG, PNG, or WebP. Max 2MB file size.
                </Typography>

                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<PhotoCameraRoundedIcon />}
                    onClick={() => avatarInputRef.current?.click()}
                    sx={{ borderRadius: 2 }}
                  >
                    Upload New Photo
                  </Button>

                  {(avatarPreview || user?.avatar) && (
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteOutlineRoundedIcon />}
                      onClick={handleRemoveAvatar}
                      sx={{ borderRadius: 2 }}
                    >
                      Remove Photo
                    </Button>
                  )}
                </Stack>

                {avatarError && (
                  <Typography variant="caption" color="error.main" fontWeight={600} sx={{ display: 'block', mt: 1 }}>
                    {avatarError}
                  </Typography>
                )}
                {avatarFile !== undefined && (
                  <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ display: 'block', mt: 1 }}>
                    Photo selected. Click "Save account" below to commit changes.
                  </Typography>
                )}
              </Box>
            </Box>

            {accountMessage.text && (
              <Alert severity={accountMessage.type === 'success' ? 'success' : 'error'} variant="outlined">
                {accountMessage.text}
              </Alert>
            )}

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="First name"
                value={account.firstName}
                onChange={(e) => setAccount({ ...account, firstName: e.target.value })}
                fullWidth
              />
              <TextField
                label="Last name"
                value={account.lastName}
                onChange={(e) => setAccount({ ...account, lastName: e.target.value })}
                fullWidth
              />
            </Stack>
            <TextField label="Email" value={account.email} fullWidth disabled helperText="Email cannot be changed yet." />
            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSaveAccount}
              disabled={accountSaving}
              sx={{ alignSelf: 'flex-start' }}
            >
              {accountSaving ? 'Saving…' : 'Save account'}
            </Button>
          </Stack>
        );

      case 'training':
        if (!training) {
          return <Typography color="text.secondary">No training profile loaded.</Typography>;
        }
        return (
          <Stack spacing={3}>
            {trainingMessage.text && (
              <Alert severity={trainingMessage.type === 'success' ? 'success' : 'error'} variant="outlined">
                {trainingMessage.text}
              </Alert>
            )}

            <Typography variant="subtitle2" color="text.secondary">
              Body metrics
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Age"
                  type="number"
                  fullWidth
                  value={training.age}
                  onChange={(e) => setTrainingField('age', e.target.value)}
                  error={Boolean(trainingErrors.age)}
                  helperText={trainingErrors.age}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth error={Boolean(trainingErrors.sex)}>
                  <InputLabel>Sex</InputLabel>
                  <Select
                    label="Sex"
                    value={training.sex}
                    onChange={(e) => setTrainingField('sex', e.target.value)}
                  >
                    {SEX_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {trainingErrors.sex && <FormHelperText>{trainingErrors.sex}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Height (cm)"
                  type="number"
                  fullWidth
                  value={training.heightCm}
                  onChange={(e) => setTrainingField('heightCm', e.target.value)}
                  error={Boolean(trainingErrors.heightCm)}
                  helperText={trainingErrors.heightCm}
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  label="Weight (kg)"
                  type="number"
                  fullWidth
                  value={training.weightKg}
                  onChange={(e) => setTrainingField('weightKg', e.target.value)}
                  error={Boolean(trainingErrors.weightKg)}
                  helperText={trainingErrors.weightKg}
                />
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Goal & experience
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(trainingErrors.goal)}>
                  <InputLabel>Goal</InputLabel>
                  <Select
                    label="Goal"
                    value={training.goal}
                    onChange={(e) => setTrainingField('goal', e.target.value)}
                  >
                    {GOAL_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {trainingErrors.goal && <FormHelperText>{trainingErrors.goal}</FormHelperText>}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(trainingErrors.experienceLevel)}>
                  <InputLabel>Experience</InputLabel>
                  <Select
                    label="Experience"
                    value={training.experienceLevel}
                    onChange={(e) => setTrainingField('experienceLevel', e.target.value)}
                  >
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {trainingErrors.experienceLevel && (
                    <FormHelperText>{trainingErrors.experienceLevel}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Training months"
                  type="number"
                  fullWidth
                  value={training.trainingMonths}
                  onChange={(e) => setTrainingField('trainingMonths', e.target.value)}
                  error={Boolean(trainingErrors.trainingMonths)}
                  helperText={trainingErrors.trainingMonths}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={Boolean(trainingErrors.equipment)}>
                  <InputLabel>Equipment</InputLabel>
                  <Select
                    label="Equipment"
                    value={training.equipment}
                    onChange={(e) => setTrainingField('equipment', e.target.value)}
                  >
                    {EQUIPMENT_OPTIONS.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {trainingErrors.equipment && (
                    <FormHelperText>{trainingErrors.equipment}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Availability
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Days per week"
                  type="number"
                  fullWidth
                  inputProps={{ min: 2, max: 6 }}
                  value={training.daysPerWeek}
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setTraining((current) => ({
                      ...current,
                      daysPerWeek: e.target.value,
                      preferredDays: current.preferredDays.slice(0, Number.isFinite(next) ? next : 0),
                    }));
                    setTrainingErrors((current) => ({
                      ...current,
                      daysPerWeek: undefined,
                      preferredDays: undefined,
                    }));
                  }}
                  error={Boolean(trainingErrors.daysPerWeek)}
                  helperText={trainingErrors.daysPerWeek}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Minutes / session"
                  type="number"
                  fullWidth
                  value={training.minutesPerSession}
                  onChange={(e) => setTrainingField('minutesPerSession', e.target.value)}
                  error={Boolean(trainingErrors.minutesPerSession)}
                  helperText={trainingErrors.minutesPerSession}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControl fullWidth error={Boolean(trainingErrors.preferredDays)}>
                  <InputLabel>Preferred days</InputLabel>
                  <Select
                    multiple
                    label="Preferred days"
                    value={training.preferredDays}
                    onChange={(e) => {
                      const next = typeof e.target.value === 'string'
                        ? e.target.value.split(',')
                        : e.target.value;
                      const limit = Number(training.daysPerWeek) || next.length;
                      setTrainingField('preferredDays', next.slice(0, limit));
                    }}
                    renderValue={(selected) =>
                      selected
                        .map((value) => DAY_OPTIONS.find((d) => d.value === value)?.label ?? value)
                        .join(', ')
                    }
                  >
                    {DAY_OPTIONS.map((day) => (
                      <MenuItem key={day.value} value={day.value}>
                        {day.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {trainingErrors.preferredDays && (
                    <FormHelperText>{trainingErrors.preferredDays}</FormHelperText>
                  )}
                </FormControl>
              </Grid>
            </Grid>

            <Divider />

            <Typography variant="subtitle2" color="text.secondary">
              Current training & limits
            </Typography>
            <TextField
              label="Current workout routine"
              fullWidth
              multiline
              minRows={2}
              value={training.currentRoutine}
              onChange={(e) => setTrainingField('currentRoutine', e.target.value)}
            />
            <TextField
              label="Current strength levels"
              fullWidth
              multiline
              minRows={2}
              value={training.strengthLevels}
              onChange={(e) => setTrainingField('strengthLevels', e.target.value)}
            />
            <TagInput
              label="Liked exercises"
              value={training.likedExercises}
              onChange={(next) => setTrainingField('likedExercises', next)}
              placeholder="Type and press Enter"
            />
            <TagInput
              label="Disliked exercises"
              value={training.dislikedExercises}
              onChange={(next) => setTrainingField('dislikedExercises', next)}
              placeholder="Type and press Enter"
            />
            <TextField
              label="Injuries or painful movements"
              fullWidth
              multiline
              minRows={2}
              value={training.injuries}
              onChange={(e) => setTrainingField('injuries', e.target.value)}
            />
            <TagInput
              label="Exercises you cannot do"
              value={training.cannotDoExercises}
              onChange={(next) => setTrainingField('cannotDoExercises', next)}
              placeholder="Type and press Enter"
            />

            <Button
              variant="contained"
              startIcon={<SaveRoundedIcon />}
              onClick={handleSaveTraining}
              disabled={trainingSaving}
              sx={{ alignSelf: 'flex-start' }}
            >
              {trainingSaving ? 'Saving…' : 'Save training profile'}
            </Button>
          </Stack>
        );

      case 'appearance':
        return (
          <Stack spacing={3}>
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                {t('settings.language')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('settings.langDescription')}
              </Typography>
              <LanguageSelector variant="chips" />
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                {t('settings.appearance')}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {t('settings.themeDescription')}
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                {[
                  { id: 'dark', label: t('nav.darkMode'), preview: '#0A0C0F' },
                  { id: 'light', label: t('nav.lightMode'), preview: '#F8FAFC' },
                ].map((themeOption) => {
                  const active = mode === themeOption.id;
                  return (
                    <Box
                      key={themeOption.id}
                      onClick={() => setMode(themeOption.id)}
                      sx={{
                        flex: 1,
                        p: 2,
                        borderRadius: 2.5,
                        border: '2px solid',
                        borderColor: active ? 'primary.main' : 'divider',
                        bgcolor: active ? 'action.selected' : 'transparent',
                        cursor: 'pointer',
                        transition: 'border-color 0.15s ease, background-color 0.15s ease',
                        '&:hover': { borderColor: 'primary.main' },
                      }}
                    >
                      <Box
                        sx={{
                          height: 56,
                          borderRadius: 2,
                          mb: 1.5,
                          bgcolor: themeOption.preview,
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      />
                      <Typography variant="body2" fontWeight={active ? 700 : 500} textAlign="center">
                        {themeOption.label}
                      </Typography>
                    </Box>
                  );
                })}
              </Stack>
            </Box>
          </Stack>
        );

      case 'notifications':
        return (
          <Stack spacing={2}>
            <Alert severity="info" variant="outlined">
              Notification preferences are stored on this device for now.
            </Alert>
            <List disablePadding>
              {NOTIFICATION_ITEMS.map((item, index) => (
                <Box key={item.key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', py: 1.25, gap: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={600}>
                        {item.label}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {item.desc}
                      </Typography>
                    </Box>
                    <Switch
                      edge="end"
                      checked={notifications[item.key]}
                      onChange={(e) =>
                        setNotifications({ ...notifications, [item.key]: e.target.checked })
                      }
                      color="primary"
                    />
                  </Box>
                  {index < NOTIFICATION_ITEMS.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          </Stack>
        );

      case 'security':
        return (
          <Stack spacing={3}>
            <Typography variant="body2" color="text.secondary">
              Change the password for {user?.email}.
            </Typography>
            {securityMessage.text && (
              <Alert severity={securityMessage.type === 'success' ? 'success' : 'error'} variant="outlined">
                {securityMessage.text}
              </Alert>
            )}
            <TextField
              label="Current password"
              type={showPassword ? 'text' : 'password'}
              value={security.currentPassword}
              onChange={(e) => setSecurity({ ...security, currentPassword: e.target.value })}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" size="small">
                      {showPassword ? <VisibilityOffRoundedIcon fontSize="small" /> : <VisibilityRoundedIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New password"
              type={showPassword ? 'text' : 'password'}
              value={security.newPassword}
              onChange={(e) => setSecurity({ ...security, newPassword: e.target.value })}
              fullWidth
              helperText="At least 8 characters."
            />
            <TextField
              label="Confirm new password"
              type={showPassword ? 'text' : 'password'}
              value={security.confirmPassword}
              onChange={(e) => setSecurity({ ...security, confirmPassword: e.target.value })}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={handleChangePassword}
              disabled={securitySaving}
              sx={{ alignSelf: 'flex-start' }}
            >
              {securitySaving ? 'Updating…' : 'Update password'}
            </Button>
          </Stack>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <Box>
        <SectionHeader title="Settings" subtitle="Manage your account and training profile" />
        <LoadingSpinner sx={{ py: 8 }} />
      </Box>
    );
  }

  return (
    <Box>
      <SEO
        title="Settings & Preferences"
        description="Manage your GymPilot account preferences, training profile, language, and security settings."
        path="/settings"
        noIndex
      />
      <SectionHeader
        title="Settings"
        subtitle="Manage your account and training profile"
        action={
          loadError ? <Badge label="Load error" variant="error" /> : null
        }
      />

      {loadError && (
        <Alert severity="error" variant="outlined" sx={{ mb: 3 }}>
          {loadError}
        </Alert>
      )}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '240px 1fr' },
          gap: 3,
          alignItems: 'start',
        }}
      >
        <Card sx={{ ...staticCardSx, p: 1.5 }}>
          <List disablePadding>
            {sections.map((section) => (
              <ListItemButton
                key={section.id}
                selected={activeSection === section.id}
                onClick={() => setActiveSection(section.id)}
                sx={{
                  borderRadius: 2,
                  mb: 0.5,
                  '&.Mui-selected': {
                    bgcolor: 'action.selected',
                    color: 'primary.main',
                    '& .MuiListItemIcon-root': { color: 'primary.main' },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36, color: 'text.secondary' }}>
                  {section.icon}
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" fontWeight={600}>
                      {section.label}
                    </Typography>
                  }
                />
              </ListItemButton>
            ))}
          </List>
        </Card>

        <Card sx={staticCardSx}>
          <Typography
            variant="h6"
            sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 3 }}
          >
            {sections.find((s) => s.id === activeSection)?.label}
          </Typography>
          {renderSection()}
        </Card>
      </Box>
    </Box>
  );
}
