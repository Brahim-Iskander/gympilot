import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  IconButton,
  TextField,
  LinearProgress,
  Alert,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  styled,
  keyframes,
  Paper,
} from '@mui/material';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import RestaurantRoundedIcon from '@mui/icons-material/RestaurantRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import GrainRoundedIcon from '@mui/icons-material/GrainRounded';
import FastfoodRoundedIcon from '@mui/icons-material/FastfoodRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import SparklesIcon from '@mui/icons-material/AutoAwesome';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import { aiService } from '../../services/aiService';
import { useFitnessData } from '../../hooks/useFitnessData';
import SEO from '../../components/SEO';

const scanAnimation = keyframes`
  0% {
    top: 0%;
    opacity: 0.8;
  }
  50% {
    top: 96%;
    opacity: 1;
  }
  100% {
    top: 0%;
    opacity: 0.8;
  }
`;

const pulseAnimation = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.03); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

const StyledDropZone = styled(Card)(({ theme, isDragging }) => ({
  borderRadius: 20,
  border: `2px dashed ${isDragging ? theme.palette.primary.main : theme.palette.divider}`,
  backgroundColor: isDragging ? 'rgba(198, 255, 62, 0.06)' : 'rgba(255, 255, 255, 0.02)',
  padding: theme.spacing(4),
  textAlign: 'center',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    borderColor: theme.palette.primary.main,
    backgroundColor: 'rgba(198, 255, 62, 0.04)',
  },
}));

const MetricCard = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  padding: theme.spacing(2.5),
  border: '1px solid',
  borderColor: theme.palette.divider,
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  height: '100%',
}));

const SAMPLE_MEALS = [
  {
    name: 'Grilled Salmon & Quinoa',
    calories: 540,
    protein: 42,
    prompt: 'Grilled Atlantic Salmon with organic quinoa and steamed broccoli',
    imageUrl: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Chicken Rice & Greens',
    calories: 510,
    protein: 48,
    prompt: 'Herb grilled chicken breast with jasmine rice and broccoli florets',
    imageUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Steak & Sweet Potato',
    calories: 610,
    protein: 52,
    prompt: 'Seared grass-fed sirloin steak with roasted sweet potato mash and green beans',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Avocado & Egg Toast',
    calories: 460,
    protein: 22,
    prompt: 'Two poached eggs on sourdough toast with mashed hass avocado',
    imageUrl: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=600&q=80',
  },
  {
    name: 'Anabolic Whey Smoothie',
    calories: 430,
    protein: 38,
    prompt: 'Anabolic whey protein isolate shake with banana, oats and natural peanut butter',
    imageUrl: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80',
  },
];

