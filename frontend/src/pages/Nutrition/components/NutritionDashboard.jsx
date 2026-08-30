import { Box, Button, Card, Chip, Grid, Stack, Typography, styled, CircularProgress } from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GrainRoundedIcon from '@mui/icons-material/GrainRounded';
import FastfoodRoundedIcon from '@mui/icons-material/FastfoodRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ProgressBar from '../../../components/ui/ProgressBar';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

function MacroCard({ macro }) {
  const percentage = Math.min((macro.current / macro.target) * 100, 100);
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

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        {remaining > 0 ? `${remaining} ${macro.unit} remaining` : 'Target reached!'}
      </Typography>
    </StyledCard>
  );
}

export default function NutritionDashboard({ aiPlan, loading }) {
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

  const displayMacros = [
    { id: 'calories', name: 'Calories', current: Math.round(targetCalories * 0.75), target: targetCalories, unit: 'kcal', icon: <LocalFireDepartmentRoundedIcon />, color: '#FF6B6B' },
    { id: 'protein', name: 'Protein', current: Math.round(targetProtein * 0.75), target: targetProtein, unit: 'g', icon: <FitnessCenterRoundedIcon />, color: '#C6FF3E' },
    { id: 'carbs', name: 'Carbs', current: Math.round(targetCarbs * 0.75), target: targetCarbs, unit: 'g', icon: <GrainRoundedIcon />, color: '#8A7CFF' },
    { id: 'fat', name: 'Fat', current: Math.round(targetFat * 0.75), target: targetFat, unit: 'g', icon: <FastfoodRoundedIcon />, color: '#FFC107' },
  ];

  // Dynamic meal suggestions parsing
  const mealSuggestions = aiPlan?.nutritionPlan?.mealSuggestions || [];
  const parsedMeals = mealSuggestions.length > 0 ? mealSuggestions.map((suggestion, idx) => {
    const parts = suggestion.split(':');
    let title = `Meal ${idx + 1}`;
    let items = suggestion;
    if (parts.length > 1) {
      title = parts[0].trim();
      items = parts.slice(1).join(':').trim();
    }
    const cal = Math.round(targetCalories / mealSuggestions.length);
    return { title, items, calories: cal };
  }) : [
    { title: 'Breakfast', items: 'Scrambled eggs with whole grain toast', calories: Math.round(targetCalories * 0.25) },
    { title: 'Lunch', items: 'Grilled chicken breast with quinoa and vegetables', calories: Math.round(targetCalories * 0.35) },
    { title: 'Dinner', items: 'Lean beef stir-fry with brown rice', calories: Math.round(targetCalories * 0.30) },
    { title: 'Snacks', items: 'Greek yogurt with almonds and honey', calories: Math.round(targetCalories * 0.10) },
  ];

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {displayMacros.map((macro) => (
          <Grid item xs={12} sm={6} md={3} key={macro.id}>
            <MacroCard macro={macro} />
          </Grid>
        ))}
      </Grid>

      <StyledCard sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
            Today's AI Recommended Meals
          </Typography>
          <Button variant="outlined" startIcon={<AddRoundedIcon />} size="small">
            Add Custom Meal
          </Button>
        </Stack>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {parsedMeals.map((meal, idx) => (
            <Box
              key={idx}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                p: 2,
                borderRadius: 2,
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid',
                borderColor: 'rgba(255,255,255,0.06)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Chip
                  size="small"
                  label={meal.title}
                  sx={{ fontWeight: 600, bgcolor: 'rgba(198,255,62,0.1)', color: '#C6FF3E', border: '1px solid', borderColor: 'rgba(198,255,62,0.2)' }}
                />
                <Box>
                  <Typography variant="body2" fontWeight={600}>{meal.items}</Typography>
                  <Typography variant="caption" color="text.secondary">Est. {meal.calories} kcal</Typography>
                </Box>
              </Box>
              <Button variant="outlined" size="small">Edit</Button>
            </Box>
          ))}
        </Box>
      </StyledCard>
    </Box>
  );
}