import { useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Stack,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import ScheduleRoundedIcon from '@mui/icons-material/ScheduleRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import { useAuth } from '../../context/AuthContext';
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
  const { user } = useAuth();
  const [onboarding, setOnboarding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
              <Avatar name={fullName} size="xxl" />
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
