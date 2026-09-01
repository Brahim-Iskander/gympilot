import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Snackbar,
  Alert,
  Stack,
  TextField,
  Tooltip,
  Typography,
  styled,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

import ExerciseTutorialModal from './ExerciseTutorialModal';
import BodyMapSVG from './BodyMapSVG';

const StyledCard = styled(Card)(({ }) => ({
  borderRadius: 16,
  border: '1px solid',
  borderColor: 'rgba(255,255,255,0.08)',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  transition: 'all .3s ease',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(198,255,62,0.4)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
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

function ExerciseCard({ exercise, onAdd, isAdded, onOpenTutorial }) {
  const difficultyColors = {
    Beginner: '#C6FF3E',
    Intermediate: '#FFC107',
    Advanced: '#FF6B6B',
  };

  return (
    <StyledCard sx={{ p: 2.5, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
        <Box sx={{ flex: 1, pr: 1 }}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                cursor: 'pointer',
                fontFamily: "'Sora', sans-serif",
                fontSize: '1.05rem',
                lineHeight: 1.3,
                '&:hover': { color: 'primary.main' },
              }}
              onClick={() => onOpenTutorial(exercise)}
            >
              {exercise.name}
            </Typography>
            <Tooltip title="View step-by-step tutorial & form tips">
              <IconButton
                size="small"
                onClick={() => onOpenTutorial(exercise)}
                sx={{ color: 'text.secondary', p: 0.25, '&:hover': { color: 'primary.main' } }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </Stack>

          <Stack direction="row" spacing={0.75} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
            <Chip
              size="small"
              label={exercise.muscle}
              sx={{
                fontWeight: 600,
                fontSize: '0.65rem',
                bgcolor: 'rgba(198,255,62,0.08)',
                color: '#C6FF3E',
                border: '1px solid rgba(198,255,62,0.2)',
              }}
            />
            <Chip
              size="small"
              label={exercise.equipment}
              sx={{
                fontWeight: 600,
                fontSize: '0.65rem',
                bgcolor: 'rgba(138,124,255,0.08)',
                color: '#8A7CFF',
                border: '1px solid rgba(138,124,255,0.2)',
              }}
            />
            <Chip
              size="small"
              label={exercise.difficulty}
              sx={{
                fontWeight: 700,
                fontSize: '0.65rem',
                bgcolor: `${difficultyColors[exercise.difficulty]}18`,
                color: difficultyColors[exercise.difficulty],
                border: `1px solid ${difficultyColors[exercise.difficulty]}33`,
              }}
            />
          </Stack>
        </Box>

        <Box
          onClick={() => onOpenTutorial(exercise)}
          sx={{
            width: 52,
            height: 52,
            borderRadius: 3,
            bgcolor: 'rgba(198,255,62,0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            border: '1px solid rgba(198,255,62,0.15)',
            '&:hover': {
              bgcolor: 'rgba(198,255,62,0.18)',
              transform: 'scale(1.05)',
            },
          }}
        >
          <FitnessCenterRoundedIcon sx={{ fontSize: 26, color: '#C6FF3E' }} />
        </Box>
      </Stack>

      {/* Card Actions */}
      <Box sx={{ mt: 'auto', pt: 2, borderTop: '1px solid', borderColor: 'rgba(255,255,255,0.06)' }}>
        <Stack direction="row" spacing={1}>
          <Button
            variant="text"
            size="small"
            startIcon={<SchoolRoundedIcon fontSize="small" />}
            onClick={() => onOpenTutorial(exercise)}
            sx={{
              flex: 1,
              borderRadius: 2,
              color: 'text.secondary',
              fontWeight: 700,
              fontSize: '0.8rem',
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              '&:hover': {
                bgcolor: 'rgba(198,255,62,0.08)',
                color: 'primary.main',
                borderColor: 'rgba(198,255,62,0.3)',
              },
            }}
          >
            Tutorial
          </Button>

          {isAdded ? (
            <Button
              variant="outlined"
              size="small"
              disabled
              startIcon={<CheckCircleRoundedIcon fontSize="small" />}
              sx={{
                flex: 1.2,
                borderRadius: 2,
                borderColor: 'rgba(198,255,62,0.3)',
                color: '#C6FF3E',
                fontSize: '0.8rem',
                fontWeight: 700,
                '&.Mui-disabled': { borderColor: 'rgba(198,255,62,0.2)', color: '#C6FF3E', opacity: 0.7 },
              }}
            >
              Added
            </Button>
          ) : (
            <Button
              variant="contained"
              size="small"
              startIcon={<FitnessCenterRoundedIcon fontSize="small" />}
              onClick={() => onAdd(exercise)}
              sx={{
                flex: 1.2,
                borderRadius: 2,
                bgcolor: 'primary.main',
                color: '#000',
                fontWeight: 800,
                fontSize: '0.8rem',
                boxShadow: '0 2px 10px rgba(198,255,62,0.25)',
                '&:hover': { bgcolor: '#b3f520' },
              }}
            >
              Add
            </Button>
          )}
        </Stack>
      </Box>
    </StyledCard>
  );
}

export default function ExerciseLibrary({ onAddExercise, addedExerciseIds = [] }) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedEquipment, setSelectedEquipment] = useState('All');
  const [snackbar, setSnackbar] = useState('');

  // Selected exercise for tutorial modal
  const [activeTutorialExercise, setActiveTutorialExercise] = useState(null);

  const filteredExercises = useMemo(() => {
    return exercises.filter((exercise) => {
      const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory =
        selectedCategory === 'All' ||
        exercise.muscle?.toLowerCase() === selectedCategory.toLowerCase();
      const matchesEquipment =
        selectedEquipment === 'All' ||
        exercise.equipment?.toLowerCase() === selectedEquipment.toLowerCase();
      return matchesSearch && matchesCategory && matchesEquipment;
    });
  }, [search, selectedCategory, selectedEquipment]);

  const handleAdd = (exercise) => {
    if (onAddExercise) {
      onAddExercise(exercise);
      setSnackbar(`Added "${exercise.name}" to your workout`);
    }
  };

  // Body map muscle click → sync with selectedCategory
  const handleBodyMapMuscleSelect = (muscle) => {
    setSelectedCategory((prev) => (prev?.toLowerCase() === muscle?.toLowerCase() ? 'All' : muscle));
  };

  // ── Body Map Panel ──
  const bodyMapPanel = (
    <Box
      sx={{
        width: isMobile ? '100%' : 340,
        minWidth: isMobile ? 'auto' : 300,
        flexShrink: 0,
        position: isMobile ? 'relative' : 'sticky',
        top: isMobile ? 'auto' : 24,
        alignSelf: 'flex-start',
        p: 2.5,
        borderRadius: 4,
        border: '1px solid rgba(255,255,255,0.07)',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <BodyMapSVG
        selectedMuscle={selectedCategory === 'All' ? null : selectedCategory}
        onSelectMuscle={handleBodyMapMuscleSelect}
      />
    </Box>
  );

  // ── Exercise List Panel ──
  const exerciseListPanel = (
    <Box sx={{ flex: 1, minWidth: 0 }}>
      {/* Search & Filter Header */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box sx={{ flex: 1, minWidth: { xs: '100%', sm: 240 } }}>
          <TextField
            placeholder="Search exercises by name..."
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
        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
          <TextField
            select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
            SelectProps={{ IconComponent: () => <ExpandMoreRoundedIcon fontSize="small" /> }}
          >
            {categories.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat === 'All' ? 'All Muscles' : cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            select
            value={selectedEquipment}
            onChange={(e) => setSelectedEquipment(e.target.value)}
            size="small"
            sx={{ minWidth: 150 }}
            SelectProps={{ IconComponent: () => <ExpandMoreRoundedIcon fontSize="small" /> }}
          >
            {equipment.map((eq) => (
              <MenuItem key={eq} value={eq}>
                {eq === 'All' ? 'All Equipment' : eq}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
        Showing {filteredExercises.length} of {exercises.length} exercises
        {selectedCategory !== 'All' && (
          <> • Filtered by <strong style={{ color: '#C6FF3E' }}>{selectedCategory}</strong></>
        )}
      </Typography>

      {/* Grid */}
      <Grid container spacing={2}>
        {filteredExercises.map((exercise) => (
          <Grid item xs={12} sm={6} lg={6} key={exercise.id}>
            <ExerciseCard
              exercise={exercise}
              onAdd={handleAdd}
              isAdded={addedExerciseIds.includes(exercise.id)}
              onOpenTutorial={(ex) => setActiveTutorialExercise(ex)}
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
    </Box>
  );

  return (
    <Box>
      {/* ── Responsive Layout: Body Map + Exercise List ── */}
      <Stack
        direction={isMobile ? 'column' : 'row'}
        spacing={isMobile ? 3 : 4}
        alignItems="flex-start"
      >
        {/* On mobile, body map goes on top. On desktop, exercise list first (left), body map second (right). */}
        {isMobile ? (
          <>
            {bodyMapPanel}
            {exerciseListPanel}
          </>
        ) : (
          <>
            {exerciseListPanel}
            {bodyMapPanel}
          </>
        )}
      </Stack>

      {/* Interactive Exercise Tutorial Modal */}
      <ExerciseTutorialModal
        open={Boolean(activeTutorialExercise)}
        onClose={() => setActiveTutorialExercise(null)}
        exercise={activeTutorialExercise}
        onAddExercise={handleAdd}
        isAdded={activeTutorialExercise ? addedExerciseIds.includes(activeTutorialExercise.id) : false}
      />

      <Snackbar
        open={!!snackbar}
        autoHideDuration={2500}
        onClose={() => setSnackbar('')}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar('')}
          severity="success"
          variant="filled"
          sx={{ width: '100%', borderRadius: 2, fontWeight: 600 }}
        >
          {snackbar}
        </Alert>
      </Snackbar>
    </Box>
  );
}