import { useState, useRef } from 'react';
import {
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Alert,
  Tooltip,
  Paper,
} from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import LinkRoundedIcon from '@mui/icons-material/LinkRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AddPhotoAlternateRoundedIcon from '@mui/icons-material/AddPhotoAlternateRounded';
import { uploadImage } from '../../services/uploadService';

/**
 * Reusable multi-image input component for Products and Product Packs.
 * Allows sellers and admins to EITHER upload local images from their machine OR add image URLs.
 */
export default function MultiImageInput({
  images = [],
  onChange,
  maxImages = 5,
  folder = 'gympilot/products',
  label = 'Product Images',
  helperText = 'Upload from your device or paste online image URLs (up to 5 photos).',
}) {
  const [mode, setMode] = useState('upload'); // 'upload' | 'url'
  const [urlInput, setUrlInput] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const cleanImages = (images || []).filter((img) => img && img.trim());
  const remainingSlots = maxImages - cleanImages.length;

  // Compress image client-side to ensure fast upload and reasonable size
  const compressImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    const filesToProcess = files.slice(0, remainingSlots);

    try {
      setUploading(true);
      setError('');

      const newUrls = [];
      for (const file of filesToProcess) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) {
          setError('Some images were skipped because they exceed 10MB.');
          continue;
        }

        const base64 = await compressImageFile(file);
        try {
          const cloudUrl = await uploadImage(base64, folder);
          newUrls.push(cloudUrl);
        } catch (uploadErr) {
          // If Cloudinary fails or is offline, fallback to the compressed data URL
          console.warn('Cloudinary upload fallback to data URL:', uploadErr);
          newUrls.push(base64);
        }
      }

      if (newUrls.length > 0) {
        onChange([...cleanImages, ...newUrls]);
      }
    } catch (err) {
      console.error('File processing error:', err);
      setError('Failed to process image file. Please try another image.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.startsWith('data:image/')) {
      setError('Please enter a valid image URL starting with https:// or http://');
      return;
    }

    if (remainingSlots <= 0) {
      setError(`Maximum ${maxImages} images allowed.`);
      return;
    }

    setError('');
    onChange([...cleanImages, trimmed]);
    setUrlInput('');
  };

  const handleRemoveImage = (indexToRemove) => {
    const updated = cleanImages.filter((_, idx) => idx !== indexToRemove);
    onChange(updated);
  };

  const handleSetAsCover = (indexToCover) => {
    if (indexToCover === 0) return;
    const target = cleanImages[indexToCover];
    const rest = cleanImages.filter((_, idx) => idx !== indexToCover);
    onChange([target, ...rest]);
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Label and Counter */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 0.75 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
          {label}
        </Typography>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
          {cleanImages.length} / {maxImages} images
        </Typography>
      </Stack>

      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        {helperText}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 1.5, borderRadius: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Thumbnails Strip */}
      {cleanImages.length > 0 && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
          {cleanImages.map((img, idx) => (
            <Paper
              key={idx}
              elevation={0}
              sx={{
                position: 'relative',
                width: 96,
                height: 96,
                borderRadius: 2.5,
                overflow: 'hidden',
                border: '2px solid',
                borderColor: idx === 0 ? 'primary.main' : 'divider',
                bgcolor: '#0a0a0a',
                transition: 'transform 0.15s ease',
                '&:hover .image-actions': {
                  opacity: 1,
                },
              }}
            >
              <Box
                component="img"
                src={img}
                alt={`Item ${idx + 1}`}
                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />

              {/* Cover Chip */}
              {idx === 0 && (
                <Chip
                  label="Cover"
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 4,
                    left: 4,
                    height: 18,
                    fontSize: '0.62rem',
                    fontWeight: 800,
                    bgcolor: 'primary.main',
                    color: '#000',
                  }}
                />
              )}

              {/* Delete Button */}
              <IconButton
                size="small"
                onClick={() => handleRemoveImage(idx)}
                sx={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 22,
                  height: 22,
                  bgcolor: 'rgba(0,0,0,0.75)',
                  color: '#fff',
                  '&:hover': { bgcolor: 'error.main' },
                }}
              >
                <CloseRoundedIcon sx={{ fontSize: 14 }} />
              </IconButton>

              {/* Make Cover Action on hover */}
              {idx !== 0 && (
                <Tooltip title="Set as main cover photo">
                  <IconButton
                    size="small"
                    className="image-actions"
                    onClick={() => handleSetAsCover(idx)}
                    sx={{
                      position: 'absolute',
                      bottom: 4,
                      left: 4,
                      width: 24,
                      height: 24,
                      bgcolor: 'rgba(0,0,0,0.75)',
                      color: '#FFB800',
                      opacity: 0,
                      transition: 'opacity 0.2s',
                      '&:hover': { bgcolor: 'rgba(0,0,0,0.95)' },
                    }}
                  >
                    <StarRoundedIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              )}
            </Paper>
          ))}
        </Box>
      )}

      {/* Input Source Toggle (Local Machine Upload vs Image URL) */}
      {remainingSlots > 0 ? (
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            borderRadius: 2.5,
            bgcolor: 'background.default',
            border: '1px dashed',
            borderColor: 'divider',
          }}
        >
          <Stack spacing={1.5}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'flex-start', sm: 'center' }}>
              <ToggleButtonGroup
                size="small"
                value={mode}
                exclusive
                onChange={(_, next) => next && setMode(next)}
                sx={{
                  bgcolor: 'background.paper',
                  borderRadius: 2,
                  '& .MuiToggleButton-root': {
                    px: 1.5,
                    py: 0.5,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.8rem',
                  },
                }}
              >
                <ToggleButton value="upload">
                  <CloudUploadRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Upload from Device
                </ToggleButton>
                <ToggleButton value="url">
                  <LinkRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                  Enter Image URL
                </ToggleButton>
              </ToggleButtonGroup>

              <Typography variant="caption" color="text.secondary">
                {mode === 'upload' ? 'Select PNG, JPG, or WEBP files' : 'Paste web URL from manufacturer, CDN or shop'}
              </Typography>
            </Stack>

            {/* Upload from Local Machine Mode */}
            {mode === 'upload' && (
              <Box>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  multiple
                  style={{ display: 'none' }}
                  onChange={handleFileUpload}
                />
                <Button
                  variant="outlined"
                  fullWidth
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                  startIcon={uploading ? <CircularProgress size={18} color="inherit" /> : <AddPhotoAlternateRoundedIcon />}
                  sx={{
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderStyle: 'dashed',
                  }}
                >
                  {uploading ? 'Processing & Uploading...' : `Choose Images from Local Machine (${remainingSlots} slots left)`}
                </Button>
              </Box>
            )}

            {/* Add by Image URL Mode */}
            {mode === 'url' && (
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="https://example.com/images/product.jpg"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddUrl();
                    }
                  }}
                  InputProps={{
                    startAdornment: <LinkRoundedIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />,
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleAddUrl}
                  disabled={!urlInput.trim()}
                  sx={{
                    px: 2.5,
                    fontWeight: 700,
                    textTransform: 'none',
                    borderRadius: 2,
                    whiteSpace: 'nowrap',
                  }}
                >
                  Add URL
                </Button>
              </Stack>
            )}
          </Stack>
        </Paper>
      ) : (
        <Alert severity="info" sx={{ borderRadius: 2 }}>
          Maximum of {maxImages} images reached. Remove an image above if you wish to replace it.
        </Alert>
      )}
    </Box>
  );
}
