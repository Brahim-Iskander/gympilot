import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Chip,
  Button,
  Divider,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

function getCategoryColor(category = '') {
  const cat = category.toUpperCase();
  if (cat.includes('CREATINE')) return '#C6FF3E'; // Neon lime
  if (cat.includes('PROTEIN') || cat.includes('ISOLATE')) return '#38BDF8'; // Sky blue
  if (cat.includes('GAINER')) return '#FFB703'; // Amber gold
  if (cat.includes('PRE_WORKOUT') || cat.includes('ENERGY')) return '#FF6B6B'; // Coral red
  if (cat.includes('FAT_BURNER') || cat.includes('CARNITINE')) return '#FB8500'; // Orange
  return '#8A7CFF'; // Cyber purple
}

export default function RecommendedSupplements({ supplementPlan = [], userGoal = '', title, subtitle }) {
  // If no supplements are provided by AI yet, supply standard fallback list based on goal
  const supplements = supplementPlan && supplementPlan.length > 0
    ? supplementPlan
    : [
        {
          name: 'Creatine Monohydrate 200 Mesh',
          category: 'CREATINE',
          dosage: '5g daily with water or shake',
          purpose: 'Maximizes muscular ATP energy, explosive power output on heavy compounds, and cellular muscle volume.',
          priority: 'ESSENTIAL',
          shopSearch: 'creatine',
          targetBenefits: ['+12% Raw Power', 'Faster ATP Recovery', 'Cellular Hydration'],
        },
        {
          name: '100% Pure Whey Protein',
          category: 'PROTEIN',
          dosage: '1 scoop (30g) within 45 mins post-workout',
          purpose: 'High-biological-value protein to ensure optimal muscle protein synthesis and hit your daily macronutrient target.',
          priority: 'ESSENTIAL',
          shopSearch: 'protein',
          targetBenefits: ['24g Pure Protein', '5.5g Natural BCAAs', 'Lean Recovery'],
        },
        {
          name: 'High-Performance Pre-Workout',
          category: 'PRE_WORKOUT',
          dosage: '1 scoop 20-30 mins prior to training',
          purpose: 'Enhances mental focus, nitric oxide blood flow pumps, and muscular endurance for high-volume overload sessions.',
          priority: 'RECOMMENDED',
          shopSearch: 'pre workout',
          targetBenefits: ['Sharp Focus', 'Maximum Pumps', 'Fights Fatigue'],
        },
      ];

  return (
    <Box sx={{ my: 4 }}>
      {/* Header Banner */}
      <Card
        elevation={0}
        sx={{
          p: { xs: 2.5, sm: 3.5 },
          borderRadius: 4,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(198, 255, 62, 0.08) 0%, rgba(138, 124, 255, 0.05) 50%, rgba(18, 21, 27, 0.8) 100%)'
              : 'linear-gradient(135deg, rgba(58, 125, 26, 0.06) 0%, rgba(107, 92, 239, 0.04) 50%, #FFFFFF 100%)',
          border: '1px solid',
          borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.25)' : 'rgba(58, 125, 26, 0.2)'),
          boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 12px 36px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.04)'),
          mb: 3,
        }}
      >
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2.5} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
              <Chip
                icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '0.95rem !important', color: 'primary.main' }} />}
                label="AI GOAL-TAILORED STACK"
                size="small"
                sx={{
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.12)' : 'rgba(58, 125, 26, 0.1)'),
                  color: 'primary.main',
                  fontWeight: 900,
                  fontSize: '0.68rem',
                  letterSpacing: 0.5,
                  border: '1px solid',
                  borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.3)' : 'rgba(58, 125, 26, 0.3)'),
                }}
              />
              <Chip
                icon={<VerifiedRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#00E676' }} />}
                label="Available on GymPilot Store"
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 230, 118, 0.1)',
                  color: '#00E676',
                  fontWeight: 800,
                  fontSize: '0.68rem',
                  border: '1px solid rgba(0, 230, 118, 0.25)',
                }}
              />
            </Stack>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora','Inter',sans-serif", color: 'text.primary' }}>
              {title || 'Recommended Supplement Stack for Your Goal'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 680 }}>
              {subtitle || `Based on your profile${userGoal ? ` and goal of ${userGoal}` : ''}, our AI calculated that these supplements will optimize your strength, recovery, and hypertrophy. Buy them directly from verified sellers in the GymPilot Shop.`}
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to="/shop"
            variant="contained"
            startIcon={<ShoppingBagRoundedIcon />}
            sx={{
              fontWeight: 800,
              px: 3,
              py: 1.25,
              borderRadius: 3,
              whiteSpace: 'nowrap',
              boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 8px 24px rgba(198,255,62,0.3)' : '0 6px 18px rgba(58,125,26,0.25)'),
            }}
          >
            Explore Gym Shop
          </Button>
        </Stack>
      </Card>

      {/* Supplement Cards Grid */}
      <Grid container spacing={2.5}>
        {supplements.map((item, idx) => {
          const accent = getCategoryColor(item.category);
          const isEssential = item.priority === 'ESSENTIAL';
          const searchQuery = item.shopSearch || item.name;

          return (
            <Grid item xs={12} sm={6} md={supplements.length === 3 ? 4 : supplements.length === 4 ? 3 : 4} key={idx}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3.5,
                  bgcolor: 'background.paper',
                  border: '1px solid',
                  borderColor: isEssential
                    ? (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.35)' : 'rgba(58, 125, 26, 0.35)')
                    : 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: accent,
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? `0 16px 36px rgba(0,0,0,0.4), 0 0 20px ${accent}22`
                        : '0 12px 30px rgba(0,0,0,0.08)',
                  },
                }}
              >
                {/* Accent top line */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 20,
                    right: 20,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${accent}, transparent)`,
                  }}
                />

                {/* Card Top: Badges */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Chip
                    label={item.category || 'SUPPLEMENT'}
                    size="small"
                    sx={{
                      bgcolor: `${accent}16`,
                      color: accent,
                      fontWeight: 800,
                      fontSize: '0.66rem',
                      letterSpacing: 0.5,
                      border: `1px solid ${accent}33`,
                      height: 22,
                    }}
                  />
                  <Chip
                    label={item.priority || 'RECOMMENDED'}
                    size="small"
                    sx={{
                      bgcolor: isEssential ? 'rgba(198, 255, 62, 0.12)' : 'action.hover',
                      color: isEssential ? 'primary.main' : 'text.secondary',
                      fontWeight: 800,
                      fontSize: '0.62rem',
                      border: isEssential ? '1px solid' : 'none',
                      borderColor: 'primary.main',
                      height: 20,
                    }}
                  />
                </Stack>

                {/* Supplement Name */}
                <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.08rem', color: 'text.primary', mb: 1, lineHeight: 1.3 }}>
                  {item.name}
                </Typography>

                {/* Dosage Pill */}
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.75,
                    borderRadius: 2,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(15,23,42,0.03)'),
                    border: '1px solid',
                    borderColor: 'divider',
                    mb: 2,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase' }}>
                    Recommended Intake:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary', fontSize: '0.82rem' }}>
                    {item.dosage}
                  </Typography>
                </Box>

                {/* Why You Need It */}
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.84rem', lineHeight: 1.6, mb: 2, flexGrow: 1 }}>
                  {item.purpose}
                </Typography>

                {/* Benefit Tags */}
                {item.targetBenefits && item.targetBenefits.length > 0 && (
                  <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
                    {item.targetBenefits.map((b, bIdx) => (
                      <Chip
                        key={bIdx}
                        icon={<CheckCircleRoundedIcon sx={{ fontSize: '0.8rem !important', color: accent }} />}
                        label={b}
                        size="small"
                        sx={{
                          bgcolor: 'action.hover',
                          color: 'text.secondary',
                          fontSize: '0.68rem',
                          fontWeight: 600,
                          height: 22,
                        }}
                      />
                    ))}
                  </Stack>
                )}

                {/* Shop CTA Button */}
                <Button
                  component={RouterLink}
                  to={`/shop?search=${encodeURIComponent(searchQuery)}`}
                  variant="outlined"
                  fullWidth
                  startIcon={<ShoppingBagRoundedIcon />}
                  sx={{
                    mt: 'auto',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    py: 1,
                    borderRadius: 2.5,
                    borderColor: 'divider',
                    color: 'text.primary',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)'),
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198,255,62,0.08)' : 'rgba(58,125,26,0.08)'),
                    },
                  }}
                >
                  Buy in Gym Shop
                </Button>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Trust & Delivery Banner */}
      <Box
        sx={{
          mt: 3,
          p: 2,
          borderRadius: 3,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)'),
          border: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <LocalShippingRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
            Orders ship anywhere across Tunisia in <strong>24–48 hours</strong> with <strong>Cash on Delivery (Paiement à la livraison)</strong>.
          </Typography>
        </Stack>
        <Button
          component={RouterLink}
          to="/shop"
          size="small"
          sx={{ fontWeight: 800, color: 'primary.main', textTransform: 'none', fontSize: '0.8rem' }}
        >
          Browse All Shop Supplements &rarr;
        </Button>
      </Box>
    </Box>
  );
}
