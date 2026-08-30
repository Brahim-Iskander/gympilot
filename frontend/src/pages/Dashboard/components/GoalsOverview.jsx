import { Box, Button, Card, Chip, Link, Stack, Typography, styled } from '@mui/material';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link as RouterLink } from 'react-router-dom';

const StyledCard = styled(Card)(({ }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const goals = [
  { id: '1', title: 'Bench Press 100 kg', current: 80, target: 100, unit: 'kg', type: 'Strength', deadline: '2026-12-31', status: 'Active' },
  { id: '2', title: 'Reach 80 kg body weight', current: 78.4, target: 80, unit: 'kg', type: 'Weight', deadline: '2026-10-15', status: 'Active' },
  { id: '3', title: 'Train 4 times/week', current: 4, target: 4, unit: 'sessions', type: 'Frequency', deadline: '2026-09-01', status: 'Completed' },
];

function GoalCard({ goal }) {
  const progress = Math.min((goal.current / goal.target) * 100, 100);
  const isCompleted = goal.status === 'Completed';

  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 3,
        border: '1px solid',
        borderColor: isCompleted ? 'rgba(198,255,62,0.3)' : 'divider',
        background: isCompleted
          ? 'linear-gradient(180deg, rgba(198,255,62,0.04), rgba(255,255,255,0.01))'
          : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        transition: 'transform .3s ease, border-color .3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          borderColor: 'rgba(198,255,62,0.3)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box sx={{ flex: 1 }}>
          <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1, flexWrap: 'wrap' }}>
            <Chip
              size="small"
              label={goal.type}
              sx={{
                bgcolor: isCompleted ? 'rgba(198,255,62,0.15)' : 'rgba(138,124,255,0.15)',
                color: isCompleted ? '#C6FF3E' : '#8A7CFF',
                fontWeight: 600,
                fontSize: '0.65rem',
              }}
            />
            {isCompleted && (
              <Chip
                size="small"
                label="Completed"
                icon={<FlagRoundedIcon fontSize="small" />}
                sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', fontWeight: 600, fontSize: '0.65rem' }}
              />
            )}
          </Stack>
          <Typography variant="body1" sx={{ fontWeight: 700, lineHeight: 1.4, mb: 1.5 }}>
            {goal.title}
          </Typography>
        </Box>
        <Chip
          icon={<FlagRoundedIcon fontSize="small" />}
          label={goal.status}
          size="small"
          sx={{
            bgcolor: isCompleted ? 'rgba(198,255,62,0.15)' : 'rgba(255,193,7,0.15)',
            color: isCompleted ? '#C6FF3E' : '#FFC107',
            fontWeight: 600,
          }}
        />
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Progress
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 700, color: isCompleted ? '#C6FF3E' : 'text.primary' }}>
            {Math.round(progress)}%
          </Typography>
        </Stack>
        <Box
          sx={{
            width: '100%',
            height: 8,
            borderRadius: 4,
            backgroundColor: 'rgba(255,255,255,0.07)',
            overflow: 'hidden',
          }}
        >
          <Box
            sx={{
              width: `${progress}%`,
              height: '100%',
              borderRadius: 4,
              background: isCompleted
                ? 'linear-gradient(90deg, #C6FF3E, #C6FF3Edd)'
                : 'linear-gradient(90deg, #C6FF3E, #8A7CFF)',
              transition: 'width 0.8s ease-out',
            }}
          />
        </Box>
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: '1px solid', borderColor: 'rgba(255,255,255,0.06)' }}>
        <Typography variant="caption" color="text.secondary">
          {goal.current} / {goal.target} {goal.unit}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Due: {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </Typography>
      </Box>
    </Card>
  );
}

export default function GoalsOverview() {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Active Goals
        </Typography>
        <Button
          component={RouterLink}
          to="/goals"
          variant="outlined"
          endIcon={<ArrowForwardRoundedIcon />}
          size="small"
        >
          View All Goals
        </Button>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 3 }}>
        {goals.map((goal) => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </Box>

      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
          No goals yet? Create your first goal to start tracking progress.
        </Typography>
        <Button
          component={RouterLink}
          to="/goals"
          variant="contained"
          startIcon={<FlagRoundedIcon />}
        >
          Create Goal
        </Button>
      </Box>
    </Box>
  );
}