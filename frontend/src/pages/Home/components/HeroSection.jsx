import { Box, Button, Chip, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

import heroImage from '../../../assets/hero-gym.jpg';
import { useLanguage } from '../../../i18n';

const weekLifts = [
  { id: 'bench', name: 'Bench Press', detail: '80 kg × 8 reps', pr: false },
  { id: 'squat', name: 'Squat', detail: '120 kg × 6 reps', pr: true },
];

function HeroVisual() {
  const { t, isRtl } = useLanguage();

  return (
    <Box className="animate-fade-up" sx={{ position: 'relative', animationDelay: '150ms' }}>
      {/* Main image panel with graceful gradient fallback if the image fails */}
      <Box
        sx={{
          position: 'relative',
          height: 480,
          borderRadius: 5,
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 90px rgba(0,0,0,0.55)',
          background: 'linear-gradient(135deg, #1a2110, #12151B 55%, #171a2e)',
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
            background: 'linear-gradient(200deg, rgba(10,12,15,0.05) 30%, rgba(10,12,15,0.85))',
          }}
        />
      </Box>

      {/* Floating "this week" card */}
      <Paper
        elevation={0}
        className="float-slow"
        sx={{
          position: 'absolute',
          top: -28,
          left: isRtl ? 'auto' : -36,
          right: isRtl ? -36 : 'auto',
          width: 252,
          p: 2.25,
          borderRadius: 3.5,
          bgcolor: 'rgba(18,21,27,0.88)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.09)',
        }}
      >
        <Typography variant="overline" color="text.secondary">
          {t('home.thisWeek')}
        </Typography>
        {weekLifts.map((lift) => (
          <Stack key={lift.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.25 }}>
            <Box>
              <Typography variant="body2" fontWeight={600}>
                {lift.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {lift.detail}
              </Typography>
            </Box>
            {lift.pr && (
              <Chip
                size="small"
                label={t('common.pr')}
                sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: 'primary.main', fontWeight: 700, height: 22 }}
              />
            )}
          </Stack>
        ))}
      </Paper>

      {/* Floating PR badge */}
      <Paper
        elevation={0}
        className="float-slow"
        sx={{
          position: 'absolute',
          bottom: -26,
          right: isRtl ? 'auto' : -32,
          left: isRtl ? -32 : 'auto',
          p: 2.25,
          borderRadius: 3.5,
          bgcolor: 'rgba(198,255,62,0.95)',
          animationDelay: '1.4s',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <EmojiEventsRoundedIcon sx={{ color: '#0A0C0F' }} />
          <Box>
            <Typography sx={{ color: '#0A0C0F', fontWeight: 800 }}>{t('home.deadliftPr')}</Typography>
            <Typography variant="caption" sx={{ color: 'rgba(10,12,15,0.72)', fontWeight: 600 }}>
              {t('home.prMonth')}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <Box sx={{ position: 'relative', overflow: 'hidden', pt: { xs: 13, md: 19 }, pb: { xs: 8, md: 12 } }}>
      {/* Ambient glows */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -260,
          right: -200,
          width: 620,
          height: 620,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198,255,62,0.09), transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -300,
          left: -240,
          width: 640,
          height: 640,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,124,255,0.08), transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Grid container spacing={{ xs: 8, md: 6 }} alignItems="center">
          <Grid item xs={12} md={6}>
            <Stack className="animate-fade-up" spacing={3.5} sx={{ maxWidth: 580 }}>
              <Chip
                label={t('home.badge')}
                variant="outlined"
                sx={{
                  alignSelf: 'flex-start',
                  borderColor: 'rgba(198,255,62,0.4)',
                  color: 'primary.main',
                  fontWeight: 600,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  fontSize: 12,
                }}
              />

              <Typography
                variant="h1"
                sx={{
                  fontWeight: 800,
                  letterSpacing: '-0.03em',
                  lineHeight: 1.06,
                  fontSize: { xs: '2.65rem', sm: '3.35rem', md: '3.9rem' },
                  fontFamily: "'Sora','Inter',sans-serif",
                }}
              >
                {t('home.heroTitle')}
                <Box
                  component="span"
                  sx={{
                    display: 'block',
                    background: 'linear-gradient(90deg, #C6FF3E, #59D96C)',
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                  }}
                >
                  {t('home.heroTitleHighlight')}
                </Box>
              </Typography>

              <Typography color="text.secondary" sx={{ fontSize: '1.1rem', lineHeight: 1.8, maxWidth: 500 }}>
                {t('home.heroSubtitle')}
              </Typography>

              <Stack direction="row" spacing={2} useFlexGap flexWrap="wrap">
                <Button component={RouterLink} to="/register" variant="contained" size="large" endIcon={<ArrowForwardRoundedIcon />}>
                  {t('home.startTraining')}
                </Button>
                <Button component={RouterLink} to="/login" variant="outlined" size="large">
                  {t('home.signIn')}
                </Button>
              </Stack>

              <Stack direction="row" spacing={1} alignItems="center" sx={{ color: 'text.secondary' }}>
                <LocalFireDepartmentRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                <Typography variant="caption">{t('home.freeToStart')}</Typography>
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
