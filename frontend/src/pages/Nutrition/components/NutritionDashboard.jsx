import { Box, Button, Card, Chip, Grid, Stack, Typography, styled, CircularProgress, Paper, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GrainRoundedIcon from '@mui/icons-material/GrainRounded';
import FastfoodRoundedIcon from '@mui/icons-material/FastfoodRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import WaterDropRoundedIcon from '@mui/icons-material/WaterDropRounded';
import ProgressBar from '../../../components/ui/ProgressBar';
import RecommendedSupplements from '../../../components/RecommendedSupplements';

const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

function MacroCard({ macro }) {
  const percentage = Math.min((macro.current / Math.max(macro.target, 1)) * 100, 100);
  const remaining = Math.max(0, macro.target - macro.current);

  return (
    <StyledCard sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: `${macro.color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {macro.icon}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0 }}>
            {macro.name}
          </Typography>
        </Box>
        <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: macro.color }}>
          {macro.current}
        </Typography>
      </Stack>

      <Box sx={{ mb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {macro.current} / {macro.target} {macro.unit}
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700, color: macro.color }}>
            {Math.round(percentage)}%
          </Typography>
        </Stack>
        <ProgressBar value={macro.current} max={macro.target} color={macro.color} size="md" />
      </Box>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 'auto' }}>
        {remaining > 0 ? `${remaining} ${macro.unit} remaining` : 'Target reached!'}
      </Typography>
    </StyledCard>
  );
}

export default function NutritionDashboard({ aiPlan, loading, dailyNutrition, nutritionTotals, updateWater }) {
  const navigate = useNavigate();

  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading your personalized nutrition plan...</Typography>
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

  const displayMacros = [
    { id: 'calories', name: 'Calories', current: currentCalories, target: targetCalories, unit: 'kcal', icon: <LocalFireDepartmentRoundedIcon />, color: '#FF6B6B' },
    { id: 'protein', name: 'Protein', current: currentProtein, target: targetProtein, unit: 'g', icon: <FitnessCenterRoundedIcon />, color: '#C6FF3E' },
    { id: 'carbs', name: 'Carbs', current: currentCarbs, target: targetCarbs, unit: 'g', icon: <GrainRoundedIcon />, color: '#8A7CFF' },
    { id: 'fat', name: 'Fat', current: currentFat, target: targetFat, unit: 'g', icon: <FastfoodRoundedIcon />, color: '#FFC107' },
  ];

  const loggedMeals = dailyNutrition?.meals || [];
  const waterLiters = dailyNutrition?.waterLiters || 2.0;
  const waterTarget = dailyNutrition?.waterTargetLiters || 3.5;

  return (
    <Box>
      {/* 4 Macro Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {displayMacros.map((macro) => (
          <Grid item xs={12} sm={6} md={3} key={macro.id}>
            <MacroCard macro={macro} />
          </Grid>
        ))}
      </Grid>

      {/* Water & Quick Scanner Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Hydration Widget */}
        <Grid item xs={12} md={6}>
          <StyledCard sx={{ p: 3, height: '100%' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    bgcolor: 'rgba(64,158,255,0.15)',
                    color: '#409EFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <WaterDropRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={800}>
                    Daily Hydration
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Target: {waterTarget} L / day
                  </Typography>
                </Box>
              </Stack>
              <Typography variant="h5" fontWeight={800} color="#409EFF">
                {waterLiters} L
              </Typography>
            </Stack>

            <Box sx={{ mb: 2 }}>
              <ProgressBar value={waterLiters} max={waterTarget} color="#409EFF" size="md" />
            </Box>

            <Stack direction="row" spacing={1} justifyContent="flex-end">
              <Button
                variant="outlined"
                size="small"
                startIcon={<RemoveRoundedIcon />}
                onClick={() => updateWater(Math.max(0, waterLiters - 0.25))}
                sx={{ borderRadius: 2 }}
              >
                -250ml
              </Button>
              <Button
                variant="contained"
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => updateWater(waterLiters + 0.25)}
                sx={{ borderRadius: 2, bgcolor: '#409EFF', '&:hover': { bgcolor: '#2b85e4' } }}
              >
                +250ml Glass
              </Button>
            </Stack>
          </StyledCard>
        </Grid>

        {/* AI Food Scanner Promo */}
        <Grid item xs={12} md={6}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'rgba(198,255,62,0.3)',
              background: 'linear-gradient(135deg, rgba(198,255,62,0.08), rgba(255,255,255,0.02))',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              height: '100%',
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                <AutoAwesomeRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="h6" fontWeight={800}>
                  AI Calorie & Food Vision
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary">
                Don't guess calories. Snap a photo of your plate and let AI calculate portion sizes, macros, and nutrients instantly.
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/calories-calculator')}
              startIcon={<AutoAwesomeRoundedIcon />}
              sx={{ borderRadius: 2.5, fontWeight: 700, alignSelf: 'flex-start' }}
            >
              Scan Food Photo Now
            </Button>
          </Paper>
        </Grid>
      </Grid>

      {/* Today's Logged Meals Summary */}
      <StyledCard sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
              Today's Logged Meals ({loggedMeals.length})
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Consumed: <strong>{currentCalories} kcal</strong> · {currentProtein}g Protein
            </Typography>
          </Box>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            size="small"
            onClick={() => navigate('/calories-calculator')}
            sx={{ borderRadius: 2 }}
          >
            + AI Scan Meal
          </Button>
        </Stack>

        {loggedMeals.length === 0 ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary">
              No meals logged today yet. Click "AI Food Scanner" to analyze and log your first meal!
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            {loggedMeals.map((meal) => (
              <Paper
                key={meal.id}
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(255,255,255,0.02)',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Chip
                    label={meal.type || 'Meal'}
                    size="small"
                    sx={{
                      fontWeight: 700,
                      bgcolor: meal.aiScanned ? 'rgba(198,255,62,0.12)' : 'rgba(255,255,255,0.08)',
                      color: meal.aiScanned ? 'primary.main' : 'text.primary',
                    }}
                  />
                  <Box>
                    <Typography variant="body1" fontWeight={700}>
                      {meal.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {meal.items || 'Meal items'} · {meal.time}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={2} alignItems="center">
                  <Chip label={`${meal.calories} kcal`} size="small" sx={{ fontWeight: 800, color: '#FF6B6B' }} />
                  <Chip label={`${meal.protein}g P`} size="small" sx={{ fontWeight: 800, color: '#C6FF3E' }} />
                  <Chip label={`${meal.carbs}g C`} size="small" sx={{ fontWeight: 800, color: '#8A7CFF' }} />
                  <Chip label={`${meal.fat}g F`} size="small" sx={{ fontWeight: 800, color: '#FFC107' }} />
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </StyledCard>

      {/* AI Recommended Supplement Blueprint */}
      <RecommendedSupplements
        supplementPlan={aiPlan?.supplementPlan}
        userGoal={aiPlan?.goal}
      />
    </Box>
  );
}