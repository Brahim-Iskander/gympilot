import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  TextField,
  Typography,
  MenuItem,
} from '@mui/material';
import {
  Dumbbell01Icon,
  WeightScaleIcon,
  UserIcon,
  Calendar01Icon,
  RestaurantIcon,
  SparklesIcon,
  Flag01Icon,
  PlusSignIcon,
  Edit02Icon,
  Delete02Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  AlertCircleIcon,
} from 'hugeicons-react';
import { Card, EmptyState, ConfirmDialog } from '../../../components/ui';
import { useAiPlan } from '../../../hooks/useAiPlan';
import { fitnessDataService } from '../../../services/fitnessDataService';

const GOAL_TYPES = [
  { id: 'strength', name: 'Strength', icon: <Dumbbell01Icon size={18} /> },
  { id: 'weight', name: 'Weight', icon: <WeightScaleIcon size={18} /> },
  { id: 'body', name: 'Body Composition', icon: <UserIcon size={18} /> },
  { id: 'frequency', name: 'Workout Frequency', icon: <Calendar01Icon size={18} /> },
  { id: 'nutrition', name: 'Nutrition', icon: <RestaurantIcon size={18} /> },
  { id: 'custom', name: 'Custom', icon: <SparklesIcon size={18} /> },
];

function generateAiGoals(aiPlan) {
  const currentWeight = aiPlan?.weightKg || 75;
  const goalStr = (aiPlan?.goal || 'general fitness').toLowerCase();
  const isGain = goalStr.includes('gain') || goalStr.includes('muscle') || goalStr.includes('bulk');
  const isLoss = goalStr.includes('loss') || goalStr.includes('fat') || goalStr.includes('cut');

  const weightTarget = isGain ? Math.round(currentWeight + 4) : isLoss ? Math.round(currentWeight - 5) : currentWeight;
  const proteinTarget = aiPlan?.nutritionPlan?.protein || Math.round(currentWeight * 2);
  const daysPerWeek = aiPlan?.daysPerWeek || 4;

  const exp = (aiPlan?.experienceLevel || 'beginner').toLowerCase();
  const benchTarget = exp.includes('advanced') ? Math.round(currentWeight * 1.4) : exp.includes('intermediate') ? Math.round(currentWeight * 1.15) : Math.round(currentWeight * 0.9);
  const squatTarget = exp.includes('advanced') ? Math.round(currentWeight * 1.8) : exp.includes('intermediate') ? Math.round(currentWeight * 1.4) : Math.round(currentWeight * 1.1);

  return [
    { id: 1, title: `Target Body Weight (${weightTarget} kg)`, type: 'weight', target: weightTarget, current: currentWeight, unit: 'kg', deadline: '2026-12-31', status: 'active', isAi: true },
    { id: 2, title: `Bench Press Goal (${benchTarget} kg)`, type: 'strength', target: benchTarget, current: Math.round(benchTarget * 0.75), unit: 'kg', deadline: '2026-12-31', status: 'active', isAi: true },
    { id: 3, title: `Squat Goal (${squatTarget} kg)`, type: 'strength', target: squatTarget, current: Math.round(squatTarget * 0.8), unit: 'kg', deadline: '2027-01-31', status: 'active', isAi: true },
    { id: 4, title: `Train ${daysPerWeek} times per week`, type: 'frequency', target: daysPerWeek, current: daysPerWeek, unit: 'days/week', deadline: '2026-09-30', status: 'completed', isAi: true },
    { id: 5, title: `Daily Protein (${proteinTarget}g)`, type: 'nutrition', target: proteinTarget, current: Math.round(proteinTarget * 0.85), unit: 'g', deadline: '2026-09-30', status: 'active', isAi: true },
  ];
}

const statusConfig = {
  active: { label: 'Active', color: 'info', icon: <Clock01Icon size={14} /> },
  completed: { label: 'Completed', color: 'success', icon: <CheckmarkCircle02Icon size={14} /> },
  overdue: { label: 'Overdue', color: 'error', icon: <AlertCircleIcon size={14} /> },
};

function getProgress(goal) {
  if (goal.type === 'custom' && goal.unit === 'min') {
    const range = goal.target * 1.5 - goal.target;
    return Math.min(Math.max(((goal.target * 1.5 - goal.current) / range) * 100, 0), 100);
  }
  return Math.min((goal.current / goal.target) * 100, 100);
}

const STORAGE_KEY = 'gymtrack_user_goals';

