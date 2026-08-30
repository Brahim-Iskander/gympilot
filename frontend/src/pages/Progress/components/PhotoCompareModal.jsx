import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import CalendarTodayRoundedIcon from '@mui/icons-material/CalendarTodayRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getDaysBetween(date1, date2) {
  if (!date1 || !date2) return null;
  const d1 = new Date(date1 + 'T00:00:00');
  const d2 = new Date(date2 + 'T00:00:00');
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export default function PhotoCompareModal({ open, onClose, entries = [] }) {
  // Collect all photos with their entry date
  const allPhotos = useMemo(() => {
    const list = [];
    entries.forEach((entry) => {
      if (entry.photos && entry.photos.length > 0) {
        entry.photos.forEach((photo) => {
          list.push({
            ...photo,
            entryDate: entry.date,
            weight: entry.weight,
            weightUnit: entry.weightUnit,
          });
        });
      }
    });
    // Sort oldest first for before -> after
    return list.sort((a, b) => (a.entryDate > b.entryDate ? 1 : -1));
  }, [entries]);

  const [angleFilter, setAngleFilter] = useState('All');

  const filteredPhotos = useMemo(() => {
    if (angleFilter === 'All') return allPhotos;
    return allPhotos.filter((p) => (p.angle || '').toLowerCase() === angleFilter.toLowerCase());
  }, [allPhotos, angleFilter]);

  // Selected photo indices or IDs
  const [beforePhotoId, setBeforePhotoId] = useState(null);
  const [afterPhotoId, setAfterPhotoId] = useState(null);

  // Initialize selections when list changes
  const beforePhoto = useMemo(() => {
    if (beforePhotoId) {
      const found = filteredPhotos.find((p) => p.id === beforePhotoId);
      if (found) return found;
    }
    return filteredPhotos.length > 0 ? filteredPhotos[0] : null;
  }, [filteredPhotos, beforePhotoId]);

  const afterPhoto = useMemo(() => {
    if (afterPhotoId) {
      const found = filteredPhotos.find((p) => p.id === afterPhotoId);
      if (found) return found;
    }
    return filteredPhotos.length > 1 ? filteredPhotos[filteredPhotos.length - 1] : filteredPhotos[0] || null;
  }, [filteredPhotos, afterPhotoId]);

  const daysBetween = useMemo(() => {
    if (!beforePhoto || !afterPhoto) return null;
    return getDaysBetween(beforePhoto.entryDate, afterPhoto.entryDate);
  }, [beforePhoto, afterPhoto]);

  const weightDiff = useMemo(() => {
    if (!beforePhoto?.weight || !afterPhoto?.weight) return null;
    const diff = (afterPhoto.weight - beforePhoto.weight).toFixed(1);
    return Number(diff);
  }, [beforePhoto, afterPhoto]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          backgroundImage: 'radial-gradient(ellipse at top, rgba(198,255,62,0.03), transparent 70%)',
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', display: 'flex' }}>
            <CompareArrowsRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
              Side-by-Side Photo Comparison
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Compare your physique transformation between two specific milestone dates.
            </Typography>
          </Box>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2.5 }}>
        {allPhotos.length < 2 ? (
          <Box sx={{ py: 8, textAlign: 'center' }}>
            <PhotoCameraRoundedIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
            <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
              Need at least 2 progress photos to compare
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto' }}>
              Log multiple progress entries with photos across different dates to unlock side-by-side transformation analysis.
            </Typography>
          </Box>
        ) : (
          <Stack spacing={3}>
            {/* Top Toolbar: Angle Filter + Transformation Pill */}
            <Paper
              elevation={0}
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.02)',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 2,
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="caption" fontWeight={700} color="text.secondary">
                  FILTER BY ANGLE:
                </Typography>
                {['All', 'Front', 'Side', 'Back', 'Other'].map((angle) => (
                  <Chip
                    key={angle}
                    label={angle}
                    size="small"
                    onClick={() => setAngleFilter(angle)}
                    variant={angleFilter === angle ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: 700,
                      bgcolor: angleFilter === angle ? 'primary.main' : 'transparent',
                      color: angleFilter === angle ? 'primary.contrastText' : 'text.secondary',
                      borderColor: angleFilter === angle ? 'primary.main' : 'divider',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Stack>

              {daysBetween != null && (
                <Chip
                  icon={<CalendarTodayRoundedIcon sx={{ fontSize: '14px !important' }} />}
                  label={`${daysBetween} days apart ${weightDiff != null ? `(${weightDiff >= 0 ? '+' : ''}${weightDiff} kg)` : ''}`}
                  sx={{
                    bgcolor: 'rgba(198,255,62,0.12)',
                    color: 'primary.main',
                    fontWeight: 800,
                    border: '1px solid rgba(198,255,62,0.3)',
                  }}
                />
              )}
            </Paper>

            {/* Side-by-Side Comparison Container */}
            <Grid container spacing={3}>
              {/* Left: Before Photo */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip label="BEFORE / EARLIER" size="small" color="default" sx={{ fontWeight: 800 }} />
                    <Select
                      size="small"
                      value={beforePhoto?.id || ''}
                      onChange={(e) => setBeforePhotoId(e.target.value)}
                      sx={{ height: 32, fontSize: '0.8rem', minWidth: 160 }}
                    >
                      {filteredPhotos.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.entryDate} • {p.angle || 'Photo'}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>

                  {beforePhoto ? (
                    <Box>
                      <Box
                        sx={{
                          aspectRatio: '3/4',
                          maxHeight: 480,
                          borderRadius: 3,
                          overflow: 'hidden',
                          bgcolor: '#0A0C0F',
                          border: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <img
                          src={beforePhoto.url}
                          alt="Before photo"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {formatDate(beforePhoto.entryDate)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Angle: {beforePhoto.angle || 'Front'}
                          </Typography>
                        </Box>
                        {beforePhoto.weight && (
                          <Chip
                            label={`${beforePhoto.weight} ${beforePhoto.weightUnit || 'kg'}`}
                            size="small"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No photo selected.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>

              {/* Right: After Photo */}
              <Grid item xs={12} md={6}>
                <Paper
                  elevation={0}
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    bgcolor: 'rgba(255,255,255,0.02)',
                    border: '1px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip label="AFTER / LATER" size="small" color="primary" sx={{ fontWeight: 800 }} />
                    <Select
                      size="small"
                      value={afterPhoto?.id || ''}
                      onChange={(e) => setAfterPhotoId(e.target.value)}
                      sx={{ height: 32, fontSize: '0.8rem', minWidth: 160 }}
                    >
                      {filteredPhotos.map((p) => (
                        <MenuItem key={p.id} value={p.id}>
                          {p.entryDate} • {p.angle || 'Photo'}
                        </MenuItem>
                      ))}
                    </Select>
                  </Stack>

                  {afterPhoto ? (
                    <Box>
                      <Box
                        sx={{
                          aspectRatio: '3/4',
                          maxHeight: 480,
                          borderRadius: 3,
                          overflow: 'hidden',
                          bgcolor: '#0A0C0F',
                          border: '1px solid rgba(255,255,255,0.08)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mb: 2,
                        }}
                      >
                        <img
                          src={afterPhoto.url}
                          alt="After photo"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </Box>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="subtitle2" fontWeight={800}>
                            {formatDate(afterPhoto.entryDate)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Angle: {afterPhoto.angle || 'Front'}
                          </Typography>
                        </Box>
                        {afterPhoto.weight && (
                          <Chip
                            label={`${afterPhoto.weight} ${afterPhoto.weightUnit || 'kg'}`}
                            size="small"
                            color="primary"
                            sx={{ fontWeight: 700 }}
                          />
                        )}
                      </Stack>
                    </Box>
                  ) : (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                      <Typography variant="body2" color="text.secondary">
                        No photo selected.
                      </Typography>
                    </Box>
                  )}
                </Paper>
              </Grid>
            </Grid>
          </Stack>
        )}
      </DialogContent>
    </Dialog>
  );
}
