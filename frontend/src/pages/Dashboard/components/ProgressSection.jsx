import { Box, Card, Grid, Stack, Typography } from '@mui/material';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';

const progressData = [
  {
    id: 'bench',
    name: 'Bench Press',
    icon: 'chest',
    weeks: [
      { week: 'Week 1', weight: 70, reps: 8 },
      { week: 'Week 2', weight: 72.5, reps: 8 },
      { week: 'Week 3', weight: 75, reps: 8 },
      { week: 'Week 4', weight: 80, reps: 8 },
    ],
    currentPR: 80,
    totalProgress: '+14.3%',
    color: '#C6FF3E',
  },
  {
    id: 'squat',
    name: 'Squat',
    icon: 'legs',
    weeks: [
      { week: 'Week 1', weight: 100, reps: 6 },
      { week: 'Week 2', weight: 105, reps: 6 },
      { week: 'Week 3', weight: 112.5, reps: 6 },
      { week: 'Week 4', weight: 120, reps: 6 },
    ],
    currentPR: 120,
    totalProgress: '+20%',
    color: '#8A7CFF',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    icon: 'back',
    weeks: [
      { week: 'Week 1', weight: 130, reps: 5 },
      { week: 'Week 2', weight: 137.5, reps: 5 },
      { week: 'Week 3', weight: 142.5, reps: 5 },
      { week: 'Week 4', weight: 150, reps: 5 },
    ],
    currentPR: 150,
    totalProgress: '+15.4%',
    color: '#FF6B6B',
  },
];

function ProgressBar({ value, color, max = 100 }) {
  const percentage = Math.min((value / max) * 100, 100);
  return (
    <Box sx={{ width: '100%', height: 10, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.07)', overflow: 'hidden' }}>
      <Box
        sx={{
          width: `${percentage}%`,
          height: '100%',
          borderRadius: 5,
          background: `linear-gradient(90deg, ${color}, ${color}dd)`,
          transition: 'width 0.8s ease-out',
        }}
      />
    </Box>
  );
}

function LiftProgressCard({ lift }) {
  const latestWeek = lift.weeks[lift.weeks.length - 1];
  const firstWeek = lift.weeks[0];

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        transition: 'transform .3s ease, border-color .3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(198,255,62,0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          {lift.name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShowChartRoundedIcon sx={{ color: lift.color, fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: lift.color, fontWeight: 700 }}>
            {lift.totalProgress}
          </Typography>
        </Box>
      </Stack>

      <Stack spacing={2} sx={{ mb: 3 }}>
        {lift.weeks.map((week) => (
          <Box key={week.week} sx={{ width: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.5 }}>
              <Typography variant="caption" color="text.secondary">
                {week.week}
              </Typography>
              <Typography variant="caption" fontWeight={600}>
                {week.weight} kg × {week.reps}
              </Typography>
            </Stack>
            <ProgressBar value={week.weight} color={lift.color} max={latestWeek.weight * 1.2} />
          </Box>
        ))}
      </Stack>

      <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${lift.color}22, ${lift.color}11)`, border: `1px solid ${lift.color}44` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary">Current PR</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif" }}>
              {lift.currentPR} kg
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Started at {firstWeek.weight} kg
          </Typography>
        </Stack>
      </Box>
    </Card>
  );
}

export default function ProgressSection() {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Strength Progress
        </Typography>
        <Chip
          icon={<ShowChartRoundedIcon fontSize="small" />}
          label="Demo data"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 600 }}
        />
      </Stack>

      <Grid container spacing={3}>
        {progressData.map((lift) => (
          <Grid item xs={12} md={4} key={lift.id}>
            <LiftProgressCard lift={lift} />
          </Grid>
        ))}
      </Grid>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
        Connect your account to see your real strength progression over time.
      </Typography>
    </Box>
  );
}