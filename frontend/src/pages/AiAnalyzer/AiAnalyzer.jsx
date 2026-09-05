import { useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Stack,
  Card,
  Grid,
  Button,
  TextField,
  Chip,
  Alert,
  CircularProgress,
  IconButton,
  Divider,
  Paper,
  Tooltip,
} from '@mui/material';
import {
  CameraAltRounded,
  CloudUploadRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  RestaurantRounded,
  FitnessCenterRounded,
  LocalMallRounded,
  RestartAltRounded,
  LockRounded,
  ShieldRounded,
  InfoOutlined,
  ArrowForwardRounded,
  CloseRounded,
  AddShoppingCartRounded,
} from '@mui/icons-material';

import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { aiPhotoAnalysisService } from '../../services/aiPhotoAnalysisService';
import { useCart } from '../../context/CartContext';

const EXAMPLE_GOALS = [
  'Build lean muscle & strength',
  'Lose stubborn belly fat',
  'Tone up & get defined',
  'Clearer, glowing skin',
  'Boost all-day energy & stamina',
];

export default function AiAnalyzer() {
  const { addItem, openCartDrawer } = useCart();
  const fileInputRef = useRef(null);

  const MAX_PHOTOS = 5;
  const [images, setImages] = useState([]); // [{file, preview, base64}]
  const [goal, setGoal] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [addedProductIds, setAddedProductIds] = useState(new Set());

  // Client-side image compression using canvas
  const compressImage = (file) => {
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

          // Compress to JPEG with 0.82 quality
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(compressedDataUrl);
        };
        img.onerror = () => reject(new Error('Could not load image.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    const fileArray = Array.from(files);

    // Check how many more we can add
    const slotsLeft = MAX_PHOTOS - images.length;
    if (slotsLeft <= 0) {
      setError(`You can upload a maximum of ${MAX_PHOTOS} photos.`);
      return;
    }

    const filesToProcess = fileArray.slice(0, slotsLeft);
    const newImages = [];

    for (const file of filesToProcess) {
      if (!file.type.startsWith('image/')) {
        setError('Please upload valid image files (JPG, PNG, WEBP).');
        continue;
      }
      if (file.size > 15 * 1024 * 1024) {
        setError('One or more files are too large (max 15MB each).');
        continue;
      }

      try {
        setError('');
        const compressedBase64 = await compressImage(file);
        newImages.push({ file, preview: compressedBase64, base64: compressedBase64 });
      } catch (err) {
        console.error('Image processing error:', err);
        setError('Failed to process one of the images. Please try another photo.');
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
    }

    // Reset file input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemovePhoto = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRemoveAllPhotos = () => {
    setImages([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (images.length === 0) {
      setError('Please upload at least one photo to analyze.');
      return;
    }
    if (!goal.trim()) {
      setError('Please enter or select a goal description.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const data = await aiPhotoAnalysisService.analyzeGoalPhoto({
        imagesBase64: images.map((img) => img.base64),
        goal: goal.trim(),
      });
      setResult(data);
    } catch (err) {
      console.error('Analysis failed:', err);
      setError(
        err.response?.data?.message ||
        err.message ||
        'Analysis failed. Please try again with clearer photos or a shorter goal.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetAll = () => {
    setResult(null);
    handleRemoveAllPhotos();
    setGoal('');
    setError('');
  };

  const handleAddToCart = (product) => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0] || '',
      quantity: 1,
      stockQuantity: product.stockQuantity,
      categoryName: product.categoryName,
    });
    setAddedProductIds((prev) => new Set(prev).add(product.id));
    openCartDrawer();
  };

  return (
    <>
      <SEO
        title="Free AI Photo Goal Analysis & Recommendations — GymPilot"
        description="Upload a photo and set your fitness goal. Our AI analyzes your physique, suggests targeted nutrition tips, actionable steps, and recommends in-stock supplements from our store catalog."
        path="/analyze"
      />

      <Navbar />

      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: { xs: 12, md: 16 }, pb: 10 }}>
        <Container maxWidth="lg">
          {/* Header Banner */}
          <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: 6 }}>
            <Chip
              icon={<AutoAwesomeRounded sx={{ fontSize: '1rem !important', color: 'primary.main' }} />}
              label="100% Free · No Signup Required · Ephemeral Vision AI"
              sx={{
                fontWeight: 800,
                fontSize: '0.8rem',
                bgcolor: 'rgba(198, 255, 62, 0.12)',
                color: 'primary.main',
                border: '1px solid',
                borderColor: 'rgba(198, 255, 62, 0.3)',
                px: 1,
                py: 0.5,
              }}
            />

            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 900,
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
                lineHeight: 1.15,
                background: 'linear-gradient(135deg, #FFFFFF 30%, #C6FF3E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              AI Photo-Based Goal Analysis
            </Typography>

            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 680, fontSize: { xs: '0.95rem', md: '1.1rem' } }}>
              Upload a physique or wellness photo and specify your target. Our AI Vision model delivers actionable guidance, tailored nutrition insights, and matches certified store products.
            </Typography>

            {/* Privacy Guarantee Pill */}
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                px: 2.5,
                borderRadius: 3,
                bgcolor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
              }}
            >
              <ShieldRounded sx={{ color: 'primary.main', fontSize: 20 }} />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                <strong>Strict Privacy:</strong> Your photo is processed in-memory and discarded immediately. It is never stored or saved.
              </Typography>
            </Paper>
          </Stack>

          {error && (
            <Alert severity="error" sx={{ mb: 4, borderRadius: 2.5 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {/* If Result exists, display the Results View */}
          {result ? (
            <Stack spacing={4}>
              {/* Top Result Actions */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
                <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                  Your Personalized Assessment
                </Typography>
                <Button
                  variant="outlined"
                  startIcon={<RestartAltRounded />}
                  onClick={handleResetAll}
                  sx={{
                    fontWeight: 700,
                    borderRadius: 2.5,
                    borderColor: 'divider',
                    color: 'text.primary',
                    '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(198,255,62,0.06)' },
                  }}
                >
                  Analyze Another Photo
                </Button>
              </Stack>

              {/* 1. Observation & Assessment Card */}
              <Card
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: 'primary.main',
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(145deg, rgba(198,255,62,0.06) 0%, rgba(18,21,27,0.85) 100%)',
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={3.5} alignItems={{ md: 'center' }}>
                  {images.length > 0 && (
                    <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0, overflowX: 'auto', pb: 1 }}>
                      {images.map((img, idx) => (
                        <Box
                          key={idx}
                          component="img"
                          src={img.preview}
                          alt={`Analyzed photo ${idx + 1}`}
                          sx={{
                            width: { xs: 100, md: 120 },
                            height: { xs: 100, md: 120 },
                            objectFit: 'cover',
                            borderRadius: 2.5,
                            border: '2px solid',
                            borderColor: 'divider',
                            flexShrink: 0,
                          }}
                        />
                      ))}
                    </Stack>
                  )}
                  <Box sx={{ flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <AutoAwesomeRounded sx={{ color: 'primary.main', fontSize: 20 }} />
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'primary.main' }}>
                        Target: "{goal}"
                      </Typography>
                    </Stack>
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", mb: 1.5 }}>
                      Coach Assessment
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, fontSize: '1.02rem' }}>
                      {result.summary}
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* 2. Matched Store Supplements */}
              {result.recommendedProducts && result.recommendedProducts.length > 0 && (
                <Box>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                    <LocalMallRounded sx={{ color: 'primary.main', fontSize: 26 }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                        Recommended Supplements From Our Store
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        In-stock certified supplements directly matched to support your stated target.
                      </Typography>
                    </Box>
                  </Stack>

                  <Grid container spacing={3}>
                    {result.recommendedProducts.map((product) => {
                      const isAdded = addedProductIds.has(product.id);
                      return (
                        <Grid item xs={12} sm={6} md={3} key={product.id}>
                          <Card
                            elevation={0}
                            sx={{
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              borderRadius: 3.5,
                              border: '1px solid',
                              borderColor: 'divider',
                              bgcolor: 'background.paper',
                              transition: 'all 0.25s ease',
                              '&:hover': {
                                transform: 'translateY(-4px)',
                                borderColor: 'primary.main',
                                boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                              },
                            }}
                          >
                            <Box sx={{ position: 'relative', pt: '75%', bgcolor: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                              <Box
                                component="img"
                                src={product.images?.[0] || 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80'}
                                alt={product.name}
                                sx={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                              <Chip
                                label="In Stock"
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 10,
                                  right: 10,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'primary.main',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  border: '1px solid',
                                  borderColor: 'primary.main',
                                  backdropFilter: 'blur(4px)',
                                }}
                              />
                            </Box>

                            <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase' }}>
                                {product.categoryName || 'Supplement'}
                              </Typography>
                              <Typography
                                component={RouterLink}
                                to={`/shop/${product.id}`}
                                variant="subtitle1"
                                sx={{
                                  fontWeight: 800,
                                  color: 'text.primary',
                                  textDecoration: 'none',
                                  lineHeight: 1.3,
                                  my: 0.5,
                                  '&:hover': { color: 'primary.main' },
                                }}
                              >
                                {product.name}
                              </Typography>

                              <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', mt: 'auto', pt: 1.5 }}>
                                TND {Number(product.price).toFixed(2)}
                              </Typography>

                              <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                                <Button
                                  fullWidth
                                  size="small"
                                  variant={isAdded ? 'contained' : 'outlined'}
                                  startIcon={isAdded ? <CheckCircleRounded /> : <AddShoppingCartRounded />}
                                  onClick={() => handleAddToCart(product)}
                                  sx={{
                                    fontWeight: 800,
                                    borderRadius: 2,
                                    fontSize: '0.75rem',
                                    py: 0.9,
                                    bgcolor: isAdded ? 'primary.main' : 'transparent',
                                    color: isAdded ? '#000' : 'text.primary',
                                    borderColor: isAdded ? 'primary.main' : 'divider',
                                  }}
                                >
                                  {isAdded ? 'In Cart' : 'Add to Cart'}
                                </Button>
                                <IconButton
                                  component={RouterLink}
                                  to={`/shop/${product.id}`}
                                  size="small"
                                  sx={{
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 2,
                                    color: 'text.secondary',
                                    '&:hover': { color: 'primary.main', borderColor: 'primary.main' },
                                  }}
                                >
                                  <ArrowForwardRounded fontSize="small" />
                                </IconButton>
                              </Stack>
                            </Box>
                          </Card>
                        </Grid>
                      );
                    })}
                  </Grid>
                </Box>
              )}

              {/* 3. Nutrition Tips & Actionable Steps (2-column layout) */}
              <Grid container spacing={3}>
                {/* Nutrition Guidance */}
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3.5,
                      height: '100%',
                      borderRadius: 3.5,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                      <RestaurantRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                        Targeted Nutrition Guidance
                      </Typography>
                    </Stack>

                    <Stack spacing={2}>
                      {result.nutritionTips && result.nutritionTips.map((tip, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <CheckCircleRounded sx={{ color: 'primary.main', fontSize: 18, mt: 0.3, flexShrink: 0 }} />
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {tip}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Grid>

                {/* Actionable Steps */}
                <Grid item xs={12} md={6}>
                  <Card
                    elevation={0}
                    sx={{
                      p: 3.5,
                      height: '100%',
                      borderRadius: 3.5,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2.5 }}>
                      <FitnessCenterRounded sx={{ color: 'primary.main', fontSize: 24 }} />
                      <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                        Actionable Workout & Habit Steps
                      </Typography>
                    </Stack>

                    <Stack spacing={2}>
                      {result.adviceSteps && result.adviceSteps.map((step, idx) => (
                        <Stack key={idx} direction="row" spacing={1.5} alignItems="flex-start">
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              bgcolor: 'rgba(198, 255, 62, 0.15)',
                              color: 'primary.main',
                              fontWeight: 800,
                              fontSize: '0.75rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                              mt: 0.2,
                            }}
                          >
                            {idx + 1}
                          </Box>
                          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                            {step}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </Card>
                </Grid>
              </Grid>

              {/* 4. Mandatory Medical & Wellness Disclaimer */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <InfoOutlined sx={{ color: 'text.secondary', fontSize: 20, mt: 0.2, flexShrink: 0 }} />
                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                  {result.disclaimer}
                </Typography>
              </Paper>
            </Stack>
          ) : (
            /* Input & Upload View */
            <Card
              elevation={0}
              sx={{
                p: { xs: 3, md: 5 },
                borderRadius: 4,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              }}
            >
              <form onSubmit={handleAnalyze}>
                <Grid container spacing={4}>
                  {/* Left: Photo Upload */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Sora', sans-serif" }}>
                      1. Upload Photos <Chip label={`${images.length}/${MAX_PHOTOS}`} size="small" sx={{ ml: 1, fontWeight: 800, fontSize: '0.72rem', bgcolor: images.length > 0 ? 'rgba(198,255,62,0.15)' : 'rgba(255,255,255,0.04)', color: images.length > 0 ? 'primary.main' : 'text.secondary' }} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Upload up to {MAX_PHOTOS} physique or portrait photos for a more comprehensive analysis.
                    </Typography>

                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      multiple
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files.length > 0) {
                          handleFileSelect(e.target.files);
                        }
                      }}
                    />

                    {images.length > 0 ? (
                      <Stack spacing={2}>
                        {/* Photo Grid */}
                        <Box
                          sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' },
                            gap: 1.5,
                          }}
                        >
                          {images.map((img, idx) => (
                            <Box
                              key={idx}
                              sx={{
                                position: 'relative',
                                borderRadius: 2.5,
                                overflow: 'hidden',
                                border: '2px solid',
                                borderColor: 'primary.main',
                                aspectRatio: '1',
                                bgcolor: '#000',
                              }}
                            >
                              <Box
                                component="img"
                                src={img.preview}
                                alt={`Photo ${idx + 1}`}
                                sx={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                              />
                              <IconButton
                                onClick={() => handleRemovePhoto(idx)}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: 6,
                                  right: 6,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: '#fff',
                                  width: 26,
                                  height: 26,
                                  '&:hover': { bgcolor: 'error.main' },
                                }}
                              >
                                <CloseRounded sx={{ fontSize: 16 }} />
                              </IconButton>
                              <Chip
                                label={idx + 1}
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  bottom: 6,
                                  left: 6,
                                  minWidth: 24,
                                  height: 22,
                                  bgcolor: 'rgba(0,0,0,0.7)',
                                  color: 'primary.main',
                                  fontWeight: 900,
                                  fontSize: '0.7rem',
                                }}
                              />
                            </Box>
                          ))}

                          {/* Add More Card */}
                          {images.length < MAX_PHOTOS && (
                            <Box
                              onClick={() => fileInputRef.current?.click()}
                              sx={{
                                borderRadius: 2.5,
                                border: '2px dashed',
                                borderColor: 'divider',
                                aspectRatio: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                bgcolor: 'rgba(255,255,255,0.02)',
                                '&:hover': {
                                  borderColor: 'primary.main',
                                  bgcolor: 'rgba(198, 255, 62, 0.04)',
                                },
                              }}
                            >
                              <CloudUploadRounded sx={{ color: 'text.secondary', fontSize: 28, mb: 0.5 }} />
                              <Typography variant="caption" color="text.secondary" fontWeight={700}>
                                Add More
                              </Typography>
                            </Box>
                          )}
                        </Box>

                        {/* Clear All Button */}
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          startIcon={<CloseRounded />}
                          onClick={handleRemoveAllPhotos}
                          sx={{ borderRadius: 2, fontWeight: 700, alignSelf: 'flex-start' }}
                        >
                          Remove All Photos
                        </Button>
                      </Stack>
                    ) : (
                      <Box
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onClick={() => fileInputRef.current?.click()}
                        sx={{
                          height: 320,
                          borderRadius: 3,
                          border: '2px dashed',
                          borderColor: 'divider',
                          bgcolor: 'rgba(255, 255, 255, 0.02)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          p: 3,
                          textAlign: 'center',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: 'rgba(198, 255, 62, 0.04)',
                          },
                        }}
                      >
                        <Box
                          sx={{
                            width: 64,
                            height: 64,
                            borderRadius: '50%',
                            bgcolor: 'rgba(198, 255, 62, 0.1)',
                            color: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            mb: 2,
                          }}
                        >
                          <CloudUploadRounded sx={{ fontSize: 32 }} />
                        </Box>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                          Click or drag photos here
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
                          Supports JPG, PNG, WEBP (Max 15MB each · Up to {MAX_PHOTOS} photos)
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CameraAltRounded />}
                          sx={{ mt: 2.5, fontWeight: 700, borderRadius: 2, pointerEvents: 'none' }}
                        >
                          Choose from Device / Camera
                        </Button>
                      </Box>
                    )}
                  </Grid>

                  {/* Right: Goal Description & Suggestions */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Sora', sans-serif" }}>
                      2. Describe Your Goal
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                      Briefly describe what you want to achieve or select one of the suggested goals below.
                    </Typography>

                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      value={goal}
                      onChange={(e) => setGoal(e.target.value.slice(0, 200))}
                      placeholder="e.g. I want to shed stubborn belly fat and get lean definition in 12 weeks..."
                      helperText={`${goal.length}/200 characters`}
                      sx={{
                        mb: 2.5,
                        '& .MuiOutlinedInput-root': {
                          borderRadius: 2.5,
                        },
                      }}
                    />

                    {/* Example Goal Chips */}
                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5, display: 'block', mb: 1.5 }}>
                      Suggested Targets (Click to Fill):
                    </Typography>
                    <Stack direction="row" flexWrap="wrap" gap={1} sx={{ mb: 4 }}>
                      {EXAMPLE_GOALS.map((eg) => (
                        <Chip
                          key={eg}
                          label={eg}
                          onClick={() => setGoal(eg)}
                          clickable
                          sx={{
                            fontWeight: 600,
                            fontSize: '0.8rem',
                            bgcolor: goal === eg ? 'rgba(198, 255, 62, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                            color: goal === eg ? 'primary.main' : 'text.primary',
                            border: '1px solid',
                            borderColor: goal === eg ? 'primary.main' : 'divider',
                            '&:hover': {
                              borderColor: 'primary.main',
                              bgcolor: 'rgba(198, 255, 62, 0.08)',
                            },
                          }}
                        />
                      ))}
                    </Stack>

                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      size="large"
                      disabled={loading || images.length === 0 || !goal.trim()}
                      startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeRounded />}
                      sx={{
                        py: 1.5,
                        fontWeight: 900,
                        fontSize: '1rem',
                        borderRadius: 3,
                        boxShadow: '0 4px 20px rgba(198, 255, 62, 0.25)',
                      }}
                    >
                      {loading ? 'Analyzing Photos & Tailoring Guidance...' : 'Analyze Photos & Get Recommendations'}
                    </Button>

                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                      By analyzing your photo, you agree to receive general fitness & wellness recommendations.
                    </Typography>
                  </Grid>
                </Grid>
              </form>
            </Card>
          )}
        </Container>
      </Box>

      <Footer />
    </>
  );
}
