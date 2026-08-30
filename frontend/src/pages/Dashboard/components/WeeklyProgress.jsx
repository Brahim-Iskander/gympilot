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

const StyledCard = styled(Card)(({ }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const weeklyData = [
  { day: 'Mon', completed: true, duration: 58, volume: 12450 },
  { day: 'Tue', completed: true, duration: 62, volume: 14200 },
  { day: 'Wed', completed: false, duration: 0, volume: 0 },
  { day: 'Thu', completed: true, duration: 55, volume: 11800 },
  { day: 'Fri', completed: true, duration: 65, volume: 15600 },
  { day: 'Sat', completed: false, duration: 0, volume: 0 },
  { day: 'Sun', completed: false, duration: 0, volume: 0 },
];

const chartData = weeklyData.map((d) => ({
  name: d.day,
  workouts: d.completed ? 1 : 0,
  duration: d.duration,
  volume: d.volume,
}));

const completedWorkouts = weeklyData.filter((d) => d.completed).length;
const totalDuration = weeklyData.reduce((sum, d) => sum + d.duration, 0);
const totalVolume = weeklyData.reduce((sum, d) => sum + d.volume, 0);

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
          p: 2,
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
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {data.duration} min • {data.volume.toLocaleString()} kg volume
          </Typography>
        )}
      </Box>
    );
  }
  return null;
};

export default function WeeklyProgress({ aiPlan }) {
  // Use preferred days to determine which days have a workout
  const daysPerWeek = aiPlan?.daysPerWeek || 3;
  const preferredDays = aiPlan?.preferredDays || ['monday', 'wednesday', 'friday'];
  
  // Use minutes per session for duration
  const mins = aiPlan?.minutesPerSession || 60;

  // Build weekly data dynamically
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  
  const dynamicWeeklyData = daysOfWeek.map((dayLabel, idx) => {
    const isWorkoutDay = preferredDays.includes(fullDays[idx]);
    // For demo purposes, pretend past days that are workout days are completed
    // Let's say today is Thursday (idx = 3).
    const todayIdx = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;
    const completed = isWorkoutDay && idx <= todayIdx;
    
    return {
      day: dayLabel,
      completed,
      duration: isWorkoutDay ? mins : 0,
      volume: completed ? 12000 + (Math.random() * 2000) : 0,
    };
  });

  const chartData = dynamicWeeklyData.map((d) => ({
    name: d.day,
    workouts: d.completed ? 1 : 0,
    duration: d.duration,
    volume: d.volume,
  }));

  const completedWorkouts = dynamicWeeklyData.filter((d) => d.completed).length;
  const totalDuration = dynamicWeeklyData.reduce((sum, d) => sum + d.duration, 0);
  const totalVolume = Math.round(dynamicWeeklyData.reduce((sum, d) => sum + d.volume, 0));

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Weekly Training
        </Typography>
        <Chip
          icon={<ShowChartRoundedIcon fontSize="small" />}
          label="Demo data"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 600 }}
        />
      </Stack>

      <StyledCard sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
              {completedWorkouts} / {daysPerWeek} Workouts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {totalDuration} min total • {totalVolume.toLocaleString()} kg volume
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            {dynamicWeeklyData.map((day) => (
              <Box key={day.day} sx={{ textAlign: 'center', minWidth: 40 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: day.completed ? 700 : 400,
                    color: day.completed ? 'primary.main' : 'text.secondary',
                    opacity: day.completed ? 1 : 0.5,
                  }}
                >
                  {day.day}
                </Typography>
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: '50%',
                    mx: 'auto',
                    mt: 1,
                    backgroundColor: day.completed ? '#C6FF3E' : 'rgba(255,255,255,0.1)',
                    border: day.completed ? 'none' : '1px dashed',
                    borderColor: 'rgba(255,255,255,0.2)',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Stack>

        <Box sx={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWorkouts" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6FF3E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6FF3E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
                tickCount={4}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="workouts"
                stroke="#C6FF3E"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorWorkouts)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </StyledCard>
    </Box>
  );
}