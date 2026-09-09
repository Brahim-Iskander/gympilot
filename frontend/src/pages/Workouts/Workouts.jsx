import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import { useAiPlan } from '../../hooks/useAiPlan';
import { useLanguage } from '../../i18n';

import MyPrograms from './components/MyPrograms';
import StartWorkout from './components/StartWorkout';
import ExerciseLibrary from './components/ExerciseLibrary';
import { TabNavigation } from '../../components/ui';
import SEO from '../../components/SEO';

export default function Workouts() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || (searchParams.get('day') !== null ? 'start' : 'programs');
  const initialDayIndex = parseInt(searchParams.get('day') || '0', 10);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex);
  const { aiPlan, loading } = useAiPlan();
  const [addedExercises, setAddedExercises] = useState([]);

  const tabs = useMemo(() => [
    { id: 'programs', label: t('workouts.tabs.programs'), icon: <FitnessCenterRoundedIcon /> },
    { id: 'start', label: t('workouts.tabs.start'), icon: <PlayCircleRoundedIcon /> },
    { id: 'library', label: t('workouts.tabs.library'), icon: <LibraryBooksRoundedIcon /> },
  ], [t]);

  useEffect(() => {
    const dayParam = searchParams.get('day');
    if (dayParam !== null) {
      const idx = parseInt(dayParam, 10);
      if (!isNaN(idx)) {
        setSelectedDayIndex(idx);
        setActiveTab('start');
      }
    }
  }, [searchParams]);

  const handleStartDay = (dayIndex = 0) => {
    setSelectedDayIndex(dayIndex);
    setActiveTab('start');
  };

  const handleAddExercise = (exercise) => {
    setAddedExercises((prev) => {
      if (prev.find((e) => e.id === exercise.id)) return prev;
      return [...prev, exercise];
    });
    setActiveTab('start');
  };

  return (
    <Box>
      <SEO
        title={`${t('workouts.title')} — GymPilot`}
        description={t('workouts.subtitle')}
        path="/workouts"
        noIndex
      />
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          {t('workouts.title')}
        </Typography>
      </Stack>

      <TabNavigation
        tabs={tabs}
        value={activeTab}
        onChange={(e, value) => setActiveTab(value)}
        variant="pill"
        sx={{ mb: 4 }}
      />

      {activeTab === 'programs' && (
        <MyPrograms
          aiPlan={aiPlan}
          loading={loading}
          onStart={handleStartDay}
        />
      )}
      {activeTab === 'start' && (
        <StartWorkout
          aiPlan={aiPlan}
          loading={loading}
          addedExercises={addedExercises}
          selectedDayIndex={selectedDayIndex}
          setSelectedDayIndex={setSelectedDayIndex}
        />
      )}
      {activeTab === 'library' && (
        <ExerciseLibrary
          onAddExercise={handleAddExercise}
          addedExerciseIds={addedExercises.map((e) => e.id)}
        />
      )}
    </Box>
  );
}