import { Box, Button, Card, Chip, Stack, Typography, styled, CircularProgress } from '@mui/material';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import { Link as RouterLink } from 'react-router-dom';

const StyledCard = styled(Card)(({ highlight }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: highlight ? 'rgba(198,255,62,0.3)' : 'divider',
  background: highlight
    ? 'linear-gradient(180deg, rgba(198,255,62,0.04), rgba(255,255,255,0.01))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    background: 'linear-gradient(180deg, #C6FF3E, #8A7CFF)',
    opacity: highlight ? 1 : 0,
    transition: 'opacity 0.3s ease',
  },
  '&:hover': {
    borderColor: 'rgba(198,255,62,0.35)',
  },
}));

export default function TodayWorkout({ aiPlan, loading }) {
  if (loading) {
    return (
      <Box component="section" sx={{ mb: 5 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 3 }}>
          Today's Workout
        </Typography>
        <StyledCard highlight sx={{ p: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180 }}>
          <CircularProgress size={32} sx={{ color: 'primary.main', mr: 2 }} />
          <Typography variant="body2" color="text.secondary">Loading today's session...</Typography>
        </StyledCard>
      </Box>
    );
  }

  const hasPlan = aiPlan?.workoutPlan && aiPlan.workoutPlan.length > 0;
  
  // Calculate today's recommended workout day index based on day of week
  const todayDayIndex = new Date().getDay(); // 0 = Sunday, 1 = Monday...
  const activeDayIndex = hasPlan ? (todayDayIndex % aiPlan.workoutPlan.length) : 0;
  const planWorkout = hasPlan ? aiPlan.workoutPlan[activeDayIndex] : null;

  const workoutName = planWorkout?.dayName || 'Full Body Workout';
  const numExercises = planWorkout?.exercises?.length || 5;
  const estimatedDuration = aiPlan?.minutesPerSession || (numExercises * 9);

  // Dynamic focus text built from actual exercises
  const focusText = planWorkout?.exercises 
    ? planWorkout.exercises.slice(0, 3).map((e) => e.name).join(' • ')
    : 'Custom Personalized Training';

  // Dynamic muscle group chips
  const muscleGroups = planWorkout?.exercises
    ? Array.from(new Set(planWorkout.exercises.map((e) => {
        const name = e.name.toLowerCase();
        if (name.includes('squat') || name.includes('leg') || name.includes('lunge')) return 'Legs';
        if (name.includes('bench') || name.includes('push-up') || name.includes('chest')) return 'Chest';
        if (name.includes('row') || name.includes('pull') || name.includes('lat')) return 'Back';
        if (name.includes('press') || name.includes('raise')) return 'Shoulders';
        if (name.includes('curl') || name.includes('tricep') || name.includes('dip')) return 'Arms';
        if (name.includes('plank') || name.includes('crunch')) return 'Core';
        return 'Full Body';
      }))).slice(0, 4)
    : ['Full Body', 'Custom'];

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Today's Workout
        </Typography>
      </Stack>

      <StyledCard highlight sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={3}>
          <Box sx={{ flex: 1, minWidth: 280 }}>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1 }}>
              <Chip
                size="small"
                label={hasPlan ? `Scheduled • Day ${activeDayIndex + 1}` : 'Scheduled'}
                sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', fontWeight: 600 }}
              />
            </Stack>

            <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
              {workoutName}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {focusText}
            </Typography>

            <Stack direction="row" spacing={2.5} useFlexGap flexWrap="wrap">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <FitnessCenterRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Exercises</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", lineHeight: 1.2 }}>
                    {numExercises}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <AccessTimeRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Box>
                  <Typography variant="caption" color="text.secondary">Est. Duration</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", lineHeight: 1.2 }}>
                    {estimatedDuration} min
                  </Typography>
                </Box>
              </Box>
            </Stack>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2, minWidth: 180 }}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              {muscleGroups.map((muscle) => (
                <Chip
                  key={muscle}
                  size="small"
                  label={muscle}
                  sx={{ bgcolor: 'rgba(198,255,62,0.08)', color: 'text.secondary', fontWeight: 500, border: '1px solid', borderColor: 'rgba(198,255,62,0.2)' }}
                />
              ))}
            </Box>
            <Button
              component={RouterLink}
              to={`/workouts?day=${activeDayIndex}`}
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1rem',
                minWidth: 200,
                whiteSpace: 'nowrap',
              }}
            >
              Start Workout
            </Button>
          </Box>
        </Stack>
      </StyledCard>
    </Box>
  );
}