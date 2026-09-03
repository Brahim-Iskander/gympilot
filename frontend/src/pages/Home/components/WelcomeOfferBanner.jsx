import { Box, Container, Stack, Typography, Chip } from '@mui/material';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import { Link as RouterLink } from 'react-router-dom';

const PERKS = [
  {
    icon: <CardGiftcardRoundedIcon sx={{ fontSize: 18, color: '#C6FF3E' }} />,
    text: '14-Day Free Basic Trial on Registration',
    highlight: 'No Credit Card Needed',
    badge: 'NEW',
    badgeColor: '#C6FF3E',
  },
  {
    icon: <MonetizationOnRoundedIcon sx={{ fontSize: 18, color: '#FFD700' }} />,
    text: 'Earn Reward Points on orders & invites',
    highlight: '1 pt per 2 TND',
    badge: 'REWARDS',
    badgeColor: '#FFD700',
  },
  {
    icon: <WorkspacePremiumRoundedIcon sx={{ fontSize: 18, color: '#8A7CFF' }} />,
    text: 'Redeem points for Free Subscriptions',
    highlight: '250 / 500 pts',
    badge: 'VIP PERK',
    badgeColor: '#8A7CFF',
  },
  {
    icon: <LocalShippingRoundedIcon sx={{ fontSize: 18, color: '#00E676' }} />,
    text: 'Fitness Shop & Fast Delivery across Tunisia',
    highlight: 'Cash on Delivery',
    badge: 'SHOP',
    badgeColor: '#00E676',
  },
];

export default function WelcomeOfferBanner() {
  return (
    <Box
      component="section"
      aria-label="New User Benefits"
      sx={{
        position: 'relative',
        py: 2,
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(18, 21, 27, 0.95)' : 'rgba(241, 245, 249, 0.95)'),
        borderTop: '1px solid',
        borderBottom: '1px solid',
        borderColor: 'divider',
        backdropFilter: 'blur(12px)',
        overflow: 'hidden',
        zIndex: 2,
      }}
    >
      {/* Background neon shimmer line */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: '15%',
          right: '15%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(198, 255, 62, 0.5), transparent)',
        }}
      />

      <Container maxWidth="xl">
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={{ xs: 1.5, md: 3 }}
          alignItems="center"
          justifyContent="space-between"
        >
          {/* Main callout pill */}
          <Stack
            component={RouterLink}
            to="/register"
            direction="row"
            alignItems="center"
            spacing={1.25}
            sx={{
              textDecoration: 'none',
              px: 2,
              py: 0.75,
              borderRadius: 3,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.08)' : 'rgba(58, 125, 26, 0.08)'),
              border: (theme) => (theme.palette.mode === 'dark' ? '1px solid rgba(198, 255, 62, 0.3)' : '1px solid rgba(58, 125, 26, 0.25)'),
              transition: 'all 0.25s ease',
              '&:hover': {
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.16)' : 'rgba(58, 125, 26, 0.16)'),
                transform: 'scale(1.02)',
              },
            }}
          >
            <BoltRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.2 }}>
              NEW ATHLETE OFFER
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.primary', fontWeight: 600, display: { xs: 'none', sm: 'inline' } }}>
              Get 14 Days Basic Plan Free instantly on registration
            </Typography>
          </Stack>

          {/* Quick perks list */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            justifyContent="center"
          >
            {PERKS.map((perk, idx) => (
              <Stack
                key={idx}
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(15, 23, 42, 0.04)'),
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                {perk.icon}
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  {perk.text}
                </Typography>
                <Chip
                  size="small"
                  label={perk.highlight}
                  sx={{
                    height: 20,
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    bgcolor: `${perk.badgeColor}18`,
                    color: perk.badgeColor,
                    border: `1px solid ${perk.badgeColor}33`,
                  }}
                />
              </Stack>
            ))}
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
}
