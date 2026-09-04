import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useSearchParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Chip,
  Stack,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Rating,
  Skeleton,
  Fab,
  Badge,
  IconButton,
  Pagination,
  Tooltip,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';

import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { productPackService } from '../../services/productPackService';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';

export default function Shop() {
  const { addToCart, itemCount, openCartDrawer } = useCart();
  const [searchParams] = useSearchParams();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [packs, setPacks] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState(() => searchParams.get('category') || 'all');
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get('search') || '');
  const [sortOption, setSortOption] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);

  // Sync with URL query parameters when navigating from external links (e.g. AI supplement recommendations)
  useEffect(() => {
    const q = searchParams.get('search');
    if (q !== null && q !== searchQuery) {
      setSearchQuery(q);
      setPage(0);
    }
    const cat = searchParams.get('category');
    if (cat !== null && cat !== selectedCategory) {
      setSelectedCategory(cat);
      setPage(0);
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [addedPackIds, setAddedPackIds] = useState(new Set());

  // Load categories and packs
  useEffect(() => {
    categoryService.getAll().then((data) => setCategories(data || [])).catch(() => {});
    productService.getFeatured().then((data) => setFeaturedProducts(data || [])).catch(() => {});
    productPackService.getActivePacks().then((data) => setPacks(data || [])).catch(() => {});
  }, []);

  const handleAddPackToCart = (pack) => {
    addToCart({
      id: pack.id,
      productId: pack.id,
      name: pack.name,
      price: pack.price,
      images: pack.images,
      stockQuantity: pack.stockQuantity || 20,
      categoryName: 'Special Offer Pack',
    });
    setAddedPackIds((prev) => new Set(prev).add(pack.id));
    openCartDrawer();
  };

  // Fetch products
  const fetchProducts = useCallback(async () => {
    if (selectedCategory === 'packs') {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await productService.getProducts({
        categoryId: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        sort: sortOption,
        page,
        size: 12,
      });
      setProducts(res.content || []);
      setTotalElements(res.totalElements || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load shop products:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, searchQuery, sortOption, page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    setPage(0);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(0);
  };

  return (
    <>
      <SEO
        title="Fitness Supplements & Training Equipment — GymPilot Shop"
        description="Shop 100% verified whey protein, micronized creatine, mass gainers, vitamins, and commercial training gear on GymPilot Marketplace."
        path="/shop"
      />

      <CartDrawer />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Button
          component={RouterLink}
          to="/dashboard"
          startIcon={<ArrowBackRoundedIcon />}
          sx={{ mb: 2, fontWeight: 700, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Back to Dashboard
        </Button>

        {/* ===================== HERO STORE BANNER ===================== */}
        <Card
          sx={{
            mb: 5,
            p: { xs: 3, md: 5 },
            borderRadius: 4,
            background: 'linear-gradient(135deg, rgba(198, 255, 62, 0.12) 0%, rgba(138, 124, 255, 0.08) 50%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(198, 255, 62, 0.3)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                <Chip
                  icon={<LocalFireDepartmentRoundedIcon sx={{ color: '#C6FF3E !important' }} />}
                  label="GymPilot Pro Marketplace"
                  size="small"
                  sx={{ bgcolor: 'rgba(198,255,62,0.18)', color: 'primary.main', fontWeight: 800, border: '1px solid rgba(198,255,62,0.4)' }}
                />
                <Chip
                  label="Earn 5% Points on Every Order"
                  size="small"
                  sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.secondary', fontWeight: 700 }}
                />
              </Stack>
              <Typography
                variant="h3"
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 900,
                  letterSpacing: -1,
                  mb: 1.5,
                  fontSize: { xs: '1.8rem', sm: '2.4rem', md: '3rem' },
                }}
              >
                Fuel Your Gains. <br />
                <Box component="span" sx={{ color: 'primary.main' }}>
                  Authentic Supplements & Gear.
                </Box>
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 540, lineHeight: 1.6 }}>
                Certified pure protein isolates, micronized creatine, bulking gainers, and professional training equipment vetted by elite fitness coaches.
              </Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" gap={1}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleCategorySelect('all')}
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{ fontWeight: 800, px: 3.5, borderRadius: 2 }}
                >
                  Browse Full Catalog
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={openCartDrawer}
                  startIcon={<ShoppingBagRoundedIcon />}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Cart ({itemCount})
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' }, textAlign: 'center' }}>
              <Box
                component="img"
                src="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=700&auto=format&fit=crop&q=80"
                alt="GymPilot Supplements"
                sx={{
                  maxHeight: 280,
                  maxWidth: '100%',
                  borderRadius: 3.5,
                  boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  objectFit: 'cover',
                }}
              />
            </Grid>
          </Grid>
        </Card>

        {/* ===================== CATEGORY PILLS ===================== */}
        <Box sx={{ mb: 4, overflowX: 'auto', pb: 1 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleCategorySelect('all')}
              sx={{
                borderRadius: 3,
                px: 2.5,
                py: 1,
                fontWeight: 700,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              All Products
            </Button>
            {packs.length > 0 && (
              <Button
                variant={selectedCategory === 'packs' ? 'contained' : 'outlined'}
                onClick={() => handleCategorySelect('packs')}
                startIcon={<LocalFireDepartmentRoundedIcon sx={{ color: selectedCategory === 'packs' ? '#0A0C0F' : '#FF4D4D' }} />}
                sx={{
                  borderRadius: 3,
                  px: 2.5,
                  py: 1,
                  fontWeight: 800,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  bgcolor: selectedCategory === 'packs' ? '#FF4D4D' : 'rgba(255, 77, 77, 0.08)',
                  borderColor: 'rgba(255, 77, 77, 0.4)',
                  color: selectedCategory === 'packs' ? '#FFFFFF' : '#FF4D4D',
                  '&:hover': {
                    bgcolor: selectedCategory === 'packs' ? '#E03E3E' : 'rgba(255, 77, 77, 0.16)',
                    borderColor: '#FF4D4D',
                  },
                }}
              >
                Special Offer Packs ({packs.length})
              </Button>
            )}
            {categories.map((cat) => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'contained' : 'outlined'}
                onClick={() => handleCategorySelect(cat.id)}
                sx={{
                  borderRadius: 3,
                  px: 2.5,
                  py: 1,
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                {cat.name}
              </Button>
            ))}
          </Stack>
        </Box>

        {/* ===================== SPECIAL OFFERS & PACKS SHOWCASE ===================== */}
        {packs.length > 0 && (selectedCategory === 'all' || selectedCategory === 'packs') && !searchQuery.trim() && (
          <Box sx={{ mb: 6 }}>
            <Box
              sx={{
                p: { xs: 2.5, md: 3.5 },
                borderRadius: 4,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255, 77, 77, 0.08) 0%, rgba(198, 255, 62, 0.05) 50%, rgba(20, 24, 33, 0.6) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 77, 77, 0.04) 0%, rgba(198, 255, 62, 0.04) 100%)',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 77, 77, 0.25)' : 'rgba(255, 77, 77, 0.2)',
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 3 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip
                      icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '1rem !important', color: '#FF4D4D' }} />}
                      label="LIMITED TIME BUNDLES"
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(255, 77, 77, 0.12)',
                        color: '#FF4D4D',
                        border: '1px solid rgba(255, 77, 77, 0.3)',
                      }}
                    />
                    <Chip
                      label="Best Value"
                      size="small"
                      sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: 'primary.main', fontWeight: 800, fontSize: '0.7rem' }}
                    />
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>
                    Special Offers &amp; Product Packs
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Save up to 30% with certified sports supplement bundles and stacks.
                  </Typography>
                </Box>
                {selectedCategory !== 'packs' && (
                  <Button
                    variant="text"
                    onClick={() => handleCategorySelect('packs')}
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ fontWeight: 800, color: 'primary.main' }}
                  >
                    View All {packs.length} Offers
                  </Button>
                )}
              </Stack>

              <Grid container spacing={3}>
                {(selectedCategory === 'packs' ? packs : packs.slice(0, 3)).map((pack) => {
                  const isAdded = addedPackIds.has(pack.id);
                  const savings = (pack.originalPrice || pack.price) - pack.price;
                  const savingsPct =
                    pack.originalPrice > pack.price
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
                          borderRadius: 3.5,
                          border: '1px solid',
                          borderColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.2)' : 'rgba(0,0,0,0.1)',
                          bgcolor: 'background.paper',
                          overflow: 'hidden',
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            transform: 'translateY(-4px)',
                            borderColor: 'primary.main',
                            boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
                          },
                        }}
                      >
                        {/* Image & Badge */}
                        <Box sx={{ position: 'relative', pt: '56%', bgcolor: '#0A0C0F', overflow: 'hidden' }}>
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
                            }}
                          />
                          {pack.badge && (
                            <Chip
                              label={pack.badge}
                              sx={{
                                position: 'absolute',
                                top: 12,
                                left: 12,
                                bgcolor: 'primary.main',
                                color: '#0A0C0F',
                                fontWeight: 900,
                                fontSize: '0.72rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                              }}
                            />
                          )}
                          {savingsPct > 0 && (
                            <Chip
                              label={`-${savingsPct}% OFF`}
                              size="small"
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                bgcolor: 'rgba(0, 0, 0, 0.8)',
                                color: '#00E676',
                                fontWeight: 900,
                                fontSize: '0.72rem',
                                border: '1px solid #00E676',
                              }}
                            />
                          )}
                        </Box>

                        {/* Content */}
                        <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 0.5 }}>
                            {pack.name}
                          </Typography>
                          {pack.tagline && (
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', lineHeight: 1.4 }}>
                              {pack.tagline}
                            </Typography>
                          )}

                          {/* Items List */}
                          {pack.items && pack.items.length > 0 && (
                            <Box
                              sx={{
                                p: 1.5,
                                mb: 2.5,
                                borderRadius: 2,
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                                Pack Includes:
                              </Typography>
                              <Stack spacing={0.75}>
                                {pack.items.map((item, idx) => (
                                  <Stack direction="row" spacing={0.75} alignItems="center" key={idx}>
                                    <CheckCircleRoundedIcon sx={{ fontSize: 14, color: 'primary.main', flexShrink: 0 }} />
                                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
                                      {item.quantity}x {item.name}
                                    </Typography>
                                  </Stack>
                                ))}
                              </Stack>
                            </Box>
                          )}

                          {/* Price & Add to Cart */}
                          <Box sx={{ mt: 'auto' }}>
                            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
                              <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main' }}>
                                {Number(pack.price).toFixed(2)} TND
                              </Typography>
                              {pack.originalPrice && pack.originalPrice > pack.price && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through', fontWeight: 600 }}>
                                  {Number(pack.originalPrice).toFixed(2)} TND
                                </Typography>
                              )}
                              {savings > 0 && (
                                <Typography variant="caption" sx={{ color: '#00E676', fontWeight: 800 }}>
                                  (Save {savings.toFixed(0)} TND)
                                </Typography>
                              )}
                            </Stack>

                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={<AddShoppingCartRoundedIcon />}
                              onClick={() => handleAddPackToCart(pack)}
                              sx={{
                                fontWeight: 800,
                                py: 0.9,
                                borderRadius: 2,
                                fontSize: '0.82rem',
                                bgcolor: isAdded ? '#00E676' : 'primary.main',
                                color: '#0A0C0F',
                              }}
                            >
                              {isAdded ? 'Added to Basket ✓' : 'Add Pack to Cart'}
                            </Button>
                          </Box>
                        </Box>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          </Box>
        )}

        {/* ===================== SEARCH & FILTER BAR ===================== */}
        {selectedCategory !== 'packs' && (
          <>
            <Card
              elevation={0}
              sx={{
                p: 2,
                mb: 4,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <TextField
                placeholder="Search creatine, whey, mass gainer, bands..."
                value={searchQuery}
                onChange={handleSearchChange}
                size="small"
                sx={{ width: { xs: '100%', md: 360 } }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={2} alignItems="center" sx={{ width: { xs: '100%', md: 'auto' } }}>
                <FormControl size="small" sx={{ minWidth: 180, width: { xs: '100%', sm: 'auto' } }}>
                  <InputLabel>Sort By</InputLabel>
                  <Select value={sortOption} label="Sort By" onChange={handleSortChange}>
                    <MenuItem value="popularity"><LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, mr: 1, color: '#FF6B35' }} /> Most Popular</MenuItem>
                    <MenuItem value="price_asc"><AttachMoneyRoundedIcon sx={{ fontSize: 18, mr: 1, color: '#4CAF50' }} /> Price: Low to High</MenuItem>
                    <MenuItem value="price_desc"><DiamondRoundedIcon sx={{ fontSize: 18, mr: 1, color: '#7C4DFF' }} /> Price: High to Low</MenuItem>
                    <MenuItem value="rating"><StarRoundedIcon sx={{ fontSize: 18, mr: 1, color: '#FFD700' }} /> Highest Rated</MenuItem>
                    <MenuItem value="newest"><AutoAwesomeRoundedIcon sx={{ fontSize: 18, mr: 1, color: '#C6FF3E' }} /> Newest Arrivals</MenuItem>
                  </Select>
                </FormControl>
              </Stack>
            </Card>

            {/* ===================== PRODUCT GRID ===================== */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Skeleton variant="rounded" height={380} sx={{ borderRadius: 3 }} />
                  </Grid>
                ))}
              </Grid>
            ) : products.length === 0 ? (
              <Card
                elevation={0}
                sx={{
                  p: 6,
                  borderRadius: 3.5,
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: 'text.secondary',
                  }}
                >
                  <ShoppingBagRoundedIcon sx={{ fontSize: 32 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  No products found
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Try searching with different keywords or switch categories.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => {
                    setSelectedCategory('all');
                    setSearchQuery('');
                  }}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Reset Filters
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {products.map((product) => {
                  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 3.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'background.paper',
                          transition: 'transform .25s ease, border-color .25s ease, box-shadow .25s ease',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            borderColor: 'rgba(198,255,62,0.4)',
                            boxShadow: '0 20px 45px rgba(0,0,0,0.45)',
                          },
                        }}
                      >
                        {/* Media Container */}
                        <Box sx={{ position: 'relative', pt: '75%', bgcolor: 'background.elevated', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            image={
                              product.images && product.images.length > 0
                                ? product.images[0]
                                : 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80'
                            }
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

                          {/* Badges */}
                          <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {hasDiscount && (
                              <Chip
                                label={`-${discountPercent}%`}
                                size="small"
                                sx={{ bgcolor: 'error.main', color: '#fff', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                              />
                            )}
                            {product.featured && (
                              <Chip
                                label="Featured"
                                size="small"
                                sx={{ bgcolor: 'rgba(198,255,62,0.9)', color: '#0A0C0F', fontWeight: 800, fontSize: '0.7rem', height: 22 }}
                              />
                            )}
                          </Box>

                          {/* Stock badge */}
                          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                            {product.stockQuantity > 0 ? (
                              <Chip
                                label="In Stock"
                                size="small"
                                sx={{ bgcolor: 'rgba(0, 230, 118, 0.15)', color: '#00E676', border: '1px solid rgba(0, 230, 118, 0.3)', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                              />
                            ) : (
                              <Chip
                                label="Out of Stock"
                                size="small"
                                sx={{ bgcolor: 'rgba(255, 82, 82, 0.15)', color: '#FF5252', border: '1px solid rgba(255, 82, 82, 0.3)', fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Content */}
                        <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                              {product.categoryName}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Rating value={product.rating || 5} precision={0.1} size="small" readOnly sx={{ fontSize: '0.85rem' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                ({product.reviewCount || 1})
                              </Typography>
                            </Stack>
                          </Stack>

                          <Typography
                            component={RouterLink}
                            to={`/shop/${product.id}`}
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              lineHeight: 1.3,
                              color: 'text.primary',
                              textDecoration: 'none',
                              mb: 1,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            {product.name}
                          </Typography>

                          <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 2 }}>
                            <StorefrontRoundedIcon sx={{ fontSize: 15, color: '#8A7CFF' }} />
                            <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                              {product.sellerStoreName || product.sellerName || 'GymPilot Official'}
                            </Typography>
                            <VerifiedRoundedIcon sx={{ fontSize: 13, color: 'primary.main' }} />
                          </Stack>

                          {/* Price Section */}
                          <Box sx={{ mt: 'auto', pt: 1, display: 'flex', alignItems: 'baseline', gap: 1 }}>
                            <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                              {Number(product.price).toFixed(2)} TND
                            </Typography>
                            {hasDiscount && (
                              <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                                {Number(product.originalPrice).toFixed(2)} TND
                              </Typography>
                            )}
                          </Box>
                        </CardContent>

                        {/* Actions */}
                        <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                          <Tooltip
                            title={
                              product.stockQuantity <= 0
                                ? 'Currently out of stock — restocking soon'
                                : `Add 1 unit to your basket (${Number(product.price).toFixed(2)} TND)`
                            }
                            arrow
                            placement="top"
                          >
                            <span style={{ width: '100%' }}>
                              <Button
                                variant="contained"
                                fullWidth
                                startIcon={<AddShoppingCartRoundedIcon />}
                                disabled={product.stockQuantity <= 0}
                                onClick={() => addToCart(product, 1)}
                                sx={{
                                  fontWeight: 700,
                                  borderRadius: 2,
                                  py: 1,
                                }}
                              >
                                {product.stockQuantity > 0 ? 'Add to Cart' : 'Sold Out'}
                              </Button>
                            </span>
                          </Tooltip>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* ===================== PAGINATION ===================== */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, val) => setPage(val - 1)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </>
        )}

        {/* ===================== FLOATING CART TRIGGER ===================== */}
        <Fab
          color="primary"
          aria-label="cart"
          onClick={openCartDrawer}
          sx={{
            position: 'fixed',
            bottom: 32,
            right: 32,
            boxShadow: '0 12px 35px rgba(198,255,62,0.4)',
            zIndex: 1000,
          }}
        >
          <Badge badgeContent={itemCount} color="error">
            <ShoppingBagRoundedIcon sx={{ color: '#0A0C0F', fontSize: 26 }} />
          </Badge>
        </Fab>
      </Container>
      <Footer />
    </>
  );
}
