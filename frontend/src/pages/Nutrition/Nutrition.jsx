import { useState, useMemo } from 'react';
import { Box, Typography, Stack } from '@mui/material';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import NutritionDashboard from './components/NutritionDashboard';
import Meals from './components/Meals';
import Macros from './components/Macros';
import TunisianMealPlanner from './components/TunisianMealPlanner';
import { TabNavigation } from '../../components/ui';
import { useFitnessData } from '../../hooks/useFitnessData';
import { useLanguage } from '../../i18n';
import SEO from '../../components/SEO';

export default function Nutrition() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState('dashboard');
  const {
    aiPlan,
    aiPlanLoading,
    dailyNutrition,
    nutritionTotals,
    customTargets,
    updateNutritionTargets,
    logMeal,
    deleteMeal,
    updateWater,
  } = useFitnessData();

  const tabs = useMemo(() => [
    { id: 'dashboard', label: t('nutrition.tabs.dashboard'), icon: <RestaurantRoundedIcon /> },
    { id: 'planner', label: t('nutrition.tabs.planner'), icon: <AutoAwesomeRoundedIcon /> },
    { id: 'meals', label: t('nutrition.tabs.meals'), icon: <LocalDiningRoundedIcon /> },
    { id: 'macros', label: t('nutrition.tabs.macros'), icon: <PieChartRoundedIcon /> },
  ], [t]);

  return (
    <Box>
      <SEO
        title={`${t('nutrition.title')} — GymPilot`}
        description={t('nutrition.subtitle')}
        path="/nutrition"
        noIndex
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        flexWrap="wrap"
        gap={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
            {t('nutrition.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('nutrition.subtitle')}
          </Typography>
        </Box>
      </Stack>

      <TabNavigation
        tabs={tabs}
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        variant="pill"
        sx={{ mb: 4 }}
      />

      {activeTab === 'dashboard' && (
        <NutritionDashboard
          aiPlan={aiPlan}
          loading={aiPlanLoading}
          dailyNutrition={dailyNutrition}
          nutritionTotals={nutritionTotals}
          customTargets={customTargets}
          updateNutritionTargets={updateNutritionTargets}
          updateWater={updateWater}
          logMeal={logMeal}
          onSwitchToMeals={() => setActiveTab('meals')}
        />
      )}
      {activeTab === 'planner' && (
        <TunisianMealPlanner onLogMeal={logMeal} />
      )}
      {activeTab === 'meals' && (
        <Meals
          aiPlan={aiPlan}
          loading={aiPlanLoading}
          dailyNutrition={dailyNutrition}
          nutritionTotals={nutritionTotals}
          customTargets={customTargets}
          updateNutritionTargets={updateNutritionTargets}
          logMeal={logMeal}
          deleteMeal={deleteMeal}
        />
      )}
      {activeTab === 'macros' && (
        <Macros
          aiPlan={aiPlan}
          loading={aiPlanLoading}
          dailyNutrition={dailyNutrition}
          nutritionTotals={nutritionTotals}
          customTargets={customTargets}
          updateNutritionTargets={updateNutritionTargets}
        />
      )}
    </Box>
  );
}