export default function CaloriesCalculator() {
  const navigate = useNavigate();
  const { logMeal } = useFitnessData();
  const fileInputRef = useRef(null);

  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState('');
  const [promptText, setPromptText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('Lunch');
  const [successSnackbar, setSuccessSnackbar] = useState(false);

  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }
    setError('');
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      setImagePreview(dataUrl);
      setImageBase64(dataUrl);
      // Auto analyze when uploaded
      handleAnalyze(promptText, dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSelectSample = (sample) => {
    setImagePreview(sample.imageUrl);
    setImageBase64('');
    setPromptText(sample.prompt);
    handleAnalyze(sample.prompt, sample.imageUrl);
  };

  const handleAnalyze = async (queryText = promptText, imgData = imageBase64) => {
    const textToSend = queryText || 'Fitness meal with balanced protein and carbs';
    setAnalyzing(true);
    setError('');
    setResult(null);

    try {
      const data = await aiService.analyzeFood(textToSend, imgData);
      setResult(data);
    } catch (err) {
      console.error('Error analyzing meal:', err);
      setError('Failed to analyze the food image. Using intelligent nutrition estimate.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleLogToDailyTracker = () => {
    if (!result) return;
    const mealPayload = {
      title: result.foodName || promptText || 'AI Analyzed Meal',
      type: selectedMealType,
      calories: result.calories || 0,
      protein: result.protein || 0,
      carbs: result.carbs || 0,
      fat: result.fat || 0,
      fiber: result.fiber || 0,
      healthScore: result.healthScore,
      servingSize: result.servingSize,
      items: result.ingredients ? result.ingredients.map((i) => `${i.amount || ''} ${i.name}`).join(', ') : promptText,
      aiScanned: true,
    };

    logMeal(mealPayload);
    setSuccessSnackbar(true);
  };

  const handleReset = () => {
    setImagePreview(null);
    setImageBase64('');
    setPromptText('');
    setResult(null);
    setError('');
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <SEO
        title="AI Calorie Calculator & Food Vision"
        description="Upload food photos for instant AI computer vision calorie, macro, and micronutrient breakdown on GymPilot."
        path="/calories-calculator"
        noIndex
      />

      {/* Header */}
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} sx={{ mb: 4 }}>
        <Box>
          <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 3,
                bgcolor: 'rgba(198,255,62,0.15)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AutoAwesomeRoundedIcon fontSize="medium" />
            </Box>
            <Typography variant="h4" component="h1" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
              AI Calorie & Food Vision
            </Typography>
          </Stack>
          <Typography variant="body1" color="text.secondary">
            Upload or photograph any meal. Our AI vision instantly calculates calories, protein, carbs, fats, and health score.
          </Typography>
        </Box>

        {result && (
          <Button
            variant="outlined"
            startIcon={<RestartAltRoundedIcon />}
            onClick={handleReset}
            sx={{ borderRadius: 3, textTransform: 'none', fontWeight: 600 }}
          >
            Scan Another Meal
          </Button>
        )}
      </Stack>

      {error && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Left Column: Upload & Image Viewer */}
        <Grid item xs={12} lg={5}>
          {!imagePreview ? (
            <Box>
              <StyledDropZone
                isDragging={isDragging}
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                sx={{ mb: 3 }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: 'rgba(198,255,62,0.12)',
                    color: 'primary.main',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    animation: `${pulseAnimation} 3s infinite ease-in-out`,
                  }}
                >
                  <CloudUploadRoundedIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  Drop your meal photo here
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  or browse from your device (JPG, PNG, WEBP)
                </Typography>
                <Button variant="contained" color="primary" sx={{ borderRadius: 3, px: 3, textTransform: 'none', fontWeight: 700 }}>
                  Select Photo
                </Button>
              </StyledDropZone>

              {/* Sample meals to test instantly */}
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, color: 'text.secondary', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  Or Try a Sample Fitness Meal:
                </Typography>
                <Stack spacing={1.5}>
                  {SAMPLE_MEALS.map((sample, idx) => (
                    <Paper
                      key={idx}
                      onClick={() => handleSelectSample(sample)}
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        border: '1px solid',
                        borderColor: 'divider',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          borderColor: 'primary.main',
                          transform: 'translateX(4px)',
                          bgcolor: 'rgba(255,255,255,0.03)',
                        },
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Box
                          component="img"
                          src={sample.imageUrl}
                          alt={sample.name}
                          sx={{ width: 48, height: 48, borderRadius: 2, objectFit: 'cover' }}
                        />
                        <Box>
                          <Typography variant="body2" fontWeight={700}>
                            {sample.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ~{sample.calories} kcal · {sample.protein}g Protein
                          </Typography>
                        </Box>
                      </Stack>
                      <Chip label="Analyze" size="small" sx={{ fontWeight: 700, bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main' }} />
                    </Paper>
                  ))}
                </Stack>
              </Box>
            </Box>
          ) : (
            <Card sx={{ borderRadius: 4, overflow: 'hidden', border: '1px solid', borderColor: 'divider', position: 'relative' }}>
              <Box sx={{ position: 'relative', width: '100%', height: 360, bgcolor: '#000' }}>
                <Box
                  component="img"
                  src={imagePreview}
                  alt="Food to analyze"
                  sx={{ width: '100%', height: '100%', objectFit: 'cover', opacity: analyzing ? 0.7 : 1 }}
                />

                {/* Laser scan line overlay during analysis */}
                {analyzing && (
                  <Box
                    sx={{
                      position: 'absolute',
                      left: 0,
                      right: 0,
                      height: 4,
                      bgcolor: 'primary.main',
                      boxShadow: '0 0 15px #C6FF3E, 0 0 30px #C6FF3E',
                      animation: `${scanAnimation} 2s infinite linear`,
                    }}
                  />
                )}

                <Box
                  sx={{
                    position: 'absolute',
                    top: 16,
                    left: 16,
                    bgcolor: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(8px)',
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <SparklesIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                  <Typography variant="caption" sx={{ fontWeight: 700, color: '#fff' }}>
                    {analyzing ? 'AI Vision Scanning...' : 'Scan Complete'}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ p: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Optional meal notes / details"
                  placeholder="e.g., without dressing, extra chicken breast"
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  sx={{ mb: 2 }}
                />

                <Stack direction="row" spacing={1.5}>
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    disabled={analyzing}
                    onClick={() => handleAnalyze(promptText, imageBase64 || imagePreview)}
                    startIcon={<AutoAwesomeRoundedIcon />}
                    sx={{ borderRadius: 3, fontWeight: 700, py: 1.2 }}
                  >
                    {analyzing ? 'Analyzing with AI...' : 'Re-Analyze Food'}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    sx={{ borderRadius: 3, px: 2 }}
                  >
                    Change
                  </Button>
                </Stack>
              </Box>
            </Card>
          )}
        </Grid>

        {/* Right Column: Detailed Nutritional Analysis */}
        <Grid item xs={12} lg={7}>
          {analyzing && (
            <Card sx={{ p: 6, borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(198,255,62,0.15)',
                  color: 'primary.main',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                  animation: `${pulseAnimation} 1.5s infinite ease-in-out`,
                }}
              >
                <AutoAwesomeRoundedIcon sx={{ fontSize: 42 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Sora','Inter',sans-serif" }}>
                AI Vision Analyzing Calories & Macros...
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 450, mx: 'auto', mb: 4 }}>
                Segmenting ingredients, estimating portion mass in grams, calculating macro density and micronutrient profiles.
              </Typography>
              <LinearProgress sx={{ maxWidth: 300, mx: 'auto', borderRadius: 2, height: 8 }} />
            </Card>
          )}

          {!analyzing && !result && (
            <Card sx={{ p: 6, borderRadius: 4, textAlign: 'center', border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.01)' }}>
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  bgcolor: 'rgba(255,255,255,0.04)',
                  color: 'text.secondary',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: 3,
                }}
              >
                <RestaurantRoundedIcon sx={{ fontSize: 40 }} />
              </Box>
              <Typography variant="h5" sx={{ fontWeight: 800, mb: 1 }}>
                No Food Photo Analyzed Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
                Upload a picture of your breakfast, lunch, post-workout meal, or snack to see an instant full calorie, macro, and ingredient breakdown.
              </Typography>
            </Card>
          )}

          {!analyzing && result && (
            <Stack spacing={3}>
              {/* Dish Overview Card */}
              <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider', background: 'linear-gradient(180deg, rgba(198,255,62,0.06), rgba(255,255,255,0.01))' }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 2 }}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                      <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800 }}>
                        {result.foodName}
                      </Typography>
                      <VerifiedRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      Estimated Portion: <strong>{result.servingSize || '1 Serving'}</strong> · Category: <strong>{result.category || 'Fitness Meal'}</strong>
                    </Typography>
                  </Box>

                  <Chip
                    icon={<SparklesIcon sx={{ fontSize: 16 }} />}
                    label={`Health Score: ${result.healthScore || 95}/100`}
                    color="primary"
                    sx={{ fontWeight: 800, fontSize: '0.85rem', px: 1 }}
                  />
                </Stack>

                {result.coachTips && (
                  <Alert severity="info" icon={<AutoAwesomeRoundedIcon fontSize="small" />} sx={{ borderRadius: 3, bgcolor: 'rgba(138,124,255,0.1)', color: '#fff', border: '1px solid rgba(138,124,255,0.2)' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      <strong>Coach Insight:</strong> {result.coachTips}
                    </Typography>
                  </Alert>
                )}
              </Card>

              {/* Core 4 Macro Cards */}
              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <MetricCard sx={{ borderLeft: '4px solid #FF6B6B' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        Calories
                      </Typography>
                      <LocalFireDepartmentRoundedIcon sx={{ color: '#FF6B6B', fontSize: 20 }} />
                    </Stack>
                    <Box sx={{ my: 1 }}>
                      <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#FF6B6B' }}>
                        {result.calories}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        kcal energy
                      </Typography>
                    </Box>
                  </MetricCard>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <MetricCard sx={{ borderLeft: '4px solid #C6FF3E' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        Protein
                      </Typography>
                      <FitnessCenterRoundedIcon sx={{ color: '#C6FF3E', fontSize: 20 }} />
                    </Stack>
                    <Box sx={{ my: 1 }}>
                      <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#C6FF3E' }}>
                        {result.protein}g
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(((result.protein * 4) / Math.max(result.calories, 1)) * 100)}% calories
                      </Typography>
                    </Box>
                  </MetricCard>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <MetricCard sx={{ borderLeft: '4px solid #8A7CFF' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        Carbs
                      </Typography>
                      <GrainRoundedIcon sx={{ color: '#8A7CFF', fontSize: 20 }} />
                    </Stack>
                    <Box sx={{ my: 1 }}>
                      <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#8A7CFF' }}>
                        {result.carbs}g
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(((result.carbs * 4) / Math.max(result.calories, 1)) * 100)}% calories
                      </Typography>
                    </Box>
                  </MetricCard>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <MetricCard sx={{ borderLeft: '4px solid #FFC107' }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase">
                        Fats
                      </Typography>
                      <FastfoodRoundedIcon sx={{ color: '#FFC107', fontSize: 20 }} />
                    </Stack>
                    <Box sx={{ my: 1 }}>
                      <Typography variant="h4" sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, color: '#FFC107' }}>
                        {result.fat}g
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {Math.round(((result.fat * 9) / Math.max(result.calories, 1)) * 100)}% calories
                      </Typography>
                    </Box>
                  </MetricCard>
                </Grid>
              </Grid>

              {/* Detected Ingredients Breakdown */}
              {result.ingredients && result.ingredients.length > 0 && (
                <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2 }}>
                    Detected Ingredients & Quantities
                  </Typography>
                  <Grid container spacing={1.5}>
                    {result.ingredients.map((ing, i) => (
                      <Grid item xs={12} sm={6} key={i}>
                        <Paper sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Box>
                              <Typography variant="body2" fontWeight={700}>
                                {ing.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {ing.amount}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip label={`${ing.calories} kcal`} size="small" sx={{ fontWeight: 700 }} />
                              <Chip label={`${ing.protein}g P`} size="small" sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', fontWeight: 700 }} />
                            </Stack>
                          </Stack>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Card>
              )}

              {/* Micronutrients Highlights */}
              {result.micronutrients && result.micronutrients.length > 0 && (
                <Card sx={{ p: 3, borderRadius: 4, border: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5 }}>
                    Key Micronutrient Profile
                  </Typography>
                  <Stack direction="row" flexWrap="wrap" gap={1}>
                    {result.micronutrients.map((micro, i) => (
                      <Chip
                        key={i}
                        icon={<CheckCircleRoundedIcon />}
                        label={`${micro.name}: ${micro.value} (${micro.percentage}% DV)`}
                        variant="outlined"
                        sx={{ borderRadius: 2, fontWeight: 600, py: 2 }}
                      />
                    ))}
                  </Stack>
                </Card>
              )}

              {/* Add to Daily Nutrition Log Box */}
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(198,255,62,0.05)',
                }}
              >
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth size="small">
                      <InputLabel id="meal-type-select-label">Log to Meal Category</InputLabel>
                      <Select
                        labelId="meal-type-select-label"
                        value={selectedMealType}
                        label="Log to Meal Category"
                        onChange={(e) => setSelectedMealType(e.target.value)}
                        sx={{ borderRadius: 2.5 }}
                      >
                        <MenuItem value="Breakfast">Breakfast</MenuItem>
                        <MenuItem value="Lunch">Lunch</MenuItem>
                        <MenuItem value="Dinner">Dinner</MenuItem>
                        <MenuItem value="Snack">Post-Workout / Snack</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="primary"
                      size="large"
                      onClick={handleLogToDailyTracker}
                      startIcon={<RestaurantRoundedIcon />}
                      sx={{
                        borderRadius: 3,
                        fontWeight: 800,
                        py: 1.2,
                        textTransform: 'none',
                        fontSize: '1rem',
                        boxShadow: '0 8px 25px rgba(198,255,62,0.3)',
                      }}
                    >
                      + Add to Daily Nutrition Log
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            </Stack>
          )}
        </Grid>
      </Grid>

      {/* Success Snackbar */}
      <Snackbar
        open={successSnackbar}
        autoHideDuration={4000}
        onClose={() => setSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          severity="success"
          onClose={() => setSuccessSnackbar(false)}
          sx={{ borderRadius: 3, fontWeight: 600, alignItems: 'center' }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/nutrition')}
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{ fontWeight: 800, textTransform: 'none' }}
            >
              View Nutrition
            </Button>
          }
        >
          Meal successfully logged to your daily nutrition tracker!
        </Alert>
      </Snackbar>
    </Container>
  );
}
