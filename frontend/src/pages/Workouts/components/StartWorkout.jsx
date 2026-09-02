import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Button, Card, Chip, IconButton, Stack, Typography, styled, TextField, Tabs, Tab, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import KeyboardArrowUpRoundedIcon from '@mui/icons-material/KeyboardArrowUpRounded';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { buildExerciseForWorkout, suggestWeight } from '../../../utils/exerciseDefaults';
import { progressService } from '../../../services/progressService';
import { fitnessDataService } from '../../../services/fitnessDataService';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const fallbackPlan = {
  name: 'Full Body Foundations',
  focus: 'General Strength & Hypertrophy',
  exercises: [
    { id: 'fb-1', name: 'Goblet Squat', sets: [{ weight: 16, reps: 10, completed: false }, { weight: 16, reps: 10, completed: false }, { weight: 16, reps: 10, completed: false }] },
    { id: 'fb-2', name: 'Dumbbell Bench Press', sets: [{ weight: 14, reps: 10, completed: false }, { weight: 14, reps: 10, completed: false }, { weight: 14, reps: 10, completed: false }] },
    { id: 'fb-3', name: 'Dumbbell Row', sets: [{ weight: 14, reps: 12, completed: false }, { weight: 14, reps: 12, completed: false }, { weight: 14, reps: 12, completed: false }] },
    { id: 'fb-4', name: 'Dumbbell Shoulder Press', sets: [{ weight: 10, reps: 10, completed: false }, { weight: 10, reps: 10, completed: false }] },
    { id: 'fb-5', name: 'Plank', sets: [{ weight: 0, reps: 45, completed: false }, { weight: 0, reps: 45, completed: false }] },
  ],
};

function SetRow({ set, index, onComplete, onUpdate, completed: isCompleted }) {
  const [weight, setWeight] = useState(set.weight);
  const [reps, setReps] = useState(set.reps);

  useEffect(() => {
    setWeight(set.weight);
    setReps(set.reps);
  }, [set.weight, set.reps]);

  const handleWeightChange = (delta) => {
    const newWeight = Math.max(0, Math.round((weight + delta) * 10) / 10);
    setWeight(newWeight);
    onUpdate(index, { ...set, weight: newWeight });
  };

  const handleRepsChange = (delta) => {
    const newReps = Math.max(0, reps + delta);
    setReps(newReps);
    onUpdate(index, { ...set, reps: newReps });
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ py: 1, borderBottom: '1px solid', borderColor: 'rgba(255,255,255,0.04)', '&:last-child': { borderBottom: 'none' } }}>
      <Typography variant="body2" color="text.secondary" sx={{ width: 40, textAlign: 'center', fontWeight: 600 }}>
        Set {index + 1}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
        <IconButton size="small" onClick={() => handleWeightChange(-2.5)} sx={{ color: 'text.secondary' }}>
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        </IconButton>
        <TextField
          size="small"
          value={weight}
          onChange={(e) => { const val = parseFloat(e.target.value) || 0; setWeight(val); onUpdate(index, { ...set, weight: val }); }}
          inputProps={{ inputMode: 'numeric' }}
          sx={{ width: 70, '& .MuiInputBase-root': { py: 0.5 } }}
        />
        <IconButton size="small" onClick={() => handleWeightChange(2.5)} sx={{ color: 'text.secondary' }}>
          <KeyboardArrowUpRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5, mr: 1 }}>kg</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mr: 2 }}>
        <IconButton size="small" onClick={() => handleRepsChange(-1)} sx={{ color: 'text.secondary' }}>
          <KeyboardArrowDownRoundedIcon fontSize="small" />
        </IconButton>
        <TextField
          size="small"
          value={reps}
          onChange={(e) => { const val = parseInt(e.target.value) || 0; setReps(val); onUpdate(index, { ...set, reps: val }); }}
          inputProps={{ inputMode: 'numeric' }}
          sx={{ width: 50, '& .MuiInputBase-root': { py: 0.5 } }}
        />
        <IconButton size="small" onClick={() => handleRepsChange(1)} sx={{ color: 'text.secondary' }}>
          <KeyboardArrowUpRoundedIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>reps</Typography>
      </Box>
      <Box sx={{ flex: 1 }} />
      <IconButton
        size="large"
        onClick={() => onComplete(index)}
        disabled={isCompleted}
        sx={{
          bgcolor: isCompleted ? 'rgba(198,255,62,0.15)' : 'rgba(255,255,255,0.06)',
          color: isCompleted ? '#C6FF3E' : 'text.secondary',
          '&:hover': { bgcolor: isCompleted ? 'rgba(198,255,62,0.25)' : 'rgba(255,255,255,0.12)' },
        }}
      >
        <CheckRoundedIcon />
      </IconButton>
    </Stack>
  );
}

