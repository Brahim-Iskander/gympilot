import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  Alert,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

const COMMON_MEASUREMENT_KEYS = [
  { key: 'chest', label: 'Chest' },
  { key: 'waist', label: 'Waist' },
  { key: 'hips', label: 'Hips' },
  { key: 'arms', label: 'Arms / Biceps' },
  { key: 'thighs', label: 'Thighs' },
  { key: 'neck', label: 'Neck' },
  { key: 'calves', label: 'Calves' },
  { key: 'shoulders', label: 'Shoulders' },
];

const PHOTO_ANGLES = ['Front', 'Side', 'Back', 'Other'];

export default function AddEntryModal({ open, onClose, onSave, initialData = null }) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [weightUnit, setWeightUnit] = useState('kg');

  // Measurements map { [key]: value }
  const [measurements, setMeasurements] = useState({});
  const [measurementUnit, setMeasurementUnit] = useState('cm');
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [showCustomKeyInput, setShowCustomKeyInput] = useState(false);

  // Strength logs array [{ exerciseName, weight, reps, sets, isPR, notes }]
  const [strengthLogs, setStrengthLogs] = useState([]);

  // Photos array [{ id, angle, url, caption }]
  const [photos, setPhotos] = useState([]);

  // Note
  const [note, setNote] = useState('');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (initialData) {
        setDate(initialData.date ? initialData.date.toString() : new Date().toISOString().split('T')[0]);
        setWeight(initialData.weight != null ? String(initialData.weight) : '');
        setWeightUnit(initialData.weightUnit || 'kg');
        setMeasurements(initialData.measurements ? { ...initialData.measurements } : {});
        setMeasurementUnit(initialData.measurementUnit || 'cm');
        setStrengthLogs(initialData.strengthLogs ? initialData.strengthLogs.map((l) => ({ ...l })) : []);
        setPhotos(initialData.photos ? initialData.photos.map((p) => ({ ...p })) : []);
        setNote(initialData.note || '');
      } else {
        setDate(new Date().toISOString().split('T')[0]);
        setWeight('');
        setWeightUnit('kg');
        setMeasurements({});
        setMeasurementUnit('cm');
        setStrengthLogs([]);
        setPhotos([]);
        setNote('');
      }
      setError('');
    }
  }, [open, initialData]);

  const handleMeasurementChange = (key, val) => {
    setMeasurements((prev) => {
      const next = { ...prev };
      if (val === '' || isNaN(val)) {
        delete next[key];
      } else {
        next[key] = parseFloat(val);
      }
      return next;
    });
  };

  const handleAddCustomMeasurement = () => {
    const trimmed = customKeyInput.trim().toLowerCase().replace(/\s+/g, '_');
    if (!trimmed) return;
    setMeasurements((prev) => ({ ...prev, [trimmed]: '' }));
    setCustomKeyInput('');
    setShowCustomKeyInput(false);
  };

  const handleAddStrengthLog = () => {
    setStrengthLogs((prev) => [
      ...prev,
      { exerciseName: '', weight: '', reps: 10, sets: 3, isPR: false, notes: '' },
    ]);
  };

  const handleUpdateStrengthLog = (index, field, value) => {
    setStrengthLogs((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleRemoveStrengthLog = (index) => {
    setStrengthLogs((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result;
        setPhotos((prev) => [
          ...prev,
          {
            id: `photo-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
            angle: 'Front',
            url: base64,
            caption: '',
            uploadedAt: new Date().toISOString(),
          },
        ]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const handleUpdatePhotoAngle = (index, angle) => {
    setPhotos((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], angle };
      return updated;
    });
  };

  const handleRemovePhoto = (index) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError('');

    // Check if at least one piece of data is filled
    const hasWeight = weight !== '' && !isNaN(Number(weight)) && Number(weight) > 0;
    const cleanMeasurements = {};
    Object.entries(measurements).forEach(([k, v]) => {
      if (v !== '' && !isNaN(Number(v)) && Number(v) > 0) {
        cleanMeasurements[k] = Number(v);
      }
    });
    const hasMeasurements = Object.keys(cleanMeasurements).length > 0;

    const cleanStrengthLogs = strengthLogs
      .filter((l) => l.exerciseName.trim())
      .map((l) => ({
        exerciseName: l.exerciseName.trim(),
        weight: l.weight !== '' && !isNaN(Number(l.weight)) ? Number(l.weight) : 0,
        reps: parseInt(l.reps, 10) || 1,
        sets: parseInt(l.sets, 10) || 1,
        isPR: Boolean(l.isPR),
        notes: l.notes ? l.notes.trim() : '',
      }));
    const hasStrength = cleanStrengthLogs.length > 0;

    const hasPhotos = photos.length > 0;
    const hasNote = note.trim().length > 0;

    if (!hasWeight && !hasMeasurements && !hasStrength && !hasPhotos && !hasNote) {
      setError('Please fill in at least one progress field (weight, measurement, lift, photo, or note) to save.');
      return;
    }

    const payload = {
      date,
      weight: hasWeight ? Number(weight) : null,
      weightUnit,
      measurements: hasMeasurements ? cleanMeasurements : null,
      measurementUnit,
      strengthLogs: hasStrength ? cleanStrengthLogs : [],
      photos,
      note: hasNote ? note.trim() : null,
    };

    try {
      setSaving(true);
      await onSave(payload, initialData?.id);
      onClose();
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to save progress entry.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif" }}>
            {initialData ? 'Edit Progress Entry' : 'Log Progress Entry'}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Log body metrics, strength PRs, photos, or workout notes for any date.
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Stack spacing={3}>
          {error && <Alert severity="error">{error}</Alert>}

          {/* Date Selector */}
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Entry Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  helperText="Default is today. You can also log for past dates."
                />
              </Grid>
            </Grid>
          </Paper>

          {/* 1. Body Weight Section */}
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', display: 'flex' }}>
                <MonitorWeightRoundedIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Body Weight
              </Typography>
            </Stack>

            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Weight"
                  type="number"
                  placeholder="e.g. 78.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  fullWidth
                  size="small"
                  inputProps={{ step: '0.1', min: '0' }}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <Select
                          size="small"
                          value={weightUnit}
                          onChange={(e) => setWeightUnit(e.target.value)}
                          variant="standard"
                          disableUnderline
                          sx={{ fontWeight: 700, fontSize: '0.85rem' }}
                        >
                          <MenuItem value="kg">kg</MenuItem>
                          <MenuItem value="lbs">lbs</MenuItem>
                        </Select>
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* 2. Body Measurements Section */}
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(138,124,255,0.12)', color: '#8A7CFF', display: 'flex' }}>
                  <StraightenRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Body Circumference Measurements
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Flexible key/value measurements. Fill only what you measured.
                  </Typography>
                </Box>
              </Stack>
              <Select
                size="small"
                value={measurementUnit}
                onChange={(e) => setMeasurementUnit(e.target.value)}
                sx={{ height: 32, fontSize: '0.8rem', fontWeight: 700 }}
              >
                <MenuItem value="cm">cm</MenuItem>
                <MenuItem value="in">in</MenuItem>
              </Select>
            </Stack>

            <Grid container spacing={2}>
              {COMMON_MEASUREMENT_KEYS.map(({ key, label }) => (
                <Grid item xs={6} sm={4} md={3} key={key}>
                  <TextField
                    label={label}
                    type="number"
                    size="small"
                    placeholder="—"
                    value={measurements[key] ?? ''}
                    onChange={(e) => handleMeasurementChange(key, e.target.value)}
                    fullWidth
                    inputProps={{ step: '0.1', min: '0' }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <Typography variant="caption" color="text.secondary">{measurementUnit}</Typography>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              ))}

              {/* Any additional custom keys */}
              {Object.keys(measurements)
                .filter((k) => !COMMON_MEASUREMENT_KEYS.some((c) => c.key === k))
                .map((customKey) => (
                  <Grid item xs={6} sm={4} md={3} key={customKey}>
                    <TextField
                      label={customKey.replace(/_/g, ' ')}
                      type="number"
                      size="small"
                      value={measurements[customKey] ?? ''}
                      onChange={(e) => handleMeasurementChange(customKey, e.target.value)}
                      fullWidth
                      inputProps={{ step: '0.1', min: '0' }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <Typography variant="caption" color="text.secondary">{measurementUnit}</Typography>
                            <IconButton size="small" onClick={() => handleMeasurementChange(customKey, '')}>
                              <CloseRoundedIcon fontSize="inherit" />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                ))}
            </Grid>

            {showCustomKeyInput ? (
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2, maxWidth: 320 }}>
                <TextField
                  size="small"
                  placeholder="e.g. Forearms, Forehead"
                  value={customKeyInput}
                  onChange={(e) => setCustomKeyInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCustomMeasurement()}
                />
                <Button size="small" variant="contained" onClick={handleAddCustomMeasurement}>
                  Add
                </Button>
                <Button size="small" variant="text" onClick={() => setShowCustomKeyInput(false)}>
                  Cancel
                </Button>
              </Stack>
            ) : (
              <Button
                size="small"
                startIcon={<AddRoundedIcon />}
                onClick={() => setShowCustomKeyInput(true)}
                sx={{ mt: 2, textTransform: 'none', fontWeight: 700 }}
              >
                + Add Custom Body Part
              </Button>
            )}
          </Paper>

          {/* 3. Strength Lifts Section */}
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(255,107,107,0.12)', color: '#FF6B6B', display: 'flex' }}>
                  <FitnessCenterRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Strength Logs & Personal Records
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Log key lifts, top working sets, and mark any new PRs.
                  </Typography>
                </Box>
              </Stack>
              <Button
                size="small"
                variant="outlined"
                startIcon={<AddRoundedIcon />}
                onClick={handleAddStrengthLog}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Add Lift
              </Button>
            </Stack>

            {strengthLogs.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No lifts added for this entry. Click &quot;Add Lift&quot; to track Bench, Squat, Deadlift, etc.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2}>
                {strengthLogs.map((log, index) => (
                  <Paper
                    key={index}
                    elevation={0}
                    sx={{
                      p: 2,
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid',
                      borderColor: log.isPR ? 'rgba(198,255,62,0.4)' : 'divider',
                      borderRadius: 2.5,
                    }}
                  >
                    <Grid container spacing={1.5} alignItems="center">
                      <Grid item xs={12} sm={4}>
                        <TextField
                          label="Exercise"
                          size="small"
                          placeholder="e.g. Barbell Bench Press"
                          value={log.exerciseName}
                          onChange={(e) => handleUpdateStrengthLog(index, 'exerciseName', e.target.value)}
                          fullWidth
                        />
                      </Grid>
                      <Grid item xs={4} sm={2}>
                        <TextField
                          label="Weight (kg)"
                          type="number"
                          size="small"
                          value={log.weight}
                          onChange={(e) => handleUpdateStrengthLog(index, 'weight', e.target.value)}
                          fullWidth
                          inputProps={{ step: '0.5', min: '0' }}
                        />
                      </Grid>
                      <Grid item xs={4} sm={1.5}>
                        <TextField
                          label="Reps"
                          type="number"
                          size="small"
                          value={log.reps}
                          onChange={(e) => handleUpdateStrengthLog(index, 'reps', e.target.value)}
                          fullWidth
                          inputProps={{ min: '1' }}
                        />
                      </Grid>
                      <Grid item xs={4} sm={1.5}>
                        <TextField
                          label="Sets"
                          type="number"
                          size="small"
                          value={log.sets}
                          onChange={(e) => handleUpdateStrengthLog(index, 'sets', e.target.value)}
                          fullWidth
                          inputProps={{ min: '1' }}
                        />
                      </Grid>
                      <Grid item xs={9} sm={2.5}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={Boolean(log.isPR)}
                              onChange={(e) => handleUpdateStrengthLog(index, 'isPR', e.target.checked)}
                              color="primary"
                              size="small"
                            />
                          }
                          label={
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <EmojiEventsRoundedIcon sx={{ fontSize: 16, color: log.isPR ? '#C6FF3E' : 'text.secondary' }} />
                              <Typography variant="caption" fontWeight={700} color={log.isPR ? 'primary.main' : 'text.secondary'}>
                                New PR!
                              </Typography>
                            </Stack>
                          }
                        />
                      </Grid>
                      <Grid item xs={3} sm={0.5} sx={{ textAlign: 'right' }}>
                        <IconButton size="small" color="error" onClick={() => handleRemoveStrengthLog(index)}>
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </Grid>
                    </Grid>
                  </Paper>
                ))}
              </Stack>
            )}
          </Paper>

          {/* 4. Progress Photos Section */}
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(255,152,0,0.12)', color: '#FF9800', display: 'flex' }}>
                  <PhotoCameraRoundedIcon fontSize="small" />
                </Box>
                <Box>
                  <Typography variant="subtitle1" fontWeight={800}>
                    Progress Photos
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tag photos by angle (Front, Side, Back, Other) for side-by-side comparison.
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="outlined"
                component="label"
                size="small"
                startIcon={<PhotoCameraRoundedIcon />}
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                Upload Photos
                <input type="file" hidden multiple accept="image/*" onChange={handlePhotoUpload} />
              </Button>
            </Stack>

            {photos.length === 0 ? (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No photos attached to this entry.
                </Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {photos.map((photo, idx) => (
                  <Grid item xs={6} sm={4} md={3} key={photo.id || idx}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1,
                        bgcolor: 'rgba(255,255,255,0.04)',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2.5,
                        position: 'relative',
                      }}
                    >
                      <Box
                        sx={{
                          aspectRatio: '3/4',
                          borderRadius: 2,
                          overflow: 'hidden',
                          bgcolor: 'black',
                          mb: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <img
                          src={photo.url}
                          alt={`Progress ${photo.angle}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                        <Select
                          size="small"
                          value={photo.angle || 'Front'}
                          onChange={(e) => handleUpdatePhotoAngle(idx, e.target.value)}
                          sx={{ height: 28, fontSize: '0.75rem', fontWeight: 700, flex: 1 }}
                        >
                          {PHOTO_ANGLES.map((angle) => (
                            <MenuItem key={angle} value={angle}>
                              {angle}
                            </MenuItem>
                          ))}
                        </Select>
                        <IconButton size="small" color="error" onClick={() => handleRemovePhoto(idx)}>
                          <DeleteOutlineRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            )}
          </Paper>

          {/* 5. Notes Section */}
          <Paper elevation={0} sx={{ p: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Box sx={{ p: 0.75, borderRadius: 2, bgcolor: 'rgba(33,150,243,0.12)', color: '#2196F3', display: 'flex' }}>
                <NotesRoundedIcon fontSize="small" />
              </Box>
              <Typography variant="subtitle1" fontWeight={800}>
                Session Notes & Reflections
              </Typography>
            </Stack>
            <TextField
              placeholder="e.g. Felt energetic today, hit good depth on squats. Nutrition on point, 3L water."
              multiline
              rows={3}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              size="small"
            />
          </Paper>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={saving} sx={{ color: 'text.secondary', fontWeight: 700 }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving}
          sx={{ fontWeight: 800, px: 3, borderRadius: 2.5 }}
        >
          {saving ? 'Saving...' : initialData ? 'Update Entry' : 'Save Entry'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
