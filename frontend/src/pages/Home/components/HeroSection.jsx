import { Box, Button, Chip, Container, Grid, Paper, Stack, Typography, Avatar, AvatarGroup, keyframes } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';

import heroImage from '../../../assets/hero-gym.jpg';
import { useLanguage } from '../../../i18n';

const pulseDot = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 255, 62, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(198, 255, 62, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 255, 62, 0); }
`;

function HeroVisual() {
  const { isRtl } = useLanguage();

  return (
    <Box className="animate-fade-up" sx={{ position: 'relative', animationDelay: '150ms' }}>
      {/* Ambient background glow behind visual */}
      <Box
        sx={{
          position: 'absolute',
          inset: -20,
          background: 'radial-gradient(ellipse at center, rgba(198, 255, 62, 0.18) 0%, rgba(138, 124, 255, 0.12) 40%, transparent 70%)',
          filter: 'blur(40px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Main image panel */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: 400, md: 500 },
          borderRadius: 5,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 40px 100px rgba(0,0,0,0.7)',
          background: 'linear-gradient(135deg, #1a2110, #12151B 55%, #171a2e)',
          zIndex: 1,
        }}
      >
        <Box
          component="img"
          src={heroImage}
          alt="Athlete preparing a heavy barbell in a dark gym"
          onError={(event) => {
            event.currentTarget.style.display = 'none';
          }}
          sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <Box
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(200deg, rgba(10,12,15,0.1) 20%, rgba(10,12,15,0.85) 90%)',
          }}
        />

        {/* Live Set Overlay Badge on top right of image */}
        <Box
          sx={{
            position: 'absolute',
            top: 20,
            right: 20,
            px: 2,
            py: 1,
            borderRadius: 3,
            bgcolor: 'rgba(10, 12, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(198, 255, 62, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              bgcolor: '#C6FF3E',
              animation: `${pulseDot} 2s infinite`,
            }}
          />
          <Typography variant="caption" sx={{ color: '#C6FF3E', fontWeight: 800, letterSpacing: 0.5 }}>
            LIVE WORKOUT IN PROGRESS
          </Typography>
        </Box>
      </Box>

      {/* Floating "Active Session" card */}
      <Paper
        elevation={0}
        className="float-slow"
        sx={{
          position: 'absolute',
          top: -24,
          left: isRtl ? 'auto' : -32,
          right: isRtl ? -32 : 'auto',
          width: 270,
          p: 2.25,
          borderRadius: 3.5,
          bgcolor: 'rgba(18, 21, 27, 0.92)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(198, 255, 62, 0.25)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          zIndex: 2,
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <FitnessCenterRoundedIcon sx={{ color: '#C6FF3E', fontSize: 20 }} />
            <Typography variant="caption" sx={{ color: '#F4F6F8', fontWeight: 800 }}>
              Heavy Chest & Shoulders
            </Typography>
          </Stack>
          <Chip
            size="small"
            label="Set 3/4"
            sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', fontWeight: 800, height: 20, fontSize: '0.65rem' }}
          />
        </Stack>

        <Box sx={{ p: 1.25, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
          <Typography variant="body2" sx={{ fontWeight: 700, color: '#F4F6F8' }}>
            Bench Press · 80 kg × 8 reps
          </Typography>
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 0.5 }}>
            <TimerRoundedIcon sx={{ color: '#98A1AC', fontSize: 14 }} />
            <Typography variant="caption" color="text.secondary">
              Rest: 45s remaining · RPE 8.5
            </Typography>
          </Stack>
        </Box>
      </Paper>

      {/* Floating PR Achievement badge */}
      <Paper
        elevation={0}
        className="float-slow"
        sx={{
          position: 'absolute',
          bottom: 24,
          right: isRtl ? 'auto' : -30,
          left: isRtl ? -30 : 'auto',
          p: 2,
          borderRadius: 3.5,
          bgcolor: 'rgba(198, 255, 62, 0.96)',
          boxShadow: '0 20px 40px rgba(198, 255, 62, 0.3)',
          animationDelay: '1.2s',
          zIndex: 2,
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Avatar sx={{ bgcolor: '#0A0C0F', width: 40, height: 40, color: '#C6FF3E' }}>
            <EmojiEventsRoundedIcon sx={{ fontSize: 22 }} />
          </Avatar>
          <Box>
            <Typography sx={{ color: '#0A0C0F', fontWeight: 900, fontSize: '0.95rem', lineHeight: 1.2 }}>
              Deadlift PR: 160 kg!
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" sx={{ color: 'rgba(10,12,15,0.8)', fontWeight: 700 }}>
                +10 kg increase this month
              </Typography>
              <LocalFireDepartmentRoundedIcon sx={{ fontSize: 14, color: '#0A0C0F' }} />
            </Stack>
          </Box>
        </Stack>
      </Paper>

      {/* Floating Points Reward Badge */}
      <Paper
        elevation={0}
        className="float-slow"
        sx={{
          position: 'absolute',
          bottom: -28,
          left: isRtl ? 'auto' : 24,
          right: isRtl ? 24 : 'auto',
          p: 1.5,
          borderRadius: 3,
          bgcolor: 'rgba(18, 21, 27, 0.94)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 215, 0, 0.35)',
          boxShadow: '0 16px 36px rgba(0,0,0,0.5)',
          animationDelay: '2s',
          zIndex: 2,
        }}
      >
        <Stack direction="row" spacing={1.25} alignItems="center">
          <MonetizationOnRoundedIcon sx={{ color: '#FFD700', fontSize: 24 }} />
          <Box>
            <Typography variant="caption" sx={{ color: '#FFD700', fontWeight: 900, display: 'block' }}>
              +250 Reward Points
            </Typography>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <Typography variant="caption" sx={{ color: '#98A1AC', fontWeight: 600, fontSize: '0.7rem' }}>
                Redeem for Free Basic Plan
              </Typography>
              <WorkspacePremiumRoundedIcon sx={{ fontSize: 14, color: '#FFD700' }} />
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 6, md: 9 }, pb: { xs: 8, md: 12 } }}>
      {/* Ambient background glows */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -200,
          right: -150,
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198,255,62,0.12), transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -250,
          left: -200,
          width: 650,
          height: 650,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,124,255,0.1), transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        <Grid container spacing={{ xs: 6, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack className="animate-fade-up" spacing={3} sx={{ maxWidth: 590 }}>
              {/* 14-Day Free Trial Top Pill */}
              <Box
                component={RouterLink}
                to="/register"
                sx={{
                  textDecoration: 'none',
                  alignSelf: 'flex-start',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1.25,
                  px: 2,
                  py: 0.75,
                  borderRadius: 50,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.1)' : 'rgba(58, 125, 26, 0.1)'),
                  border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(198, 255, 62, 0.4)' : '1px solid rgba(58, 125, 26, 0.3)'),
                  boxShadow: (theme) => (theme.palette.mode === 'dark' ? '0 4px 16px rgba(198, 255, 62, 0.15)' : 'none'),
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.18)' : 'rgba(58, 125, 26, 0.18)'),
                    borderColor: 'primary.main',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <CardGiftcardRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: 0.3 }}>
                  14-DAY BASIC FREE TRIAL ON REGISTRATION
                </Typography>
                <Chip
                  label="FREE"
                  size="small"
                  sx={{
                    height: 18,
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    fontWeight: 900,
                    fontSize: '0.62rem',
                  }}
                />
              </Box>

              {/* Main Headline */}
              <Typography
                variant="h1"
                sx={{
                  fontWeight: 900,
                  letterSpacing: '-0.035em',
                  lineHeight: 1.05,
                  fontSize: { xs: '2.75rem', sm: '3.5rem', md: '4rem' },
                  fontFamily: "'Sora','Inter',sans-serif",
                }}
              >
                {t('home.heroTitle')}
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    background: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'linear-gradient(90deg, #C6FF3E 0%, #70FF50 50%, #8A7CFF 100%)'
                        : 'linear-gradient(90deg, #2E6315 0%, #3A7D1A 50%, #6B5CEF 100%)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    textShadow: (theme) => (theme.palette.mode === 'dark' ? '0 0 40px rgba(198,255,62,0.25)' : 'none'),
                  }}
                >
                  {t('home.heroTitleHighlight')}
                </Box>
              </Typography>

              {/* Subtitle */}
              <Typography color="text.secondary" sx={{ fontSize: '1.12rem', lineHeight: 1.75, maxWidth: 520 }}>
                {t('home.heroSubtitle')} Log your sets, track progressive overload, earn points to unlock free memberships, and shop official fitness gear in Tunisia.
              </Typography>

              {/* CTA Buttons */}
              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.02rem',
                    py: 1.5,
                    px: 3.5,
                    borderRadius: 3,
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 8px 30px rgba(198,255,62,0.35)'
                        : '0 8px 24px rgba(58,125,26,0.3)',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    },
                    transition: 'all 0.25s ease',
                  }}
                >
                  Claim 14-Day Free Trial
                </Button>

                <Button
                  component={RouterLink}
                  to="/shop"
                  variant="outlined"
                  size="large"
                  startIcon={<ShoppingBagRoundedIcon />}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.98rem',
                    py: 1.5,
                    px: 3,
                    borderRadius: 3,
                    borderColor: 'divider',
                    color: 'text.primary',
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.03)'),
                    '&:hover': {
                      borderColor: 'primary.main',
                      color: 'primary.main',
                    },
                  }}
                >
                  Explore Shop
                </Button>
              </Stack>

              {/* Trust checklist */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 1, sm: 2.5 }} sx={{ pt: 1 }}>
                {[
                  '14-Day Free Trial Included',
                  'No Credit Card Required',
                  'Points = Free Subscriptions',
                ].map((item, idx) => (
                  <Stack key={idx} direction="row" spacing={0.75} alignItems="center">
                    <CheckCircleOutlineRoundedIcon sx={{ color: 'primary.main', fontSize: 17 }} />
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                      {item}
                    </Typography>
                  </Stack>
                ))}
              </Stack>

              {/* Social Proof Athletes Banner */}
              <Stack direction="row" spacing={2} alignItems="center" sx={{ pt: 1 }}>
                <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 32, height: 32, fontSize: 12 } }}>
                  <Avatar sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800 }}>M</Avatar>
                  <Avatar sx={{ bgcolor: '#8A7CFF', color: '#fff', fontWeight: 800 }}>A</Avatar>
                  <Avatar sx={{ bgcolor: '#00E676', color: '#000', fontWeight: 800 }}>K</Avatar>
                  <Avatar sx={{ bgcolor: '#FF6B6B', color: '#fff', fontWeight: 800 }}>S</Avatar>
                </AvatarGroup>
                <Box>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <StarRoundedIcon key={s} sx={{ color: '#FFD700', fontSize: 16 }} />
                    ))}
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.primary', ml: 0.5 }}>
                      4.9 / 5
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                    Trusted by 2,800+ lifters & athletes in Tunisia
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={6} sx={{ display: { xs: 'none', lg: 'block' } }}>
            <HeroVisual />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
