import { useState, useMemo } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  Grid,
  IconButton,
  Stack,
  Typography,
  styled,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import ExpandRoundedIcon from '@mui/icons-material/ExpandRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CompareArrowsRoundedIcon from '@mui/icons-material/CompareArrowsRounded';
import { EmptyState } from '../../../components/ui';

const StyledCard = styled(Card)(() => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  transition: 'transform .3s ease, border-color .3s ease, box-shadow .3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(198,255,62,0.3)',
    boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
  },
}));

function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PhotosProgress({ entries = [], onAddNew, onOpenCompare }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Flatten all photos from entries
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
    // Sort newest first
    return list.sort((a, b) => (a.entryDate < b.entryDate ? 1 : -1));
  }, [entries]);

  const filteredPhotos = useMemo(() => {
    if (activeCategory === 'All') return allPhotos;
    return allPhotos.filter((p) => (p.angle || '').toLowerCase() === activeCategory.toLowerCase());
  }, [allPhotos, activeCategory]);

  // Group photos by date
  const groupedPhotos = useMemo(() => {
    const grouped = {};
    filteredPhotos.forEach((photo) => {
      const dateKey = photo.entryDate;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(photo);
    });
    return grouped;
  }, [filteredPhotos]);

  const openLightbox = (photo) => {
    const index = filteredPhotos.findIndex((p) => p.id === photo.id);
    setLightboxIndex(index >= 0 ? index : 0);
    setLightboxOpen(true);
  };

  const nextPhoto = () => {
    setLightboxIndex((prev) => (prev < filteredPhotos.length - 1 ? prev + 1 : 0));
  };

  const prevPhoto = () => {
    setLightboxIndex((prev) => (prev > 0 ? prev - 1 : filteredPhotos.length - 1));
  };

  if (allPhotos.length === 0) {
    return (
      <EmptyState
        icon={<PhotoCameraRoundedIcon sx={{ fontSize: 48, color: 'text.secondary' }} />}
        title="No progress photos uploaded yet"
        description="Upload progress photos from different angles (Front, Side, Back) to visually track changes and compare body transformations side by side."
        action={
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddRoundedIcon />}
            onClick={onAddNew}
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}
          >
            Upload First Photo
          </Button>
        }
      />
    );
  }

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h6" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, mb: 0.5 }}>
            Progress Photo Gallery
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {allPhotos.length} photo{allPhotos.length !== 1 ? 's' : ''} logged across your training milestones
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} useFlexGap flexWrap="wrap" alignItems="center">
          <Button
            variant="contained"
            color="primary"
            startIcon={<CompareArrowsRoundedIcon />}
            onClick={onOpenCompare}
            disabled={allPhotos.length < 2}
            sx={{ fontWeight: 800, borderRadius: 2.5 }}
          >
            Side-by-Side Compare
          </Button>

          <Button
            variant="outlined"
            startIcon={<AddRoundedIcon />}
            onClick={onAddNew}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Upload Photo
          </Button>

          <Stack direction="row" spacing={0.75} sx={{ ml: 1 }}>
            {['All', 'Front', 'Side', 'Back', 'Other'].map((cat) => (
              <Chip
                key={cat}
                label={cat}
                size="small"
                onClick={() => setActiveCategory(cat)}
                variant={activeCategory === cat ? 'filled' : 'outlined'}
                sx={{
                  fontWeight: 600,
                  bgcolor: activeCategory === cat ? 'primary.main' : 'transparent',
                  color: activeCategory === cat ? 'primary.contrastText' : 'text.secondary',
                  borderColor: activeCategory === cat ? 'primary.main' : 'divider',
                  cursor: 'pointer',
                }}
              />
            ))}
          </Stack>
        </Stack>
      </Stack>

      {/* Gallery grouped by Date */}
      <Stack spacing={4}>
        {Object.entries(groupedPhotos).map(([date, datePhotos]) => (
          <Box key={date}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                {formatDate(date)}
              </Typography>
              <Chip label={`${datePhotos.length} photo${datePhotos.length !== 1 ? 's' : ''}`} size="small" sx={{ height: 22, fontSize: '0.7rem' }} />
              {datePhotos[0]?.weight && (
                <Chip
                  label={`${datePhotos[0].weight} ${datePhotos[0].weightUnit || 'kg'}`}
                  size="small"
                  variant="outlined"
                  sx={{ height: 22, fontSize: '0.7rem', borderColor: 'divider' }}
                />
              )}
            </Stack>

            <Grid container spacing={2.5}>
              {datePhotos.map((photo) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                  <StyledCard
                    onClick={() => openLightbox(photo)}
                    sx={{ p: 0, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  >
                    <Box
                      sx={{
                        aspectRatio: '3/4',
                        bgcolor: 'black',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                        position: 'relative',
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
                          top: 10,
                          right: 10,
                          bgcolor: 'rgba(0,0,0,0.6)',
                          borderRadius: '50%',
                          p: 0.5,
                        }}
                      >
                        <ExpandRoundedIcon sx={{ fontSize: 18, color: 'white' }} />
                      </Box>
                    </Box>

                    <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Chip
                        size="small"
                        label={photo.angle || 'Front'}
                        sx={{ bgcolor: 'rgba(255,255,255,0.06)', fontWeight: 700, fontSize: '0.7rem' }}
                      />
                      <Typography variant="caption" color="text.secondary">
                        {photo.entryDate}
                      </Typography>
                    </Box>
                  </StyledCard>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Stack>

      {/* Lightbox Dialog */}
      {lightboxOpen && filteredPhotos.length > 0 && (
        <Dialog
          open={lightboxOpen}
          onClose={() => setLightboxOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              bgcolor: 'rgba(10,12,15,0.96)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        >
          <IconButton
            onClick={() => setLightboxOpen(false)}
            sx={{ position: 'absolute', top: 16, right: 16, zIndex: 1301, bgcolor: 'rgba(0,0,0,0.6)', color: 'white' }}
          >
            <CloseRoundedIcon />
          </IconButton>

          {filteredPhotos.length > 1 && (
            <>
              <IconButton
                onClick={prevPhoto}
                sx={{
                  position: 'absolute',
                  left: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1301,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                }}
              >
                <ArrowBackRoundedIcon />
              </IconButton>
              <IconButton
                onClick={nextPhoto}
                sx={{
                  position: 'absolute',
                  right: 16,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 1301,
                  bgcolor: 'rgba(0,0,0,0.6)',
                  color: 'white',
                }}
              >
                <ArrowForwardRoundedIcon />
              </IconButton>
            </>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2, md: 4 } }}>
            <Box
              sx={{
                maxHeight: '75vh',
                maxWidth: '100%',
                borderRadius: 3,
                overflow: 'hidden',
                mb: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <img
                src={filteredPhotos[lightboxIndex]?.url}
                alt=""
                style={{ maxHeight: '75vh', maxWidth: '100%', objectFit: 'contain', borderRadius: 12 }}
              />
            </Box>

            <Stack direction="row" spacing={2} alignItems="center">
              <Chip
                label={filteredPhotos[lightboxIndex]?.angle || 'Photo'}
                color="primary"
                sx={{ fontWeight: 800 }}
              />
              <Typography variant="body2" color="text.secondary">
                Logged on {formatDate(filteredPhotos[lightboxIndex]?.entryDate)}
              </Typography>
              {filteredPhotos[lightboxIndex]?.weight && (
                <Chip
                  label={`${filteredPhotos[lightboxIndex].weight} ${filteredPhotos[lightboxIndex].weightUnit || 'kg'}`}
                  size="small"
                  sx={{ fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>
        </Dialog>
      )}
    </Box>
  );
}