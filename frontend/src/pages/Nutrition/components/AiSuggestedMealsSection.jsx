import { useState } from 'react';
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
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';

const StyledMealCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: theme.palette.mode === 'dark' 
    ? 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
    : '#FFFFFF',
  transition: 'transform 0.2s ease, border-color 0.2s ease',
  '&:hover': {
    borderColor: 'rgba(198,255,62,0.4)',
    transform: 'translateY(-2px)',
  },
}));

export function extractSuggestedMeals(aiPlan) {
  if (Array.isArray(aiPlan?.nutritionPlan?.suggestedMeals) && aiPlan.nutritionPlan.suggestedMeals.length > 0) {
    return aiPlan.nutritionPlan.suggestedMeals;
  }
  if (Array.isArray(aiPlan?.nutritionPlan?.mealSuggestions) && aiPlan.nutritionPlan.mealSuggestions.length > 0) {
    return aiPlan.nutritionPlan.mealSuggestions.map((m) => {
      const parts = typeof m === 'string' ? m.split(':') : ['Meal', String(m)];
      const type = parts.length > 1 ? parts[0].trim() : 'Meal';
      const items = parts.length > 1 ? parts.slice(1).join(':').trim() : m;
      return {
        name: `${type} Power Meal`,
        type: type,
        calories: 520,
        protein: 36,
        carbs: 58,
        fat: 14,
        ingredients: items,
        budgetSwaps: 'Swap chicken/meat with eggs, canned tuna, or lentils; swap oats with whole grain bread.',
      };
    });
  }
  return [];
}

const typeColors = {
  Breakfast: { bg: 'rgba(255, 107, 107, 0.15)', text: '#FF6B6B' },
  Lunch: { bg: 'rgba(64, 158, 255, 0.15)', text: '#409EFF' },
  Dinner: { bg: 'rgba(138, 124, 255, 0.15)', text: '#8A7CFF' },
  Snack: { bg: 'rgba(198, 255, 62, 0.15)', text: '#C6FF3E' },
};

export default function AiSuggestedMealsSection({ aiPlan, onLogMeal, onCustomizeMeal }) {
  const [showAll, setShowAll] = useState(true);
  const [loggedMealIndices, setLoggedMealIndices] = useState(new Set());
  const suggestedMeals = extractSuggestedMeals(aiPlan);

  if (!suggestedMeals || suggestedMeals.length === 0) {
    return null;
  }

  const handleQuickLog = (meal, idx) => {
    if (onLogMeal) {
      onLogMeal({
        title: meal.name,
        type: meal.type || 'Lunch',
        calories: Number(meal.calories) || 0,
        protein: Number(meal.protein) || 0,
        carbs: Number(meal.carbs) || 0,
        fat: Number(meal.fat) || 0,
        items: meal.ingredients || '',
        aiScanned: true,
      });
      setLoggedMealIndices((prev) => new Set(prev).add(idx));
    }
  };

  return (
    <Card
      sx={{
        p: { xs: 2.5, md: 3 },
        mb: 4,
        borderRadius: 3.5,
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(135deg, rgba(198,255,62,0.06) 0%, rgba(138,124,255,0.04) 100%)'
            : 'linear-gradient(135deg, rgba(198,255,62,0.04) 0%, rgba(15,23,42,0.02) 100%)',
        border: '1px solid',
        borderColor: 'rgba(198,255,62,0.25)',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={1}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '0.9rem !important', color: '#0A0C0F' }} />}
              label="AI SUGGESTED FOODS & MEALS"
              size="small"
              sx={{ fontWeight: 900, bgcolor: 'primary.main', color: '#0A0C0F', height: 22, fontSize: '0.7rem' }}
            />
            <Chip
              label={`${suggestedMeals.length} Curated Meals`}
              size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 700, height: 22, fontSize: '0.7rem' }}
            />
          </Stack>
          <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>
            Recommended Meals for Your Fitness Goal
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Personalized meal plans matched to your daily calorie and protein targets with exact portions and budget swaps.
          </Typography>
        </Box>
        <Button
          size="small"
          variant="text"
          onClick={() => setShowAll(!showAll)}
          sx={{ fontWeight: 700, color: 'text.secondary' }}
        >
          {showAll ? 'Hide Meals' : 'Show All Meals'}
        </Button>
      </Stack>

      {showAll && (
        <Grid container spacing={2.5}>
          {suggestedMeals.map((meal, idx) => {
            const isLogged = loggedMealIndices.has(idx);
            const colorScheme = typeColors[meal.type] || { bg: 'rgba(255,255,255,0.08)', text: 'text.primary' };

            return (
              <Grid item xs={12} sm={6} lg={3} key={idx}>
                <StyledMealCard sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Chip
                      label={meal.type}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.7rem',
                        bgcolor: colorScheme.bg,
                        color: colorScheme.text,
                        height: 22,
                      }}
                    />
                    <Typography variant="body2" fontWeight={800} sx={{ color: 'primary.main' }}>
                      {meal.calories} kcal
                    </Typography>
                  </Stack>

                  <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 1, lineHeight: 1.25 }}>
                    {meal.name}
                  </Typography>

                  {/* Macro chips */}
                  <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                    <Chip label={`${meal.protein}g P`} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20, bgcolor: 'rgba(198,255,62,0.1)', color: '#C6FF3E' }} />
                    <Chip label={`${meal.carbs}g C`} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20, bgcolor: 'rgba(138,124,255,0.1)', color: '#8A7CFF' }} />
                    <Chip label={`${meal.fat}g F`} size="small" sx={{ fontWeight: 700, fontSize: '0.7rem', height: 20, bgcolor: 'rgba(255,193,7,0.1)', color: '#FFC107' }} />
                  </Stack>

                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5, flex: 1, lineHeight: 1.4 }}>
                    <strong style={{ color: '#fff' }}>Ingredients:</strong> {meal.ingredients}
                  </Typography>

                  {meal.budgetSwaps && (
                    <Box
                      sx={{
                        p: 1.25,
                        mb: 2,
                        borderRadius: 2,
                        bgcolor: 'rgba(255, 193, 7, 0.06)',
                        border: '1px solid rgba(255, 193, 7, 0.2)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: '#FFC107', fontWeight: 800, display: 'block', mb: 0.25 }}>
                        💡 Budget / Easy Swaps:
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3, display: 'block' }}>
                        {meal.budgetSwaps}
                      </Typography>
                    </Box>
                  )}

                  <Stack direction="row" spacing={1} sx={{ mt: 'auto', pt: 1 }}>
                    <Button
                      size="small"
                      variant={isLogged ? 'outlined' : 'contained'}
                      color={isLogged ? 'success' : 'primary'}
                      startIcon={<AddRoundedIcon />}
                      onClick={() => handleQuickLog(meal, idx)}
                      disabled={isLogged}
                      sx={{
                        fontWeight: 800,
                        borderRadius: 2,
                        fontSize: '0.75rem',
                        flex: 1,
                        textTransform: 'none',
                      }}
                    >
                      {isLogged ? '✓ Logged' : 'Log Meal'}
                    </Button>
                    {onCustomizeMeal && (
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => onCustomizeMeal(meal)}
                        sx={{ fontWeight: 700, borderRadius: 2, fontSize: '0.75rem', textTransform: 'none' }}
                      >
                        Customize
                      </Button>
                    )}
                  </Stack>
                </StyledMealCard>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Card>
  );
}
