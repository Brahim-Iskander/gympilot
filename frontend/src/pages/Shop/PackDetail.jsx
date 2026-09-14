import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Grid,
  Typography,
  Stack,
  Chip,
  Rating,
  Button,
  IconButton,
  Divider,
  Card,
  CircularProgress,
  Breadcrumbs,
  Link,
  Alert,
  Tooltip,
  Snackbar,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import FlashOnRoundedIcon from '@mui/icons-material/FlashOnRounded';
import ShareRoundedIcon from '@mui/icons-material/ShareRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import { productPackService } from '../../services/productPackService';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';
import { getPackDurationStatus } from '../../utils/durationHelper';

// Rich fallback for showcase packs
const FALLBACK_PACKS = {
  'pack-trio-anabolique': {
    id: 'pack-trio-anabolique',
    name: 'Pack Trio Anabolique : 100% Whey Isolate + Créatine + Zinc',
    slug: 'pack-trio-whey-creatine-zinc',
    tagline: 'Force explosive, construction de muscle sec et optimisation hormonale maximale.',
    description: 'Le combo d’élite conçu pour les athlètes exigeants. L’alliance de la Whey Isolate ultra-filtrée pour relancer la synthèse protéique, de la Créatine monohydrate micronisée pour saturer vos réserves énergétiques d’ATP, et du Zinc hautement assimilable pour soutenir un taux optimal de testostérone et une régénération cellulaire nocturne.',
    badge: '-22% OFF · Bestseller',
    price: 249.0,
    originalPrice: 318.0,
    images: ['/pack-whey-creatine-zinc.jpg'],
    stockQuantity: 12,
    rating: 5.0,
    reviewCount: 34,
    items: [
      { name: 'Ultra Whey Protein Isolate (2.27kg)', quantity: 1, notes: '25g protéines pures, 0 sucre ajouté & 5.5g BCAA naturels' },
      { name: 'Micronized Creatine Monohydrate (300g)', quantity: 1, notes: 'Saturation cellulaire ATP, explosivité et puissance maximale' },
      { name: 'Zinc Bisglycinate 25mg (90 gélules)', quantity: 1, notes: 'Soutien testostérone naturelle, sommeil anabolique & immunité' },
    ],
  },
  'pack-trio-whey-creatine-zinc': {
    id: 'pack-trio-anabolique',
    name: 'Pack Trio Anabolique : 100% Whey Isolate + Créatine + Zinc',
    slug: 'pack-trio-whey-creatine-zinc',
    tagline: 'Force explosive, construction de muscle sec et optimisation hormonale maximale.',
    description: 'Le combo d’élite conçu pour les athlètes exigeants. L’alliance de la Whey Isolate ultra-filtrée pour relancer la synthèse protéique, de la Créatine monohydrate micronisée pour saturer vos réserves énergétiques d’ATP, et du Zinc hautement assimilable pour soutenir un taux optimal de testostérone et une régénération cellulaire nocturne.',
    badge: '-22% OFF · Bestseller',
    price: 249.0,
    originalPrice: 318.0,
    images: ['/pack-whey-creatine-zinc.jpg'],
    stockQuantity: 12,
    rating: 5.0,
    reviewCount: 34,
    items: [
      { name: 'Ultra Whey Protein Isolate (2.27kg)', quantity: 1, notes: '25g protéines pures, 0 sucre ajouté & 5.5g BCAA naturels' },
      { name: 'Micronized Creatine Monohydrate (300g)', quantity: 1, notes: 'Saturation cellulaire ATP, explosivité et puissance maximale' },
      { name: 'Zinc Bisglycinate 25mg (90 gélules)', quantity: 1, notes: 'Soutien testostérone naturelle, sommeil anabolique & immunité' },
    ],
  },
  'pack-mass-builder': {
    id: 'pack-masse-extreme',
    name: 'Pack Mass Builder : Hyper Gainer 3kg + Créatine 300g + Shaker Pro',
    slug: 'pack-mass-builder',
    tagline: 'La solution complète pour hardgainers : surplus calorique dense et progression rapide.',
    description: 'Conçu spécialement pour ceux qui ont des difficultés à prendre du poids ou de la masse musculaire. Un apport massif de calories saines et de protéines de haute valeur biologique, combiné à la créatine pour un gain de volume et de force accéléré.',
    badge: '-18% OFF · Prise de Masse',
    price: 219.0,
    originalPrice: 268.0,
    images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80'],
    stockQuantity: 8,
    rating: 4.9,
    reviewCount: 22,
    items: [
      { name: 'Hyper Mass Gainer Advanced (3.0kg)', quantity: 1, notes: '1150 kcal & 50g protéines par portion' },
      { name: 'Quamtrax Pure Creatine (300g)', quantity: 1, notes: '100% micronisée pour booster la force' },
      { name: 'Shaker GymPilot Pro 700ml', quantity: 1, notes: 'Anti-fuite avec grille mélangeuse inox' },
    ],
  },
};

