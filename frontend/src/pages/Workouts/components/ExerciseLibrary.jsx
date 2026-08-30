import { useState, useMemo } from 'react';
import { Box, Button, Card, Chip, Grid, InputAdornment, Snackbar, Stack, TextField, Typography, styled } from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';

const StyledCard = styled(Card)(({ }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  transition: 'transform .3s ease, border-color .3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(198,255,62,0.3)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
}));

const categories = ['All', 'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps', 'Legs', 'Glutes', 'Abs', 'Cardio'];
const equipment = ['All', 'Barbell', 'Dumbbell', 'Machine', 'Cable', 'Bodyweight', 'Kettlebell', 'Band'];

const exercises = [
  { id: '1', name: 'Bench Press', muscle: 'Chest', equipment: 'Barbell', difficulty: 'Intermediate', image: null },
  { id: '2', name: 'Incline Dumbbell Press', muscle: 'Chest', equipment: 'Dumbbell', difficulty: 'Intermediate', image: null },
  { id: '3', name: 'Push-ups', muscle: 'Chest', equipment: 'Bodyweight', difficulty: 'Beginner', image: null },
  { id: '4', name: 'Chest Fly', muscle: 'Chest', equipment: 'Dumbbell', difficulty: 'Beginner', image: null },
  { id: '5', name: 'Dips', muscle: 'Chest', equipment: 'Bodyweight', difficulty: 'Intermediate', image: null },
  { id: '6', name: 'Pull-ups', muscle: 'Back', equipment: 'Bodyweight', difficulty: 'Advanced', image: null },
  { id: '7', name: 'Barbell Row', muscle: 'Back', equipment: 'Barbell', difficulty: 'Intermediate', image: null },
  { id: '8', name: 'Lat Pulldown', muscle: 'Back', equipment: 'Machine', difficulty: 'Beginner', image: null },
  { id: '9', name: 'Seated Cable Row', muscle: 'Back', equipment: 'Cable', difficulty: 'Beginner', image: null },
  { id: '10', name: 'Deadlift', muscle: 'Back', equipment: 'Barbell', difficulty: 'Advanced', image: null },
  { id: '11', name: 'Overhead Press', muscle: 'Shoulders', equipment: 'Barbell', difficulty: 'Intermediate', image: null },
  { id: '12', name: 'Lateral Raises', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Beginner', image: null },
  { id: '13', name: 'Face Pulls', muscle: 'Shoulders', equipment: 'Cable', difficulty: 'Beginner', image: null },
  { id: '14', name: 'Arnold Press', muscle: 'Shoulders', equipment: 'Dumbbell', difficulty: 'Intermediate', image: null },
  { id: '15', name: 'Bicep Curls', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', image: null },
  { id: '16', name: 'Hammer Curls', muscle: 'Biceps', equipment: 'Dumbbell', difficulty: 'Beginner', image: null },
  { id: '17', name: 'Preacher Curls', muscle: 'Biceps', equipment: 'Machine', difficulty: 'Beginner', image: null },
  { id: '18', name: 'Tricep Pushdowns', muscle: 'Triceps', equipment: 'Cable', difficulty: 'Beginner', image: null },
  { id: '19', name: 'Overhead Tricep Extension', muscle: 'Triceps', equipment: 'Dumbbell', difficulty: 'Beginner', image: null },
  { id: '20', name: 'Close-Grip Bench Press', muscle: 'Triceps', equipment: 'Barbell', difficulty: 'Intermediate', image: null },
  { id: '21', name: 'Squat', muscle: 'Legs', equipment: 'Barbell', difficulty: 'Advanced', image: null },
  { id: '22', name: 'Leg Press', muscle: 'Legs', equipment: 'Machine', difficulty: 'Beginner', image: null },
  { id: '23', name: 'Romanian Deadlift', muscle: 'Legs', equipment: 'Barbell', difficulty: 'Intermediate', image: null },
  { id: '24', name: 'Lunges', muscle: 'Legs', equipment: 'Dumbbell', difficulty: 'Beginner', image: null },
  { id: '25', name: 'Leg Curls', muscle: 'Legs', equipment: 'Machine', difficulty: 'Beginner', image: null },
  { id: '26', name: 'Hip Thrust', muscle: 'Glutes', equipment: 'Barbell', difficulty: 'Intermediate', image: null },
  { id: '27', name: 'Glute Bridge', muscle: 'Glutes', equipment: 'Bodyweight', difficulty: 'Beginner', image: null },
  { id: '28', name: 'Plank', muscle: 'Abs', equipment: 'Bodyweight', difficulty: 'Beginner', image: null },
  { id: '29', name: 'Hanging Leg Raises', muscle: 'Abs', equipment: 'Bodyweight', difficulty: 'Advanced', image: null },
  { id: '30', name: 'Cable Crunches', muscle: 'Abs', equipment: 'Cable', difficulty: 'Beginner', image: null },
];

function ExerciseCard({ exercise, onAdd, isAdded }) {
  const difficultyColors = {
    Beginner: '#C6FF3E',
    Intermediate: '#FFC107',
    Advanced: '#FF6B6B',
  };

  return (
    <StyledCard sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.5 }}>
            {exercise.name}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip size="small" label={exercise.muscle} sx={{ fontWeight: 500, fontSize: '0.65rem', bgcolor: 'rgba(198,255,62,0.08)', color: '#C6FF3E', border: '1px solid', borderColor: 'rgba(198,255,62,0.2)' }} />
            <Chip size="small" label={exercise.equipment} sx={{ fontWeight: 500, fontSize: '0.65rem', bgcolor: 'rgba(138,124,255,0.08)', color: '#8A7CFF', border: '1px solid', borderColor: 'rgba(138,124,255,0.2)' }} />
            <Chip
              size="small"
              label={exercise.difficulty}
              sx={{
                fontWeight: 600,
                fontSize: '0.65rem',
                bgcolor: `${difficultyColors[exercise.difficulty]}22`,
                color: difficultyColors[exercise.difficulty],
                border: `1px solid ${difficultyColors[exercise.difficulty]}44`,
              }}
            />
          </Stack>
        </Box>
        <Box
          sx={{
            width: 60,
            height: 60,
            borderRadius: 3,
            bgcolor: 'rgba(198,255,62,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <FitnessCenterRoundedIcon sx={{ fontSize: 28, color: '#C6FF3E' }} />
        </Box>
      </Stack>

      <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'rgba(255,255,255,0.06)' }}>
        {isAdded ? (
          <Button
            variant="outlined"
            fullWidth
            disabled
            startIcon={<CheckCircleRoundedIcon fontSize="small" />}
            sx={{
              borderColor: 'rgba(198,255,62,0.3)',
              color: '#C6FF3E',
              '&.Mui-disabled': { borderColor: 'rgba(198,255,62,0.2)', color: '#C6FF3E', opacity: 0.7 },
            }}
          >
            Added
          </Button>
        ) : (
          <Button
            variant="outlined"
            fullWidth
            startIcon={<FitnessCenterRoundedIcon fontSize="small" />}
            onClick={() => onAdd(exercise)}
          >
            Add to Workout
          </Button>
        )}
      </Box>
    </StyledCard>
  );
}

