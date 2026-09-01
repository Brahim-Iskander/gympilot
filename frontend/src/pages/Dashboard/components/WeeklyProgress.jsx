import { Box, Card, Chip, Stack, Typography, styled } from '@mui/material';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <Box
        sx={{
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 2,
          p: 1.5,
          boxShadow: '0 10px 40px rgba(0,0,0,0.4)',
        }}
      >
        <Typography variant="body2" fontWeight={700} sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
          {label}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {data.workouts} workout{data.workouts !== 1 ? 's' : ''} completed
        </Typography>
        {data.duration > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
            {data.duration} min • {data.volume.toLocaleString()} kg volume
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

export default function WeeklyProgress({ aiPlan, workoutHistory = [] }) {
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);

  const dynamicWeeklyData = daysOfWeek.map((dayLabel, idx) => {
    const targetDate = new Date(startOfWeek);
    targetDate.setDate(startOfWeek.getDate() + idx);
    const dateStr = targetDate.toISOString().split('T')[0];

    const matchWorkouts = workoutHistory.filter((w) => w.date === dateStr);
    const isCompleted = matchWorkouts.length > 0;
    const duration = matchWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 45), 0);
    const volume = matchWorkouts.reduce((sum, w) => sum + (w.totalVolumeKg || 4200), 0);

    return {
      day: dayLabel,
      completed: isCompleted,
      duration: isCompleted ? duration : 0,
      volume: isCompleted ? volume : 0,
      workouts: matchWorkouts.length,
    };
  });

  const chartData = dynamicWeeklyData.map((d) => ({
    name: d.day,
    workouts: d.workouts,
    duration: d.duration,
    volume: d.volume,
  }));

  const completedCount = dynamicWeeklyData.filter((d) => d.completed).length;
  const totalWeeklyDuration = dynamicWeeklyData.reduce((sum, d) => sum + d.duration, 0);

  return (
    <StyledCard sx={{ p: 4, mb: 5 }}>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} sx={{ mb: 3 }} gap={2}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
            Weekly Training Consistency
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {completedCount} sessions logged this week ({totalWeeklyDuration} mins total training)
          </Typography>
        </Box>
        <Chip
          icon={<ShowChartRoundedIcon fontSize="small" />}
          label="Weekly Volume & Frequency"
          size="small"
          sx={{ bgcolor: 'rgba(138,124,255,0.12)', color: '#8A7CFF', fontWeight: 700 }}
        />
      </Stack>

      <Box sx={{ height: 200, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C6FF3E" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C6FF3E" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'Inter',sans-serif" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontFamily: "'Inter',sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickCount={4}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="volume"
              stroke="#C6FF3E"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorVolume)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </Box>
    </StyledCard>
  );
}