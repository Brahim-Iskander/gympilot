import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';

import NutritionDashboard from './components/NutritionDashboard';
import Meals from './components/Meals';
import Macros from './components/Macros';
import { TabNavigation } from '../../components/ui';
import { useFitnessData } from '../../hooks/useFitnessData';
import SEO from '../../components/SEO';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <RestaurantRoundedIcon /> },
  { id: 'meals', label: 'Meals & Logs', icon: <LocalDiningRoundedIcon /> },
  { id: 'macros', label: 'Macros Breakdown', icon: <PieChartRoundedIcon /> },
];

export default function Nutrition() {
  const navigate = useNavigate();
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

  return (
    <Box>
      <SEO
        title="Nutrition & Macro Targets"
        description="Track daily calorie intake, macronutrient ratios (protein, carbs, fats), and suggested meal plans on GymPilot."
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
            Nutrition & Fuel
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time daily calorie and macro tracking synchronized with your fitness goals.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/calories-calculator')}
          startIcon={<AutoAwesomeRoundedIcon />}
          sx={{
            borderRadius: 3,
            fontWeight: 800,
            px: 2.5,
            py: 1,
            textTransform: 'none',
            boxShadow: '0 4px 20px rgba(198,255,62,0.25)',
          }}
        >
          AI Food Scanner
        </Button>
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
        />
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