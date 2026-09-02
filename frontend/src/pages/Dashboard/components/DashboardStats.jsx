import { useEffect, useState } from 'react';
import { Box, Grid, Typography, Skeleton } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import StatCard from '../../../components/StatCard';
import { Dumbbell01Icon } from 'hugeicons-react';
import { useLanguage } from '../../../i18n';
import { progressService } from '../../../services/progressService';

export default function DashboardStats({
  userName,
  aiPlan,
  workoutStreak = 0,
  thisWeekWorkouts = 0,
  workoutHistory = [],
  nutritionTotals = { calories: 0, protein: 0 },
  prs = [],
}) {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function loadStats() {
      try {
        const data = await progressService.getAll();
        if (active) {
          setEntries(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Failed to load user progress entries for stats:', err);
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStats();
    return () => {
      active = false;
    };
  }, []);

  // 1. Total workouts calculation
  const totalWorkouts = Math.max(entries.length, workoutHistory.length);

  // 2. Weight calculation
  const weightEntries = entries
    .filter((e) => typeof e.weight === 'number' && e.weight > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let currentWeight = aiPlan?.weightKg ?? '--';
  let weightUnit = aiPlan?.weightKg ? (t('common.kg') || 'kg') : '';
  let weightTrend = aiPlan?.weightKg ? 'Onboarding profile' : 'No logs yet';

  if (weightEntries.length > 0) {
    currentWeight = weightEntries[0].weight;
    weightUnit = weightEntries[0].weightUnit || 'kg';
    if (weightEntries.length >= 2) {
      const diff = Math.round((weightEntries[0].weight - weightEntries[1].weight) * 10) / 10;
      weightTrend = diff >= 0 ? `+${diff} ${weightUnit}` : `${diff} ${weightUnit}`;
    } else {
      weightTrend = 'Latest logged';
    }
  }

  // 3. PRs calculation
  const totalPrCount = Math.max(
    prs.length,
    entries.reduce((acc, e) => acc + (e.strengthLogs?.filter((l) => l.isPR).length || 0), 0)
  );

  const displayStats = [
    {
      id: 'workouts',
      label: t('dashboard.workouts', 'Workouts Logged'),
      value: String(totalWorkouts),
      icon: <FitnessCenterRoundedIcon />,
      trend: totalWorkouts > 0 ? `${thisWeekWorkouts} sessions this week` : 'Start your first workout',
    },
    {
      id: 'weight',
      label: t('dashboard.currentWeight', 'Current Weight'),
      value: String(currentWeight),
      unit: weightUnit,
      icon: <MonitorWeightRoundedIcon />,
      trend: weightTrend,
    },
    {
      id: 'records',
      label: t('dashboard.personalRecords', 'Personal Records'),
      value: String(totalPrCount),
      icon: <EmojiEventsRoundedIcon />,
      trend: totalPrCount > 0 ? `${totalPrCount} personal records tracked` : 'No records yet',
    },
    {
      id: 'streak',
      label: t('dashboard.trainingStreak', 'Training Streak'),
      value: String(workoutStreak),
      unit: t('common.days', 'days'),
      icon: <LocalFireDepartmentRoundedIcon />,
      trend: workoutStreak > 0 ? `${workoutStreak} day streak active` : 'No active streak',
    },
  ];

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          {t('auth.welcomeBack', 'Welcome back')}, {userName || 'Athlete'}! <Dumbbell01Icon size={32} color="#C6FF3E" />
        </Typography>
        <Typography color="text.secondary">
          Ready to crush your next workout? Today: <strong>{nutritionTotals.calories} kcal</strong> consumed · <strong>{nutritionTotals.protein}g</strong> protein.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {displayStats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            {loading ? (
              <Skeleton variant="rounded" height={130} sx={{ borderRadius: 3.5 }} />
            ) : (
              <StatCard
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                trend={stat.trend}
                icon={stat.icon}
              />
            )}
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
