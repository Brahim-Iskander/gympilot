import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded';
import {
  LineChart,
  Line,
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

const MEASUREMENT_COLORS = {
  chest: '#C6FF3E',
  waist: '#8A7CFF',
  hips: '#FF9800',
  arms: '#2196F3',
  thighs: '#FF6B6B',
  neck: '#00BCD4',
  calves: '#E91E63',
  shoulders: '#9C27B0',
};

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
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: payload[0].color }}>
          {payload[0].value} {payload[0].payload.unit || 'cm'}
        </Typography>
      </Box>
    );
  }
  return null;
};

function MeasurementCard({ item, selected, onClick }) {
  const diff = item.latest - item.initial;
  // For waist/hips, decrease is often desired; for chest/arms/thighs, increase is often desired
  const isWaist = item.key === 'waist';
  const isPositive = isWaist ? diff <= 0 : diff >= 0;

  return (
    <StyledCard
      onClick={onClick}
      sx={{
        p: 2.5,
        height: '100%',
        cursor: 'pointer',
        borderColor: selected ? 'primary.main' : 'divider',
        bgcolor: selected ? 'rgba(198,255,62,0.04)' : undefined,
        transition: 'all 0.2s ease',
        '&:hover': {
          borderColor: 'primary.main',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Box>
          <Typography variant="subtitle1" sx={{ fontWeight: 800, textTransform: 'capitalize', mb: 0.25 }}>
            {item.key.replace(/_/g, ' ')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Initial: {item.initial} {item.unit}
          </Typography>
        </Box>
        <Box
          sx={{
            width: 38,
            height: 38,
            borderRadius: 2,
            bgcolor: `${item.color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <StraightenRoundedIcon sx={{ fontSize: 20, color: item.color }} />
        </Box>
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 2 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          {item.latest}{' '}
          <Typography component="span" variant="body2" color="text.secondary">
            {item.unit}
          </Typography>
        </Typography>

        {item.count > 1 && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {diff !== 0 && (
              diff > 0 ? (
                <TrendingUpRoundedIcon fontSize="small" color={isPositive ? 'success' : 'error'} />
              ) : (
                <TrendingDownRoundedIcon fontSize="small" color={isPositive ? 'success' : 'error'} />
              )
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                color: isPositive ? 'success.main' : 'error.main',
              }}
            >
              {diff > 0 ? '+' : ''}
              {diff.toFixed(1)} {item.unit}
            </Typography>
          </Box>
        )}
      </Box>
    </StyledCard>
  );
}

export default function MeasurementsProgress({ entries = [], onAddNew }) {
  // Sort oldest first
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [entries]);

  // Extract all measurement summary items
  const measurementSummaries = useMemo(() => {
    const map = {};

    sortedEntries.forEach((entry) => {
      if (entry.measurements) {
        const unit = entry.measurementUnit || 'cm';
        Object.entries(entry.measurements).forEach(([key, val]) => {
          if (val != null && val > 0) {
            if (!map[key]) {
              map[key] = {
                key,
                initial: val,
                latest: val,
                unit,
                color: MEASUREMENT_COLORS[key] || '#C6FF3E',
                history: [],
                count: 0,
              };
            }
            map[key].latest = val;
            map[key].unit = unit;
            map[key].count += 1;
            map[key].history.push({
              date: entry.date,
              name: new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: val,
              unit,
            });
          }
        });
      }
    });

    return Object.values(map);
  }, [sortedEntries]);

  const [activeKey, setActiveKey] = useState(null);

  const selectedMeasurement = useMemo(() => {
    if (measurementSummaries.length === 0) return null;
    if (activeKey) {
      const found = measurementSummaries.find((m) => m.key === activeKey);
      if (found) return found;
    }
    return measurementSummaries[0];
  }, [measurementSummaries, activeKey]);

  if (measurementSummaries.length === 0) {
    return (
      <EmptyState
        icon={<StraightenRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />}
        title="No body measurements logged yet"
        description="Track key body circumferences (chest, waist, hips, arms, thighs, neck) to accurately measure body composition changes."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={onAddNew}
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}
          >
            Log Measurements
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
            Body Circumference Measurements
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {measurementSummaries.length} body metric{measurementSummaries.length !== 1 ? 's' : ''} tracked across {sortedEntries.length} entries
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={onAddNew}
          size="small"
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Add Measurement
        </Button>
      </Stack>

      {/* Grid of measurement metric cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {measurementSummaries.map((item) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={item.key}>
            <MeasurementCard
              item={item}
              selected={selectedMeasurement?.key === item.key}
              onClick={() => setActiveKey(item.key)}
            />
          </Grid>
        ))}
      </Grid>

      {/* Historical Line Chart for selected measurement */}
      {selectedMeasurement && (
        <StyledCard sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, textTransform: 'capitalize' }}>
                {selectedMeasurement.key.replace(/_/g, ' ')} Progression
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Tracked over {selectedMeasurement.history.length} logged data points
              </Typography>
            </Box>
            <Chip
              label={`Current: ${selectedMeasurement.latest} ${selectedMeasurement.unit}`}
              sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', fontWeight: 800 }}
            />
          </Stack>

          <Box sx={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={selectedMeasurement.history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={selectedMeasurement.color}
                  strokeWidth={3}
                  dot={{ r: 5, strokeWidth: 2, stroke: selectedMeasurement.color, fill: '#0A0C0F' }}
                  activeDot={{ r: 7, strokeWidth: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </StyledCard>
      )}
    </Box>
  );
}