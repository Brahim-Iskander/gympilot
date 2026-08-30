import { Box, Card, Chip, Grid, Stack, Typography } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';

const recentWorkouts = [
  {
    id: '1',
    name: 'Push Day',
    focus: 'Chest + Triceps',
    date: 'Today',
    exercises: 6,
    volume: '12,450 kg',
    isToday: true,
  },
  {
    id: '2',
    name: 'Pull Day',
    focus: 'Back + Biceps',
    date: 'Yesterday',
    exercises: 7,
    volume: '14,200 kg',
    isToday: false,
  },
  {
    id: '3',
    name: 'Leg Day',
    focus: 'Legs',
    date: '2 days ago',
    exercises: 5,
    volume: '18,750 kg',
    isToday: false,
  },
  {
    id: '4',
    name: 'Upper Body',
    focus: 'Chest + Back',
    date: '5 days ago',
    exercises: 8,
    volume: '15,600 kg',
    isToday: false,
  },
];

export default function RecentWorkouts() {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Recent Workouts
        </Typography>
        <Chip
          icon={<TrendingUpRoundedIcon fontSize="small" />}
          label="Demo data"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 600 }}
        />
      </Stack>

      <Grid container spacing={2}>
        {recentWorkouts.map((workout) => (
          <Grid item xs={12} sm={6} key={workout.id}>
            <Card
              elevation={0}
              sx={{
                p: 3,
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: workout.isToday ? 'rgba(198,255,62,0.4)' : 'divider',
                background: workout.isToday
                  ? 'linear-gradient(180deg, rgba(198,255,62,0.04), rgba(255,255,255,0.01))'
                  : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                transition: 'transform .3s ease, border-color .3s ease, box-shadow .3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  borderColor: 'rgba(198,255,62,0.4)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                },
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" gap={2} flexWrap="wrap">
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.25 }}>
                    {workout.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {workout.focus}
                  </Typography>
                </Box>
                {workout.isToday && (
                  <Chip
                    size="small"
                    label="Today"
                    icon={<FitnessCenterRoundedIcon fontSize="small" />}
                    sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: 'primary.main', fontWeight: 700 }}
                  />
                )}
              </Stack>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, mb: 1 }}>
                {workout.date}
              </Typography>

              <Stack direction="row" spacing={2.5} useFlexGap flexWrap="wrap">
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <FitnessCenterRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Exercises</Typography>
                    <Typography variant="body2" fontWeight={700}>{workout.exercises}</Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
                  <TrendingUpRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary">Volume</Typography>
                    <Typography variant="body2" fontWeight={700}>{workout.volume}</Typography>
                  </Box>
                </Box>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}