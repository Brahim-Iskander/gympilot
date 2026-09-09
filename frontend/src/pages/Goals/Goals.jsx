import { useState, useMemo } from 'react';
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
import SEO from '../../components/SEO';
import { useLanguage } from '../../i18n';

export default function Goals() {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('all');

  const goalTypes = useMemo(() => [
    { id: 'strength', name: t('goals.types.strength'), icon: <Dumbbell01Icon size={18} /> },
    { id: 'weight', name: t('goals.types.weight'), icon: <WeightScaleIcon size={18} /> },
    { id: 'body', name: t('goals.types.body'), icon: <UserIcon size={18} /> },
    { id: 'frequency', name: t('goals.types.frequency'), icon: <Calendar01Icon size={18} /> },
    { id: 'nutrition', name: t('goals.types.nutrition'), icon: <RestaurantIcon size={18} /> },
    { id: 'custom', name: t('goals.types.custom'), icon: <SparklesIcon size={18} /> },
  ], [t]);

  return (
    <Box>
      <SEO
        title={`${t('goals.title')} — GymPilot`}
        description={t('goals.subtitle')}
        path="/goals"
        noIndex
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
            {t('goals.title')}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {t('goals.subtitle')}
          </Typography>
        </Box>
        <Chip
          icon={<SparklesIcon size={14} color="#C6FF3E" />}
          label={t('goals.aiProposed')}
          size="small"
          sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', fontWeight: 700 }}
        />
      </Stack>

      <SectionHeader
        title={t('goals.filterByType')}
        action={
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            {['all', ...goalTypes.map((t) => t.id)].map((filter) => (
              <Chip
                key={filter}
                label={filter === 'all' ? t('goals.types.all') : goalTypes.find((t) => t.id === filter)?.name || filter}
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