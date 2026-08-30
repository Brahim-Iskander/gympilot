import { useEffect, useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  CircularProgress,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

import { useAuth } from '../../context/AuthContext';
import { authService } from '../../services/authService';
import { onboardingService } from '../../services/onboardingService';
import { getApiErrorMessage } from '../../utils/errors';
import {
  formatPreferredDays,
  formatTrainingDuration,
  labelEquipment,
  labelExperience,
  labelGoal,
  labelSex,
} from '../../utils/onboardingLabels';
import { Avatar, Badge, Card, LoadingSpinner, SectionHeader } from '../../components/ui';

const staticCardSx = {
  '&:hover': {
    transform: 'none',
    boxShadow: 'none',
    borderColor: 'divider',
  },
};

function InfoRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, py: 1.25 }}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600} textAlign="right">
        {value || '—'}
      </Typography>
    </Box>
  );
}

function StatTile({ icon, label, value }) {
  return (
    <Card sx={{ ...staticCardSx, p: 2.5 }}>
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: 2,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'action.selected',
            color: 'primary.main',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{ fontWeight: 700, fontFamily: "'Sora','Inter',sans-serif", lineHeight: 1.3 }}
          >
            {value || '—'}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
}

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarError, setAvatarError] = useState('');
  const avatarInputRef = useRef(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await onboardingService.get();
        if (active) setOnboarding(data);
      } catch (err) {
        if (active) setError(getApiErrorMessage(err));
      } finally {
        if (active) setLoading(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, []);

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
    setAvatarUploading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result;
        const updated = await authService.updateProfile({
          firstName: user?.firstName || '',
          lastName: user?.lastName || '',
          avatar: base64,
        });
        updateUser(updated);
      } catch (err) {
        setAvatarError(getApiErrorMessage(err));
      } finally {
        setAvatarUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  let aiPlan = null;
  if (onboarding?.aiGeneratedPlan) {
    try {
      aiPlan = JSON.parse(onboarding.aiGeneratedPlan);
    } catch (e) {
      console.error('Failed to parse AI plan', e);
    }
  }

  return (
    <Box>
      <input
        type="file"
        ref={avatarInputRef}
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarSelect}
        style={{ display: 'none' }}
      />

      <SectionHeader
        title="Profile"
        subtitle="Your account and training profile from GymPilot"
        action={
          <Button
            component={RouterLink}
            to="/settings"
            variant="contained"
            startIcon={<EditRoundedIcon />}
          >
            Edit in Settings
          </Button>
        }
      />

      {loading ? (
        <LoadingSpinner sx={{ py: 8 }} />
      ) : (
        <Stack spacing={3}>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}

          <Card sx={staticCardSx}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={3}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
            >
              <Box sx={{ position: 'relative' }}>
                <Avatar
                  src={user?.avatar}
                  name={fullName}
                  size="xxl"
                  sx={{
                    border: '2px solid',
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                  }}
                />
                <Tooltip title="Upload / change profile photo">
                  <IconButton
                    size="small"
                    onClick={() => avatarInputRef.current?.click()}
                    disabled={avatarUploading}
                    sx={{
                      position: 'absolute',
                      bottom: -4,
                      right: -4,
                      bgcolor: 'primary.main',
                      color: '#000',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                      border: '2px solid',
                      borderColor: 'background.paper',
                      '&:hover': {
                        bgcolor: 'primary.dark',
                      },
                    }}
                  >
                    {avatarUploading ? (
                      <CircularProgress size={16} sx={{ color: '#000' }} />
                    ) : (
                      <PhotoCameraRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif" }}
                >
                  {fullName || 'Athlete'}
                </Typography>
                <Typography color="text.secondary" sx={{ mt: 0.5 }}>
                  {user?.email}
                </Typography>
                {avatarError && (
                  <Typography variant="caption" color="error.main" fontWeight={600} sx={{ display: 'block', mt: 0.5 }}>
                    {avatarError}
                  </Typography>
                )}
                <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
                  {onboarding?.goal && <Badge label={labelGoal(onboarding.goal)} variant="accent" />}
                  {onboarding?.experienceLevel && (
                    <Badge label={labelExperience(onboarding.experienceLevel)} variant="info" />
                  )}
                  {onboarding?.equipment && (
                    <Badge label={labelEquipment(onboarding.equipment)} variant="default" />
                  )}
                </Stack>
              </Box>
            </Stack>
          </Card>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile
                icon={<FlagRoundedIcon fontSize="small" />}
                label="Goal"
                value={labelGoal(onboarding?.goal)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile
                icon={<FitnessCenterRoundedIcon fontSize="small" />}
                label="Experience"
                value={labelExperience(onboarding?.experienceLevel)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile
                icon={<ScheduleRoundedIcon fontSize="small" />}
                label="Availability"
                value={
                  onboarding?.daysPerWeek
                    ? `${onboarding.daysPerWeek}× / week · ${onboarding.minutesPerSession ?? '—'} min`
                    : '—'
                }
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatTile
                icon={<MonitorWeightRoundedIcon fontSize="small" />}
                label="Body metrics"
                value={
                  onboarding?.weightKg
                    ? `${onboarding.weightKg} kg · ${onboarding.heightCm ?? '—'} cm`
                    : '—'
                }
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card sx={staticCardSx}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", mb: 1 }}
                >
                  Account
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <InfoRow label="First name" value={user?.firstName} />
                <InfoRow label="Last name" value={user?.lastName} />
                <InfoRow label="Email" value={user?.email} />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={staticCardSx}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", mb: 1 }}
                >
                  Basic profile
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <InfoRow label="Age" value={onboarding?.age} />
                <InfoRow label="Sex" value={labelSex(onboarding?.sex)} />
                <InfoRow
                  label="Height"
                  value={onboarding?.heightCm != null ? `${onboarding.heightCm} cm` : null}
                />
                <InfoRow
                  label="Weight"
                  value={onboarding?.weightKg != null ? `${onboarding.weightKg} kg` : null}
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={staticCardSx}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", mb: 1 }}
                >
                  Training setup
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <InfoRow label="Goal" value={labelGoal(onboarding?.goal)} />
                <InfoRow label="Experience" value={labelExperience(onboarding?.experienceLevel)} />
                <InfoRow
                  label="Training history"
                  value={formatTrainingDuration(onboarding?.trainingMonths)}
                />
                <InfoRow label="Equipment" value={labelEquipment(onboarding?.equipment)} />
                <InfoRow
                  label="Days / week"
                  value={onboarding?.daysPerWeek != null ? String(onboarding.daysPerWeek) : null}
                />
                <InfoRow label="Preferred days" value={formatPreferredDays(onboarding?.preferredDays)} />
                <InfoRow
                  label="Session length"
                  value={
                    onboarding?.minutesPerSession != null
                      ? `${onboarding.minutesPerSession} min`
                      : null
                  }
                />
              </Card>
            </Grid>

            <Grid item xs={12} md={6}>
              <Card sx={staticCardSx}>
                <Typography
                  variant="subtitle1"
                  sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", mb: 1 }}
                >
                  Preferences & limits
                </Typography>
                <Divider sx={{ mb: 1 }} />
                <InfoRow label="Current routine" value={onboarding?.currentRoutine || 'Not set'} />
                <InfoRow label="Strength levels" value={onboarding?.strengthLevels || 'Not set'} />
                <Box sx={{ py: 1.25 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Liked exercises
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {onboarding?.likedExercises?.length ? (
                      onboarding.likedExercises.map((item) => (
                        <Chip key={item} label={item} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" fontWeight={600}>
                        —
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <Box sx={{ py: 1.25 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Disliked exercises
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {onboarding?.dislikedExercises?.length ? (
                      onboarding.dislikedExercises.map((item) => (
                        <Chip key={item} label={item} size="small" />
                      ))
                    ) : (
                      <Typography variant="body2" fontWeight={600}>
                        —
                      </Typography>
                    )}
                  </Stack>
                </Box>
                <InfoRow label="Injuries" value={onboarding?.injuries || 'None noted'} />
                <Box sx={{ py: 1.25 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    Cannot do
                  </Typography>
                  <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                    {onboarding?.cannotDoExercises?.length ? (
                      onboarding.cannotDoExercises.map((item) => (
                        <Chip key={item} label={item} size="small" color="warning" variant="outlined" />
                      ))
                    ) : (
                      <Typography variant="body2" fontWeight={600}>
                        —
                      </Typography>
                    )}
                  </Stack>
                </Box>
              </Card>
            </Grid>

            {aiPlan && (
              <Grid item xs={12}>
                <Card sx={staticCardSx}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AutoAwesomeRoundedIcon sx={{ color: 'primary.main' }} /> Your AI Personalized Plan
                  </Typography>
                  <Divider sx={{ mb: 2 }} />

                  <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>Workout Plan</Typography>
                  {aiPlan.workoutPlan?.map((day, idx) => (
                    <Box key={idx} sx={{ mb: 2 }}>
                      <Typography variant="body2" fontWeight="bold">{day.dayName}</Typography>
                      <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                        {day.exercises?.map((ex, exIdx) => (
                          <li key={exIdx} style={{ marginBottom: '4px' }}>
                            <Typography variant="body2">
                              {ex.name} — {ex.sets} sets × {ex.reps} {ex.notes && <Typography component="span" variant="caption" color="text.secondary">({ex.notes})</Typography>}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    </Box>
                  ))}

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="h6" sx={{ fontSize: '1rem', mb: 1 }}>Nutrition Plan</Typography>
                  <Grid container spacing={2} sx={{ mb: 2 }}>
                    <Grid item xs={6} sm={3}>
                      <StatTile icon={<FlagRoundedIcon fontSize="small" />} label="Calories" value={aiPlan.nutritionPlan?.dailyCalories} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatTile icon={<FlagRoundedIcon fontSize="small" />} label="Protein" value={`${aiPlan.nutritionPlan?.protein}g`} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatTile icon={<FlagRoundedIcon fontSize="small" />} label="Carbs" value={`${aiPlan.nutritionPlan?.carbs}g`} />
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <StatTile icon={<FlagRoundedIcon fontSize="small" />} label="Fat" value={`${aiPlan.nutritionPlan?.fat}g`} />
                    </Grid>
                  </Grid>

                  <Typography variant="body2" fontWeight="bold" sx={{ mt: 1 }}>Meal Suggestions:</Typography>
                  <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
                    {aiPlan.nutritionPlan?.mealSuggestions?.map((meal, idx) => (
                      <li key={idx} style={{ marginBottom: '4px' }}>
                        <Typography variant="body2">{meal}</Typography>
                      </li>
                    ))}
                  </ul>
                </Card>
              </Grid>
            )}
          </Grid>
        </Stack>
      )}
    </Box>
  );
}
