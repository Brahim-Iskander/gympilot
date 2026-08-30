import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Skeleton,
  Stack,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddTaskRoundedIcon from '@mui/icons-material/AddTaskRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';

import { Card, StatCard, SectionHeader, ChartCard, EmptyState, LoadingSpinner } from '../../components/ui';
import { progressService } from '../../services/progressService';
import { onboardingService } from '../../services/onboardingService';
import { getApiErrorMessage } from '../../utils/errors';
import { useLanguage } from '../../i18n/LanguageContext';

const CACHE_STORAGE_KEY = 'gymtrack_ai_analytics_cache';
const CONSENT_STORAGE_KEY = 'gymtrack_ai_analytics_consent';

export const CATEGORY_CONFIG = {
  nutrition: {
    key: 'nutrition',
    label: 'Nutrition',
    icon: RestaurantRoundedIcon,
    color: '#C6FF3E',
    bgColor: 'rgba(198, 255, 62, 0.12)',
    borderColor: 'rgba(198, 255, 62, 0.3)',
    hoverBorder: '#C6FF3E',
  },
  training: {
    key: 'training',
    label: 'Training',
    icon: FitnessCenterRoundedIcon,
    color: '#8A7CFF',
    bgColor: 'rgba(138, 124, 255, 0.12)',
    borderColor: 'rgba(138, 124, 255, 0.3)',
    hoverBorder: '#8A7CFF',
  },
  recovery: {
    key: 'recovery',
    label: 'Recovery',
    icon: WaterDropRoundedIcon,
    color: '#38BDF8',
    bgColor: 'rgba(56, 189, 248, 0.12)',
    borderColor: 'rgba(56, 189, 248, 0.3)',
    hoverBorder: '#38BDF8',
  },
  progress: {
    key: 'progress',
    label: 'Progress',
    icon: ShowChartRoundedIcon,
    color: '#3B82F6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: 'rgba(59, 130, 246, 0.3)',
    hoverBorder: '#3B82F6',
  },
  goals: {
    key: 'goals',
    label: 'Goals',
    icon: FlagRoundedIcon,
    color: '#F59E0B',
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.3)',
    hoverBorder: '#F59E0B',
  },
  warnings: {
    key: 'warnings',
    label: 'Warnings',
    icon: WarningAmberRoundedIcon,
    color: '#EF4444',
    bgColor: 'rgba(239, 68, 68, 0.12)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
    hoverBorder: '#EF4444',
  },
};

