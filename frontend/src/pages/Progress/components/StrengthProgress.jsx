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
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
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
import { EmptyState } from '../../../components/ui';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const EXERCISE_COLORS = ['#C6FF3E', '#8A7CFF', '#FF9800', '#2196F3', '#FF6B6B', '#00BCD4', '#E91E63', '#9C27B0'];

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
        {payload.map((entry, index) => (
          <Typography key={index} variant="caption" sx={{ color: entry.color, fontWeight: 700, display: 'block' }}>
            {entry.name}: {entry.value} kg
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

function StrengthCard({ exercise }) {
  const diff = exercise.currentPR - exercise.initialPR;
  const progressPercent = exercise.initialPR > 0 ? ((diff / exercise.initialPR) * 100).toFixed(1) : '0.0';

  return (
    <StyledCard sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Stack direction="row" spacing={1.25} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2,
              bgcolor: `${exercise.color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <FitnessCenterRoundedIcon sx={{ fontSize: 20, color: exercise.color }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
              {exercise.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {exercise.history.length} session{exercise.history.length !== 1 ? 's' : ''} logged
            </Typography>
          </Box>
        </Stack>

        {exercise.prCount > 0 && (
          <Chip
            icon={<EmojiEventsRoundedIcon sx={{ fontSize: '13px !important', color: '#0A0C0F !important' }} />}
            label={`${exercise.prCount} PR${exercise.prCount !== 1 ? 's' : ''}`}
            size="small"
            sx={{ bgcolor: '#C6FF3E', color: '#0A0C0F', fontWeight: 800, height: 22, fontSize: '0.68rem' }}
          />
        )}
      </Stack>

      <Box sx={{ height: 110, my: 1.5, flex: 1 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={exercise.history} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis
              dataKey="name"
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: "'Inter',sans-serif" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={['dataMin - 5', 'dataMax + 5']}
              tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9, fontFamily: "'Inter',sans-serif" }}
              axisLine={false}
              tickLine={false}
              tickCount={3}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="weight"
              name={exercise.name}
              stroke={exercise.color}
              strokeWidth={2.5}
              dot={{ r: 3, strokeWidth: 2, stroke: exercise.color, fill: '#0A0C0F' }}
              activeDot={{ r: 5, strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Box>

      <Box
        sx={{
          p: 1.75,
          borderRadius: 2.5,
          background: `linear-gradient(135deg, ${exercise.color}15, ${exercise.color}08)`,
          border: `1px solid ${exercise.color}33`,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="caption" color="text.secondary" fontWeight={700}>
              CURRENT BEST
            </Typography>
            <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
              {exercise.currentPR} kg
            </Typography>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            <Typography variant="caption" color="text.secondary">
              First Logged
            </Typography>
            <Typography variant="body2" fontWeight={700}>
              {exercise.initialPR} kg
            </Typography>
            {diff > 0 && (
              <Stack direction="row" spacing={0.5} justifyContent="flex-end" alignItems="center">
                <TrendingUpRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800 }}>
                  +{diff.toFixed(1)} kg ({progressPercent}%)
                </Typography>
              </Stack>
            )}
          </Box>
        </Stack>
      </Box>
    </StyledCard>
  );
}

export default function StrengthProgress({ entries = [], onAddNew }) {
  // Sort oldest first
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [entries]);

  // Group by Exercise
  const exerciseMap = useMemo(() => {
    const map = {};
    let colorIdx = 0;

    sortedEntries.forEach((entry) => {
      if (entry.strengthLogs && entry.strengthLogs.length > 0) {
        entry.strengthLogs.forEach((log) => {
          if (!log.exerciseName || !log.exerciseName.trim()) return;
          const key = log.exerciseName.trim();
          const weight = log.weight || 0;

          if (!map[key]) {
            map[key] = {
              name: key,
              initialPR: weight,
              currentPR: weight,
              prCount: log.isPR ? 1 : 0,
              color: EXERCISE_COLORS[colorIdx % EXERCISE_COLORS.length],
              history: [],
            };
            colorIdx++;
          } else {
            if (weight > map[key].currentPR) {
              map[key].currentPR = weight;
            }
            if (log.isPR) {
              map[key].prCount += 1;
            }
          }

          map[key].history.push({
            date: entry.date,
            name: new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight,
            reps: log.reps,
            sets: log.sets,
            isPR: log.isPR,
          });
        });
      }
    });

    return Object.values(map);
  }, [sortedEntries]);

  // Aggregate multi-line chart data across dates
  const chartData = useMemo(() => {
    const dateMap = {};

    sortedEntries.forEach((entry) => {
      if (entry.strengthLogs && entry.strengthLogs.length > 0) {
        const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!dateMap[dateStr]) {
          dateMap[dateStr] = { name: dateStr };
        }
        entry.strengthLogs.forEach((log) => {
          if (log.exerciseName && log.exerciseName.trim()) {
            dateMap[dateStr][log.exerciseName.trim()] = log.weight;
          }
        });
      }
    });

    return Object.values(dateMap);
  }, [sortedEntries]);

  const totalPrs = useMemo(() => {
    return exerciseMap.reduce((sum, e) => sum + e.prCount, 0);
  }, [exerciseMap]);

  if (exerciseMap.length === 0) {
    return (
      <EmptyState
        icon={<FitnessCenterRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />}
        title="No strength lifts logged yet"
        description="Log your working weights, reps, sets, and Personal Records for your key compound and isolation movements."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={onAddNew}
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}
          >
            Log First Lift
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
            Strength & Personal Records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Tracking {exerciseMap.length} exercise{exerciseMap.length !== 1 ? 's' : ''} with {totalPrs} registered PR{totalPrs !== 1 ? 's' : ''}
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<AddRoundedIcon />}
          onClick={onAddNew}
          size="small"
          sx={{ fontWeight: 700, borderRadius: 2 }}
        >
          Log Lift
        </Button>
      </Stack>

      {/* Grid of exercise cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {exerciseMap.map((exercise) => (
          <Grid item xs={12} md={6} lg={4} key={exercise.name}>
            <StrengthCard exercise={exercise} />
          </Grid>
        ))}
      </Grid>

      {/* Multi-Exercise Progression Overview */}
      {chartData.length > 1 && (
        <StyledCard sx={{ p: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 3 }}>
            Strength Progression Timeline
          </Typography>
          <Box sx={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontFamily: "'Inter',sans-serif" }}
                  axisLine={false}
                  tickLine={false}
                  tickCount={5}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {exerciseMap.map((ex) => (
                  <Line
                    key={ex.name}
                    type="monotone"
                    dataKey={ex.name}
                    stroke={ex.color}
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 2, stroke: ex.color, fill: '#0A0C0F' }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                    name={ex.name}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </Box>
        </StyledCard>
      )}
    </Box>
  );
}