function ExerciseCard({ exercise, exerciseIndex, onSetComplete, onSetUpdate, onAddSet }) {
  const completedSets = exercise.sets.filter((s) => s.completed).length;

  return (
    <StyledCard sx={{ p: 2, mb: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: 'rgba(198,255,62,0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontFamily: "'Sora','Inter',sans-serif",
            }}
          >
            {exerciseIndex + 1}
          </Box>
          <Typography variant="h6" sx={{ fontWeight: 800, mb: 0 }}>
            {exercise.name}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={`${completedSets}/${exercise.sets.length} sets`}
          sx={{ bgcolor: completedSets === exercise.sets.length ? 'rgba(198,255,62,0.15)' : 'rgba(255,255,255,0.06)', color: completedSets === exercise.sets.length ? '#C6FF3E' : 'text.secondary', fontWeight: 600 }}
        />
      </Stack>

      {exercise.sets.map((set, setIndex) => (
        <SetRow
          key={setIndex}
          set={set}
          index={setIndex}
          completed={set.completed}
          onComplete={(idx) => onSetComplete(exerciseIndex, idx)}
          onUpdate={(idx, updatedSet) => onSetUpdate(exerciseIndex, idx, updatedSet)}
        />
      ))}

      <Button
        variant="outlined"
        size="small"
        startIcon={<AddRoundedIcon fontSize="small" />}
        onClick={onAddSet}
        sx={{ mt: 1 }}
      >
        + Add Set
      </Button>
    </StyledCard>
  );
}