export function classifySuggestion(rawText) {
  if (!rawText || typeof rawText !== 'string') return { category: CATEGORY_CONFIG.goals, cleanText: '' };

  const text = rawText.trim();
  const lower = text.toLowerCase();

  // 1. Check direct prefix tags or emojis
  if (/^(🍗|🥩|🥗|🥑|🍳|🍎|\[nutrition\]|nutrition:|macros:|diet:|calories:)/i.test(text)) {
    return {
      category: CATEGORY_CONFIG.nutrition,
      cleanText: text.replace(/^(🍗|🥩|🥗|🥑|🍳|🍎)?\s*(\[nutrition\]|nutrition:|macros:|diet:|calories:)?\s*/i, '').trim() || text,
    };
  }
  if (/^(🏋️|🏋|💪|⚡|🥋|\[training\]|training:|workout:|progressive overload:|overload:)/i.test(text)) {
    return {
      category: CATEGORY_CONFIG.training,
      cleanText: text.replace(/^(🏋️|🏋|💪|⚡|🥋)?\s*(\[training\]|training:|workout:|progressive overload:|overload:)?\s*/i, '').trim() || text,
    };
  }
  if (/^(💧|😴|🧘|🛌|🧊|🛁|\[recovery\]|recovery:|hydration:|sleep:|rest:)/i.test(text)) {
    return {
      category: CATEGORY_CONFIG.recovery,
      cleanText: text.replace(/^(💧|😴|🧘|🛌|🧊|🛁)?\s*(\[recovery\]|recovery:|hydration:|sleep:|rest:)?\s*/i, '').trim() || text,
    };
  }
  if (/^(📈|📊|📉|⚖️|📏|\[progress\]|progress:|trajectory:|weight trajectory:|tracking:)/i.test(text)) {
    return {
      category: CATEGORY_CONFIG.progress,
      cleanText: text.replace(/^(📈|📊|📉|⚖️|📏)?\s*(\[progress\]|progress:|trajectory:|weight trajectory:|tracking:)?\s*/i, '').trim() || text,
    };
  }
  if (/^(🎯|🏆|🥇|🏁|\[goals?\]|goals?:|target:)/i.test(text)) {
    return {
      category: CATEGORY_CONFIG.goals,
      cleanText: text.replace(/^(🎯|🏆|🥇|🏁)?\s*(\[goals?\]|goals?:|target:)?\s*/i, '').trim() || text,
    };
  }
  if (/^(⚠️|🚨|🛑|❗|\[warnings?\]|\[caution\]|warnings?:|caution:|injury:)/i.test(text)) {
    return {
      category: CATEGORY_CONFIG.warnings,
      cleanText: text.replace(/^(⚠️|🚨|🛑|❗)?\s*(\[warnings?\]|\[caution\]|warnings?:|caution:|injury:)?\s*/i, '').trim() || text,
    };
  }

  // 2. Keyword-based disambiguation
  // Warnings first
  if (lower.includes('pain') || lower.includes('injury') || lower.includes('doctor') || lower.includes('caution') || lower.includes('overtrain') || lower.includes('red flag')) {
    return { category: CATEGORY_CONFIG.warnings, cleanText: text };
  }
  // Recovery: hydration, sleep, water, creatine, deload, cns fatigue
  if (lower.includes('hydration') || lower.includes('creatine') || lower.includes('water daily') || lower.includes('liters') || lower.includes('sleep') || lower.includes('rest day') || lower.includes('soreness') || lower.includes('foam roll') || lower.includes('cns fatigue')) {
    return { category: CATEGORY_CONFIG.recovery, cleanText: text };
  }
  // Training: progressive overload, compound lift, bench press, squat, deadlift, rep range, sets, hypertrophy, eccentric
  if (lower.includes('progressive overload') || lower.includes('compound lift') || lower.includes('squat') || lower.includes('bench press') || lower.includes('deadlift') || lower.includes('rep range') || lower.includes('working weight') || lower.includes('eccentric') || lower.includes('hypertrophy range') || lower.includes('isolation')) {
    return { category: CATEGORY_CONFIG.training, cleanText: text };
  }
  // Progress: scale weight, weigh-in, circumference, personal record, prs, velocity
  if (lower.includes('weigh-in') || lower.includes('scale weight') || lower.includes('circumference') || lower.includes('personal record') || lower.includes('pr ') || lower.includes('prs') || lower.includes('tracking rhythm') || lower.includes('weight dropped') || lower.includes('weight moved')) {
    return { category: CATEGORY_CONFIG.progress, cleanText: text };
  }
  // Nutrition: carb, protein, calorie, macro, meal, diet, surplus, deficit, oats, rice, chicken
  if (lower.includes('protein') || lower.includes('calorie') || lower.includes('carb') || lower.includes('macro') || lower.includes('surplus') || lower.includes('deficit') || lower.includes('meal') || lower.includes('diet') || lower.includes('oats') || lower.includes('rice') || lower.includes('sweet potato')) {
    return { category: CATEGORY_CONFIG.nutrition, cleanText: text };
  }
  // Goals
  if (lower.includes('goal') || lower.includes('target') || lower.includes('milestone') || lower.includes('timeline') || lower.includes('macrocycle') || lower.includes('phase')) {
    return { category: CATEGORY_CONFIG.goals, cleanText: text };
  }

  // Default fallback
  return { category: CATEGORY_CONFIG.training, cleanText: text };
}

const CustomChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.5,
        boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
      }}
    >
      <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      {payload.map((entry, i) => (
        <Typography key={i} variant="caption" sx={{ color: entry.color, fontWeight: 600, display: 'block' }}>
          {entry.name}: {entry.value} {entry.name.toLowerCase().includes('weight') || entry.name.toLowerCase().includes('bench') || entry.name.toLowerCase().includes('squat') || entry.name.toLowerCase().includes('deadlift') ? 'kg' : ''}
        </Typography>
      ))}
    </Box>
  );
};

export default function Analytics() {
  const { t } = useLanguage();
  const [entries, setEntries] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [cachedTime, setCachedTime] = useState(null);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');

  const [loadingData, setLoadingData] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');

  // Consent modal state
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [hasConsented, setHasConsented] = useState(() => {
    return localStorage.getItem(CONSENT_STORAGE_KEY) === 'true';
  });

  const navigate = useNavigate();

  // Load user data + progress entries
  const loadData = useCallback(async () => {
    try {
      setLoadingData(true);
      setError('');
      const [entriesData, profileData] = await Promise.all([
        progressService.getAll().catch(() => []),
        onboardingService.get().catch(() => null),
      ]);
      setEntries(entriesData || []);
      setUserProfile(profileData || null);
    } catch (err) {
      console.error('Failed to load analytics data:', err);
      setError(getApiErrorMessage(err) || 'Failed to load progress data.');
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Load cached analysis or trigger fresh analysis if consented
  useEffect(() => {
    if (!loadingData) {
      const cached = localStorage.getItem(CACHE_STORAGE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.data) {
            setAiAnalysis(parsed.data);
            setCachedTime(parsed.timestamp);
          }
        } catch (e) {
          console.error('Failed to parse cached analytics', e);
        }
      }
    }
  }, [loadingData]);

  // Check consent when user wants to run analysis
  const runAiAnalysis = async (skipConsentCheck = false) => {
    if (!skipConsentCheck && !hasConsented) {
      setConsentDialogOpen(true);
      return;
    }

    try {
      setAnalyzing(true);
      setError('');
      const result = await progressService.analyze();
      setAiAnalysis(result);
      const timestamp = new Date().toISOString();
      setCachedTime(timestamp);
      localStorage.setItem(
        CACHE_STORAGE_KEY,
        JSON.stringify({
          data: result,
          timestamp,
        })
      );
    } catch (err) {
      console.error('AI Analysis failed:', err);
      setError(getApiErrorMessage(err) || 'Failed to complete AI progress analysis.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleGrantConsent = () => {
    localStorage.setItem(CONSENT_STORAGE_KEY, 'true');
    setHasConsented(true);
    setConsentDialogOpen(false);
    runAiAnalysis(true);
  };

  // Real Charts Data Computations
  const sortedEntries = useMemo(() => {
    return [...entries].sort((a, b) => (a.date > b.date ? 1 : -1));
  }, [entries]);

  // Weight Trend Data
  const weightChartData = useMemo(() => {
    const list = sortedEntries
      .filter((e) => e.weight != null && e.weight > 0)
      .map((e) => ({
        name: new Date(e.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: e.weight,
        unit: e.weightUnit || 'kg',
      }));

    // If user has only 1 weight entry or 0 entries, integrate onboarding base weight if available
    if (list.length === 0 && userProfile?.weightKg) {
      list.push({
        name: 'Profile Base',
        weight: userProfile.weightKg,
        unit: 'kg',
      });
    } else if (list.length === 1 && userProfile?.weightKg && userProfile.weightKg !== list[0].weight) {
      list.unshift({
        name: 'Profile Base',
        weight: userProfile.weightKg,
        unit: 'kg',
      });
    }

    return list;
  }, [sortedEntries, userProfile]);

  // Strength Progression Data
  const strengthChartData = useMemo(() => {
    const map = {};
    sortedEntries.forEach((entry) => {
      if (entry.strengthLogs && entry.strengthLogs.length > 0) {
        const dateStr = new Date(entry.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        if (!map[dateStr]) map[dateStr] = { name: dateStr };
        entry.strengthLogs.forEach((log) => {
          if (log.exerciseName && log.exerciseName.trim()) {
            map[dateStr][log.exerciseName.trim()] = log.weight;
          }
        });
      }
    });
    return Object.values(map);
  }, [sortedEntries]);

  // Stats Counters
  const totalEntries = entries.length;
  const weightEntries = entries.filter((e) => e.weight != null && e.weight > 0);
  const currentWeight = weightEntries.length > 0 ? weightEntries[0].weight : (userProfile?.weightKg || '—');
  const currentWeightUnit = weightEntries.length > 0 ? weightEntries[0].weightUnit || 'kg' : 'kg';

  let totalPRs = 0;
  let totalLifts = 0;
  let totalPhotos = 0;

  entries.forEach((e) => {
    if (e.photos) totalPhotos += e.photos.length;
    if (e.strengthLogs) {
      e.strengthLogs.forEach((l) => {
        totalLifts += 1;
        if (l.isPR) totalPRs += 1;
      });
    }
  });

  const formattedCachedTime = useMemo(() => {
    if (!cachedTime) return null;
    const dateObj = new Date(cachedTime);
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }, [cachedTime]);

  // Categorized Suggestions
  const categorizedSuggestions = useMemo(() => {
    if (!aiAnalysis?.suggestions || !Array.isArray(aiAnalysis.suggestions)) return [];
    return aiAnalysis.suggestions.map((s, idx) => {
      const { category, cleanText } = classifySuggestion(s);
      return {
        id: idx,
        raw: s,
        category,
        cleanText,
      };
    });
  }, [aiAnalysis?.suggestions]);

  // Unique categories present in the current analysis
  const presentCategoryKeys = useMemo(() => {
    const set = new Set(categorizedSuggestions.map((item) => item.category.key));
    return Array.from(set);
  }, [categorizedSuggestions]);

  // Filtered suggestions based on user category tab selection
  const filteredSuggestions = useMemo(() => {
    if (selectedCategoryFilter === 'all') return categorizedSuggestions;
    return categorizedSuggestions.filter((item) => item.category.key === selectedCategoryFilter);
  }, [categorizedSuggestions, selectedCategoryFilter]);

  return (
    <Box>
      <SectionHeader
        title="AI Performance & Deep Analytics"
        subtitle="Personalized progress assessment, trend identification, and progressive overload intelligence by Claude Opus"
        action={
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            <Button
              variant="outlined"
              color="primary"
              startIcon={<RefreshRoundedIcon className={analyzing ? 'spin' : ''} />}
              onClick={() => runAiAnalysis(false)}
              disabled={analyzing}
              sx={{ fontWeight: 800, borderRadius: 2.5 }}
            >
              {analyzing ? 'Analyzing with AI...' : aiAnalysis ? 'Regenerate Analysis' : 'Run AI Analysis'}
            </Button>

            <Button
              variant="contained"
              color="primary"
              startIcon={<AddTaskRoundedIcon />}
              onClick={() => navigate('/progress')}
              sx={{ fontWeight: 800, borderRadius: 2.5 }}
            >
              Log New Progress
            </Button>
          </Stack>
        }
      />

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Overview Stat Cards Row */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
          gap: 3,
          mb: 4,
        }}
      >
        <StatCard
          title="Progress Entries"
          value={String(totalEntries)}
          trend={`${entries.length} historical logs`}
          trendUp
          icon={<CalendarTodayRoundedIcon />}
        />
        <StatCard
          title="Current Weight"
          value={String(currentWeight)}
          unit={currentWeightUnit}
          trend={userProfile?.goal ? `Goal: ${userProfile.goal.replace(/_/g, ' ')}` : 'Logged'}
          trendUp
          icon={<MonitorWeightRoundedIcon />}
        />
        <StatCard
          title="Personal Records"
          value={String(totalPRs)}
          trend={`${totalLifts} total lifts logged`}
          trendUp
          icon={<EmojiEventsRoundedIcon />}
        />
        <StatCard
          title="Progress Photos"
          value={String(totalPhotos)}
          trend="Visual Milestones"
          trendUp
          icon={<SpeedRoundedIcon />}
        />
      </Box>

      {/* Main AI Performance Assessment Section */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 4,
          borderRadius: 4,
          background: 'linear-gradient(135deg, rgba(18,21,27,0.95) 0%, rgba(26,30,38,0.92) 100%)',
          border: '1px solid rgba(198, 255, 62, 0.3)',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.35)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            top: -100,
            right: -100,
            width: 320,
            height: 320,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(198,255,62,0.12), transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        <Stack spacing={3}>
          {/* Header row: Badge + Metadata */}
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '0.9rem !important', color: '#0A0C0F !important' }} />}
                label="CLAUDE OPUS PROGRESS ANALYST"
                size="small"
                sx={{ bgcolor: '#C6FF3E', color: '#0A0C0F', fontWeight: 800, fontSize: '0.68rem', letterSpacing: '0.06em' }}
              />
              {userProfile?.goal && (
                <Chip
                  label={userProfile.goal.replace(/_/g, ' ')}
                  size="small"
                  variant="outlined"
                  sx={{ borderColor: 'rgba(198,255,62,0.4)', color: '#C6FF3E', fontWeight: 700, fontSize: '0.68rem', textTransform: 'capitalize' }}
                />
              )}
              {userProfile?.experienceLevel && (
                <Chip
                  label={userProfile.experienceLevel}
                  size="small"
                  sx={{ bgcolor: 'rgba(138,124,255,0.15)', color: '#8A7CFF', fontWeight: 700, fontSize: '0.68rem', textTransform: 'capitalize' }}
                />
              )}
            </Stack>

            {formattedCachedTime && (
              <Typography variant="caption" color="text.secondary">
                Last analyzed: {formattedCachedTime}
              </Typography>
            )}
          </Stack>

          {/* Analysis Content or Prompt to Run */}
          {analyzing ? (
            <Stack spacing={2} sx={{ py: 2 }}>
              <Skeleton variant="text" width="60%" height={32} />
              <Skeleton variant="rectangular" height={90} sx={{ borderRadius: 2 }} />
              <Skeleton variant="rectangular" height={90} sx={{ borderRadius: 2 }} />
            </Stack>
          ) : aiAnalysis ? (
            <Stack spacing={3}>
              {/* 1. Summary Section */}
              <Box>
                <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif", lineHeight: 1.3, mb: 1 }}>
                  Executive Progress Evaluation
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.75 }}>
                  {aiAnalysis.summary}
                </Typography>
              </Box>

              <Divider sx={{ borderColor: 'rgba(255,255,255,0.06)' }} />

              {/* 2. Specific Trend Breakdowns Grid */}
              <Grid container spacing={2.5}>
                {/* Weight Trend */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(198,255,62,0.2)',
                      height: '100%',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <MonitorWeightRoundedIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                      <Typography variant="subtitle2" fontWeight={800}>
                        WEIGHT TRAJECTORY
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {aiAnalysis.weightTrend || 'No weight trends established yet.'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Measurement Trend */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(138,124,255,0.2)',
                      height: '100%',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <StraightenRoundedIcon sx={{ fontSize: 20, color: '#8A7CFF' }} />
                      <Typography variant="subtitle2" fontWeight={800}>
                        MEASUREMENT TRENDS
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {aiAnalysis.measurementTrend || 'No circumference measurement changes detected.'}
                    </Typography>
                  </Paper>
                </Grid>

                {/* Strength Trend */}
                <Grid item xs={12} md={4}>
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,107,107,0.2)',
                      height: '100%',
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                      <FitnessCenterRoundedIcon sx={{ fontSize: 20, color: '#FF6B6B' }} />
                      <Typography variant="subtitle2" fontWeight={800}>
                        STRENGTH PROGRESSION
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                      {aiAnalysis.strengthTrend || 'No strength logs recorded in dataset.'}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* 3. Actionable Categorized Suggestions */}
              {categorizedSuggestions && categorizedSuggestions.length > 0 && (
                <Box sx={{ pt: 1 }}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    gap={1.5}
                    sx={{ mb: 2 }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Typography variant="subtitle1" fontWeight={800} color="primary.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 20 }} />
                        {t('analytics.directives') || 'Goal-Driven AI Directives & Recommendations:'}
                      </Typography>
                      {userProfile?.goal && (
                        <Chip
                          label={
                            userProfile.goal.toLowerCase().includes('bulk') || userProfile.goal.toLowerCase().includes('muscle')
                              ? (t('analytics.bulkingSurplus') || 'Bulking Surplus Focus')
                              : (t('analytics.cuttingDeficit') || 'Target Strategy')
                          }
                          size="small"
                          sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                        />
                      )}
                    </Stack>

                    {/* Filter Category Chips */}
                    {presentCategoryKeys.length > 1 && (
                      <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                        <Chip
                          label={`${t('analytics.categories.all') || 'All'} (${categorizedSuggestions.length})`}
                          size="small"
                          onClick={() => setSelectedCategoryFilter('all')}
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.72rem',
                            cursor: 'pointer',
                            bgcolor: selectedCategoryFilter === 'all' ? 'primary.main' : 'rgba(255,255,255,0.06)',
                            color: selectedCategoryFilter === 'all' ? '#0A0C0F' : 'text.secondary',
                            border: '1px solid',
                            borderColor: selectedCategoryFilter === 'all' ? 'primary.main' : 'rgba(255,255,255,0.1)',
                            '&:hover': {
                              bgcolor: selectedCategoryFilter === 'all' ? 'primary.main' : 'rgba(255,255,255,0.12)',
                            },
                          }}
                        />
                        {presentCategoryKeys.map((catKey) => {
                          const catConfig = CATEGORY_CONFIG[catKey] || CATEGORY_CONFIG.goals;
                          const CatIcon = catConfig.icon;
                          const count = categorizedSuggestions.filter((s) => s.category.key === catKey).length;
                          const isSelected = selectedCategoryFilter === catKey;
                          const translatedLabel = t(`analytics.categories.${catKey}`) || catConfig.label;

                          return (
                            <Chip
                              key={catKey}
                              icon={CatIcon ? <CatIcon sx={{ fontSize: '14px !important', color: isSelected ? `${catConfig.color} !important` : 'inherit' }} /> : undefined}
                              label={`${translatedLabel} (${count})`}
                              size="small"
                              onClick={() => setSelectedCategoryFilter(isSelected ? 'all' : catKey)}
                              sx={{
                                fontWeight: 700,
                                fontSize: '0.72rem',
                                cursor: 'pointer',
                                bgcolor: isSelected ? catConfig.bgColor : 'rgba(255,255,255,0.04)',
                                color: isSelected ? catConfig.color : 'text.secondary',
                                border: '1px solid',
                                borderColor: isSelected ? catConfig.color : 'rgba(255,255,255,0.08)',
                                '&:hover': {
                                  borderColor: catConfig.color,
                                  bgcolor: catConfig.bgColor,
                                },
                              }}
                            />
                          );
                        })}
                      </Stack>
                    )}
                  </Stack>

                  <Grid container spacing={2}>
                    {filteredSuggestions.map((item) => {
                      const { category, cleanText } = item;
                      const translatedCategoryLabel = t(`analytics.categories.${category.key}`) || category.label;
                      const CatCardIcon = category.icon;

                      // Check for title:body structure
                      const colonIdx = cleanText.indexOf(':');
                      const hasTitle = colonIdx > 0 && colonIdx < 35;
                      const title = hasTitle ? cleanText.substring(0, colonIdx) : '';
                      const body = hasTitle ? cleanText.substring(colonIdx + 1).trim() : cleanText;

                      return (
                        <Grid item xs={12} sm={6} key={item.id}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: 2.25,
                              borderRadius: 3,
                              bgcolor: 'rgba(255,255,255,0.03)',
                              border: '1px solid',
                              borderColor: category.borderColor,
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'space-between',
                              transition: 'all 0.25s ease',
                              '&:hover': {
                                transform: 'translateY(-2px)',
                                borderColor: category.hoverBorder,
                                boxShadow: `0 8px 24px ${category.bgColor}`,
                              },
                            }}
                          >
                            <Stack spacing={1.25}>
                              {/* Category Header Badge */}
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Chip
                                  icon={CatCardIcon ? <CatCardIcon sx={{ fontSize: '13px !important', color: `${category.color} !important` }} /> : undefined}
                                  label={translatedCategoryLabel}
                                  size="small"
                                  sx={{
                                    bgcolor: category.bgColor,
                                    color: category.color,
                                    fontWeight: 800,
                                    height: 22,
                                    fontSize: '0.68rem',
                                    letterSpacing: '0.03em',
                                    border: `1px solid ${category.borderColor}`,
                                  }}
                                />
                              </Stack>

                              {/* Suggestion Content */}
                              <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.65, fontWeight: 500 }}>
                                {hasTitle && (
                                  <Typography component="span" variant="body2" fontWeight={800} sx={{ color: category.color, mr: 0.5 }}>
                                    {title}:
                                  </Typography>
                                )}
                                {body}
                              </Typography>
                            </Stack>
                          </Paper>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* 4. Data Quality Notes */}
              {aiAnalysis.dataQualityNotes && (
                <Paper
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2.5,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <InfoOutlinedIcon sx={{ fontSize: 18, color: 'text.secondary', mt: 0.2 }} />
                    <Box>
                      <Typography variant="caption" fontWeight={700} color="text.secondary">
                        LOGGING CONSISTENCY & DATA QUALITY NOTES
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
                        {aiAnalysis.dataQualityNotes}
                      </Typography>
                    </Box>
                  </Stack>
                </Paper>
              )}
            </Stack>
          ) : (
            <Box sx={{ py: 3, textAlign: 'center' }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
                Ready to evaluate your training trajectory?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 2.5 }}>
                Click below to send your profile metrics and progress history to our AI analyst for personalized feedback.
              </Typography>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AutoAwesomeRoundedIcon />}
                onClick={() => runAiAnalysis(false)}
                sx={{ fontWeight: 800, borderRadius: 2.5, px: 3.5, py: 1 }}
              >
                Run AI Progress Analysis
              </Button>
            </Box>
          )}
        </Stack>
      </Paper>

      {/* Real Data Visualizations */}
      <Grid container spacing={3}>
        {/* Real Weight Trajectory Chart */}
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Weight Trajectory"
            subtitle="Body weight progression across logged entries"
            action={
              weightChartData.length > 0 ? (
                <Chip
                  label={`Current: ${currentWeight} ${currentWeightUnit}`}
                  size="small"
                  sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', fontWeight: 800 }}
                />
              ) : null
            }
          >
            {weightChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                <AreaChart data={weightChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorWeightAnalytics" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C6FF3E" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#C6FF3E" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#98A1AC', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis
                    tick={{ fill: '#98A1AC', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    domain={[(dataMin) => Math.max(0, Math.floor(dataMin - 3)), (dataMax) => Math.ceil(dataMax + 3)]}
                  />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="weight"
                    name="Body Weight"
                    stroke="#C6FF3E"
                    strokeWidth={2.5}
                    fill="url(#colorWeightAnalytics)"
                    dot={{ r: 6, fill: '#C6FF3E', strokeWidth: 2, stroke: '#0A0C0F' }}
                    activeDot={{ r: 8, strokeWidth: 3 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                <MonitorWeightRoundedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No body weight logged yet.
                </Typography>
                <Button size="small" variant="outlined" onClick={() => navigate('/progress')}>
                  Log Weight
                </Button>
              </Box>
            )}
          </ChartCard>
        </Grid>

        {/* Real Strength Overload Chart */}
        <Grid item xs={12} lg={6}>
          <ChartCard
            title="Compound Lift Progression"
            subtitle="Overload trajectory of logged working weights"
            action={
              totalPRs > 0 ? (
                <Chip
                  icon={<EmojiEventsRoundedIcon sx={{ fontSize: '13px !important', color: '#0A0C0F !important' }} />}
                  label={`${totalPRs} PRs`}
                  size="small"
                  sx={{ bgcolor: '#C6FF3E', color: '#0A0C0F', fontWeight: 800 }}
                />
              ) : null
            }
          >
            {strengthChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%" minHeight={240}>
                <LineChart data={strengthChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#98A1AC', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#98A1AC', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                  <RechartsTooltip content={<CustomChartTooltip />} />
                  <Legend />
                  {Object.keys(strengthChartData[0] || {})
                    .filter((k) => k !== 'name')
                    .map((exName, idx) => {
                      const colors = ['#C6FF3E', '#8A7CFF', '#FF9800', '#2196F3', '#FF6B6B'];
                      const strokeColor = colors[idx % colors.length];
                      return (
                        <Line
                          key={exName}
                          type="monotone"
                          dataKey={exName}
                          name={exName}
                          stroke={strokeColor}
                          strokeWidth={2.5}
                          dot={{ r: 5, fill: strokeColor, strokeWidth: 2, stroke: '#0A0C0F' }}
                          activeDot={{ r: 7 }}
                        />
                      );
                    })}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', py: 4 }}>
                <FitnessCenterRoundedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  No strength lifts logged yet.
                </Typography>
                <Button size="small" variant="outlined" onClick={() => navigate('/progress')}>
                  Log Lifts & PRs
                </Button>
              </Box>
            )}
          </ChartCard>
        </Grid>
      </Grid>

      {/* Explicit User Consent Modal */}
      <Dialog
        open={consentDialogOpen}
        onClose={() => setConsentDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3.5, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' } }}
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 800 }}>
          <SecurityRoundedIcon sx={{ color: 'primary.main' }} /> AI Analysis Data Consent
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: 'text.secondary', lineHeight: 1.7, mb: 2 }}>
            To generate personalized progress assessments and progressive overload directives, GymPilot securely analyzes:
          </DialogContentText>
          <Stack spacing={1} sx={{ mb: 2, pl: 1 }}>
            <Typography variant="body2">• Your physical training profile (age, sex, height, goal, experience, injuries)</Typography>
            <Typography variant="body2">• Logged progress history (body weights, circumference measurements, strength lifts, notes)</Typography>
            <Typography variant="body2">• Progress photo milestone metadata (entry date and camera angles)</Typography>
          </Stack>
          <DialogContentText variant="caption" color="text.secondary">
            Your data is processed strictly for providing your custom analytics and is never shared or sold. You can revoke this consent or re-run analysis at any time.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setConsentDialogOpen(false)} sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Decline
          </Button>
          <Button variant="contained" onClick={handleGrantConsent} sx={{ fontWeight: 800, borderRadius: 2, px: 2.5 }}>
            I Agree & Analyze
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
