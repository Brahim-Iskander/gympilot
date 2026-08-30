import { useState } from 'react';
import { Box, Stack, Typography } from '@mui/material';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import PieChartRoundedIcon from '@mui/icons-material/PieChartRounded';
import { useAiPlan } from '../../hooks/useAiPlan';

import NutritionDashboard from './components/NutritionDashboard';
import Meals from './components/Meals';
import Macros from './components/Macros';
import { TabNavigation } from '../../components/ui';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: <RestaurantRoundedIcon /> },
  { id: 'meals', label: 'Meals', icon: <LocalDiningRoundedIcon /> },
  { id: 'macros', label: 'Macros', icon: <PieChartRoundedIcon /> },
];

export default function Nutrition() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { aiPlan, loading } = useAiPlan();

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Nutrition
        </Typography>
      </Stack>

      <TabNavigation
        tabs={tabs}
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        variant="pill"
        sx={{ mb: 4 }}
      />

      {activeTab === 'dashboard' && <NutritionDashboard aiPlan={aiPlan} loading={loading} />}
      {activeTab === 'meals' && <Meals aiPlan={aiPlan} loading={loading} />}
      {activeTab === 'macros' && <Macros aiPlan={aiPlan} loading={loading} />}
    </Box>
  );
}