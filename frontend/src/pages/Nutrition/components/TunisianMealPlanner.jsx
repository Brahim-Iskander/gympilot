import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  Typography,
  Slider,
  TextField,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Checkbox,
  FormControlLabel,
  Paper,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import RestaurantMenuRoundedIcon from '@mui/icons-material/RestaurantMenuRounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import TipsAndUpdatesRoundedIcon from '@mui/icons-material/TipsAndUpdatesRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';

import { aiService } from '../../../services/aiService';

const BUDGET_PRESETS = [
  {
    tier: 'BUDGET',
    label: 'Économique / Étudiant',
    dailyBudget: 13.5,
    weeklyBudget: 94.5,
    subtitle: 'Œufs frais, Thon, Lentilles, Avoine, Ricotta & Kawkaw',
    color: '#00E676',
  },
  {
    tier: 'BALANCED',
    label: 'Équilibré / Fitness Standard',
    dailyBudget: 21.0,
    weeklyBudget: 147.0,
    subtitle: 'Escalope de dinde, Thon El Manar, Riz Randa, Dattes, Huile d’olive',
    color: '#C6FF3E',
  },
  {
    tier: 'PERFORMANCE',
    label: 'Performance / Prise de Masse',
    dailyBudget: 34.0,
    weeklyBudget: 238.0,
    subtitle: 'Escalope, Steak bœuf, Amandes, Patates douces, Poissons nobles',
    color: '#FFB300',
  },
];

