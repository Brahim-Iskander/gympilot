import { useState, useMemo } from 'react';
import { Box, Button, Card, Chip, Grid, Paper, Stack, Typography, styled } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { EmptyState } from '../../../components/ui';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const timeFilters = ['7D', '1M', '3M', '6M', '1Y', 'ALL'];

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
        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: 'primary.main' }}>
          {payload[0].value} {payload[0].payload.unit || 'kg'}
        </Typography>
      </Box>
    );
  }
  return null;
};

export default function WeightProgress({ entries = [], onAddNew }) {
  const [activeFilter, setActiveFilter] = useState('ALL');

  // Filter entries that have a valid weight
  const weightEntries = useMemo(() => {
    return entries
      .filter((e) => e.weight != null && e.weight > 0)
      .sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [entries]);

  // Apply time filters
  const filteredEntries = useMemo(() => {
    if (activeFilter === 'ALL' || weightEntries.length === 0) return weightEntries;

    const now = new Date();
    const cutoff = new Date();

    if (activeFilter === '7D') cutoff.setDate(now.getDate() - 7);
    else if (activeFilter === '1M') cutoff.setMonth(now.getMonth() - 1);
    else if (activeFilter === '3M') cutoff.setMonth(now.getMonth() - 3);
    else if (activeFilter === '6M') cutoff.setMonth(now.getMonth() - 6);
    else if (activeFilter === '1Y') cutoff.setFullYear(now.getFullYear() - 1);

    const cutoffStr = cutoff.toISOString().split('T')[0];
    const filtered = weightEntries.filter((e) => e.date >= cutoffStr);
    return filtered.length > 0 ? filtered : weightEntries;
  }, [weightEntries, activeFilter]);

  const chartData = useMemo(() => {
    return filteredEntries.map((d) => {
      const dateObj = new Date(d.date + 'T00:00:00');
      return {
        date: d.date,
        name: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: d.weight,
        unit: d.weightUnit || 'kg',
      };
    });
  }, [filteredEntries]);

  // Calculations
  const hasData = weightEntries.length > 0;
  const currentWeight = hasData ? weightEntries[weightEntries.length - 1].weight : null;
  const currentUnit = hasData ? weightEntries[weightEntries.length - 1].weightUnit || 'kg' : 'kg';
  const startingWeight = hasData ? weightEntries[0].weight : null;
  const startYearMonth = hasData
    ? new Date(weightEntries[0].date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    : '';

  const change = hasData && startingWeight != null ? currentWeight - startingWeight : 0;
  const changePercent = startingWeight ? ((change / startingWeight) * 100).toFixed(1) : '0.0';

  if (!hasData) {
    return (
      <EmptyState
        icon={<MonitorWeightRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />}
        title="No weight logs recorded yet"
        description="Log your body weight consistently (e.g. morning weigh-ins) to unlock weight trajectory trends and progress analytics."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={onAddNew}
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}
          >
            Log First Weight
          </Button>
        }
      />
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
            Weight Tracking
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {weightEntries.length} weigh-in{weightEntries.length !== 1 ? 's' : ''} recorded over time
          </Typography>
        </Box>
        <Stack direction="row" spacing={1} useFlexGap alignItems="center">
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={onAddNew}
            size="small"
            sx={{ mr: 1, fontWeight: 700, borderRadius: 2 }}
          >
            Log Weight
          </Button>

          {timeFilters.map((filter) => (
            <Chip
              key={filter}
              label={filter}
              size="small"
              onClick={() => setActiveFilter(filter)}
              variant={activeFilter === filter ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 600,
                bgcolor: activeFilter === filter ? 'primary.main' : 'transparent',
                color: activeFilter === filter ? 'primary.contrastText' : 'text.secondary',
                borderColor: activeFilter === filter ? 'primary.main' : 'divider',
                cursor: 'pointer',
              }}
            />
          ))}
        </Stack>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3, textAlign: 'center' }}>
            <MonitorWeightRoundedIcon sx={{ fontSize: 44, color: 'primary.main', mb: 1.5 }} />
            <Typography variant="h3" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
              {currentWeight}{' '}
              <Typography component="span" variant="h6" color="text.secondary">
                {currentUnit}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Current Weight
            </Typography>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
              Starting Weight
            </Typography>
            <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
              {startingWeight}{' '}
              <Typography component="span" variant="body1" color="text.secondary">
                {currentUnit}
              </Typography>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              First logged in {startYearMonth}
            </Typography>
          </StyledCard>
        </Grid>

        <Grid item xs={12} md={4}>
          <StyledCard sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary' }}>
              Total Change
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontFamily: "'Sora','Inter',sans-serif",
                fontWeight: 800,
                mb: 0.5,
                color: change < 0 ? 'primary.main' : change > 0 ? '#FF6B6B' : 'text.primary',
              }}
            >
              {change > 0 ? '+' : ''}
              {change.toFixed(1)} {currentUnit}
            </Typography>
            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
              {change < 0 ? (
                <TrendingDownRoundedIcon fontSize="small" sx={{ color: 'primary.main' }} />
              ) : change > 0 ? (
                <TrendingUpRoundedIcon fontSize="small" sx={{ color: '#FF6B6B' }} />
              ) : null}
              <Typography
                variant="body2"
                sx={{
                  color: change < 0 ? 'primary.main' : change > 0 ? '#FF6B6B' : 'text.secondary',
                  fontWeight: 700,
                }}
              >
                {changePercent}% net shift
              </Typography>
            </Stack>
          </StyledCard>
        </Grid>
      </Grid>

      <StyledCard sx={{ p: 3 }}>
        <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif", mb: 3 }}>
          Weight Trajectory Chart
        </Typography>
        <Box sx={{ height: 320 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C6FF3E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C6FF3E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                domain={['dataMin - 2', 'dataMax + 2']}
                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                axisLine={false}
                tickLine={false}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="weight"
                stroke="#C6FF3E"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorWeight)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      </StyledCard>
    </Box>
  );
}