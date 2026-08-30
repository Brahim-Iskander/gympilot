import { Box, Card, Grid, Stack, Typography, styled, CircularProgress } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GrainRoundedIcon from '@mui/icons-material/GrainRounded';
import FastfoodRoundedIcon from '@mui/icons-material/FastfoodRounded';
import ProgressBar from '../../../components/ui/ProgressBar';
import ProgressRing from '../../../components/ui/ProgressRing';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const baseMacroIcons = [
  { id: 'protein', name: 'Protein', color: '#C6FF3E', icon: <FitnessCenterRoundedIcon />, caloriesPerGram: 4 },
  { id: 'carbs', name: 'Carbohydrates', color: '#8A7CFF', icon: <GrainRoundedIcon />, caloriesPerGram: 4 },
  { id: 'fat', name: 'Fat', color: '#FFC107', icon: <FastfoodRoundedIcon />, caloriesPerGram: 9 },
];

function MacroRing({ macro }) {
  const percentage = Math.min((macro.current / macro.target) * 100, 100);
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
  const percentage = Math.min((macro.current / macro.target) * 100, 100);
  const remaining = Math.max(0, macro.target - macro.current);

  return (
    <StyledCard sx={{ p: 3, height: '100%' }}>
      <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2 }}>
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
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
          {macro.current}g
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {remaining > 0 ? `${remaining}g remaining` : 'Target reached!'}
        </Typography>
      </Stack>
    </StyledCard>
  );
}

export default function Macros({ aiPlan, loading }) {
  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading macro breakdown...</Typography>
      </Box>
    );
  }

  const targetProtein = aiPlan?.nutritionPlan?.protein || 160;
  const targetCarbs = aiPlan?.nutritionPlan?.carbs || 230;
  const targetFat = aiPlan?.nutritionPlan?.fat || 70;

  const displayMacroData = [
    { ...baseMacroIcons[0], current: Math.round(targetProtein * 0.75), target: targetProtein, unit: 'g' },
    { ...baseMacroIcons[1], current: Math.round(targetCarbs * 0.75), target: targetCarbs, unit: 'g' },
    { ...baseMacroIcons[2], current: Math.round(targetFat * 0.75), target: targetFat, unit: 'g' },
  ];

  const totalCalories = displayMacroData.reduce((sum, m) => sum + m.current * m.caloriesPerGram, 0);
  const targetCalories = displayMacroData.reduce((sum, m) => sum + m.target * m.caloriesPerGram, 0);

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Macro Breakdown
        </Typography>
      </Stack>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {displayMacroData.map((macro) => (
          <Grid item xs={12} md={4} key={macro.id}>
            <MacroRing macro={macro} />
          </Grid>
        ))}
      </Grid>

      <StyledCard sx={{ p: 3, mb: 4 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
            Calorie Summary
          </Typography>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(198,255,62,0.15), rgba(138,124,255,0.15))',
              border: '1px solid',
              borderColor: 'rgba(198,255,62,0.3)',
            }}
          >
            <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#C6FF3E' }}>
              {totalCalories} / {targetCalories} kcal
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {targetCalories - totalCalories > 0 ? `${targetCalories - totalCalories} kcal remaining` : 'Target exceeded!'}
            </Typography>
          </Box>
        </Stack>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 3 }}>
          {displayMacroData.map((macro) => (
            <MacroBar key={macro.id} macro={macro} />
          ))}
        </Box>
      </StyledCard>

      <StyledCard sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 3 }}>
          Daily Distribution
        </Typography>
        <Grid container spacing={2}>
          {displayMacroData.map((macro) => (
            <Grid item xs={12} md={4} key={macro.id}>
              <Box sx={{ p: 2, borderRadius: 2, background: `rgba(255,255,255,0.02)`, border: '1px solid', borderColor: 'rgba(255,255,255,0.06)' }}>
                <Stack direction="row" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: `${macro.color}22`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {macro.icon}
                  </Box>
                  <Typography variant="h6" sx={{ fontWeight: 800, color: macro.color }}>
                    {macro.name}
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Current</Typography>
                    <Typography variant="body2" fontWeight={600}>{macro.current}g</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Target</Typography>
                    <Typography variant="body2" fontWeight={600}>{macro.target}g</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Calories</Typography>
                    <Typography variant="body2" fontWeight={600}>{macro.current * macro.caloriesPerGram} kcal</Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">% of Total</Typography>
                    <Typography variant="body2" fontWeight={600}>{Math.round((macro.current * macro.caloriesPerGram / (totalCalories || 1)) * 100)}%</Typography>
                  </Stack>
                </Stack>
              </Box>
            </Grid>
          ))}
        </Grid>
      </StyledCard>
    </Box>
  );
}