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
  Paper,
  Card,
  CardMedia,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  CircularProgress,
  Breadcrumbs,
  Link,
  Alert,
  Tooltip,
  Avatar,
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
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=400&auto=format&fit=crop&q=80';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, openCartDrawer } = useCart();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [selectedImage, setSelectedImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const url = window.location.href;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopied(true);
    }
  };

  const handleWhatsAppShare = () => {
    const url = window.location.href;
    const text = `Check out ${product?.name} on GymPilot: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
        window.scrollTo({ top: 0, behavior: 'instant' });
        const data = await productService.getProductById(id);
        setProduct(data);
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0]);
        }
        const rel = await productService.getRelated(id, 4);
        setRelated(rel || []);
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError('Product not found or unavailable.');
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={48} sx={{ color: 'primary.main', mb: 2 }} />
        <Typography variant="body1" color="text.secondary">Loading product specifications...</Typography>
      </Container>
    );
  }

  if (error || !product) {
    return (
      <Container maxWidth="md" sx={{ py: 8 }}>
        <Alert severity="error" sx={{ mb: 3 }}>{error || 'Product not found'}</Alert>
        <Button component={RouterLink} to="/shop" startIcon={<ArrowBackRoundedIcon />} variant="outlined">
          Back to Shop
        </Button>
      </Container>
    );
  }

  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const images = product.images && product.images.length > 0
    ? product.images
    : [FALLBACK_IMAGE];

  const specsList = product.specs ? Object.entries(product.specs) : [];

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate('/shop/checkout');
  };

  return (
    <>
      <SEO
        title={`${product.name} — GymPilot Shop`}
        description={product.description || `Buy ${product.name} with certified quality and fast delivery.`}
        path={`/shop/${product.id}`}
        ogImage={images[0]}
        ogType="product"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: product.name,
          image: images,
          description: product.description || `Buy ${product.name} on GymPilot Shop.`,
          offers: {
            '@type': 'Offer',
            price: product.price,
            priceCurrency: 'TND',
            availability: product.stockQuantity > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          },
        }}
      />

      <CartDrawer />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Breadcrumb */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link component={RouterLink} to="/shop" underline="hover" color="inherit" sx={{ fontSize: '0.875rem' }}>
            Shop
          </Link>
          <Typography color="text.secondary" sx={{ fontSize: '0.875rem' }}>
            {product.categoryName || 'Category'}
          </Typography>
          <Typography color="text.primary" sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
            {product.name}
          </Typography>
        </Breadcrumbs>

        {/* Return to Shop Button */}
        <Button
          component={RouterLink}
          to="/shop"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{
            mb: 3,
            fontWeight: 700,
            textTransform: 'none',
            color: 'text.secondary',
            '&:hover': { color: 'primary.main', bgcolor: 'rgba(198,255,62,0.08)' },
          }}
        >
          Back to Shop
        </Button>

        {/* Main Product Layout */}
        <Grid container spacing={{ xs: 4, md: 6 }} sx={{ mb: 8 }}>
          {/* Left Column: Image Gallery */}
          <Grid item xs={12} md={6}>
            <Box sx={{ position: 'sticky', top: 90 }}>
              {/* Main Display Image */}
              <Box
                sx={{
                  position: 'relative',
                  width: '100%',
                  pt: '85%',
                  borderRadius: 4,
                  overflow: 'hidden',
                  bgcolor: 'background.elevated',
                  border: '1px solid',
                  borderColor: 'divider',
                  mb: 2,
                }}
              >
                <Box
                  component="img"
                  src={selectedImage || images[0]}
                  alt={product.name}
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
                {hasDiscount && (
                  <Chip
                    label={`-${discountPercent}% OFF`}
                    size="small"
                    sx={{
                      position: 'absolute',
                      top: 16,
                      left: 16,
                      bgcolor: 'error.main',
                      color: '#fff',
                      fontWeight: 800,
                      fontSize: '0.75rem',
                    }}
                  />
                )}
              </Box>

              {/* Thumbnails */}
              {images.length > 1 && (
                <Stack direction="row" spacing={1.5} sx={{ overflowX: 'auto', pb: 1 }}>
                  {images.map((img, idx) => (
                    <Box
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      component="img"
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      sx={{
                        width: 72,
                        height: 72,
                        borderRadius: 2,
                        objectFit: 'cover',
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: selectedImage === img ? 'primary.main' : 'divider',
                        opacity: selectedImage === img ? 1 : 0.6,
                        transition: 'all .2s ease',
                        '&:hover': { opacity: 1, borderColor: 'primary.main' },
                      }}
                    />
                  ))}
                </Stack>
              )}
            </Box>
          </Grid>

          {/* Right Column: Product Info & Purchase Form */}
          <Grid item xs={12} md={6}>
            <Box>
              {/* Category & Verified Badge */}
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Chip
                  label={product.categoryName}
                  size="small"
                  sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', fontWeight: 800 }}
                />
                <Chip
                  icon={<VerifiedRoundedIcon sx={{ color: '#C6FF3E !important' }} />}
                  label="100% Lab Tested & Verified"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.04)', color: 'text.secondary', fontWeight: 600 }}
                />
              </Stack>

              {/* Title */}
              <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 2, lineHeight: 1.25 }}>
                {product.name}
              </Typography>

              {/* Rating & Reviews */}
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                <Rating value={product.rating || 5} precision={0.1} readOnly size="small" />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  {product.rating ? Number(product.rating).toFixed(1) : '5.0'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  · ({product.reviewCount || 34} athlete reviews)
                </Typography>
                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 700, ml: 'auto' }}>
                  {product.unitsSold || 0} units sold
                </Typography>
              </Stack>

              {/* Pricing Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  mb: 3,
                }}
              >
                <Stack direction="row" alignItems="baseline" spacing={2} sx={{ mb: 1 }}>
                  <Typography variant="h3" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                    {Number(product.price).toFixed(2)} TND
                  </Typography>
                  {hasDiscount && (
                    <Typography variant="h6" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                      {Number(product.originalPrice).toFixed(2)} TND
                    </Typography>
                  )}
                  {product.stockQuantity > 0 ? (
                    <Chip
                      icon={<CheckCircleRoundedIcon fontSize="small" />}
                      label={`In Stock (${product.stockQuantity} ready)`}
                      size="small"
                      color="success"
                      variant="outlined"
                      sx={{ fontWeight: 700, ml: 'auto' }}
                    />
                  ) : (
                    <Chip label="Currently Out of Stock" size="small" color="error" sx={{ fontWeight: 700, ml: 'auto' }} />
                  )}
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Taxes included · Standard delivery <strong>7 TND</strong> (Free on orders &ge; <strong>150 TND</strong>)
                </Typography>
              </Paper>

              {/* Quantity Selector & CTA Buttons */}
              <Box sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="stretch" sx={{ mb: 2 }}>
                  {/* Quantity Stepper */}
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      bgcolor: 'background.paper',
                      p: 0.5,
                      width: { xs: '100%', sm: 'auto' },
                      justifyContent: 'space-between',
                      alignSelf: { xs: 'stretch', sm: 'center' },
                    }}
                  >
                    <IconButton
                      size="small"
                      disabled={quantity <= 1}
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    >
                      <RemoveRoundedIcon fontSize="small" />
                    </IconButton>
                    <Typography variant="body1" sx={{ px: 2.5, fontWeight: 800 }}>
                      {quantity}
                    </Typography>
                    <IconButton
                      size="small"
                      disabled={quantity >= product.stockQuantity}
                      onClick={() => setQuantity((q) => Math.min(product.stockQuantity, q + 1))}
                    >
                      <AddRoundedIcon fontSize="small" />
                    </IconButton>
                  </Box>

                  {/* Add to Cart */}
                  <Tooltip
                    title={
                      product.stockQuantity <= 0
                        ? 'This item is currently out of stock'
                        : `Add ${quantity} unit${quantity > 1 ? 's' : ''} to your basket (${(product.price * quantity).toFixed(2)} TND)`
                    }
                    arrow
                    placement="top"
                  >
                    <span style={{ flex: 1, display: 'flex' }}>
                      <Button
                        variant="contained"
                        fullWidth
                        size="large"
                        disabled={product.stockQuantity <= 0}
                        startIcon={<ShoppingBagRoundedIcon />}
                        onClick={() => addToCart(product, quantity)}
                        sx={{
                          fontWeight: 800,
                          py: 1.2,
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.25,
                        }}
                      >
                        <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                          {product.stockQuantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </Typography>
                        {product.stockQuantity > 0 && (
                          <Typography component="span" sx={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 600, textTransform: 'none' }}>
                            {quantity} &times; {Number(product.price).toFixed(2)} = {(product.price * quantity).toFixed(2)} TND
                          </Typography>
                        )}
                      </Button>
                    </span>
                  </Tooltip>

                  {/* Buy Now */}
                  <Tooltip
                    title={
                      product.stockQuantity <= 0
                        ? 'Item unavailable for instant purchase'
                        : 'Skip cart and proceed directly to checkout'
                    }
                    arrow
                    placement="top"
                  >
                    <span style={{ flex: 1, display: 'flex' }}>
                      <Button
                        variant="outlined"
                        fullWidth
                        size="large"
                        disabled={product.stockQuantity <= 0}
                        startIcon={<FlashOnRoundedIcon sx={{ color: product.stockQuantity > 0 ? '#C6FF3E' : 'inherit' }} />}
                        onClick={handleBuyNow}
                        sx={{
                          fontWeight: 800,
                          py: 1.2,
                          borderRadius: 2,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.25,
                        }}
                      >
                        <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                          Buy Now
                        </Typography>
                        {product.stockQuantity > 0 && (
                          <Typography component="span" sx={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 600, textTransform: 'none' }}>
                            Direct Checkout · Cash on Delivery
                          </Typography>
                        )}
                      </Button>
                    </span>
                  </Tooltip>
                </Stack>

                {/* Direct Product Link & Sharing */}
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mt: 2 }}>
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<ContentCopyRoundedIcon />}
                    onClick={handleCopyLink}
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      bgcolor: 'rgba(255,255,255,0.03)',
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 2,
                      px: 2,
                      py: 0.8,
                      '&:hover': {
                        bgcolor: 'rgba(198,255,62,0.08)',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      },
                    }}
                  >
                    Copy Direct Product Link
                  </Button>

                  <Button
                    variant="text"
                    size="small"
                    startIcon={<ShareRoundedIcon />}
                    onClick={handleWhatsAppShare}
                    sx={{
                      color: '#25D366',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      textTransform: 'none',
                      bgcolor: 'rgba(37,211,102,0.08)',
                      border: '1px solid rgba(37,211,102,0.25)',
                      borderRadius: 2,
                      px: 2,
                      py: 0.8,
                      '&:hover': {
                        bgcolor: 'rgba(37,211,102,0.15)',
                        borderColor: '#25D366',
                      },
                    }}
                  >
                    Share on WhatsApp
                  </Button>
                </Stack>
              </Box>

              {/* Seller / Store Information Card */}
              <Card
                elevation={0}
                sx={{
                  p: 2.5,
                  mb: 4,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'rgba(138,124,255,0.04)',
                }}
              >
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar
                    src={product.sellerStoreLogo}
                    alt={product.sellerStoreName || 'Store'}
                    variant="rounded"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(138,124,255,0.15)',
                      color: '#8A7CFF',
                      fontSize: '1.25rem',
                      fontWeight: 800,
                      border: '1.5px solid rgba(138,124,255,0.3)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      flexShrink: 0,
                    }}
                  >
                    <StorefrontRoundedIcon sx={{ fontSize: 28 }} />
                  </Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 800, display: 'flex', alignItems: 'center', gap: 0.75 }}>
                      Sold & Shipped by {product.sellerStoreName || product.sellerName || 'GymPilot Official'}
                      <VerifiedRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Official GymPilot marketplace verified seller. 100% authentic fitness guarantee.
                    </Typography>
                  </Box>
                </Stack>
              </Card>

              {/* Description */}
              <Box sx={{ mb: 4 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.5, fontFamily: "'Sora', sans-serif" }}>
                  Product Overview
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  {product.description || 'No extended description available for this item.'}
                </Typography>
              </Box>

              {/* Nutrition Facts / Specifications Table */}
              {specsList.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Typography variant="h6" sx={{ fontWeight: 800, mb: 2, fontFamily: "'Sora', sans-serif" }}>
                    Nutrition Facts & Specifications
                  </Typography>
                  <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                    <Table size="small">
                      <TableBody>
                        {specsList.map(([key, val]) => (
                          <TableRow key={key} sx={{ '&:nth-of-type(odd)': { bgcolor: 'rgba(255,255,255,0.015)' } }}>
                            <TableCell sx={{ fontWeight: 700, color: 'text.secondary', width: '45%' }}>{key}</TableCell>
                            <TableCell sx={{ fontWeight: 600, color: 'text.primary' }}>{val}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* ===================== RELATED PRODUCTS ===================== */}
        {related.length > 0 && (
          <Box
            sx={{
              pt: { xs: 5, md: 7 },
              pb: 2,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            {/* Section Header */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              justifyContent="space-between"
              alignItems={{ xs: 'flex-start', sm: 'flex-end' }}
              spacing={1.5}
              sx={{ mb: 3.5 }}
            >
              <Box>
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
                  <Box
                    sx={{
                      width: 28,
                      height: 28,
                      borderRadius: 1.5,
                      bgcolor: 'rgba(198,255,62,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'primary.main',
                    }}
                  >
                    <AutoAwesomeRoundedIcon sx={{ fontSize: 16 }} />
                  </Box>
                  <Typography
                    variant="overline"
                    sx={{
                      fontWeight: 800,
                      color: 'primary.main',
                      letterSpacing: 1.2,
                    }}
                  >
                    Recommended For You
                  </Typography>
                </Stack>
                <Typography
                  variant="h4"
                  sx={{
                    fontFamily: "'Sora', sans-serif",
                    fontWeight: 800,
                    fontSize: { xs: '1.5rem', sm: '1.85rem' },
                    color: 'text.primary',
                  }}
                >
                  You May Also Like
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Curated gear & supplements tailored to complement your fitness journey
                </Typography>
              </Box>

              <Button
                component={RouterLink}
                to="/shop"
                endIcon={<ArrowForwardRoundedIcon sx={{ fontSize: 16 }} />}
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  color: 'text.secondary',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                Browse All Products
              </Button>
            </Stack>

            {/* Product Cards Grid */}
            <Grid container spacing={{ xs: 2, sm: 2.5, md: 3 }}>
              {related.map((relItem) => {
                const relImg =
                  relItem.images && relItem.images.length > 0
                    ? relItem.images[0]
                    : FALLBACK_IMAGE;

                const relHasDiscount =
                  relItem.originalPrice && relItem.originalPrice > relItem.price;
                const relDiscountPercent = relHasDiscount
                  ? Math.round(
                      ((relItem.originalPrice - relItem.price) /
                        relItem.originalPrice) *
                        100
                    )
                  : 0;

                const isOutOfStock = relItem.stockQuantity <= 0;

                return (
                  <Grid item xs={12} sm={6} md={3} key={relItem.id}>
                    <Card
                      elevation={0}
                      component={RouterLink}
                      to={`/shop/${relItem.id}`}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'instant' })}
                      sx={{
                        height: '100%',
                        borderRadius: 3.5,
                        border: '1px solid',
                        borderColor: 'divider',
                        textDecoration: 'none',
                        color: 'inherit',
                        bgcolor: 'background.paper',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'translateY(-6px)',
                          borderColor: 'primary.main',
                          boxShadow: '0 16px 36px rgba(0, 0, 0, 0.25)',
                          '& .rel-img': {
                            transform: 'scale(1.08)',
                          },
                          '& .rel-quick-add': {
                            opacity: 1,
                            transform: 'translateY(0)',
                          },
                        },
                      }}
                    >
                      {/* Product Image Area */}
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          pt: '82%',
                          bgcolor: 'background.elevated',
                          overflow: 'hidden',
                        }}
                      >
                        <Box
                          component="img"
                          src={relImg}
                          alt={relItem.name}
                          className="rel-img"
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                        />

                        {/* Top-Left Floating Badges */}
                        <Stack
                          direction="row"
                          spacing={0.75}
                          sx={{
                            position: 'absolute',
                            top: 10,
                            left: 10,
                            zIndex: 2,
                          }}
                        >
                          {relHasDiscount && (
                            <Chip
                              label={`-${relDiscountPercent}%`}
                              size="small"
                              sx={{
                                bgcolor: '#ff334b',
                                color: '#fff',
                                fontWeight: 800,
                                fontSize: '0.68rem',
                                height: 22,
                                boxShadow: '0 2px 8px rgba(255,51,75,0.4)',
                              }}
                            />
                          )}
                          {relItem.categoryName && (
                            <Chip
                              label={relItem.categoryName}
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0,0,0,0.65)',
                                backdropFilter: 'blur(8px)',
                                color: 'rgba(255,255,255,0.85)',
                                fontWeight: 600,
                                fontSize: '0.65rem',
                                height: 22,
                                border: '1px solid rgba(255,255,255,0.12)',
                              }}
                            />
                          )}
                        </Stack>

                        {/* Stock indicator top-right */}
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            zIndex: 2,
                          }}
                        >
                          {isOutOfStock ? (
                            <Chip
                              label="Out of Stock"
                              size="small"
                              sx={{
                                bgcolor: 'rgba(0,0,0,0.75)',
                                color: '#ff5252',
                                fontWeight: 700,
                                fontSize: '0.65rem',
                                height: 22,
                                border: '1px solid rgba(255,82,82,0.3)',
                              }}
                            />
                          ) : (
                            <Tooltip title="In Stock & Ready to Ship">
                              <Box
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  bgcolor: 'rgba(0,0,0,0.55)',
                                  backdropFilter: 'blur(6px)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  border: '1px solid rgba(255,255,255,0.15)',
                                }}
                              >
                                <Box
                                  sx={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    bgcolor: '#2ecc71',
                                    boxShadow: '0 0 8px #2ecc71',
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          )}
                        </Box>

                        {/* Quick Add To Cart Button */}
                        {!isOutOfStock && (
                          <Box
                            className="rel-quick-add"
                            sx={{
                              position: 'absolute',
                              bottom: 10,
                              right: 10,
                              zIndex: 3,
                              opacity: { xs: 1, sm: 0 },
                              transform: { xs: 'none', sm: 'translateY(6px)' },
                              transition: 'all 0.25s ease',
                            }}
                          >
                            <Tooltip title="Quick Add to Cart" placement="left">
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  addToCart(relItem, 1);
                                  openCartDrawer();
                                }}
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: '#000',
                                  boxShadow: '0 4px 14px rgba(198,255,62,0.4)',
                                  '&:hover': {
                                    bgcolor: '#d4ff66',
                                    transform: 'scale(1.08)',
                                  },
                                  transition: 'transform 0.15s ease',
                                }}
                              >
                                <AddShoppingCartRoundedIcon sx={{ fontSize: 18 }} />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                      </Box>

                      {/* Product Info */}
                      <Box
                        sx={{
                          p: 2.25,
                          flex: 1,
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 0.75,
                        }}
                      >
                        {/* Rating */}
                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Rating
                            value={relItem.rating || 5}
                            precision={0.5}
                            readOnly
                            size="small"
                            sx={{
                              fontSize: '0.85rem',
                              '& .MuiRating-iconFilled': { color: '#FFB800' },
                            }}
                          />
                          <Typography
                            variant="caption"
                            sx={{
                              fontWeight: 700,
                              color: 'text.secondary',
                              fontSize: '0.72rem',
                            }}
                          >
                            ({relItem.reviewCount || 18})
                          </Typography>
                        </Stack>

                        {/* Product Title */}
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            lineHeight: 1.35,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            minHeight: 38,
                            color: 'text.primary',
                          }}
                          title={relItem.name}
                        >
                          {relItem.name}
                        </Typography>

                        {/* Price & Sold Footer */}
                        <Box sx={{ mt: 'auto', pt: 1 }}>
                          <Stack
                            direction="row"
                            alignItems="baseline"
                            spacing={1}
                            justifyContent="space-between"
                          >
                            <Stack direction="row" alignItems="baseline" spacing={0.75}>
                              <Typography
                                variant="h6"
                                sx={{
                                  color: 'primary.main',
                                  fontWeight: 800,
                                  fontFamily: "'Sora', sans-serif",
                                  fontSize: '1.05rem',
                                }}
                              >
                                {Number(relItem.price).toFixed(2)}{' '}
                                <Typography
                                  component="span"
                                  sx={{ fontSize: '0.72rem', fontWeight: 700 }}
                                >
                                  TND
                                </Typography>
                              </Typography>
                              {relHasDiscount && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: 'text.secondary',
                                    textDecoration: 'line-through',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {Number(relItem.originalPrice).toFixed(2)}
                                </Typography>
                              )}
                            </Stack>

                            {relItem.unitsSold > 0 && (
                              <Typography
                                variant="caption"
                                sx={{
                                  fontSize: '0.68rem',
                                  color: 'text.secondary',
                                  fontWeight: 600,
                                }}
                              >
                                {relItem.unitsSold} sold
                              </Typography>
                            )}
                          </Stack>
                        </Box>
                      </Box>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Container>
      <Snackbar
        open={copied}
        autoHideDuration={3500}
        onClose={() => setCopied(false)}
        message="Direct product link copied! You can now send it to your customer or friend."
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />
      <Footer />
    </>
  );
}