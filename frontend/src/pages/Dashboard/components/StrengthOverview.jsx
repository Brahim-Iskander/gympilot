import { Link as RouterLink } from 'react-router-dom';
import { Box, Button, Card, Chip, Stack, Typography, styled } from '@mui/material';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import {
  LineChart,
  Line,
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
  const currentPR = lift.currentPR || 0;
  const previousPR = lift.previousPR || (currentPR > 0 ? currentPR * 0.9 : 0);
  const improvement = previousPR > 0 ? (((currentPR - previousPR) / previousPR) * 100).toFixed(1) : '0.0';

  const weeksData = [
    { week: 'W1', weight: Math.round(previousPR * 0.95 * 10) / 10 },
    { week: 'W2', weight: Math.round(previousPR * 10) / 10 },
    { week: 'W3', weight: Math.round(((Number(previousPR) + Number(currentPR)) / 2) * 10) / 10 },
    { week: 'W4', weight: Math.round(currentPR * 10) / 10 },
  ];

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
        {Number(improvement) > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUpRoundedIcon sx={{ color: lift.color, fontSize: 20 }} />
            <Typography variant="body2" sx={{ color: lift.color, fontWeight: 700 }}>
              +{improvement}%
            </Typography>
          </Box>
        )}
      </Stack>

      <Box sx={{ height: 120, mb: 3 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={weeksData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
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
              {currentPR} {lift.unit || 'kg'}
            </Typography>
          </Box>
          {previousPR > 0 && (
            <Box sx={{ textAlign: 'right' }}>
              <Typography variant="caption" color="text.secondary">Previous PR</Typography>
              <Typography variant="body2" fontWeight={600}>{previousPR} {lift.unit || 'kg'}</Typography>
            </Box>
          )}
        </Stack>
      </Box>
    </Card>
  );
}

export default function StrengthOverview({ prs = [] }) {
  const colors = ['#C6FF3E', '#8A7CFF', '#FF6B6B', '#FFC107'];

  const displayPRs = prs.map((p, i) => ({
    ...p,
    color: p.color || colors[i % colors.length],
  }));

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
            Strength Progression & PRs
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Live compound lift personal records tracked from your workouts
          </Typography>
        </Box>
        <Chip
          icon={<ShowChartRoundedIcon fontSize="small" />}
          label="Progressive Overload"
          size="small"
          sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', fontWeight: 700 }}
        />
      </Stack>

      {displayPRs.length === 0 ? (
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
              bgcolor: 'rgba(198,255,62,0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FitnessCenterRoundedIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box sx={{ maxWidth: 460 }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
              No Personal Records Yet
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete your first workout session or log your compound lifts in Progress to start charting your strength milestones!
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/workouts"
            variant="outlined"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ borderRadius: 2, fontWeight: 700, mt: 1 }}
          >
            Start Workout
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
          {displayPRs.map((lift, index) => (
            <StrengthCard key={lift.name || index} lift={lift} />
          ))}
        </Box>
      )}
    </Box>
  );
}