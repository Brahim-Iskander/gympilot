import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Box, Stack, Typography } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PlayCircleRoundedIcon from '@mui/icons-material/PlayCircleRounded';
import LibraryBooksRoundedIcon from '@mui/icons-material/LibraryBooksRounded';
import { useAiPlan } from '../../hooks/useAiPlan';

import MyPrograms from './components/MyPrograms';
import StartWorkout from './components/StartWorkout';
import ExerciseLibrary from './components/ExerciseLibrary';
import { TabNavigation } from '../../components/ui';

const tabs = [
  { id: 'programs', label: 'My Programs', icon: <FitnessCenterRoundedIcon /> },
  { id: 'start', label: 'Start Workout', icon: <PlayCircleRoundedIcon /> },
  { id: 'library', label: 'Exercise Library', icon: <LibraryBooksRoundedIcon /> },
];

export default function Workouts() {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || (searchParams.get('day') !== null ? 'start' : 'programs');
  const initialDayIndex = parseInt(searchParams.get('day') || '0', 10);

  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedDayIndex, setSelectedDayIndex] = useState(initialDayIndex);
  const { aiPlan, loading } = useAiPlan();
  const [addedExercises, setAddedExercises] = useState([]);

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
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Workouts
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