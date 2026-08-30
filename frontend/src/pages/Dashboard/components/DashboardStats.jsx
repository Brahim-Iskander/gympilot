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

function calculateDynamicStats(entries = [], aiPlan, t) {
  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // 1. Total workouts
  const totalWorkouts = entries.length;
  const thisWeekWorkouts = entries.filter((e) => {
    if (!e.date) return false;
    const d = new Date(e.date);
    return d >= oneWeekAgo && d <= now;
  }).length;

  // 2. Weight
  const weightEntries = entries
    .filter((e) => typeof e.weight === 'number' && e.weight > 0)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  let currentWeight = aiPlan?.weightKg ?? '—';
  let weightUnit = aiPlan?.weightKg ? t('common.kg') : undefined;
  let weightTrend = aiPlan?.weightKg ? 'Profile' : undefined;

  if (weightEntries.length > 0) {
    currentWeight = weightEntries[0].weight;
    weightUnit = weightEntries[0].weightUnit || t('common.kg');
    if (weightEntries.length >= 2) {
      const diff = Math.round((weightEntries[0].weight - weightEntries[1].weight) * 10) / 10;
      weightTrend = diff >= 0 ? `+${diff} ${weightUnit}` : `${diff} ${weightUnit}`;
    } else {
      weightTrend = 'Latest logged';
    }
  }

  // 3. PRs (Personal Records)
  let totalPrs = 0;
  let prsThisMonth = 0;
  entries.forEach((e) => {
    if (Array.isArray(e.strengthLogs)) {
      e.strengthLogs.forEach((s) => {
        if (s.isPR) {
          totalPrs += 1;
          if (e.date && e.date.startsWith(currentMonthStr)) {
            prsThisMonth += 1;
          }
        }
      });
    }
  });

  // 4. Streak Calculation
  const uniqueDates = Array.from(new Set(entries.map((e) => e.date).filter(Boolean))).sort().reverse();
  let streak = 0;
  if (uniqueDates.length > 0) {
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yesterdayStr = yesterdayDate.toISOString().split('T')[0];

    let checkDate = uniqueDates[0] === todayStr ? todayStr : (uniqueDates[0] === yesterdayStr ? yesterdayStr : null);
    if (checkDate) {
      let cur = new Date(checkDate);
      for (const dStr of uniqueDates) {
        const expectedStr = cur.toISOString().split('T')[0];
        if (dStr === expectedStr) {
          streak += 1;
          cur.setDate(cur.getDate() - 1);
        } else if (dStr < expectedStr) {
          break;
        }
      }
    }
  }

  return [
    {
      id: 'workouts',
      label: t('dashboard.workouts'),
      value: String(totalWorkouts),
      icon: <FitnessCenterRoundedIcon />,
      trend: t('dashboard.thisWeek', { count: thisWeekWorkouts }),
    },
    {
      id: 'weight',
      label: t('dashboard.currentWeight'),
      value: String(currentWeight),
      unit: weightUnit,
      icon: <MonitorWeightRoundedIcon />,
      trend: weightTrend,
    },
    {
      id: 'records',
      label: t('dashboard.personalRecords'),
      value: String(totalPrs),
      icon: <EmojiEventsRoundedIcon />,
      trend: t('dashboard.thisMonth', { count: prsThisMonth }),
    },
    {
      id: 'streak',
      label: t('dashboard.trainingStreak'),
      value: String(streak),
      unit: t('common.days'),
      icon: <LocalFireDepartmentRoundedIcon />,
      trend: t('dashboard.daysStreak', { count: streak }),
    },
  ];
}

export default function DashboardStats({ userName, aiPlan }) {
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

  const displayStats = calculateDynamicStats(entries, aiPlan, t);

  return (
    <Box component="section" sx={{ mb: 5 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
          {t('auth.welcomeBack')}, {userName || 'Athlete'}! <Dumbbell01Icon size={32} color="#C6FF3E" />
        </Typography>
        <Typography color="text.secondary">Ready to crush your next workout?</Typography>
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