export default function GoalsList({ filter = 'all' }) {
  const { aiPlan } = useAiPlan();
  const [goals, setGoals] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [editingGoal, setEditingGoal] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'strength', target: '', current: '', unit: 'kg', deadline: '' });

  useEffect(() => {
    const liveGoals = fitnessDataService.getGoals(aiPlan);
    setGoals(liveGoals);

    const unsubscribe = fitnessDataService.subscribe(() => {
      setGoals(fitnessDataService.getGoals(aiPlan));
    });
    return () => unsubscribe();
  }, [aiPlan]);

  const saveGoalsState = (newGoals) => {
    setGoals(newGoals);
    fitnessDataService.saveGoals(newGoals);
  };

  const handleResetAiGoals = () => {
    const resetGoals = fitnessDataService.generateInitialGoals(aiPlan);
    saveGoalsState(resetGoals);
  };


  const filteredGoals = filter === 'all' ? goals : goals.filter((g) => g.type === filter);

  const handleOpenCreate = () => {
    setEditingGoal(null);
    setForm({ title: '', type: 'strength', target: '', current: '', unit: 'kg', deadline: '' });
    setOpenDialog(true);
  };

  const handleOpenEdit = (goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      type: goal.type,
      target: goal.target.toString(),
      current: goal.current.toString(),
      unit: goal.unit,
      deadline: goal.deadline,
    });
    setOpenDialog(true);
  };

  const handleSave = () => {
    if (!form.title || !form.target) return;
    const progress = getProgress({ ...form, target: Number(form.target), current: Number(form.current || 0) });
    const status = progress >= 100 ? 'completed' : 'active';

    if (editingGoal) {
      const updated = goals.map((g) =>
        g.id === editingGoal.id
          ? { ...g, ...form, target: Number(form.target), current: Number(form.current || 0), status }
          : g
      );
      saveGoalsState(updated);
    } else {
      const newGoal = {
        id: Date.now(),
        ...form,
        target: Number(form.target),
        current: Number(form.current || 0),
        status,
      };
      saveGoalsState([...goals, newGoal]);
    }
    setOpenDialog(false);
  };

  const handleDelete = (id) => {
    const updated = goals.filter((g) => g.id !== id);
    saveGoalsState(updated);
    setDeleteTarget(null);
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="flex-end" spacing={2} sx={{ mb: 3 }}>
        <Button variant="outlined" onClick={handleResetAiGoals} sx={{ borderRadius: 2 }}>
          Reset to AI Goals
        </Button>
        <Button variant="contained" startIcon={<PlusSignIcon size={18} />} onClick={handleOpenCreate}>
          Create Goal
        </Button>
      </Stack>

      {filteredGoals.length === 0 ? (
        <EmptyState
          icon={<Flag01Icon size={56} />}
          title="No goals yet"
          description="Create your first goal to start tracking your fitness targets."
          action={{ onClick: handleOpenCreate }}
          actionLabel="Create Goal"
        />
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
          {filteredGoals.map((goal) => {
            const progress = getProgress(goal);
            const typeInfo = GOAL_TYPES.find((t) => t.id === goal.type);
            const st = statusConfig[goal.status];

            return (
              <Card key={goal.id}>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ flex: 1 }}>
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          borderRadius: 2,
                          bgcolor: 'rgba(198,255,62,0.12)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {typeInfo?.icon || <Flag01Icon size={18} />}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {goal.title}
                          </Typography>
                          {goal.isAi && (
                            <Chip
                              icon={<SparklesIcon size={12} color="#C6FF3E" />}
                              label="AI Proposed"
                              size="small"
                              sx={{ height: 20, fontSize: '0.65rem', fontWeight: 700, bgcolor: 'rgba(198,255,62,0.1)', color: 'primary.main' }}
                            />
                          )}
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          {typeInfo?.name} · Due {new Date(goal.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={0.5}>
                      <IconButton size="small" onClick={() => handleOpenEdit(goal)} sx={{ color: 'text.secondary' }}>
                        <Edit02Icon size={16} />
                      </IconButton>
                      <IconButton size="small" onClick={() => setDeleteTarget(goal)} sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}>
                        <Delete02Icon size={16} />
                      </IconButton>
                    </Stack>
                  </Stack>

                  <Box>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Typography variant="body2" color="text.secondary">
                        {goal.current} / {goal.target} {goal.unit}
                      </Typography>
                      <Chip
                        label={st.label}
                        size="small"
                        icon={st.icon}
                        color={st.color}
                        sx={{ fontWeight: 600, height: 24 }}
                      />
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: 'rgba(255,255,255,0.07)',
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          background: progress >= 100
                            ? 'linear-gradient(90deg, #C6FF3E, #9EFF00)'
                            : 'linear-gradient(90deg, #C6FF3E, #C6FF3E)',
                        },
                      }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                      {Math.round(progress)}%
                    </Typography>
                  </Box>
                </Stack>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Create / Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            boxShadow: '0 24px 60px rgba(0,0,0,0.8)',
          },
        }}
      >
        <DialogTitle sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 700 }}>
          {editingGoal ? 'Edit Goal' : 'Create Goal'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Goal Title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              placeholder="e.g., Bench Press 100 kg"
            />
            <TextField
              select
              label="Type"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              fullWidth
            >
              {GOAL_TYPES.map((t) => (
                <MenuItem key={t.id} value={t.id}>
                  {t.icon} {t.name}
                </MenuItem>
              ))}
            </TextField>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Target"
                type="number"
                value={form.target}
                onChange={(e) => setForm({ ...form, target: e.target.value })}
                fullWidth
              />
              <TextField
                label="Current"
                type="number"
                value={form.current}
                onChange={(e) => setForm({ ...form, current: e.target.value })}
                fullWidth
              />
            </Stack>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Unit"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
                fullWidth
              />
              <TextField
                label="Deadline"
                type="date"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                fullWidth
                slotProps={{ inputLabel: { shrink: true } }}
              />
            </Stack>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button variant="outlined" onClick={() => setOpenDialog(false)}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSave}>
            {editingGoal ? 'Save Changes' : 'Create Goal'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete Goal"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmText="Delete"
        color="error"
        onConfirm={() => handleDelete(deleteTarget?.id)}
      />
    </Box>
  );
}
