import { Box, Card, Chip, Stack, Typography, styled } from '@mui/material';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';

const StyledCard = styled(Card)(({ }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const activities = [
  { id: '1', type: 'workout', title: 'Completed Push Day', time: 'Today', icon: <FitnessCenterRoundedIcon color="primary" />, color: 'primary.main' },
  { id: '2', type: 'pr', title: 'New PR — Bench Press: 80 kg', time: 'Yesterday', icon: <EmojiEventsRoundedIcon color="warning" />, color: '#FFC107' },
  { id: '3', type: 'workout', title: 'Completed Pull Day', time: '2 days ago', icon: <FitnessCenterRoundedIcon color="primary" />, color: 'primary.main' },
  { id: '4', type: 'achievement', title: 'Reached 10 Workouts milestone', time: '4 days ago', icon: <EmojiEventsRoundedIcon color="secondary" />, color: '#8A7CFF' },
  { id: '5', type: 'workout', title: 'Completed Leg Day', time: '5 days ago', icon: <FitnessCenterRoundedIcon color="primary" />, color: 'primary.main' },
  { id: '6', type: 'goal', title: 'Goal "Train 4x/week" completed', time: '1 week ago', icon: <FlagRoundedIcon color="success" />, color: '#C6FF3E' },
];

function ActivityItem({ activity }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.04)', '&:last-child': { borderBottom: 'none', py: '1.5 0' } }}>
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: 2,
          bgcolor: `${activity.color}22`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {activity.icon}
      </Box>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.4 }}>
          {activity.title}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.25 }}>
          {activity.time}
        </Typography>
      </Box>
      <Chip
        size="small"
        label={activity.type.charAt(0).toUpperCase() + activity.type.slice(1)}
        sx={{
          bgcolor: `${activity.color}1A`,
          color: activity.color,
          fontWeight: 600,
          fontSize: '0.65rem',
          height: 20,
        }}
      />
    </Box>
  );
}

export default function RecentActivity() {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Recent Activity
        </Typography>
        <Chip
          icon={<HistoryRoundedIcon fontSize="small" />}
          label="Demo data"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 600 }}
        />
      </Stack>

      <StyledCard sx={{ p: 0, overflow: 'hidden' }}>
        {activities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
        <Box sx={{ p: 2, textAlign: 'center', borderTop: '1px solid', borderColor: 'rgba(255,255,255,0.04)' }}>
          <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
            View all activity
          </Typography>
        </Box>
      </StyledCard>
    </Box>
  );
}