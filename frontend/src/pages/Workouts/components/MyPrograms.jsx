import { Box, Button, Card, Chip, Grid, Stack, Typography, styled, CircularProgress } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  transition: 'transform .3s ease, border-color .3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(198,255,62,0.3)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
}));

export default function MyPrograms({ aiPlan, loading, onStart }) {
  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading your personalized workout program...</Typography>
      </Box>
    );
  }

  const hasPlan = aiPlan?.workoutPlan && aiPlan.workoutPlan.length > 0;

  return (
    <Box>
      {hasPlan ? (
        <Box sx={{ mb: 4 }}>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
            <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 28 }} />
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif" }}>
                Your AI Personalized Program
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Customized for {aiPlan.goal || 'Fitness'}, {aiPlan.equipment || 'Full Gym'} ({aiPlan.daysPerWeek || aiPlan.workoutPlan.length} days/week)
              </Typography>
            </Box>
          </Stack>

          <Grid container spacing={3}>
            {aiPlan.workoutPlan.map((day, idx) => (
              <Grid item xs={12} md={6} lg={4} key={idx}>
                <StyledCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                    <Box>
                      <Chip
                        size="small"
                        label={`Day ${idx + 1}`}
                        sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', fontWeight: 700, mb: 1 }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 800 }}>
                        {day.dayName}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 3,
                        bgcolor: 'rgba(198,255,62,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FitnessCenterRoundedIcon sx={{ fontSize: 22, color: 'primary.main' }} />
                    </Box>
                  </Stack>

                  <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
                    EXERCISES ({day.exercises?.length || 0})
                  </Typography>

                  <Stack spacing={1} sx={{ mb: 3, flex: 1 }}>
                    {day.exercises?.map((ex, exIdx) => (
                      <Box
                        key={exIdx}
                        sx={{
                          p: 1.25,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.03)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '65%' }}>
                          {ex.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={`${ex.sets} sets × ${ex.reps}`}
                          sx={{ fontSize: '0.7rem', height: 20, bgcolor: 'rgba(255,255,255,0.06)' }}
                        />
                      </Box>
                    ))}
                  </Stack>

                  <Button
                    onClick={() => onStart(idx)}
                    variant="contained"
                    fullWidth
                    startIcon={<PlayCircleRoundedIcon />}
                    sx={{ py: 1.2 }}
                  >
                    Start Day {idx + 1} Workout
                  </Button>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>
      ) : (
        <StyledCard sx={{ p: 4, textAlign: 'center' }}>
          <FitnessCenterRoundedIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
            No Customized Workout Plan Generated Yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 500, mx: 'auto' }}>
            Complete your onboarding questionnaire to receive your custom AI workout and nutrition plan tailored specifically to your goals and equipment.
          </Typography>
          <Button variant="contained" onClick={() => onStart(0)} startIcon={<PlayCircleRoundedIcon />}>
            Start Workout
          </Button>
        </StyledCard>
      )}
    </Box>
  );
}