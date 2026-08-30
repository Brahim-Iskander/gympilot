import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import StraightenRoundedIcon from '@mui/icons-material/StraightenRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import NotesRoundedIcon from '@mui/icons-material/NotesRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import { EmptyState } from '../../../components/ui';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function TimelineProgress({ entries = [], onEdit, onDelete, onAddNew, onPhotoClick }) {
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      setDeleting(true);
      await onDelete(deleteTargetId);
      setDeleteTargetId(null);
    } catch (err) {
      console.error('Failed to delete entry', err);
    } finally {
      setDeleting(false);
    }
  };

  if (!entries || entries.length === 0) {
    return (
      <EmptyState
        icon={<CalendarTodayRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />}
        title="No progress entries logged yet"
        description="Start tracking your fitness journey by logging body weight, circumference measurements, lifting PRs, or progress photos."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={onAddNew}
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}
          >
            Log First Progress Entry
          </Button>
        }
      />
    );
  }

  return (
    <Box>
      <Stack spacing={3}>
        {entries.map((entry) => {
          const hasWeight = entry.weight != null && entry.weight > 0;
          const measurements = entry.measurements ? Object.entries(entry.measurements) : [];
          const lifts = entry.strengthLogs || [];
          const photos = entry.photos || [];
          const hasNote = entry.note && entry.note.trim().length > 0;

          return (
            <Paper
              key={entry.id}
              elevation={0}
              sx={{
                p: { xs: 2.5, md: 3 },
                borderRadius: 3.5,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                '&:hover': {
                  borderColor: 'rgba(198,255,62,0.3)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.25)',
                },
              }}
            >
              {/* Header: Date + Action Buttons */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      p: 1,
                      borderRadius: 2,
                      bgcolor: 'rgba(198,255,62,0.12)',
                      color: 'primary.main',
                      display: 'flex',
                    }}
                  >
                    <CalendarTodayRoundedIcon fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                      {formatDate(entry.date)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {entry.date}
                    </Typography>
                  </Box>
                </Stack>

                <Stack direction="row" spacing={0.5}>
                  <IconButton
                    size="small"
                    onClick={() => onEdit(entry)}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                    title="Edit entry"
                  >
                    <EditRoundedIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => setDeleteTargetId(entry.id)}
                    sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                    title="Delete entry"
                  >
                    <DeleteOutlineRoundedIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>

              <Divider sx={{ mb: 2.5, opacity: 0.6 }} />

              <Grid container spacing={2.5}>
                {/* Body Weight */}
                {hasWeight && (
                  <Grid item xs={12} sm={6} md={3}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(198,255,62,0.06)',
                        border: '1px solid rgba(198,255,62,0.2)',
                        height: '100%',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                        <MonitorWeightRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          BODY WEIGHT
                        </Typography>
                      </Stack>
                      <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif", color: 'primary.main' }}>
                        {entry.weight}{' '}
                        <Typography component="span" variant="body2" color="text.secondary">
                          {entry.weightUnit || 'kg'}
                        </Typography>
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* Measurements */}
                {measurements.length > 0 && (
                  <Grid item xs={12} sm={hasWeight ? 6 : 12} md={hasWeight ? 9 : 12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(138,124,255,0.06)',
                        border: '1px solid rgba(138,124,255,0.2)',
                        height: '100%',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                        <StraightenRoundedIcon sx={{ fontSize: 18, color: '#8A7CFF' }} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          MEASUREMENTS ({entry.measurementUnit || 'cm'})
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
                        {measurements.map(([key, val]) => (
                          <Chip
                            key={key}
                            label={`${key.replace(/_/g, ' ')}: ${val} ${entry.measurementUnit || 'cm'}`}
                            size="small"
                            sx={{
                              bgcolor: 'rgba(255,255,255,0.06)',
                              color: 'text.primary',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                )}

                {/* Strength Lifts */}
                {lifts.length > 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255,107,107,0.04)',
                        border: '1px solid rgba(255,107,107,0.2)',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <FitnessCenterRoundedIcon sx={{ fontSize: 18, color: '#FF6B6B' }} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          STRENGTH LIFTS & PRS ({lifts.length})
                        </Typography>
                      </Stack>
                      <Grid container spacing={1.5}>
                        {lifts.map((lift, i) => (
                          <Grid item xs={12} sm={6} md={4} key={i}>
                            <Paper
                              elevation={0}
                              sx={{
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.03)',
                                border: '1px solid',
                                borderColor: lift.isPR ? 'rgba(198,255,62,0.4)' : 'rgba(255,255,255,0.06)',
                              }}
                            >
                              <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" fontWeight={700}>
                                  {lift.exerciseName}
                                </Typography>
                                {lift.isPR && (
                                  <Chip
                                    icon={<EmojiEventsRoundedIcon sx={{ fontSize: '14px !important', color: '#0A0C0F !important' }} />}
                                    label="PR"
                                    size="small"
                                    sx={{ bgcolor: '#C6FF3E', color: '#0A0C0F', fontWeight: 800, height: 20, fontSize: '0.65rem' }}
                                  />
                                )}
                              </Stack>
                              <Typography variant="subtitle2" fontWeight={800} color="primary.main" sx={{ mt: 0.5 }}>
                                {lift.weight} kg × {lift.reps} reps {lift.sets > 1 ? `(${lift.sets} sets)` : ''}
                              </Typography>
                              {lift.notes && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                  {lift.notes}
                                </Typography>
                              )}
                            </Paper>
                          </Grid>
                        ))}
                      </Grid>
                    </Box>
                  </Grid>
                )}

                {/* Progress Photos */}
                {photos.length > 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255,152,0,0.04)',
                        border: '1px solid rgba(255,152,0,0.2)',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                        <PhotoCameraRoundedIcon sx={{ fontSize: 18, color: '#FF9800' }} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          PROGRESS PHOTOS ({photos.length})
                        </Typography>
                      </Stack>
                      <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap">
                        {photos.map((photo, pIdx) => (
                          <Box
                            key={photo.id || pIdx}
                            onClick={() => onPhotoClick && onPhotoClick(photo, entry)}
                            sx={{
                              width: 80,
                              height: 106,
                              borderRadius: 2,
                              overflow: 'hidden',
                              bgcolor: 'black',
                              position: 'relative',
                              cursor: 'pointer',
                              border: '1px solid rgba(255,255,255,0.1)',
                              transition: 'transform 0.2s ease',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                borderColor: 'primary.main',
                              },
                            }}
                          >
                            <img
                              src={photo.url}
                              alt={`Progress ${photo.angle}`}
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                right: 0,
                                bgcolor: 'rgba(0,0,0,0.7)',
                                px: 0.5,
                                py: 0.25,
                                textAlign: 'center',
                              }}
                            >
                              <Typography variant="caption" sx={{ fontSize: '0.65rem', fontWeight: 700 }}>
                                {photo.angle}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Box>
                  </Grid>
                )}

                {/* Session Notes */}
                {hasNote && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2.5,
                        bgcolor: 'rgba(255,255,255,0.02)',
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                        <NotesRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="caption" fontWeight={700} color="text.secondary">
                          NOTES
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', lineHeight: 1.6 }}>
                        &ldquo;{entry.note}&rdquo;
                      </Typography>
                    </Box>
                  </Grid>
                )}
              </Grid>
            </Paper>
          );
        })}
      </Stack>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        PaperProps={{ sx: { borderRadius: 3, bgcolor: 'background.paper' } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Progress Entry?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this progress log? This will remove all logged weights, measurements, lifts, and photos for this entry.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteTargetId(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
