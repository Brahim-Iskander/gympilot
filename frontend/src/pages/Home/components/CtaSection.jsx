import { Box, Button, Container, Typography, Stack, Chip } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';

export default function CtaSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            px: { xs: 3, md: 10 },
            py: { xs: 8, md: 11 },
            borderRadius: 5,
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198,255,62,0.35)' : 'rgba(58,125,26,0.3)'),
            boxShadow: (theme) =>
              theme.palette.mode === 'dark'
                ? '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(198,255,62,0.12)'
                : '0 20px 60px rgba(0,0,0,0.08)',
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'radial-gradient(120% 160% at 50% 0%, rgba(198,255,62,0.16) 0%, rgba(138,124,255,0.08) 35%, rgba(18,21,27,0.85) 65%, #0A0C0F 100%)'
                : 'radial-gradient(120% 160% at 50% 0%, rgba(58,125,26,0.12) 0%, rgba(107,92,239,0.06) 35%, rgba(241,245,249,0.95) 65%, #FFFFFF 100%)',
          }}
        >
          <FitnessCenterRoundedIcon
            aria-hidden
            sx={{
              position: 'absolute',
              right: -40,
              bottom: -46,
              fontSize: 260,
              color: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198,255,62,0.04)' : 'rgba(58,125,26,0.04)'),
              transform: 'rotate(-25deg)',
              pointerEvents: 'none',
            }}
          />

          {/* Top Pill */}
          <Chip
            icon={<CardGiftcardRoundedIcon sx={{ fontSize: '1rem !important', color: 'primary.main' }} />}
            label="AUTOMATIC 14-DAY BASIC FREE TRIAL"
            size="small"
            sx={{
              mb: 3,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.12)' : 'rgba(58, 125, 26, 0.1)'),
              color: 'primary.main',
              fontWeight: 900,
              letterSpacing: 0.5,
              fontSize: '0.72rem',
              border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(198, 255, 62, 0.35)' : '1px solid rgba(58, 125, 26, 0.3)'),
              px: 1,
            }}
          />

          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "'Sora','Inter',sans-serif",
              fontWeight: 900,
              letterSpacing: '-0.03em',
              fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.4rem' },
              color: 'text.primary',
            }}
          >
            Ready to Build Your{' '}
            <Box
              component="span"
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(90deg, #C6FF3E, #8A7CFF)'
                    : 'linear-gradient(90deg, #2E6315, #6B5CEF)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Strongest Self?
            </Box>
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 2.5, mx: 'auto', maxWidth: 580, lineHeight: 1.8, fontSize: '1.08rem' }}>
            Join thousands of dedicated lifters across Tunisia. Log every set, track progressive overload, earn reward points, and unlock free premium perks.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="center" sx={{ mt: 4.5 }}>
            <Button
              component={RouterLink}
              to="/register"
              variant="contained"
              size="large"
              endIcon={<ArrowForwardRoundedIcon />}
              sx={{
                fontWeight: 900,
                fontSize: '1.05rem',
                py: 1.6,
                px: 4.5,
                borderRadius: 3,
                boxShadow: (theme) =>
                  theme.palette.mode === 'dark'
                    ? '0 8px 32px rgba(198,255,62,0.4)'
                    : '0 8px 24px rgba(58,125,26,0.3)',
                '&:hover': {
                  transform: 'translateY(-2px)',
                },
                transition: 'all 0.25s ease',
              }}
            >
              Start 14-Day Free Trial
            </Button>

            <Button
              component={RouterLink}
              to="/shop"
              variant="outlined"
              size="large"
              sx={{
                fontWeight: 700,
                fontSize: '1rem',
                py: 1.6,
                px: 3.5,
                borderRadius: 3,
                borderColor: 'divider',
                color: 'text.primary',
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'transparent' : 'rgba(15,23,42,0.03)'),
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              Browse Gym Shop
            </Button>
          </Stack>

          {/* Value props bullets */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={{ xs: 1.5, sm: 3 }}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 4, pt: 1 }}
          >
            {['No credit card required', '14-day basic trial included', 'Earn points for free subscriptions'].map((item, idx) => (
              <Stack key={idx} direction="row" spacing={0.75} alignItems="center">
                <CheckCircleOutlineRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  {item}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Container>
    </Box>
  );
}
