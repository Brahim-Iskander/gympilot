import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
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
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TuneRoundedIcon from '@mui/icons-material/TuneRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';

import SEO from '../../components/SEO';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';

export default function Shop() {
  const { addToCart, itemCount, openCartDrawer } = useCart();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('popularity');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [loading, setLoading] = useState(true);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // Load categories
  useEffect(() => {
    categoryService.getAll().then((data) => setCategories(data || [])).catch(() => {});
    productService.getFeatured().then((data) => setFeaturedProducts(data || [])).catch(() => {});
  }, []);

  // Fetch products
  const fetchProducts = useCallback(async () => {
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

        {/* ===================== SEARCH & FILTER BAR ===================== */}
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
                          ${Number(product.price).toFixed(2)}
                        </Typography>
                        {hasDiscount && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                            ${Number(product.originalPrice).toFixed(2)}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>

                    {/* Actions */}
                    <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
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
    </>
  );
}
