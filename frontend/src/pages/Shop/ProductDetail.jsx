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

import SEO from '../../components/SEO';
import { productService } from '../../services/productService';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';

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

  useEffect(() => {
    async function loadProduct() {
      try {
        setLoading(true);
        setError('');
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
    : ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80'];

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
                  Taxes included. Free standard delivery on orders over $50.
                </Typography>
              </Paper>

              {/* Quantity Selector & CTA Buttons */}
              <Box sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" sx={{ mb: 2 }}>
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
                  <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={product.stockQuantity <= 0}
                    startIcon={<ShoppingBagRoundedIcon />}
                    onClick={() => addToCart(product, quantity)}
                    sx={{ fontWeight: 800, py: 1.5, borderRadius: 2 }}
                  >
                    Add to Cart
                  </Button>

                  {/* Buy Now */}
                  <Button
                    variant="outlined"
                    fullWidth
                    size="large"
                    disabled={product.stockQuantity <= 0}
                    startIcon={<FlashOnRoundedIcon sx={{ color: '#C6FF3E' }} />}
                    onClick={handleBuyNow}
                    sx={{ fontWeight: 800, py: 1.5, borderRadius: 2 }}
                  >
                    Buy Now
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
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 2.5,
                      bgcolor: 'rgba(138,124,255,0.15)',
                      color: '#8A7CFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <StorefrontRoundedIcon sx={{ fontSize: 26 }} />
                  </Box>
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
          <Box sx={{ pt: 4, borderTop: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h5" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 3 }}>
              You May Also Like
            </Typography>
            <Grid container spacing={3}>
              {related.map((relItem) => (
                <Grid item xs={12} sm={6} md={3} key={relItem.id}>
                  <Card
                    elevation={0}
                    component={RouterLink}
                    to={`/shop/${relItem.id}`}
                    sx={{
                      p: 2,
                      height: '100%',
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: 'divider',
                      textDecoration: 'none',
                      color: 'inherit',
                      bgcolor: 'background.paper',
                      transition: 'transform .2s ease, border-color .2s ease',
                      '&:hover': { transform: 'translateY(-4px)', borderColor: 'primary.main' },
                    }}
                  >
                    <Box
                      component="img"
                      src={relItem.images && relItem.images.length > 0 ? relItem.images[0] : ''}
                      alt={relItem.name}
                      sx={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 2, mb: 1.5 }}
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }} noWrap>
                      {relItem.name}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: 'primary.main', fontWeight: 800 }}>
                      {Number(relItem.price).toFixed(2)} TND
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
      </Container>
    </>
  );
}