export default function ExerciseLibrary({ onAddExercise, addedExerciseIds = [] }) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [snackbar, setSnackbar] = useState('');

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || exercise.muscle === selectedCategory;
      const matchesEquipment = selectedEquipment === 'All' || exercise.equipment === selectedEquipment;
      return matchesSearch && matchesCategory && matchesEquipment;
    });
  }, [search, selectedCategory, selectedEquipment]);

  const handleAdd = (exercise) => {
    if (onAddExercise) {
      onAddExercise(exercise);
      setSnackbar(`Added "${exercise.name}" to your workout`);
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box sx={{ flex: 1, minWidth: 300 }}>
          <TextField
            placeholder="Search exercises..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ width: '100%' }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon color="action" />
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Stack direction="row" spacing={1.5} useFlexGap>
          <TextField
            select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="small"
            sx={{ minWidth: 160, '& .MuiSelect-select': { py: 0.5 } }}
            SelectProps={{ IconComponent: () => <ExpandMoreRoundedIcon fontSize="small" /> }}
          >
            {categories.map((cat) => (
              <Chip key={cat} label={cat} />
            ))}
          </TextField>
          <TextField
            select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            size="small"
            sx={{ minWidth: 160, '& .MuiSelect-select': { py: 0.5 } }}
            SelectProps={{ IconComponent: () => <ExpandMoreRoundedIcon fontSize="small" /> }}
          >
            {equipment.map((eq) => (
              <Chip key={eq} label={eq} />
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Showing {filteredExercises.length} of {exercises.length} exercises
      </Typography>

      <Grid container spacing={2}>
        {filteredExercises.map((exercise) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={exercise.id}>
            <ExerciseCard
              exercise={exercise}
              onAdd={handleAdd}
              isAdded={addedExerciseIds.includes(exercise.id)}
            />
          </Grid>
        ))}
      </Grid>

      {filteredExercises.length === 0 && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
            No exercises found
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Try adjusting your search or filters
          </Typography>
        </Box>
      )}

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar('')}
        message={snackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}