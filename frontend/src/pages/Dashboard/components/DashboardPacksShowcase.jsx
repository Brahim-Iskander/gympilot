import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Card,
  Grid,
  Stack,
  Typography,
  Chip,
  Button,
  IconButton,
  Tooltip,
  Snackbar,
  Rating,
  Divider,
  CircularProgress,
} from '@mui/material';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';

import { productPackService } from '../../../services/productPackService';
import { useCart } from '../../../context/CartContext';



export default function DashboardPacksShowcase() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, openCartDrawer } = useCart();
  const [addedIds, setAddedIds] = useState(new Set());
  const [copySnackbar, setCopySnackbar] = useState('');

  const handleCopyPackUrl = (e, pack) => {
    e.preventDefault();
    e.stopPropagation();
    const identifier = pack.slug || pack.id;
    const url = `${window.location.origin}/shop/pack/${identifier}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopySnackbar('Lien direct du pack copié dans le presse-papiers !');
    }
  };

  const handleWhatsAppShare = (e, pack) => {
    e.preventDefault();
    e.stopPropagation();
    const identifier = pack.slug || pack.id;
    const url = `${window.location.origin}/shop/pack/${identifier}`;
    const text = `Découvre le ${pack.name} sur GymPilot : ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  useEffect(() => {
    productPackService
      .getActivePacks()
      .then((data) => {
        const activeNonExpired = (data || []).filter(
          (p) => !p.validUntil || new Date(p.validUntil).getTime() > Date.now()
        );
        setPacks(activeNonExpired || []);
      })
      .catch(() => {
        setPacks([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAddToCart = (pack) => {
    addToCart({
      id: pack.id,
      productId: pack.id,
      name: pack.name,
      price: pack.price,
      images: pack.images && pack.images.length > 0 ? pack.images : ['/pack-whey-creatine-zinc.jpg'],
      stockQuantity: pack.stockQuantity || 15,
      categoryName: 'Packs Promo',
      sellerId: pack.sellerId,
      sellerName: pack.sellerName,
      sellerStoreName: pack.sellerStoreName,
      sellerStoreLogo: pack.sellerStoreLogo,
    });
    setAddedIds((prev) => new Set(prev).add(pack.id));
    openCartDrawer();
  };

  if (loading) {
    return null;
  }

  const displayPacks = packs.slice(0, 3);

  if (displayPacks.length === 0) {
    return null;
  }

  return (
    <Box sx={{ my: 5 }}>
      {/* Section Header */}
      <Card
        sx={{
          p: { xs: 2.5, md: 3.5 },
          mb: 3.5,
          borderRadius: 4,
          background: (theme) =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(255, 77, 77, 0.12) 0%, rgba(198, 255, 62, 0.08) 50%, rgba(15, 23, 42, 0.6) 100%)'
              : 'linear-gradient(135deg, rgba(255, 77, 77, 0.08) 0%, rgba(198, 255, 62, 0.12) 50%, #FFFFFF 100%)',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 77, 77, 0.3)' : 'rgba(255, 77, 77, 0.25)',
          boxShadow: '0 12px 36px rgba(0,0,0,0.25)',
        }}
      >
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mb: 1 }}>
              <Chip
                icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '1rem !important', color: '#FF4D4D' }} />}
                label="OFFRES SPÉCIALES ATHLÈTES"
                sx={{
                  bgcolor: 'rgba(255, 77, 77, 0.15)',
                  color: '#FF4D4D',
                  fontWeight: 900,
                  fontSize: '0.72rem',
                  letterSpacing: 0.5,
                  border: '1px solid rgba(255, 77, 77, 0.3)',
                }}
              />
              <Chip
                icon={<MonetizationOnRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#00E676' }} />}
                label="Économisez jusqu'à 70 TND"
                size="small"
                sx={{
                  bgcolor: 'rgba(0, 230, 118, 0.12)',
                  color: '#00E676',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  border: '1px solid rgba(0, 230, 118, 0.25)',
                }}
              />
            </Stack>

            <Typography
              variant="h5"
              sx={{
                fontFamily: "'Sora', sans-serif",
                fontWeight: 900,
                fontSize: { xs: '1.4rem', sm: '1.75rem' },
                background: 'linear-gradient(135deg, #FFFFFF 40%, #C6FF3E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Packs Synergie & Combos Nutrition
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 680, mt: 0.5 }}>
              Des associations de compléments scientifiquement conçues pour maximiser vos résultats tout en bénéficiant de tarifs préférentiels et de la livraison express partout en Tunisie.
            </Typography>
          </Box>

          <Button
            component={RouterLink}
            to="/shop"
            variant="outlined"
            fullWidth={false}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              fontWeight: 800,
              borderRadius: 3,
              borderColor: 'rgba(198, 255, 62, 0.4)',
              color: 'primary.main',
              px: 2.5,
              py: 1,
              whiteSpace: 'nowrap',
              width: { xs: '100%', sm: 'auto' },
              '&:hover': {
                borderColor: 'primary.main',
                bgcolor: 'rgba(198, 255, 62, 0.08)',
              },
            }}
          >
            Tous les Packs Shop
          </Button>
        </Stack>
      </Card>

      {/* Packs Grid */}
      <Grid container spacing={3}>
        {displayPacks.map((pack) => {
          const discountAmount = pack.originalPrice && pack.originalPrice > pack.price
            ? Math.round(pack.originalPrice - pack.price)
            : null;
          const discountPercent = pack.originalPrice && pack.originalPrice > pack.price
            ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
            : null;
          const isAdded = addedIds.has(pack.id);
          const packImage = pack.images && pack.images.length > 0 ? pack.images[0] : '/pack-whey-creatine-zinc.jpg';

          return (
            <Grid item xs={12} md={6} key={pack.id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 4,
                  overflow: 'hidden',
                  position: 'relative',
                  border: '1.5px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 77, 77, 0.35)' : 'rgba(255, 77, 77, 0.3)',
                  background: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'linear-gradient(180deg, rgba(26, 31, 44, 0.9) 0%, rgba(13, 17, 23, 0.98) 100%)'
                      : '#FFFFFF',
                  boxShadow: '0 16px 40px rgba(0,0,0,0.3)',
                  transition: 'transform 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    borderColor: 'primary.main',
                    boxShadow: '0 24px 50px rgba(198, 255, 62, 0.15)',
                  },
                }}
              >
                {/* Top Image + Badges Section */}
                <Box
                  component={RouterLink}
                  to={`/shop/pack/${pack.slug || pack.id}`}
                  sx={{ position: 'relative', height: { xs: 220, sm: 260 }, bgcolor: '#0A0C0F', overflow: 'hidden', display: 'block' }}
                >
                  <Box
                    component="img"
                    src={packImage}
                    alt={pack.name}
                    sx={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      transition: 'transform 0.4s ease',
                      '&:hover': { transform: 'scale(1.05)' },
                    }}
                  />

                  {/* Gradient Overlay */}
                  <Box
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      height: '60%',
                      background: 'linear-gradient(to top, rgba(10, 12, 15, 0.95) 0%, transparent 100%)',
                    }}
                  />

                  {/* Top Badges */}
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{ position: 'absolute', top: 14, left: 14, right: 14 }}
                  >
                    <Chip
                      icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#FFFFFF' }} />}
                      label={pack.badge || `-${discountPercent || 20}% OFF`}
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        bgcolor: '#FF4D4D',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 12px rgba(255,77,77,0.5)',
                        py: 0.5,
                      }}
                    />

                    {discountAmount && (
                      <Chip
                        label={`Économisez ${discountAmount} TND`}
                        sx={{
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          bgcolor: 'rgba(0, 230, 118, 0.9)',
                          color: '#000000',
                          backdropFilter: 'blur(4px)',
                        }}
                      />
                    )}
                  </Stack>

                  {/* Stock tag */}
                  <Box sx={{ position: 'absolute', bottom: 12, left: 16 }}>
                    <Chip
                      label={`🔥 Plus que ${pack.stockQuantity || 6} packs disponibles`}
                      size="small"
                      sx={{
                        fontWeight: 800,
                        fontSize: '0.72rem',
                        bgcolor: 'rgba(0,0,0,0.75)',
                        color: '#FFB300',
                        border: '1px solid rgba(255, 179, 0, 0.4)',
                        backdropFilter: 'blur(4px)',
                      }}
                    />
                  </Box>
                </Box>

                {/* Content Section */}
                <Box sx={{ p: { xs: 2.5, sm: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Rating & Verified */}
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                    <Rating value={pack.rating || 5} precision={0.5} size="small" readOnly />
                    <Typography variant="caption" sx={{ color: '#FFB300', fontWeight: 800 }}>
                      {pack.rating || 5.0} ({pack.reviewCount || 18} avis athlètes)
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>•</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <VerifiedRoundedIcon sx={{ color: '#00E676', fontSize: '0.9rem' }} />
                      <Typography variant="caption" sx={{ color: '#00E676', fontWeight: 700 }}>
                        Certifié Authentique
                      </Typography>
                    </Stack>
                  </Stack>

                  {/* Pack Title */}
                  <Typography
                    component={RouterLink}
                    to={`/shop/pack/${pack.slug || pack.id}`}
                    variant="h6"
                    sx={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 800,
                      fontSize: { xs: '1.05rem', sm: '1.2rem' },
                      lineHeight: 1.3,
                      mb: 1,
                      textDecoration: 'none',
                      color: 'text.primary',
                      transition: 'color 0.2s ease',
                      '&:hover': { color: 'primary.main' },
                    }}
                  >
                    {pack.name}
                  </Typography>

                  {/* Tagline */}
                  {pack.tagline && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.88rem' }}>
                      {pack.tagline}
                    </Typography>
                  )}

                  {/* What's Included (Items Breakdown) */}
                  <Box
                    sx={{
                      p: 2,
                      mb: 2.5,
                      borderRadius: 3,
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 900,
                        letterSpacing: 0.8,
                        textTransform: 'uppercase',
                        color: 'text.secondary',
                        display: 'block',
                        mb: 1.5,
                      }}
                    >
                      DÉTAIL DU COMBO NUTRITION :
                    </Typography>

                    <Stack spacing={1.2}>
                      {(pack.items && pack.items.length > 0 ? pack.items : [
                        { name: '100% Whey Protein Isolate (2.27kg)', notes: '25g Protéines pures' },
                        { name: 'Micronized Creatine Monohydrate (300g)', notes: 'Puissance ATP 60j' },
                        { name: 'Zinc 25mg Gélules Végétales (90 gélules)', notes: 'Soutien hormonal & immunité' },
                      ]).map((item, idx) => (
                        <Stack direction="row" spacing={1.2} alignItems="flex-start" key={idx}>
                          <CheckCircleRoundedIcon
                            sx={{
                              color: 'primary.main',
                              fontSize: '1.1rem',
                              mt: 0.2,
                              flexShrink: 0,
                            }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                              {item.quantity ? `${item.quantity}x ` : ''}
                              {item.name}
                            </Typography>
                            {item.notes && (
                              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.2 }}>
                                {item.notes}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      ))}
                    </Stack>
                  </Box>

                  {/* Trust Micro-Strip */}
                  <Stack direction="row" spacing={2} sx={{ mb: 2.5, color: 'text.secondary' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <LocalShippingRoundedIcon sx={{ fontSize: '0.95rem', color: 'primary.main' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        Livraison Express 24-48h
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <BoltRoundedIcon sx={{ fontSize: '0.95rem', color: '#FFB300' }} />
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        +125 Pts Fidélité
                      </Typography>
                    </Stack>
                  </Stack>

                  <Box sx={{ mt: 'auto' }}>
                    <Divider sx={{ mb: 2 }} />

                    {/* Price & Add to Cart Action */}
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" gap={2}>
                      <Box>
                        {pack.originalPrice && pack.originalPrice > pack.price && (
                          <Typography
                            variant="body2"
                            sx={{
                              textDecoration: 'line-through',
                              color: 'text.secondary',
                              fontWeight: 700,
                              fontSize: '0.9rem',
                            }}
                          >
                            {pack.originalPrice.toFixed(2)} TND
                          </Typography>
                        )}
                        <Typography
                          variant="h5"
                          sx={{
                            fontFamily: "'Sora', sans-serif",
                            fontWeight: 900,
                            color: '#00E676',
                            fontSize: { xs: '1.4rem', sm: '1.65rem' },
                            lineHeight: 1.1,
                          }}
                        >
                          {pack.price.toFixed(2)} <span style={{ fontSize: '0.85rem' }}>TND</span>
                        </Typography>
                      </Box>

                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ justifyContent: { xs: 'center', sm: 'flex-end' } }}>
                        <Button
                          variant={isAdded ? 'outlined' : 'contained'}
                          onClick={() => handleAddToCart(pack)}
                          startIcon={isAdded ? <CheckCircleRoundedIcon /> : <AddShoppingCartRoundedIcon />}
                          sx={{
                            py: 1.2,
                            px: { xs: 2, sm: 2.5 },
                            borderRadius: 3,
                            fontWeight: 900,
                            fontSize: '0.9rem',
                            ...(isAdded
                              ? { borderColor: '#00E676', color: '#00E676' }
                              : {
                                  bgcolor: 'primary.main',
                                  color: '#0A0C0F',
                                  boxShadow: '0 4px 20px rgba(198, 255, 62, 0.35)',
                                  '&:hover': {
                                    bgcolor: '#B8F52E',
                                    transform: 'scale(1.02)',
                                  },
                                }),
                          }}
                        >
                          {isAdded ? 'Ajouté ✓' : 'Commander'}
                        </Button>

                        {/* Direct Link Share Button */}
                        <Tooltip title="Copier le lien direct du pack" arrow placement="top">
                          <IconButton
                            onClick={(e) => handleCopyPackUrl(e, pack)}
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2.5,
                              color: 'text.secondary',
                              p: 1.1,
                              transition: 'all .2s ease',
                              '&:hover': {
                                color: 'primary.main',
                                borderColor: 'primary.main',
                                bgcolor: 'rgba(198,255,62,0.1)',
                              },
                            }}
                          >
                            <ContentCopyRoundedIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>

                        {/* WhatsApp Share Button */}
                        <Tooltip title="Partager sur WhatsApp" arrow placement="top">
                          <IconButton
                            onClick={(e) => handleWhatsAppShare(e, pack)}
                            sx={{
                              border: '1px solid',
                              borderColor: 'rgba(37, 211, 102, 0.3)',
                              borderRadius: 2.5,
                              color: '#25D366',
                              p: 1.1,
                              transition: 'all .2s ease',
                              '&:hover': {
                                borderColor: '#25D366',
                                bgcolor: 'rgba(37, 211, 102, 0.1)',
                              },
                            }}
                          >
                            <WhatsAppIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Stack>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Snackbar notification when pack URL is copied */}
      <Snackbar
        open={Boolean(copySnackbar)}
        autoHideDuration={3000}
        onClose={() => setCopySnackbar('')}
        message={copySnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </Box>
  );
}
