import { Box, Button, Card, Chip, Link, Stack, Typography, styled } from '@mui/material';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import { Link as RouterLink } from 'react-router-dom';

function GoalCard({ goal }) {
  const target = Number(goal.target) || 1;
  const current = Number(goal.current) || 0;
  const progress = Math.min(Math.round((current / target) * 100), 100);
  const isCompleted = goal.status === 'completed' || current >= target;

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
          ? 'linear-gradient(180deg, rgba(198,255,62,0.06), rgba(255,255,255,0.01))'
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
              label={goal.type || 'Fitness'}
              sx={{
                bgcolor: isCompleted ? 'rgba(198,255,62,0.15)' : 'rgba(138,124,255,0.15)',
                color: isCompleted ? '#C6FF3E' : '#8A7CFF',
                fontWeight: 700,
                fontSize: '0.7rem',
                textTransform: 'capitalize',
              }}
            />
            {isCompleted && (
              <Chip
                size="small"
                label="Completed"
                icon={<CheckCircleRoundedIcon fontSize="small" />}
                sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', fontWeight: 700, fontSize: '0.7rem' }}
              />
            )}
          </Stack>
          <Typography variant="body1" sx={{ fontWeight: 800, lineHeight: 1.4, mb: 0.5 }}>
            {goal.title}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {current} / {target} {goal.unit || ''}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ mb: 1, mt: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="caption" color="text.secondary">
            Goal Progress
          </Typography>
          <Typography variant="caption" sx={{ fontWeight: 800, color: isCompleted ? '#C6FF3E' : 'text.primary' }}>
            {progress}%
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
              backgroundColor: isCompleted ? '#C6FF3E' : '#8A7CFF',
              transition: 'width .5s ease',
            }}
          />
        </Box>
      </Box>
    </Card>
  );
}

export default function GoalsOverview({ goals = [] }) {
  const displayGoals = goals.slice(0, 3);

  return (
    <Box component="section" sx={{ mb: 4 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
            Active Fitness Goals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track milestones synchronized with your live nutrition, workout, and scale logs
          </Typography>
        </Box>
        <Button
          component={RouterLink}
          to="/goals"
          endIcon={<ArrowForwardRoundedIcon />}
          size="small"
          sx={{ fontWeight: 700, color: 'primary.main', textTransform: 'none' }}
        >
          Manage All Goals
        </Button>
      </Stack>

      {displayGoals.length === 0 ? (
        <Card
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 3,
            border: '1px dashed',
            borderColor: 'divider',
            background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: 'rgba(138,124,255,0.12)',
              color: '#8A7CFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FlagRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ maxWidth: 460 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              No Active Goals Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Set target milestones for bodyweight, daily nutrition, workout frequency, and strength to keep your momentum going.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/goals"
            variant="outlined"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, mt: 1 }}
          >
            Create Your First Goal
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {displayGoals.map((goal, index) => (
            <GoalCard key={goal.id || index} goal={goal} />
          ))}
        </Box>
      )}
    </Box>
  );
}