export default function StartWorkout({ aiPlan, loading, addedExercises = [], selectedDayIndex = 0, setSelectedDayIndex }) {
  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading workout session...</Typography>
      </Box>
    );
  }

  const daysList = aiPlan?.workoutPlan || [];
  const activeIndex = Math.min(Math.max(selectedDayIndex, 0), Math.max(daysList.length - 1, 0));

  const currentDayObj = daysList[activeIndex];

  const userProfile = aiPlan ? {
    weightKg: aiPlan.weightKg || 70,
    experienceLevel: aiPlan.experienceLevel || 'beginner',
    goal: aiPlan.goal || 'build_muscle',
  } : null;

  const displayPlan = currentDayObj ? {
    name: currentDayObj.dayName,
    focus: `Custom AI Routine • Day ${activeIndex + 1}`,
    exercises: currentDayObj.exercises.map((e, idx) => {
      const numSets = typeof e.sets === 'number' ? e.sets : parseInt(e.sets) || 3;
      const numReps = parseInt(e.reps) || 10;
      
      const recommendedWeight = suggestWeight(e.name, 'Chest', aiPlan?.equipment || 'Full Gym', userProfile);

      return {
        id: `ai-ex-${activeIndex}-${idx}`,
        name: e.name,
        sets: Array(numSets).fill(null).map(() => ({ weight: recommendedWeight, reps: numReps, completed: false }))
      };
    })
  } : fallbackPlan;

  const [exercises, setExercises] = useState([]);

  // Reset/Initialize exercises when day index or aiPlan changes
  useEffect(() => {
    const base = displayPlan.exercises.map((e) => ({ ...e, sets: e.sets.map((s) => ({ ...s })) }));
    const addedFormatted = addedExercises.map((ex) => buildExerciseForWorkout(ex, userProfile));

    setExercises([...base, ...addedFormatted]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex, aiPlan, addedExercises]);

  const handleSetComplete = (exerciseIndex, setIndex) => {
    setExercises((prev) => prev.map((ex, i) =>
      i === exerciseIndex ? { ...ex, sets: ex.sets.map((s, j) => j === setIndex ? { ...s, completed: true } : s) } : ex
    ));
  };

  const handleSetUpdate = (exerciseIndex, setIndex, updatedSet) => {
    setExercises((prev) => prev.map((ex, i) =>
      i === exerciseIndex ? { ...ex, sets: ex.sets.map((s, j) => j === setIndex ? updatedSet : s) } : ex
    ));
  };

  const handleAddSet = (exerciseIndex) => {
    setExercises((prev) => prev.map((ex, i) =>
      i === exerciseIndex ? { ...ex, sets: [...ex.sets, { weight: 0, reps: 10, completed: false }] } : ex
    ));
  };

  const [finishing, setFinishing] = useState(false);
  const [completionModal, setCompletionModal] = useState({ open: false, workoutName: '' });
  const navigate = useNavigate();

  const handleFinishWorkout = async () => {
    try {
      setFinishing(true);
      const todayStr = new Date().toISOString().split('T')[0];
      const completedExercisesList = exercises.filter((ex) => ex.sets.some((s) => s.completed));
      
      let totalVolume = 0;
      const strengthLogs = completedExercisesList.map((ex) => {
        const completedSetsList = ex.sets.filter((s) => s.completed);
        const maxWeight = Math.max(...completedSetsList.map((s) => Number(s.weight) || 0));
        const avgReps = Math.round(
          completedSetsList.reduce((acc, s) => acc + (Number(s.reps) || 0), 0) / completedSetsList.length
        );
        completedSetsList.forEach((s) => {
          totalVolume += (Number(s.weight) || 0) * (Number(s.reps) || 0);
        });

        return {
          exerciseName: ex.name,
          weight: maxWeight,
          reps: avgReps || 10,
          sets: completedSetsList.length,
          isPR: false,
          notes: `Workout: ${displayPlan.name}`,
        };
      });

      // Synchronize into central fitness engine
      fitnessDataService.logWorkoutSession({
        name: displayPlan.name,
        date: todayStr,
        durationMinutes: Math.round(totalSets * 2) || 45,
        exercisesCompleted: completedExercisesList.length,
        totalVolumeKg: totalVolume || 4000,
        exercises: completedExercisesList.map((e) => ({
          name: e.name,
          maxWeight: Math.max(...e.sets.filter((s) => s.completed).map((s) => Number(s.weight) || 0)),
        })),
      });

      if (strengthLogs.length > 0) {
        try {
          await progressService.create({
            date: todayStr,
            strengthLogs,
            note: `Finished workout: ${displayPlan.name}`,
          });
        } catch (apiErr) {
          console.warn('Progress API create fallback:', apiErr);
        }
      }

      setCompletionModal({ open: true, workoutName: displayPlan.name });
    } catch (err) {
      console.error('Failed to save workout session:', err);
      setCompletionModal({ open: true, workoutName: displayPlan.name });
    } finally {
      setFinishing(false);
    }
  };


  const completedExercises = exercises.filter((ex) => ex.sets.length > 0 && ex.sets.every((s) => s.completed)).length;
  const completedSets = exercises.reduce((acc, ex) => acc + ex.sets.filter((s) => s.completed).length, 0);
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);

  return (
    <Box>
      {daysList.length > 1 && (
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" color="text.secondary" fontWeight={600} sx={{ mb: 1, display: 'block' }}>
            SELECT ROUTINE DAY
          </Typography>
          <Tabs
            value={activeIndex}
            onChange={(e, val) => setSelectedDayIndex && setSelectedDayIndex(val)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                fontWeight: 700,
                borderRadius: 2,
                minHeight: 40,
                mr: 1,
                textTransform: 'none',
              },
            }}
          >
            {daysList.map((day, idx) => (
              <Tab key={idx} label={`Day ${idx + 1}: ${day.dayName}`} />
            ))}
          </Tabs>
        </Box>
      )}

      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
            {displayPlan.name}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            {displayPlan.focus}
          </Typography>
        </Box>
        <Stack direction="row" spacing={2} useFlexGap>
          <Chip
            icon={<FitnessCenterRoundedIcon fontSize="small" />}
            label={`${completedExercises}/${displayPlan.exercises.length} exercises`}
            sx={{ fontWeight: 600 }}
          />
          <Chip
            icon={<TimerRoundedIcon fontSize="small" />}
            label={`${Math.round(totalSets * 1.8)} min est.`}
            sx={{ fontWeight: 600 }}
          />
        </Stack>
      </Stack>

      <Stack spacing={2} sx={{ mb: 4 }}>
        {exercises.map((exercise, index) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exerciseIndex={index}
            onSetComplete={handleSetComplete}
            onSetUpdate={handleSetUpdate}
            onAddSet={() => handleAddSet(index)}
          />
        ))}
      </Stack>

      <Box sx={{ position: 'sticky', bottom: 0, bgcolor: 'background.default', p: 3, borderTop: '1px solid', borderColor: 'divider', mx: { xs: -2, md: 0 }, px: { xs: 2, md: 0 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
          <Button
            variant="contained"
            size="large"
            onClick={handleFinishWorkout}
            disabled={completedSets === 0}
            startIcon={<CheckRoundedIcon />}
            sx={{ px: 4, minWidth: 200 }}
          >
            Finish Workout
          </Button>
        </Stack>
      </Box>

      {/* Workout Completion Confirmation Modal */}
      <Dialog
        open={completionModal.open}
        onClose={() => {
          setCompletionModal({ open: false, workoutName: '' });
          navigate('/dashboard');
        }}
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 2,
            textAlign: 'center',
            bgcolor: 'background.paper',
            border: '1px solid rgba(198, 255, 62, 0.3)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
            maxWidth: 420,
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: 'rgba(198, 255, 62, 0.15)',
              color: '#C6FF3E',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 2,
            }}
          >
            <EmojiEventsRoundedIcon sx={{ fontSize: 36 }} />
          </Box>
          <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
            Workout Completed! <CelebrationRoundedIcon sx={{ fontSize: 26, color: 'primary.main' }} />
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ pb: 2 }}>
          <Typography variant="body1" color="text.secondary">
            Outstanding effort! <strong>{completionModal.workoutName}</strong> has been logged and saved to your progress history.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pt: 1, pb: 1 }}>
          <Button
            variant="contained"
            fullWidth
            size="large"
            onClick={() => {
              setCompletionModal({ open: false, workoutName: '' });
              navigate('/dashboard');
            }}
            sx={{ fontWeight: 700, py: 1.2, borderRadius: 2 }}
          >
            Go to Dashboard
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}