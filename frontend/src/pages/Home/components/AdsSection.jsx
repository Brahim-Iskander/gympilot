import { Box, Button, Card, Chip, Container, Grid, Stack, Typography, styled } from '@mui/material';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import SportsRoundedIcon from '@mui/icons-material/SportsRounded';
import ElectricBoltRoundedIcon from '@mui/icons-material/ElectricBoltRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';

const AdCard = styled(Card)(({ accentcolor }) => ({
  borderRadius: 20,
  padding: '28px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  background: 'linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)',
  border: '1px solid rgba(255,255,255,0.08)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '3px',
    background: accentcolor || '#C6FF3E',
  },
  '&:hover': {
    transform: 'translateY(-6px)',
    borderColor: `${accentcolor || '#C6FF3E'}66`,
    boxShadow: `0 20px 40px rgba(0,0,0,0.4), 0 0 20px ${accentcolor || '#C6FF3E'}22`,
  },
}));

const featuredAds = [
  {
    id: 1,
    tag: 'SPONSORED OFFER',
    brand: 'Optimum Nutrition',
    title: 'Gold Standard 100% Whey Isolate',
    description: 'Fuel your muscle recovery with 24g of ultra-pure whey protein per serving.',
    promoCode: 'GYMTRACK30',
    discount: '30% OFF',
    accentColor: '#C6FF3E',
    icon: FitnessCenterRoundedIcon,
    actionText: 'Claim 30% Off',
  },
  {
    id: 2,
    tag: 'FEATURED PARTNER',
    brand: 'Rogue Fitness',
    title: 'Monster Lite Power Rack Series',
    description: 'Commercial-grade heavy steel power racks engineered for maximum bench & squat stability.',
    promoCode: 'ROGUEATHLETE',
    discount: 'Free Shipping + 15%',
    accentColor: '#8A7CFF',
    icon: SportsRoundedIcon,
    actionText: 'Shop Rack Bundle',
  },
  {
    id: 3,
    tag: 'PARTNER SPECIAL',
    brand: 'Hyperice',
    title: 'Hypervolt 2 Pro Percussion Massage',
    description: 'Accelerate recovery, relieve sore muscles, and warm up faster with 5 speeds.',
    promoCode: 'RECOVERPRO',
    discount: '$50 OFF',
    accentColor: '#FF6B6B',
    icon: ElectricBoltRoundedIcon,
    actionText: 'Unlock Special Deal',
  },
];

export default function AdsSection() {
  const handleClaimDeal = (ad) => {
    navigator.clipboard?.writeText(ad.promoCode);
    alert(`Promo Code "${ad.promoCode}" copied to clipboard! Enjoy your ${ad.discount} with ${ad.brand}!`);
  };

  return (
    <Box component="section" sx={{ py: { xs: 6, md: 10 }, position: 'relative' }}>
      <Container maxWidth="lg">
        <Stack direction="row" justifyContent="space-between" alignItems="flex-end" flexWrap="wrap" gap={2} sx={{ mb: 5 }}>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
              <LocalOfferRoundedIcon sx={{ color: 'primary.main', fontSize: 22 }} />
              <Chip
                label="Partner Perks & Ads"
                size="small"
                sx={{ bgcolor: 'rgba(198,255,62,0.1)', color: '#C6FF3E', fontWeight: 700, border: '1px solid rgba(198,255,62,0.2)' }}
              />
            </Stack>
            <Typography
              variant="h3"
              sx={{
                fontFamily: "'Sora','Inter',sans-serif",
                fontWeight: 800,
                fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.5rem' },
              }}
            >
              Exclusive Partner Deals & Gear
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
              Handpicked promotions and member-only discounts from our fitness sponsors.
            </Typography>
          </Box>

          <Chip
            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: '1rem !important', color: '#C6FF3E !important' }} />}
            label="Verified GymPilot Discounts"
            variant="outlined"
            sx={{ fontWeight: 600 }}
          />
        </Stack>

        <Grid container spacing={3}>
          {featuredAds.map((ad) => (
            <Grid item xs={12} md={4} key={ad.id}>
              <AdCard accentcolor={ad.accentColor}>
                <Box sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Chip
                      label={ad.tag}
                      size="small"
                      sx={{
                        bgcolor: 'rgba(255,255,255,0.06)',
                        color: 'text.secondary',
                        fontWeight: 700,
                        fontSize: '0.65rem',
                        letterSpacing: 0.5,
                      }}
                    />
                    <Chip
                      label={ad.discount}
                      size="small"
                      sx={{
                        bgcolor: `${ad.accentColor}22`,
                        color: ad.accentColor,
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        border: `1px solid ${ad.accentColor}44`,
                      }}
                    />
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 3,
                        bgcolor: `${ad.accentColor}18`,
                        color: ad.accentColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: `1px solid ${ad.accentColor}33`,
                      }}
                    >
                      {ad.icon && <ad.icon sx={{ fontSize: 26 }} />}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>
                        {ad.brand}
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1.2, fontFamily: "'Sora','Inter',sans-serif" }}>
                        {ad.title}
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {ad.description}
                  </Typography>
                </Box>

                <Box sx={{ pt: 2, borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="caption" color="text.secondary">Promo Code:</Typography>
                    <Chip
                      icon={<ShoppingBagRoundedIcon sx={{ fontSize: '0.9rem !important' }} />}
                      label={ad.promoCode}
                      size="small"
                      sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: 1, bgcolor: 'rgba(255,255,255,0.08)' }}
                    />
                  </Stack>

                  <Button
                    variant="contained"
                    fullWidth
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    onClick={() => handleClaimDeal(ad)}
                    sx={{
                      py: 1.2,
                      fontWeight: 700,
                      bgcolor: ad.accentColor,
                      color: ad.accentColor === '#C6FF3E' ? '#000' : '#fff',
                      '&:hover': {
                        bgcolor: ad.accentColor,
                        filter: 'brightness(1.1)',
                      },
                    }}
                  >
                    {ad.actionText}
                  </Button>
                </Box>
              </AdCard>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
