import { Box, Card, Chip, Stack, Typography, styled } from '@mui/material';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

const StyledCard = styled(Card)(({ }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const strengthData = [
  { name: 'Bench Press', color: '#C6FF3E', currentPR: 80, previousPR: 72.5, progress: '+10.3%', weeks: [72.5, 75, 77.5, 80] },
  { name: 'Squat', color: '#8A7CFF', currentPR: 120, previousPR: 100, progress: '+20%', weeks: [100, 105, 112.5, 120] },
  { name: 'Deadlift', color: '#FF6B6B', currentPR: 150, previousPR: 130, progress: '+15.4%', weeks: [130, 137.5, 142.5, 150] },
];

const chartData = [
  { week: 'Week 1', bench: 72.5, squat: 100, deadlift: 130 },
  { week: 'Week 2', bench: 75, squat: 105, deadlift: 137.5 },
  { week: 'Week 3', bench: 77.5, squat: 112.5, deadlift: 142.5 },
  { week: 'Week 4', bench: 80, squat: 120, deadlift: 150 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
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
        {payload.map((entry, index) => (
          <Typography
            key={index}
            variant="caption"
            color={entry.color}
            sx={{ display: 'block', mt: 0.5 }}
          >
            {entry.name}: {entry.value} kg
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

function StrengthCard({ lift }) {
  const improvement = ((lift.currentPR - lift.previousPR) / lift.previousPR * 100).toFixed(1);

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
          <TrendingUpRoundedIcon sx={{ color: lift.color, fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: lift.color, fontWeight: 700 }}>
            {lift.progress}
          </Typography>
        </Box>
      </Stack>

      <Box sx={{ height: 120, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={lift.weeks.map((w, i) => ({ week: `W${i + 1}`, weight: w }))} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="week"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickCount={3}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              stroke={lift.color}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2, stroke: lift.color, fill: 'background.paper' }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box sx={{ p: 2, borderRadius: 2, background: `linear-gradient(135deg, ${lift.color}22, ${lift.color}11)`, border: `1px solid ${lift.color}44` }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary">Current PR</Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif" }}>
              {lift.currentPR} kg
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">Previous PR</Typography>
            <Typography variant="body2" fontWeight={600}>{lift.previousPR} kg</Typography>
            <Typography variant="caption" sx={{ color: lift.color, fontWeight: 600 }}>
              {improvement}% improvement
            </Typography>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

export default function StrengthOverview() {
  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Strength Overview
        </Typography>
        <Chip
          icon={<ShowChartRoundedIcon fontSize="small" />}
          label="Demo data"
          size="small"
          sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 600 }}
        />
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 3 }}>
        {strengthData.map((lift) => (
          <StrengthCard key={lift.name} lift={lift} />
        ))}
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3, textAlign: 'center' }}>
        Connect your account to see your real strength progression over time.
      </Typography>
    </Box>
  );
}