export default function TunisianMealPlanner({ onLogMeal }) {
  const [selectedTier, setSelectedTier] = useState('BALANCED');
  const [customBudget, setCustomBudget] = useState(21.0);
  const [mealCount, setMealCount] = useState(4);
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loggedMeals, setLoggedMeals] = useState(new Set());
  const [checkedGroceries, setCheckedGroceries] = useState(new Set());

  const fetchPlan = async (tier = selectedTier, budget = customBudget, count = mealCount) => {
    setLoading(true);
    setError('');
    try {
      const data = await aiService.generateTunisianMealPlan({
        budgetTier: tier,
        customDailyBudgetTnd: budget,
        mealCount: count,
      });
      setPlan(data);
    } catch (err) {
      console.error('Failed to load meal plan:', err);
      setError('Impossible de générer le plan pour le moment. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan('BALANCED', 21.0, 4);
  }, []);

  const handleSelectTier = (preset) => {
    setSelectedTier(preset.tier);
    setCustomBudget(preset.dailyBudget);
    fetchPlan(preset.tier, preset.dailyBudget, mealCount);
  };

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
      setLoggedMeals((prev) => new Set(prev).add(idx));
    }
  };

  const toggleGroceryItem = (id) => {
    setCheckedGroceries((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Box sx={{ pb: 6 }}>
      {/* Top Hero Banner */}
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          mb: 4,
          borderRadius: 4,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(198, 255, 62, 0.1) 0%, rgba(30, 41, 59, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(198, 255, 62, 0.15) 0%, rgba(241, 245, 249, 0.9) 100%)',
          border: '1px solid',
          borderColor: 'rgba(198, 255, 62, 0.3)',
        }}
      >
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
            <Chip
              icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '1rem !important', color: '#C6FF3E' }} />}
              label="Intelligence Nutritionnelle · Marché Tunisien"
              sx={{
                fontWeight: 800,
                fontSize: '0.78rem',
                bgcolor: 'rgba(198, 255, 62, 0.15)',
                color: 'primary.main',
                border: '1px solid rgba(198, 255, 62, 0.3)',
              }}
            />
            <Chip
              icon={<MonetizationOnRoundedIcon sx={{ fontSize: '1rem !important', color: '#00E676' }} />}
              label="Tarification Réelle en Dinars Tunisiens (TND)"
              sx={{
                fontWeight: 700,
                fontSize: '0.78rem',
                bgcolor: 'rgba(0, 230, 118, 0.12)',
                color: '#00E676',
                border: '1px solid rgba(0, 230, 118, 0.25)',
              }}
            />
          </Stack>

          <Typography
            variant="h4"
            sx={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 900,
              fontSize: { xs: '1.75rem', sm: '2.25rem' },
              background: 'linear-gradient(135deg, #FFFFFF 40%, #C6FF3E 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            Planificateur de Repas Tunisien Personnalisé
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 780, fontSize: '0.95rem' }}>
            Un programme alimentaire calibré sur votre profil physique (onboarding), vos besoins caloriques journaliers, et votre budget en Dinars Tunisiens. 
            Conçu exclusivement avec des aliments trouvables dans nos marchés (souks), boucheries et supermarchés locaux (Monoprix, Carrefour, MG).
          </Typography>

          {plan?.profileSummary && (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.5,
                p: 1.5,
                bgcolor: 'rgba(255, 255, 255, 0.04)',
                borderRadius: 2.5,
                border: '1px solid rgba(255, 255, 255, 0.08)',
                width: 'fit-content',
              }}
            >
              <FitnessCenterRoundedIcon sx={{ color: 'primary.main', fontSize: '1.2rem' }} />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                Profil Synchronisé : <span style={{ color: '#C6FF3E' }}>{plan.profileSummary}</span>
              </Typography>
            </Box>
          )}
        </Stack>
      </Card>

      {/* Budget & Parameter Controls */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 4,
          borderRadius: 3.5,
          border: '1px solid',
          borderColor: 'divider',
          background: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : '#FFFFFF',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Sora', sans-serif" }}>
          1. Définissez Votre Budget en Dinars Tunisiens (TND)
        </Typography>

        <Grid container spacing={2} sx={{ mb: 3 }}>
          {BUDGET_PRESETS.map((preset) => {
            const isSelected = selectedTier === preset.tier;
            return (
              <Grid item xs={12} md={4} key={preset.tier}>
                <Paper
                  onClick={() => handleSelectTier(preset)}
                  sx={{
                    p: 2.5,
                    cursor: 'pointer',
                    borderRadius: 3,
                    border: '2px solid',
                    borderColor: isSelected ? preset.color : 'rgba(255, 255, 255, 0.08)',
                    bgcolor: isSelected ? 'rgba(198, 255, 62, 0.06)' : 'transparent',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                      borderColor: preset.color,
                    },
                  }}
                >
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {preset.label}
                      </Typography>
                      {isSelected && <CheckCircleRoundedIcon sx={{ color: preset.color, fontSize: '1.25rem' }} />}
                    </Stack>

                    <Typography
                      variant="h5"
                      sx={{ fontWeight: 900, color: preset.color, fontFamily: "'Sora', sans-serif" }}
                    >
                      ~{preset.dailyBudget.toFixed(1)} DT <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>/ jour</span>
                    </Typography>

                    <Typography variant="caption" color="text.secondary">
                      Soit environ <b>{preset.weeklyBudget.toFixed(1)} DT</b> par semaine
                    </Typography>

                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', pt: 0.5 }}>
                      {preset.subtitle}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            );
          })}
        </Grid>

        <Divider sx={{ my: 2.5 }} />

        {/* Custom Slider and Meal Count */}
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm={6} md={5}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              Budget Journalier Précis : <span style={{ color: '#C6FF3E' }}>{customBudget.toFixed(1)} DT / jour</span>
            </Typography>
            <Slider
              value={customBudget}
              min={10}
              max={50}
              step={1}
              onChange={(e, val) => {
                setCustomBudget(val);
                setSelectedTier('CUSTOM');
              }}
              sx={{ color: '#C6FF3E' }}
            />
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body2" sx={{ fontWeight: 700, mb: 1 }}>
              Nombre de Repas par Jour :
            </Typography>
            <Stack direction="row" spacing={1}>
              {[3, 4, 5].map((cnt) => (
                <Button
                  key={cnt}
                  variant={mealCount === cnt ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => setMealCount(cnt)}
                  sx={{
                    minWidth: 48,
                    fontWeight: 800,
                    borderRadius: 2,
                    ...(mealCount === cnt ? { bgcolor: 'primary.main', color: '#000' } : {}),
                  }}
                >
                  {cnt} repas
                </Button>
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
            <Button
              variant="contained"
              fullWidth
              disabled={loading}
              onClick={() => fetchPlan(selectedTier, customBudget, mealCount)}
              startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <ReplayRoundedIcon />}
              sx={{
                py: 1.2,
                fontWeight: 900,
                borderRadius: 2.5,
                boxShadow: '0 4px 16px rgba(198, 255, 62, 0.25)',
              }}
            >
              {loading ? 'Calcul en cours...' : 'Régénérer le Plan'}
            </Button>
          </Grid>
        </Grid>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>
          {error}
        </Alert>
      )}

      {/* Target Macros & Daily Budget Overview */}
      {plan && (
        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                CALORIES CIBLE
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', mt: 0.5 }}>
                {Math.round(plan.targetCalories)} <span style={{ fontSize: '0.8rem' }}>kcal</span>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                PROTÉINES
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#409EFF', mt: 0.5 }}>
                {plan.targetProteinGrams} <span style={{ fontSize: '0.8rem' }}>g</span>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                GLUCIDES
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#FFB300', mt: 0.5 }}>
                {plan.targetCarbsGrams} <span style={{ fontSize: '0.8rem' }}>g</span>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={6} sm={4} md={2.4}>
            <Paper sx={{ p: 2, borderRadius: 3, textAlign: 'center', bgcolor: 'rgba(255, 255, 255, 0.03)' }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                LIPIDES
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#FF6B6B', mt: 0.5 }}>
                {plan.targetFatGrams} <span style={{ fontSize: '0.8rem' }}>g</span>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} sm={8} md={2.4}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 3,
                textAlign: 'center',
                bgcolor: 'rgba(0, 230, 118, 0.08)',
                border: '1px solid rgba(0, 230, 118, 0.25)',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, color: '#00E676' }}>
                COÛT QUOTIDIEN
              </Typography>
              <Typography variant="h5" sx={{ fontWeight: 900, color: '#00E676', mt: 0.5 }}>
                {plan.totalDailyCostTnd.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>DT / j</span>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* Planned Meals List */}
      {plan?.meals && (
        <Box sx={{ mb: 5 }}>
          <Typography variant="h5" sx={{ fontWeight: 900, mb: 3, fontFamily: "'Sora', sans-serif" }}>
            2. Vos Repas Typiques du Marché Tunisien
          </Typography>

          <Grid container spacing={3}>
            {plan.meals.map((meal, idx) => {
              const isLogged = loggedMeals.has(idx);

              return (
                <Grid item xs={12} md={6} key={meal.id || idx}>
                  <Card
                    sx={{
                      p: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      borderRadius: 3.5,
                      border: '1px solid',
                      borderColor: 'divider',
                      background: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
                          : '#FFFFFF',
                      transition: 'transform 0.2s ease, border-color 0.2s ease',
                      '&:hover': {
                        borderColor: 'rgba(198, 255, 62, 0.4)',
                        transform: 'translateY(-3px)',
                      },
                    }}
                  >
                    {/* Header: Type & Cost */}
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
                      <Chip
                        label={meal.type.toUpperCase()}
                        size="small"
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.72rem',
                          bgcolor:
                            meal.type === 'Breakfast'
                              ? 'rgba(255, 107, 107, 0.15)'
                              : meal.type === 'Lunch'
                              ? 'rgba(64, 158, 255, 0.15)'
                              : meal.type === 'Dinner'
                              ? 'rgba(138, 124, 255, 0.15)'
                              : 'rgba(198, 255, 62, 0.15)',
                          color:
                            meal.type === 'Breakfast'
                              ? '#FF6B6B'
                              : meal.type === 'Lunch'
                              ? '#409EFF'
                              : meal.type === 'Dinner'
                              ? '#8A7CFF'
                              : '#C6FF3E',
                        }}
                      />

                      <Chip
                        label={`~${meal.estimatedCostTnd.toFixed(2)} DT`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          bgcolor: 'rgba(0, 230, 118, 0.12)',
                          color: '#00E676',
                          border: '1px solid rgba(0, 230, 118, 0.25)',
                        }}
                      />
                    </Stack>

                    {/* Meal Name */}
                    <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontFamily: "'Sora', sans-serif" }}>
                      {meal.name}
                    </Typography>

                    {/* Macro pills */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                      <Chip label={`${meal.calories} kcal`} size="small" sx={{ fontWeight: 700 }} />
                      <Chip label={`P: ${meal.protein}g`} size="small" sx={{ fontWeight: 700, color: '#409EFF' }} />
                      <Chip label={`G: ${meal.carbs}g`} size="small" sx={{ fontWeight: 700, color: '#FFB300' }} />
                      <Chip label={`L: ${meal.fat}g`} size="small" sx={{ fontWeight: 700, color: '#FF6B6B' }} />
                    </Stack>

                    {/* Ingredients with portions */}
                    <Box sx={{ mb: 2, flexGrow: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        INGRÉDIENTS & PORTIONS :
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.primary', lineHeight: 1.5 }}>
                        {meal.ingredients}
                      </Typography>
                    </Box>

                    {/* Prep Tips */}
                    {meal.recipeTips && (
                      <Box sx={{ mb: 2, p: 1.5, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2 }}>
                        <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                          PRÉPARATION RAPIDE :
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          {meal.recipeTips}
                        </Typography>
                      </Box>
                    )}

                    {/* Budget Swap */}
                    {meal.budgetSwaps && (
                      <Stack direction="row" spacing={1} alignItems="flex-start" sx={{ mb: 2.5 }}>
                        <TipsAndUpdatesRoundedIcon sx={{ color: '#FFB300', fontSize: '1.1rem', mt: 0.2 }} />
                        <Typography variant="caption" sx={{ color: '#cbd5e1' }}>
                          <b>Astuce Éco :</b> {meal.budgetSwaps}
                        </Typography>
                      </Stack>
                    )}

                    {/* Quick Log Action */}
                    <Button
                      variant={isLogged ? 'outlined' : 'contained'}
                      fullWidth
                      onClick={() => handleQuickLog(meal, idx)}
                      disabled={isLogged}
                      startIcon={isLogged ? <CheckCircleRoundedIcon /> : <AddRoundedIcon />}
                      sx={{
                        borderRadius: 2.5,
                        fontWeight: 800,
                        ...(isLogged
                          ? { borderColor: 'rgba(0, 230, 118, 0.5)', color: '#00E676' }
                          : { bgcolor: 'rgba(198, 255, 62, 0.15)', color: 'primary.main', border: '1px solid rgba(198, 255, 62, 0.3)' }),
                      }}
                    >
                      {isLogged ? 'Ajouté au Journal ✓' : 'Ajouter au Journal Quotidien'}
                    </Button>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* Weekly Souk & Grocery List */}
      {plan?.weeklyGroceryList && (
        <Card
          sx={{
            p: { xs: 3, md: 4 },
            mb: 4,
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            background: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(15, 23, 42, 0.4)' : '#FFFFFF',
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1.5} sx={{ mb: 3 }}>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>
                3. Liste de Courses Hebdomadaire (Souk & Supermarché)
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cochez vos articles pendant vos courses au marché ou en grande surface.
              </Typography>
            </Box>

            <Chip
              icon={<ShoppingCartRoundedIcon sx={{ fontSize: '1rem !important', color: '#00E676' }} />}
              label={`Panier Estimé : ~${plan.totalWeeklyBudgetTnd.toFixed(1)} DT / semaine`}
              sx={{
                fontWeight: 900,
                fontSize: '0.85rem',
                bgcolor: 'rgba(0, 230, 118, 0.12)',
                color: '#00E676',
                border: '1px solid rgba(0, 230, 118, 0.3)',
                py: 0.5,
              }}
            />
          </Stack>

          <Grid container spacing={2}>
            {plan.weeklyGroceryList.map((item, i) => {
              const isChecked = checkedGroceries.has(i);

              return (
                <Grid item xs={12} sm={6} md={3} key={i}>
                  <Paper
                    onClick={() => toggleGroceryItem(i)}
                    sx={{
                      p: 2,
                      cursor: 'pointer',
                      borderRadius: 2.5,
                      border: '1px solid',
                      borderColor: isChecked ? 'rgba(0, 230, 118, 0.4)' : 'rgba(255, 255, 255, 0.06)',
                      bgcolor: isChecked ? 'rgba(0, 230, 118, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                      transition: 'all 0.15s ease',
                      '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.05)' },
                    }}
                  >
                    <Stack direction="row" alignItems="center" spacing={1.5}>
                      <Checkbox
                        checked={isChecked}
                        size="small"
                        sx={{ color: 'text.secondary', '&.Mui-checked': { color: '#00E676' }, p: 0 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: 700,
                            textDecoration: isChecked ? 'line-through' : 'none',
                            color: isChecked ? 'text.secondary' : 'text.primary',
                          }}
                        >
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.quantity} · <b style={{ color: '#00E676' }}>~{item.estimatedCostTnd.toFixed(1)} DT</b>
                        </Typography>
                      </Box>
                    </Stack>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Card>
      )}

      {/* Tunisian Market Fitness Hacks */}
      {plan?.tunisianMarketHacks && (
        <Card
          sx={{
            p: 3.5,
            borderRadius: 3.5,
            border: '1px solid rgba(255, 179, 0, 0.25)',
            bgcolor: 'rgba(255, 179, 0, 0.04)',
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
            <TipsAndUpdatesRoundedIcon sx={{ color: '#FFB300', fontSize: '1.5rem' }} />
            <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", color: '#FFB300' }}>
              Astuces & Réalités du Marché Tunisien
            </Typography>
          </Stack>

          <Stack spacing={1.2}>
            {plan.tunisianMarketHacks.map((hack, idx) => (
              <Stack direction="row" spacing={1.5} alignItems="flex-start" key={idx}>
                <Typography sx={{ color: '#FFB300', fontWeight: 900 }}>•</Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
                  {hack}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Card>
      )}
    </Box>
  );
}
