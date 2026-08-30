import { useState } from 'react';
import { Box, Chip, Stack, Typography } from '@mui/material';
import {
  Dumbbell01Icon,
  WeightScaleIcon,
  UserIcon,
  Calendar01Icon,
  RestaurantIcon,
  SparklesIcon,
} from 'hugeicons-react';

import GoalsList from './components/GoalsList';
import { SectionHeader } from '../../components/ui';

const goalTypes = [
  { id: 'strength', name: 'Strength', icon: <Dumbbell01Icon size={18} /> },
  { id: 'weight', name: 'Weight', icon: <WeightScaleIcon size={18} /> },
  { id: 'body', name: 'Body Composition', icon: <UserIcon size={18} /> },
  { id: 'frequency', name: 'Workout Frequency', icon: <Calendar01Icon size={18} /> },
  { id: 'nutrition', name: 'Nutrition', icon: <RestaurantIcon size={18} /> },
  { id: 'custom', name: 'Custom', icon: <SparklesIcon size={18} /> },
];

export default function Goals() {
  const [activeFilter, setActiveFilter] = useState('all');

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
            Goals
          </Typography>
          <Typography variant="body2" color="text.secondary">
            AI-proposed targets based on your onboarding profile
          </Typography>
        </Box>
        <Chip
          icon={<SparklesIcon size={14} color="#C6FF3E" />}
          label="AI Proposed"
          size="small"
          sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', fontWeight: 700 }}
        />
      </Stack>

      <SectionHeader
        title="Filter by Type"
        action={
          <Stack direction="row" spacing={1} useFlexGap>
            {['all', ...goalTypes.map((t) => t.id)].map((filter) => (
              <Chip
                key={filter}
                label={filter === 'all' ? 'All' : goalTypes.find((t) => t.id === filter)?.name || filter}
                size="small"
                onClick={() => setActiveFilter(filter)}
                variant={activeFilter === filter ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  bgcolor: activeFilter === filter ? 'primary.main' : 'transparent',
                  color: activeFilter === filter ? 'primary.contrastText' : 'text.secondary',
                  borderColor: activeFilter === filter ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>
        }
      />

      <GoalsList filter={activeFilter} />
    </Box>
  );
}