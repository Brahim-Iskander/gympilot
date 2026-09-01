import { Box, Card, Grid, Stack, Typography, styled, CircularProgress } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GrainRoundedIcon from '@mui/icons-material/GrainRounded';
import FastfoodRoundedIcon from '@mui/icons-material/FastfoodRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import ProgressBar from '../../../components/ui/ProgressBar';
import ProgressRing from '../../../components/ui/ProgressRing';

const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

function MacroRing({ macro }) {
  const percentage = Math.min((macro.current / Math.max(macro.target, 1)) * 100, 100);
  const remaining = Math.max(0, macro.target - macro.current);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', px: 2 }}>
      <ProgressRing
        value={macro.current}
        max={macro.target}
        color={macro.color}
        size={140}
        strokeWidth={10}
        showValue
      >
        <Typography variant="caption" color="text.secondary">
          {Math.round(percentage)}%
        </Typography>
      </ProgressRing>
      <Stack spacing={0.5} sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: macro.color }}>
          {macro.current}g
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {macro.current} / {macro.target} {macro.unit}
        </Typography>
        <Typography variant="caption" sx={{ color: macro.color, fontWeight: 600 }}>
          {remaining > 0 ? `${remaining}g remaining` : 'Target reached!'}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {macro.current * macro.caloriesPerGram} kcal
        </Typography>
      </Stack>
    </Box>
  );
}

function MacroBar({ macro }) {
  const percentage = Math.min((macro.current / Math.max(macro.target, 1)) * 100, 100);
  const remaining = Math.max(0, macro.target - macro.current);

  return (
    <StyledCard sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2.5,
            bgcolor: `${macro.color}22`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {macro.icon}
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            {macro.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {macro.current} / {macro.target} {macro.unit} • {macro.current * macro.caloriesPerGram} kcal
          </Typography>
        </Box>
      </Stack>

      <ProgressBar value={macro.current} max={macro.target} color={macro.color} size="lg" showLabel label={`${Math.round(percentage)}%`} />

      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2 }}>
        <Typography variant="body2" sx={{ fontWeight: 600, color: macro.color }}>
          {Math.round(percentage)}% of target
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {remaining > 0 ? `${remaining} ${macro.unit} remaining` : 'Target reached!'}
        </Typography>
      </Stack>
    </StyledCard>
  );
}

export default function Macros({ aiPlan, loading, dailyNutrition, nutritionTotals }) {
  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading macro ratios...</Typography>
      </Box>
    );
  }

  const targetCalories = aiPlan?.nutritionPlan?.dailyCalories || 2200;
  const targetProtein = aiPlan?.nutritionPlan?.protein || 160;
  const targetCarbs = aiPlan?.nutritionPlan?.carbs || 230;
  const targetFat = aiPlan?.nutritionPlan?.fat || 70;

  const currentCalories = nutritionTotals?.calories || 0;
  const currentProtein = nutritionTotals?.protein || 0;
  const currentCarbs = nutritionTotals?.carbs || 0;
  const currentFat = nutritionTotals?.fat || 0;

  const macros = [
    { id: 'protein', name: 'Protein', current: currentProtein, target: targetProtein, unit: 'g', color: '#C6FF3E', icon: <FitnessCenterRoundedIcon />, caloriesPerGram: 4 },
    { id: 'carbs', name: 'Carbohydrates', current: currentCarbs, target: targetCarbs, unit: 'g', color: '#8A7CFF', icon: <GrainRoundedIcon />, caloriesPerGram: 4 },
    { id: 'fat', name: 'Fats', current: currentFat, target: targetFat, unit: 'g', color: '#FFC107', icon: <FastfoodRoundedIcon />, caloriesPerGram: 9 },
  ];

  const totalCalculatedKcal = currentProtein * 4 + currentCarbs * 4 + currentFat * 9;
  const pPct = totalCalculatedKcal > 0 ? Math.round(((currentProtein * 4) / totalCalculatedKcal) * 100) : 30;
  const cPct = totalCalculatedKcal > 0 ? Math.round(((currentCarbs * 4) / totalCalculatedKcal) * 100) : 45;
  const fPct = totalCalculatedKcal > 0 ? Math.round(((currentFat * 9) / totalCalculatedKcal) * 100) : 25;

  return (
    <Box>
      {/* Visual Macro Summary Banner */}
      <StyledCard sx={{ p: 4, mb: 4 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Stack spacing={1}>
              <Typography variant="overline" color="text.secondary" fontWeight={700}>
                Macro Caloric Split
              </Typography>
              <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
                {currentCalories} / {targetCalories} kcal
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {Math.max(0, targetCalories - currentCalories)} kcal remaining to hit your target today.
              </Typography>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Box sx={{ display: 'flex', width: '100%', height: 18, borderRadius: 3, overflow: 'hidden', mb: 2 }}>
              <Box sx={{ width: `${pPct}%`, bgcolor: '#C6FF3E', transition: 'width 0.4s ease' }} title={`Protein: ${pPct}%`} />
              <Box sx={{ width: `${cPct}%`, bgcolor: '#8A7CFF', transition: 'width 0.4s ease' }} title={`Carbs: ${cPct}%`} />
              <Box sx={{ width: `${fPct}%`, bgcolor: '#FFC107', transition: 'width 0.4s ease' }} title={`Fat: ${fPct}%`} />
            </Box>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#C6FF3E' }} />
                <Typography variant="body2" fontWeight={600}>Protein ({pPct}%)</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#8A7CFF' }} />
                <Typography variant="body2" fontWeight={600}>Carbs ({cPct}%)</Typography>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: '#FFC107' }} />
                <Typography variant="body2" fontWeight={600}>Fats ({fPct}%)</Typography>
              </Stack>
            </Stack>
          </Grid>
        </Grid>
      </StyledCard>

      {/* 3 Macro Detailed Progress Bars */}
      <Grid container spacing={3}>
        {macros.map((macro) => (
          <Grid item xs={12} md={4} key={macro.id}>
            <MacroBar macro={macro} />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}