export default function PackDetail() {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCartDrawer } = useCart();

  const [pack, setPack] = useState(null);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadPack() {
      try {
        setLoading(true);
        setError('');
        const data = await productPackService.getPack(idOrSlug);
        if (data) {
          if (data.validUntil && new Date(data.validUntil).getTime() <= Date.now()) {
            setError('Cette offre promotionnelle a expiré et n\'est plus disponible.');
            setPack(null);
          } else {
            setPack(data);
            if (data.images && data.images.length > 0) {
              setSelectedImage(data.images[0]);
            }
          }
        } else if (FALLBACK_PACKS[idOrSlug]) {
          setPack(FALLBACK_PACKS[idOrSlug]);
          setSelectedImage(FALLBACK_PACKS[idOrSlug].images[0]);
        } else {
          setError('Pack introuvable.');
        }
      } catch (err) {
        if (FALLBACK_PACKS[idOrSlug]) {
          setPack(FALLBACK_PACKS[idOrSlug]);
          setSelectedImage(FALLBACK_PACKS[idOrSlug].images[0]);
        } else {
          console.error('Failed to fetch pack details:', err);
          setError('Pack promotionnel introuvable ou indisponible.');
        }
      } finally {
        setLoading(false);
      }
    }

    if (idOrSlug) {
      loadPack();
    }
  }, [idOrSlug]);

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Découvre le ${pack?.name} sur GymPilot : ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleNativeShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: pack?.name || 'Pack GymPilot',
          text: pack?.tagline || `Pack spécial disponible sur GymPilot Tunisie`,
          url,
        });
      } catch {
        handleCopyLink();
      }
    } else {
      handleCopyLink();
    }
  };

  const handleAddToCart = () => {
    if (!pack) return;
    addToCart(
      {
        id: pack.id,
        productId: pack.id,
        name: pack.name,
        price: pack.price,
        images: pack.images && pack.images.length > 0 ? pack.images : ['/pack-whey-creatine-zinc.jpg'],
        stockQuantity: pack.stockQuantity || 20,
        categoryName: 'Packs Promo',
        sellerId: pack.sellerId,
        sellerName: pack.sellerName,
        sellerStoreName: pack.sellerStoreName,
        sellerStoreLogo: pack.sellerStoreLogo,
      },
      quantity
    );
    openCartDrawer();
  };

  const handleBuyNow = () => {
    if (!pack) return;
    addToCart(
      {
        id: pack.id,
        productId: pack.id,
        name: pack.name,
        price: pack.price,
        images: pack.images && pack.images.length > 0 ? pack.images : ['/pack-whey-creatine-zinc.jpg'],
        stockQuantity: pack.stockQuantity || 20,
        categoryName: 'Packs Promo',
        sellerId: pack.sellerId,
        sellerName: pack.sellerName,
        sellerStoreName: pack.sellerStoreName,
        sellerStoreLogo: pack.sellerStoreLogo,
      },
      quantity
    );
    navigate('/shop/checkout');
  };

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Chargement de l’offre du pack...
        </Typography>
      </Container>
    );
  }

  if (error || !pack) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Pack introuvable'}
        </Alert>
        <Button component={RouterLink} to="/shop" startIcon={<ArrowBackRoundedIcon />} variant="outlined">
          Retour au Shop
        </Button>
      </Container>
    );
  }

  const hasDiscount = pack.originalPrice && pack.originalPrice > pack.price;
  const discountAmount = hasDiscount ? Math.round(pack.originalPrice - pack.price) : 0;
  const discountPercent = hasDiscount
    ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
    : 0;

  const images = pack.images && pack.images.length > 0
    ? pack.images
    : ['/pack-whey-creatine-zinc.jpg'];

  const currentImage = selectedImage || images[0];

  return (
    <>
      <SEO
        title={`${pack.name} — Offre Spéciale GymPilot`}
        description={pack.description || pack.tagline || `Économisez sur le pack ${pack.name} avec livraison express en Tunisie.`}
        path={`/shop/pack/${pack.slug || pack.id}`}
        ogImage={currentImage}
        ogType="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: pack.name,
          image: images,
          description: pack.description || pack.tagline || `Offre spéciale ${pack.name} sur GymPilot Shop.`,
          offers: {
            '@type': 'Offer',
            price: pack.price,
            priceCurrency: 'TND',
            availability: pack.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }}
      />

      <CartDrawer />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Breadcrumbs */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/" underline="hover" color="inherit" sx={{ fontSize: '0.875rem' }}>
            Accueil
          </Link>
          <Link component={RouterLink} to="/shop" underline="hover" color="inherit" sx={{ fontSize: '0.875rem' }}>
            Boutique
          </Link>
          <Typography color="primary.main" sx={{ fontSize: '0.875rem', fontWeight: 700 }}>
            Packs Synergie
          </Typography>
        </Breadcrumbs>

        <Grid container spacing={{ xs: 3, md: 5 }}>
          {/* LEFT: Image Gallery */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              <Card
                elevation={0}
                sx={{
                  position: 'relative',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: '#0A0C0F',
                  border: '1.5px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 77, 77, 0.35)' : 'rgba(255, 77, 77, 0.25)',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.3)',
                }}
              >
                <Box
                  component="img"
                  src={currentImage}
                  alt={pack.name}
                  sx={{
                    width: '100%',
                    height: { xs: 320, sm: 460 },
                    objectFit: 'cover',
                    display: 'block',
                    transition: 'transform 0.4s ease',
                    '&:hover': { transform: 'scale(1.03)' },
                  }}
                />

                {/* Badges Overlay */}
                <Stack direction="row" spacing={1} sx={{ position: 'absolute', top: 16, left: 16 }}>
                  {pack.badge && (
                    <Chip
                      icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '0.95rem !important', color: '#FFF' }} />}
                      label={pack.badge}
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        bgcolor: '#FF4D4D',
                        color: '#FFFFFF',
                        boxShadow: '0 4px 14px rgba(255,77,77,0.5)',
                      }}
                    />
                  )}
                  {hasDiscount && (
                    <Chip
                      label={`Économie ${discountAmount} TND`}
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.78rem',
                        bgcolor: '#00E676',
                        color: '#0A0C0F',
                      }}
                    />
                  )}
                </Stack>
              </Card>

              {/* Thumbnails if multiple images */}
              {images.length > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ mt: 2, overflowX: 'auto', pb: 1 }}>
                  {images.map((img, i) => (
                    <Box
                      key={i}
                      component="img"
                      src={img}
                      alt={`Thumbnail ${i + 1}`}
                      onClick={() => setSelectedImage(img)}
                      sx={{
                        width: 76,
                        height: 76,
                        borderRadius: 2.5,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: currentImage === img ? 'primary.main' : 'transparent',
                        opacity: currentImage === img ? 1 : 0.65,
                        transition: 'all 0.2s ease',
                        '&:hover': { opacity: 1 },
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          {/* RIGHT: Pack Details & Conversion Actions */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Category & Rating */}
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Chip
                  icon={<BoltRoundedIcon sx={{ fontSize: '1rem !important', color: 'primary.main' }} />}
                  label="PACK NUTRITION SYNERGIE"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(198,255,62,0.1)',
                    color: 'primary.main',
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    letterSpacing: 0.5,
                    border: '1px solid rgba(198,255,62,0.3)',
                  }}
                />

                <Stack direction="row" spacing={1} alignItems="center">
                  <Rating value={pack.rating || 5} precision={0.1} readOnly size="small" />
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.secondary' }}>
                    {pack.rating?.toFixed(1) || '5.0'} ({pack.reviewCount || 34} avis)
                  </Typography>
                </Stack>
              </Stack>

              {/* Title */}
              <Typography
                variant="h4"
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 900,
                  fontSize: { xs: '1.6rem', md: '2.1rem' },
                  lineHeight: 1.25,
                  mb: 1.5,
                }}
              >
                {pack.name}
              </Typography>

              {/* Tagline */}
              {pack.tagline && (
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.5, fontWeight: 500 }}>
                  {pack.tagline}
                </Typography>
              )}

              {/* Seller / Store info */}
              {pack.sellerStoreName && (
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <StorefrontRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Vendu et expédié par{' '}
                    <Typography component="span" variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {pack.sellerStoreName}
                    </Typography>
                  </Typography>
                </Stack>
              )}

              <Divider sx={{ my: 2 }} />

              {/* Limited Duration Alert Badge */}
              {pack.validUntil && (
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                  <Chip
                    icon={<AccessTimeRoundedIcon sx={{ fontSize: '15px !important', color: '#FFD700 !important' }} />}
                    label={getPackDurationStatus(pack).label}
                    sx={{
                      bgcolor: 'rgba(255, 215, 0, 0.1)',
                      color: '#FFD700',
                      border: '1px solid rgba(255, 215, 0, 0.3)',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                    }}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Offre limitée dans le temps.
                  </Typography>
                </Stack>
              )}

              {/* Price Anchor */}
              <Box sx={{ mb: 2.5 }}>
                <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 0.5 }}>
                  <Typography
                    variant="h3"
                    sx={{
                      fontFamily: "'Sora', sans-serif",
                      fontWeight: 900,
                      color: 'primary.main',
                      letterSpacing: -1,
                    }}
                  >
                    {Number(pack.price).toFixed(2)} TND
                  </Typography>

                  {hasDiscount && (
                    <>
                      <Typography
                        variant="h6"
                        sx={{
                          textDecoration: 'line-through',
                          color: 'text.secondary',
                          fontWeight: 600,
                        }}
                      >
                        {Number(pack.originalPrice).toFixed(2)} TND
                      </Typography>
                      <Chip
                        label={`-${discountPercent}%`}
                        sx={{
                          bgcolor: 'rgba(255,77,77,0.15)',
                          color: '#FF4D4D',
                          fontWeight: 900,
                          fontSize: '0.85rem',
                          border: '1px solid rgba(255,77,77,0.3)',
                        }}
                      />
                    </>
                  )}
                </Stack>

                {hasDiscount && (
                  <Typography variant="body2" sx={{ color: '#00E676', fontWeight: 800 }}>
                    🔥 Vous économisez {discountAmount} TND sur ce pack complet par rapport aux prix individuels !
                  </Typography>
                )}
              </Box>

              {/* Stock Urgency */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 3 }}>
                <LocalFireDepartmentRoundedIcon sx={{ color: '#FF4D4D', fontSize: 20 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#FF4D4D' }}>
                  Offre à durée limitée : Plus que {pack.stockQuantity || 12} packs disponibles à ce tarif promotionnel.
                </Typography>
              </Stack>

              {/* Itemized Contents Box */}
              {pack.items && pack.items.length > 0 && (
                <Box
                  sx={{
                    p: 2.5,
                    mb: 3.5,
                    borderRadius: 3.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                    border: '1.5px solid',
                    borderColor: 'divider',
                  }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 900,
                      textTransform: 'uppercase',
                      letterSpacing: 0.8,
                      color: 'text.secondary',
                      mb: 1.5,
                    }}
                  >
                    Composition détaillée du pack :
                  </Typography>
                  <Stack spacing={1.5}>
                    {pack.items.map((item, idx) => (
                      <Stack direction="row" spacing={1.5} alignItems="flex-start" key={idx}>
                        <CheckCircleRoundedIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.2, flexShrink: 0 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                            {item.quantity ? `${item.quantity}x ` : ''}{item.name}
                          </Typography>
                          {item.notes && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.2 }}>
                              {item.notes}
                            </Typography>
                          )}
                        </Box>
                      </Stack>
                    ))}
                  </Stack>
                </Box>
              )}

              {/* Quantity Selector & Action Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 2 }}>
                {/* Quantity */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                    px: 1,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: 'center',
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <RemoveRoundedIcon fontSize="small" />
                  </IconButton>
                  <Typography sx={{ px: 2, fontWeight: 800, minWidth: 28, textAlign: 'center' }}>
                    {quantity}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setQuantity((q) => Math.min(pack.stockQuantity || 20, q + 1))}
                  >
                    <AddRoundedIcon fontSize="small" />
                  </IconButton>
                </Box>

                {/* Add to Cart */}
                <Button
                  variant="contained"
                  fullWidth
                  size="large"
                  startIcon={<ShoppingBagRoundedIcon />}
                  onClick={handleAddToCart}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 2.5,
                    py: 1.4,
                    fontSize: '0.95rem',
                  }}
                >
                  Ajouter au Panier ({(pack.price * quantity).toFixed(2)} TND)
                </Button>

                {/* Buy Now */}
                <Button
                  variant="outlined"
                  fullWidth
                  size="large"
                  startIcon={<FlashOnRoundedIcon sx={{ color: 'primary.main' }} />}
                  onClick={handleBuyNow}
                  sx={{
                    fontWeight: 900,
                    borderRadius: 2.5,
                    py: 1.4,
                    fontSize: '0.95rem',
                    borderColor: 'primary.main',
                    color: 'primary.main',
                    '&:hover': {
                      borderColor: 'primary.dark',
                      bgcolor: 'rgba(198,255,62,0.08)',
                    },
                  }}
                >
                  Acheter Direct
                </Button>
              </Stack>

              {/* Share URL Section (like product detail) */}
              <Box
                sx={{
                  p: 2,
                  mb: 3,
                  borderRadius: 3,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.04)' : 'rgba(0,0,0,0.02)',
                  border: '1px dashed',
                  borderColor: 'rgba(198, 255, 62, 0.3)',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', display: 'block', mb: 1 }}>
                  PARTAGER CE PACK AVEC UN AMI ATHLÈTE :
                </Typography>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={handleCopyLink}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      },
                    }}
                  >
                    {copied ? 'Lien copié ! ✓' : 'Copier le lien direct du pack'}
                  </Button>

                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<WhatsAppIcon sx={{ color: '#25D366' }} />}
                    onClick={handleWhatsAppShare}
                    sx={{
                      fontWeight: 700,
                      fontSize: '0.82rem',
                      textTransform: 'none',
                      borderRadius: 2,
                      color: '#25D366',
                      borderColor: 'rgba(37, 211, 102, 0.4)',
                      '&:hover': {
                        borderColor: '#25D366',
                        bgcolor: 'rgba(37, 211, 102, 0.08)',
                      },
                    }}
                  >
                    Partager sur WhatsApp
                  </Button>

                  {typeof navigator !== 'undefined' && navigator.share && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ShareRoundedIcon />}
                      onClick={handleNativeShare}
                      sx={{
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        textTransform: 'none',
                        borderRadius: 2,
                        borderColor: 'divider',
                      }}
                    >
                      Autres options
                    </Button>
                  )}
                </Stack>
              </Box>

              {/* Guarantees Strip */}
              <Grid container spacing={2}>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <VerifiedRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                        100% Authentique
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Certifié de laboratoire
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <LocalShippingRoundedIcon sx={{ color: '#38BDF8', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                        Livraison 24-48h
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Toute la Tunisie
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} sm={4}>
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <SecurityRoundedIcon sx={{ color: '#00E676', fontSize: 24 }} />
                    <Box>
                      <Typography variant="caption" sx={{ fontWeight: 800, display: 'block' }}>
                        Paiement à la livraison
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Espèces à réception
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
              </Grid>

              {/* Description */}
              {pack.description && (
                <Box sx={{ mt: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", mb: 1 }}>
                    Pourquoi choisir cette formule combinée ?
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                    {pack.description}
                  </Typography>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />

      {/* Snackbar Notification */}
      <Snackbar
        open={copied}
        autoHideDuration={3000}
        onClose={() => setCopied(false)}
        message="Lien direct du pack copié dans le presse-papiers !"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
    </>
  );
}
