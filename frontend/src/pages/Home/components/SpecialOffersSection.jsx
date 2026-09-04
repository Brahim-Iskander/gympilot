import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Stack,
  Button,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from '@mui/material';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import { productPackService } from '../../../services/productPackService';
import { useCart } from '../../../context/CartContext';

export default function SpecialOffersSection() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, openCartDrawer } = useCart();
  const [addedPackIds, setAddedPackIds] = useState(new Set());

  useEffect(() => {
    productPackService
      .getFeaturedPacks()
      .then((data) => {
        if (data && data.length > 0) {
          setPacks(data);
        } else {
          // Fallback to active packs if none specifically marked as featured
          return productPackService.getActivePacks().then((all) => setPacks(all || []));
        }
      })
      .catch((err) => console.error('Failed to load featured packs:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading || packs.length === 0) {
    return null;
  }

  const handleAddPackToCart = (pack) => {
    addToCart({
      id: pack.id,
      productId: pack.id,
      name: pack.name,
      price: pack.price,
      images: pack.images,
      stockQuantity: pack.stockQuantity || 20,
      categoryName: 'Special Offer Pack',
      sellerId: pack.sellerId,
      sellerName: pack.sellerName,
      sellerStoreName: pack.sellerStoreName,
      sellerStoreLogo: pack.sellerStoreLogo,
    });
    setAddedPackIds((prev) => new Set(prev).add(pack.id));
    openCartDrawer();
  };

  return (
    <Box
      component="section"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #0A0C0F 0%, rgba(20,24,33,0.85) 50%, #0A0C0F 100%)'
            : 'linear-gradient(180deg, #F8FAFC 0%, rgba(241,245,249,0.8) 50%, #F8FAFC 100%)',
        overflow: 'hidden',
      }}
    >
      {/* Background glow orb */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: 600,
          height: 350,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198,255,62,0.07) 0%, transparent 70%)',
          pointerEvents: 'none',
          filter: 'blur(60px)',
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Stack spacing={2} alignItems="center" textAlign="center" sx={{ mb: { xs: 5, md: 7 } }}>
          <Chip
            icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '1.1rem !important', color: '#FF4D4D' }} />}
            label="LIMITED TIME PROMOTIONS"
            sx={{
              fontWeight: 900,
              fontSize: '0.75rem',
              letterSpacing: 1,
              bgcolor: 'rgba(255, 77, 77, 0.12)',
              color: '#FF4D4D',
              border: '1px solid rgba(255, 77, 77, 0.3)',
              px: 1.5,
              py: 0.5,
            }}
          />

          <Typography
            variant="h3"
            sx={{
              fontFamily: "'Sora', sans-serif",
              fontWeight: 900,
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              lineHeight: 1.15,
            }}
          >
            Exclusive Stacks &amp;{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #FFFFFF 30%, #C6FF3E 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Discount Packs
            </span>
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 640, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
            Supercharge your physique goals with our curated supplement stacks. Bundled together for maximum athletic synergy and verified savings.
          </Typography>
        </Stack>

        {/* Packs Grid */}
        <Grid container spacing={3.5} justifyContent="center">
          {packs.slice(0, 3).map((pack) => {
            const isAdded = addedPackIds.has(pack.id);
            const savings = (pack.originalPrice || pack.price) - pack.price;
            const savingsPct = pack.originalPrice > pack.price
              ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
              : 0;

            return (
              <Grid item xs={12} sm={6} md={4} key={pack.id}>
                <Card
                  elevation={0}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 4,
                    border: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.25)' : 'rgba(58, 125, 26, 0.25)',
                    bgcolor: 'background.paper',
                    overflow: 'hidden',
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 12px 36px rgba(0,0,0,0.4), 0 0 24px rgba(198,255,62,0.06)'
                        : '0 8px 24px rgba(0,0,0,0.05)',
                    '&:hover': {
                      transform: 'translateY(-6px)',
                      borderColor: 'primary.main',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'dark'
                          ? '0 20px 48px rgba(0,0,0,0.6), 0 0 30px rgba(198,255,62,0.18)'
                          : '0 16px 36px rgba(0,0,0,0.1)',
                    },
                  }}
                >
                  {/* Top Image & Badge */}
                  <Box sx={{ position: 'relative', pt: '60%', bgcolor: '#000', overflow: 'hidden' }}>
                    <Box
                      component="img"
                      src={pack.images?.[0] || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80'}
                      alt={pack.name}
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        filter: 'brightness(0.9)',
                      }}
                    />
                    {pack.badge && (
                      <Chip
                        label={pack.badge}
                        sx={{
                          position: 'absolute',
                          top: 14,
                          left: 14,
                          bgcolor: 'primary.main',
                          color: '#0A0C0F',
                          fontWeight: 900,
                          fontSize: '0.75rem',
                          letterSpacing: 0.5,
                          boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                        }}
                      />
                    )}
                    {savingsPct > 0 && (
                      <Chip
                        label={`Save ${savings.toFixed(0)} TND`}
                        size="small"
                        sx={{
                          position: 'absolute',
                          top: 14,
                          right: 14,
                          bgcolor: 'rgba(0, 0, 0, 0.75)',
                          color: '#00E676',
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          border: '1px solid #00E676',
                          backdropFilter: 'blur(4px)',
                        }}
                      />
                    )}
                  </Box>

                  {/* Body Content */}
                  <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 800,
                        fontFamily: "'Sora', sans-serif",
                        lineHeight: 1.3,
                        mb: 1,
                        color: 'text.primary',
                      }}
                    >
                      {pack.name}
                    </Typography>

                    {(pack.sellerStoreName || pack.sellerName) && (
                      <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1.5 }}>
                        <Avatar
                          src={pack.sellerStoreLogo}
                          alt={pack.sellerStoreName || 'Seller'}
                          sx={{
                            width: 20,
                            height: 20,
                            bgcolor: 'rgba(138,124,255,0.2)',
                            color: '#8A7CFF',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            border: '1px solid rgba(138,124,255,0.3)',
                          }}
                        >
                          {(pack.sellerStoreName || pack.sellerName || 'S').charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                          {pack.sellerStoreName || pack.sellerName}
                        </Typography>
                        <VerifiedRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                      </Stack>
                    )}

                    {pack.tagline && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, fontSize: '0.85rem', lineHeight: 1.5 }}>
                        {pack.tagline}
                      </Typography>
                    )}

                    {/* Included Items List */}
                    {pack.items && pack.items.length > 0 && (
                      <Box
                        sx={{
                          p: 1.75,
                          mb: 3,
                          borderRadius: 2.5,
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(15,23,42,0.02)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                          What's Included in This Stack:
                        </Typography>
                        <Stack spacing={1}>
                          {pack.items.map((item, idx) => (
                            <Stack direction="row" spacing={1} alignItems="flex-start" key={idx}>
                              <CheckCircleRoundedIcon sx={{ fontSize: 16, color: 'primary.main', mt: 0.25, flexShrink: 0 }} />
                              <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary', lineHeight: 1.4 }}>
                                <strong>{item.quantity}x</strong> {item.name}{item.description ? ` (${item.description})` : ''}
                              </Typography>
                            </Stack>
                          ))}
                        </Stack>
                      </Box>
                    )}

                    {/* Price Block */}
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <Stack direction="row" alignItems="baseline" spacing={1.5} sx={{ mb: 2 }}>
                        <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                          {Number(pack.price).toFixed(2)} TND
                        </Typography>
                        {pack.originalPrice && pack.originalPrice > pack.price && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through', fontWeight: 600 }}>
                            {Number(pack.originalPrice).toFixed(2)} TND
                          </Typography>
                        )}
                      </Stack>

                      {/* CTA Buttons */}
                      <Stack direction="row" spacing={1.25}>
                        <Button
                          fullWidth
                          variant="contained"
                          startIcon={<AddShoppingCartRoundedIcon />}
                          onClick={() => handleAddPackToCart(pack)}
                          sx={{
                            fontWeight: 800,
                            py: 1.1,
                            borderRadius: 2.5,
                            fontSize: '0.82rem',
                            bgcolor: isAdded ? '#00E676' : 'primary.main',
                            color: '#0A0C0F',
                            boxShadow: '0 4px 16px rgba(198,255,62,0.25)',
                          }}
                        >
                          {isAdded ? 'Added to Cart ✓' : 'Add Pack to Cart'}
                        </Button>
                        <Tooltip title="View Shop Catalog">
                          <IconButton
                            component={RouterLink}
                            to="/shop"
                            sx={{
                              border: '1px solid',
                              borderColor: 'divider',
                              borderRadius: 2.5,
                              color: 'text.secondary',
                              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
                            }}
                          >
                            <ArrowForwardRoundedIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            );
          })}
        </Grid>

        {/* Bottom CTA Banner */}
        <Box
          sx={{
            mt: 6,
            p: 3,
            borderRadius: 3.5,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(15,23,42,0.02)'),
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
            textAlign: { xs: 'center', sm: 'left' },
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <ShoppingBagRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                Looking for individual supplements, creatine powders, or gear?
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Explore our full marketplace inventory with fast 24–48h cash on delivery anywhere in Tunisia.
              </Typography>
            </Box>
          </Stack>
          <Button
            component={RouterLink}
            to="/shop"
            variant="outlined"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ fontWeight: 800, borderRadius: 2.5, whiteSpace: 'nowrap' }}
          >
            Browse Full Shop
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
