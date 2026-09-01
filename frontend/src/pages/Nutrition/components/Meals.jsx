import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Grid,
  Stack,
  TextField,
  Typography,
  styled,
  Dialog,
  DialogContent,
  DialogActions,
  DialogTitle,
  Menu,
  MenuItem,
  IconButton,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import MoreVertRoundedIcon from '@mui/icons-material/MoreVertRounded';
import LocalDiningRoundedIcon from '@mui/icons-material/LocalDiningRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

const StyledCard = styled(Card)(() => ({
  borderRadius: 16,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
}));

const mealCategories = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

function MealCardItem({ meal, onEdit, onDelete }) {
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <StyledCard sx={{ p: 2.5, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: meal.aiScanned ? 'rgba(198,255,62,0.15)' : 'rgba(255,255,255,0.06)',
              color: meal.aiScanned ? 'primary.main' : 'text.secondary',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {meal.aiScanned ? <AutoAwesomeRoundedIcon fontSize="small" /> : <LocalDiningRoundedIcon fontSize="small" />}
          </Box>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 0 }}>
                {meal.title}
              </Typography>
              {meal.aiScanned && (
                <Chip label="AI Scanned" size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main' }} />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {meal.type} · {meal.time || 'Logged today'}
            </Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ color: 'text.secondary' }}>
          <MoreVertRoundedIcon fontSize="small" />
        </IconButton>
      </Stack>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
        {meal.items || 'No detailed ingredient description'}
      </Typography>

      <Grid container spacing={1} sx={{ pt: 1, borderTop: '1px solid', borderColor: 'divider' }}>
        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">Calories</Typography>
          <Typography variant="body1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#FF6B6B' }}>
            {meal.calories} kcal
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">Protein</Typography>
          <Typography variant="body1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#C6FF3E' }}>
            {meal.protein}g
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">Carbs</Typography>
          <Typography variant="body1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#8A7CFF' }}>
            {meal.carbs}g
          </Typography>
        </Grid>
        <Grid item xs={3}>
          <Typography variant="caption" color="text.secondary">Fat</Typography>
          <Typography variant="body1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#FFC107' }}>
            {meal.fat}g
          </Typography>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{ sx: { borderRadius: 2, border: '1px solid', borderColor: 'divider' } }}
      >
        <MenuItem onClick={() => { setAnchorEl(null); onEdit(meal); }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <EditRoundedIcon fontSize="small" color="action" />
            <Typography variant="body2">Edit</Typography>
          </Stack>
        </MenuItem>
        <MenuItem onClick={() => { setAnchorEl(null); onDelete(meal.id); }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <DeleteRoundedIcon fontSize="small" color="error" />
            <Typography variant="body2" color="error">Delete</Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </StyledCard>
  );
}

export default function Meals({ aiPlan, loading, dailyNutrition, nutritionTotals, logMeal, deleteMeal }) {
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState('All');
  const [openAddModal, setOpenAddModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);

  const [form, setForm] = useState({
    title: '',
    type: 'Lunch',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    items: '',
  });

  const meals = dailyNutrition?.meals || [];
  const filteredMeals = filterType === 'All' ? meals : meals.filter((m) => m.type?.toLowerCase() === filterType.toLowerCase());

  const handleOpenAdd = () => {
    setEditingMeal(null);
    setForm({ title: '', type: 'Lunch', calories: '', protein: '', carbs: '', fat: '', items: '' });
    setOpenAddModal(true);
  };

  const handleOpenEdit = (meal) => {
    setEditingMeal(meal);
    setForm({
      title: meal.title,
      type: meal.type || 'Lunch',
      calories: meal.calories || '',
      protein: meal.protein || '',
      carbs: meal.carbs || '',
      fat: meal.fat || '',
      items: meal.items || '',
    });
    setOpenAddModal(true);
  };

  const handleSaveMeal = () => {
    if (!form.title) return;
    if (editingMeal) {
      deleteMeal(editingMeal.id);
    }
    logMeal({
      id: editingMeal ? editingMeal.id : undefined,
      title: form.title,
      type: form.type,
      calories: Number(form.calories) || 0,
      protein: Number(form.protein) || 0,
      carbs: Number(form.carbs) || 0,
      fat: Number(form.fat) || 0,
      items: form.items,
      aiScanned: editingMeal ? editingMeal.aiScanned : false,
    });
    setOpenAddModal(false);
  };

  return (
    <Box>
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 3 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {['All', ...mealCategories].map((cat) => (
            <Chip
              key={cat}
              label={cat}
              onClick={() => setFilterType(cat)}
              variant={filterType === cat ? 'filled' : 'outlined'}
              sx={{
                fontWeight: 700,
                bgcolor: filterType === cat ? 'primary.main' : 'transparent',
                color: filterType === cat ? 'primary.contrastText' : 'text.secondary',
                borderColor: filterType === cat ? 'primary.main' : 'divider',
                cursor: 'pointer',
              }}
            />
          ))}
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AutoAwesomeRoundedIcon />}
            onClick={() => navigate('/calories-calculator')}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            AI Photo Scan
          </Button>
          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenAdd}
            sx={{ borderRadius: 2.5, fontWeight: 700 }}
          >
            + Custom Meal
          </Button>
        </Stack>
      </Stack>

      {filteredMeals.length === 0 ? (
        <StyledCard sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
            No meals found in this category
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Use our AI Calorie Calculator or add a manual meal to start tracking your macros today.
          </Typography>
          <Button variant="contained" color="primary" onClick={handleOpenAdd} sx={{ borderRadius: 2 }}>
            Add Meal Now
          </Button>
        </StyledCard>
      ) : (
        <Grid container spacing={2.5}>
          {filteredMeals.map((meal) => (
            <Grid item xs={12} sm={6} md={4} key={meal.id}>
              <MealCardItem meal={meal} onEdit={handleOpenEdit} onDelete={deleteMeal} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={openAddModal} onClose={() => setOpenAddModal(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
        <DialogTitle sx={{ fontWeight: 800 }}>
          {editingMeal ? 'Edit Meal' : 'Add Custom Meal'}
        </DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 1 }}>
            <TextField
              label="Meal Title"
              placeholder="e.g., Grilled Salmon & Brown Rice"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={form.type}
                label="Category"
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {mealCategories.map((c) => (
                  <MenuItem key={c} value={c}>{c}</MenuItem>
                ))}
              </Select>
            </FormControl>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Calories (kcal)"
                  type="number"
                  value={form.calories}
                  onChange={(e) => setForm({ ...form, calories: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Protein (g)"
                  type="number"
                  value={form.protein}
                  onChange={(e) => setForm({ ...form, protein: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Carbs (g)"
                  type="number"
                  value={form.carbs}
                  onChange={(e) => setForm({ ...form, carbs: e.target.value })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Fat (g)"
                  type="number"
                  value={form.fat}
                  onChange={(e) => setForm({ ...form, fat: e.target.value })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <TextField
              label="Ingredients / Description"
              placeholder="e.g., 200g chicken breast, 1 cup cooked rice, olive oil"
              value={form.items}
              onChange={(e) => setForm({ ...form, items: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenAddModal(false)}>Cancel</Button>
          <Button variant="contained" color="primary" onClick={handleSaveMeal} sx={{ borderRadius: 2, fontWeight: 700 }}>
            {editingMeal ? 'Save Changes' : 'Add Meal'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}