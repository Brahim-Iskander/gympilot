import { useState } from 'react';
import { Box, Button, Card, Chip, Grid, Stack, TextField, Typography, styled, Dialog, DialogContent, DialogActions, Menu, MenuItem, IconButton, CircularProgress } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

function MealCard({ meal, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  return (
    <StyledCard sx={{ p: 2, height: '100%' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 2,
              bgcolor: 'rgba(198,255,62,0.12)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <LocalDiningRoundedIcon fontSize="small" />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 0.25 }}>
              {meal.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">{meal.items}</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={handleMenuOpen} sx={{ color: 'text.secondary' }}>
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Grid container spacing={1} sx={{ mb: 1.5 }}>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Calories</Typography>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#FF6B6B' }}>
            {meal.calories} kcal
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Protein</Typography>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#C6FF3E' }}>
            {meal.protein}g
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Carbs</Typography>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#8A7CFF' }}>
            {meal.carbs}g
          </Typography>
        </Grid>
        <Grid item xs={6}>
          <Typography variant="caption" color="text.secondary">Fat</Typography>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#FFC107' }}>
            {meal.fat}g
          </Typography>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' } }}
      >
        <MenuItem onClick={() => { handleMenuClose(); onEdit(meal); }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditRoundedIcon fontSize="small" color="action" />
            <Typography variant="body2">Edit</Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={() => { handleMenuClose(); onDelete(meal); }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteRoundedIcon fontSize="small" color="error" />
            <Typography variant="body2" color="error.main">Delete</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </StyledCard>
  );
}

export default function Meals({ aiPlan, loading }) {
  if (loading) {
    return (
      <Box sx={{ py: 8, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading meals...</Typography>
      </Box>
    );
  }

  const targetCalories = aiPlan?.nutritionPlan?.dailyCalories || 2200;
  const targetProtein = aiPlan?.nutritionPlan?.protein || 160;
  const targetCarbs = aiPlan?.nutritionPlan?.carbs || 230;
  const targetFat = aiPlan?.nutritionPlan?.fat || 70;

  const mealSuggestions = aiPlan?.nutritionPlan?.mealSuggestions || [];

  const displayMeals = mealSuggestions.length > 0 ? mealSuggestions.map((suggestion, idx) => {
    const parts = suggestion.split(':');
    let name = `Meal ${idx + 1}`;
    let items = suggestion;
    if (parts.length > 1) {
      name = parts[0].trim();
      items = parts.slice(1).join(':').trim();
    }
    const numMeals = mealSuggestions.length;
    return {
      id: `ai-${idx}`,
      name,
      items,
      calories: Math.round(targetCalories / numMeals),
      protein: Math.round(targetProtein / numMeals),
      carbs: Math.round(targetCarbs / numMeals),
      fat: Math.round(targetFat / numMeals),
    };
  }) : [
    { id: 'm-1', name: 'Breakfast', items: 'Scrambled eggs with whole grain toast', calories: Math.round(targetCalories * 0.25), protein: Math.round(targetProtein * 0.25), carbs: Math.round(targetCarbs * 0.25), fat: Math.round(targetFat * 0.25) },
    { id: 'm-2', name: 'Lunch', items: 'Grilled chicken breast with quinoa and vegetables', calories: Math.round(targetCalories * 0.35), protein: Math.round(targetProtein * 0.35), carbs: Math.round(targetCarbs * 0.35), fat: Math.round(targetFat * 0.35) },
    { id: 'm-3', name: 'Dinner', items: 'Lean beef stir-fry with brown rice', calories: Math.round(targetCalories * 0.30), protein: Math.round(targetProtein * 0.30), carbs: Math.round(targetCarbs * 0.30), fat: Math.round(targetFat * 0.30) },
    { id: 'm-4', name: 'Snacks', items: 'Greek yogurt with almonds and honey', calories: Math.round(targetCalories * 0.10), protein: Math.round(targetProtein * 0.10), carbs: Math.round(targetCarbs * 0.10), fat: Math.round(targetFat * 0.10) },
  ];

  const [showAddMeal, setShowAddMeal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [formData, setFormData] = useState({
    name: 'Breakfast',
    items: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });

  const handleEdit = (meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      items: meal.items,
      calories: meal.calories.toString(),
      protein: meal.protein.toString(),
      carbs: meal.carbs.toString(),
      fat: meal.fat.toString(),
    });
    setShowAddMeal(true);
  };

  const handleDelete = (meal) => {
    if (window.confirm(`Delete ${meal.name}?`)) {
      alert(`Deleted ${meal.name}`);
    }
  };

  const handleSubmit = () => {
    if (editingMeal) {
      alert(`Updated ${formData.name}`);
    } else {
      alert(`Added ${formData.name}`);
    }
    setShowAddMeal(false);
    setEditingMeal(null);
    setFormData({ name: 'Breakfast', items: '', calories: '', protein: '', carbs: '', fat: '' });
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
          Meals
        </Typography>
        <Button variant="outlined" startIcon={<AddRoundedIcon />} onClick={() => { setEditingMeal(null); setFormData({ name: 'Breakfast', items: '', calories: '', protein: '', carbs: '', fat: '' }); setShowAddMeal(true); }} size="small">
          Add Meal
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {displayMeals.map((meal) => (
          <Grid item xs={12} sm={6} md={3} key={meal.id}>
            <MealCard meal={meal} onEdit={handleEdit} onDelete={handleDelete} />
          </Grid>
        ))}
      </Grid>

      <Dialog open={showAddMeal} onClose={() => { setShowAddMeal(false); setEditingMeal(null); setFormData({ name: 'Breakfast', items: '', calories: '', protein: '', carbs: '', fat: '' }); }} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' } }}>
        <DialogContent>
          <Stack spacing={2} sx={{ p: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {editingMeal ? 'Edit Meal' : 'Add Meal'}
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  select
                  label="Meal Type"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  fullWidth
                  size="small"
                  SelectProps={{ native: true }}
                >
                  {mealTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Food Items"
                  value={formData.items}
                  onChange={(e) => setFormData({ ...formData, items: e.target.value })}
                  fullWidth
                  size="small"
                  placeholder="e.g., Chicken + Rice + Broccoli"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Calories (kcal)"
                  type="number"
                  value={formData.calories}
                  onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  fullWidth
                  size="small"
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Protein (g)"
                  type="number"
                  value={formData.protein}
                  onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  fullWidth
                  size="small"
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Carbs (g)"
                  type="number"
                  value={formData.carbs}
                  onChange={(e) => setFormData({ ...formData, carbs: e.target.value })}
                  fullWidth
                  size="small"
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Fat (g)"
                  type="number"
                  value={formData.fat}
                  onChange={(e) => setFormData({ ...formData, fat: e.target.value })}
                  fullWidth
                  size="small"
                  inputProps={{ inputMode: 'numeric' }}
                />
              </Grid>
            </Grid>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setShowAddMeal(false); setEditingMeal(null); setFormData({ name: 'Breakfast', items: '', calories: '', protein: '', carbs: '', fat: '' }); }}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmit}>
            {editingMeal ? 'Update' : 'Add Meal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}