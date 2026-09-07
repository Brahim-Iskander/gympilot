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
  Avatar,
  Snackbar,
  Paper,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import AddShoppingCartRoundedIcon from '@mui/icons-material/AddShoppingCartRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import FilterAltRoundedIcon from '@mui/icons-material/FilterAltRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';

import SEO from '../../components/SEO';
import Footer from '../../components/Footer';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { productPackService } from '../../services/productPackService';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../../components/CartDrawer';

const TRUST_BENEFITS = [
  {
    icon: <LocalShippingRoundedIcon sx={{ fontSize: 26, color: '#C6FF3E' }} />,
    title: 'Livraison Express 24-48h',
    subtitle: 'Expédition rapide partout en Tunisie',
  },
  {
    icon: <VerifiedUserRoundedIcon sx={{ fontSize: 26, color: '#8A7CFF' }} />,
    title: '100% Produits Authentiques',
    subtitle: 'Marques officielles certifiées & scellées',
  },
  {
    icon: <PaymentsRoundedIcon sx={{ fontSize: 26, color: '#00E676' }} />,
    title: 'Paiement à la Livraison',
    subtitle: 'Réglez en espèces à la réception de votre colis',
  },
  {
    icon: <CardGiftcardRoundedIcon sx={{ fontSize: 26, color: '#FFB800' }} />,
    title: 'Points & Cashback',
    subtitle: 'Gagnez 5% de points fidélité sur chaque commande',
  },
];

const QUICK_SEARCH_TAGS = [
  'Whey Isolate',
  'Creatine',
  'Mass Gainer',
  'Pre-Workout',
  'BCAA',
  'Shaker',
];

const getCategoryIcon = (categoryName = '') => {
  const lower = categoryName.toLowerCase();
  if (lower.includes('protein') || lower.includes('whey')) return <FitnessCenterRoundedIcon fontSize="small" />;
  if (lower.includes('creatine')) return <BoltRoundedIcon fontSize="small" />;
  if (lower.includes('gainer') || lower.includes('bulk')) return <TrendingUpRoundedIcon fontSize="small" />;
  if (lower.includes('vitamin') || lower.includes('health')) return <VerifiedUserRoundedIcon fontSize="small" />;
  if (lower.includes('gear') || lower.includes('equip') || lower.includes('access')) return <Inventory2RoundedIcon fontSize="small" />;
  return <StorefrontRoundedIcon fontSize="small" />;
};

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
  const [onSaleOnly, setOnSaleOnly] = useState(false);

  // Sync with URL query parameters when navigating from external links
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
  const [addedProductIds, setAddedProductIds] = useState(new Set());
  const [addedPackIds, setAddedPackIds] = useState(new Set());
  const [copyNotification, setCopyNotification] = useState('');

  const handleCopyProductUrl = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const url = `${window.location.origin}/shop/${productId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopyNotification('Direct product link copied to clipboard!');
    }
  };

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
      sellerId: pack.sellerId,
      sellerName: pack.sellerName,
      sellerStoreName: pack.sellerStoreName,
      sellerStoreLogo: pack.sellerStoreLogo,
    });
    setAddedPackIds((prev) => new Set(prev).add(pack.id));
    openCartDrawer();
  };

  const handleAddProductToCart = (product) => {
    addToCart(product, 1);
    setAddedProductIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => {
      setAddedProductIds((prev) => {
        const next = new Set(prev);
        next.delete(product.id);
        return next;
      });
    }, 2000);
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

  const handleClearSearch = () => {
    setSearchQuery('');
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setPage(0);
  };

  const handleResetFilters = () => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSortOption('popularity');
    setInStockOnly(false);
    setOnSaleOnly(false);
    setPage(0);
  };

  // Filter products by client-side toggles if set
  const displayedProducts = products.filter((p) => {
    if (inStockOnly && p.stockQuantity <= 0) return false;
    if (onSaleOnly && (!p.originalPrice || p.originalPrice <= p.price)) return false;
    return true;
  });

  const hasActiveFilters =
    selectedCategory !== 'all' ||
    searchQuery.trim() !== '' ||
    sortOption !== 'popularity' ||
    inStockOnly ||
    onSaleOnly;

  return (
    <>
      <SEO
        title="Fitness Supplements & Training Equipment — GymPilot Shop"
        description="Shop 100% verified whey protein, micronized creatine, mass gainers, vitamins, and commercial training gear on GymPilot Marketplace."
        path="/shop"
      />

      <CartDrawer />

      <Container maxWidth="xl" sx={{ py: { xs: 2.5, md: 4 } }}>
        {/* Navigation Breadcrumb & Back */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Button
            component={RouterLink}
            to="/dashboard"
            startIcon={<ArrowBackRoundedIcon />}
            size="small"
            sx={{
              fontWeight: 700,
              color: 'text.secondary',
              '&:hover': { color: 'primary.main' },
              borderRadius: 2,
            }}
          >
            Dashboard
          </Button>

          <Button
            variant="outlined"
            size="small"
            onClick={openCartDrawer}
            startIcon={
              <Badge badgeContent={itemCount} color="primary" sx={{ '& .MuiBadge-badge': { fontWeight: 900 } }}>
                <ShoppingBagRoundedIcon sx={{ fontSize: 19 }} />
              </Badge>
            }
            sx={{
              fontWeight: 800,
              borderRadius: 2.5,
              borderColor: 'divider',
              px: 2,
            }}
          >
            Panier ({itemCount})
          </Button>
        </Stack>

        {/* ===================== HERO STORE BANNER ===================== */}
        <Card
          sx={{
            mb: 4,
            p: { xs: 3, sm: 4, md: 5 },
            borderRadius: { xs: 4, md: 5 },
            background: (theme) =>
              theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(198, 255, 62, 0.15) 0%, rgba(138, 124, 255, 0.09) 45%, rgba(10, 12, 15, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(198, 255, 62, 0.2) 0%, rgba(138, 124, 255, 0.12) 60%, rgba(245, 247, 250, 0.9) 100%)',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.35)' : 'rgba(198, 255, 62, 0.5)',
            boxShadow: '0 24px 64px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Ambient decorative glow */}
          <Box
            sx={{
              position: 'absolute',
              top: -80,
              right: -80,
              width: 260,
              height: 260,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(198,255,62,0.25) 0%, rgba(198,255,62,0) 70%)',
              filter: 'blur(40px)',
              pointerEvents: 'none',
            }}
          />

          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Chip
                  icon={<LocalFireDepartmentRoundedIcon sx={{ color: '#C6FF3E !important', fontSize: 18 }} />}
                  label="GymPilot Pro Store"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(198,255,62,0.18)',
                    color: 'primary.main',
                    fontWeight: 800,
                    border: '1px solid rgba(198,255,62,0.45)',
                    px: 0.5,
                  }}
                />
                <Chip
                  icon={<PaymentsRoundedIcon sx={{ color: '#00E676 !important', fontSize: 16 }} />}
                  label="Paiement à la livraison partout en Tunisie"
                  size="small"
                  sx={{
                    bgcolor: 'rgba(0, 230, 118, 0.12)',
                    color: '#00E676',
                    fontWeight: 700,
                    border: '1px solid rgba(0, 230, 118, 0.3)',
                  }}
                />
              </Stack>

              <Typography
                variant="h2"
                component="h1"
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  fontWeight: 900,
                  letterSpacing: -1.2,
                  mb: 1.5,
                  lineHeight: 1.15,
                  fontSize: { xs: '2rem', sm: '2.6rem', md: '3.2rem' },
                }}
              >
                Boostez Vos Résultats. <br />
                <Box
                  component="span"
                  sx={{
                    background: 'linear-gradient(90deg, #C6FF3E 0%, #8A7CFF 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  Compléments & Matériel Certifiés.
                </Box>
              </Typography>

              <Typography variant="body1" color="text.secondary" sx={{ mb: 3.5, maxWidth: 580, lineHeight: 1.6, fontSize: { xs: '0.95rem', md: '1.05rem' } }}>
                Protéines pures, créatines micronisées, gainers et accessoires de musculation rigoureusement sélectionnés par des coachs certifiés.
              </Typography>

              {/* In-hero Search Box */}
              <Box
                component="form"
                onSubmit={(e) => {
                  e.preventDefault();
                  fetchProducts();
                }}
                sx={{
                  maxWidth: 520,
                  display: 'flex',
                  alignItems: 'center',
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(10, 12, 15, 0.85)' : '#FFFFFF'),
                  border: '1px solid',
                  borderColor: 'primary.main',
                  borderRadius: 3,
                  p: 0.5,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  mb: 2.5,
                }}
              >
                <SearchRoundedIcon sx={{ color: 'primary.main', ml: 1.5, mr: 1, fontSize: 22 }} />
                <TextField
                  fullWidth
                  placeholder="Rechercher protéine, créatine, gainer, shaker..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  variant="standard"
                  InputProps={{
                    disableUnderline: true,
                    sx: { fontSize: '0.95rem', fontWeight: 600 },
                  }}
                />
                {searchQuery && (
                  <IconButton size="small" onClick={handleClearSearch} sx={{ color: 'text.secondary', mr: 0.5 }}>
                    <ClearRoundedIcon fontSize="small" />
                  </IconButton>
                )}
                <Button
                  variant="contained"
                  onClick={() => fetchProducts()}
                  sx={{
                    borderRadius: 2.5,
                    px: 3,
                    py: 1,
                    fontWeight: 800,
                    textTransform: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Trouver
                </Button>
              </Box>

              {/* Quick Search Suggestions */}
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" gap={0.75}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700 }}>
                  Populaires :
                </Typography>
                {QUICK_SEARCH_TAGS.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    clickable
                    onClick={() => {
                      setSearchQuery(tag);
                      if (selectedCategory === 'packs') setSelectedCategory('all');
                      setPage(0);
                    }}
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.06)',
                      fontWeight: 600,
                      fontSize: '0.75rem',
                      borderRadius: 1.5,
                      '&:hover': { bgcolor: 'rgba(198,255,62,0.2)', color: 'primary.main' },
                    }}
                  />
                ))}
              </Stack>
            </Grid>

            {/* Right side visual badge card */}
            <Grid item xs={12} md={5} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ position: 'relative', textAlign: 'center' }}>
                <Box
                  component="img"
                  src="https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=700&auto=format&fit=crop&q=80"
                  alt="GymPilot Official Supplements"
                  sx={{
                    maxHeight: 310,
                    maxWidth: '100%',
                    borderRadius: 4,
                    boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    objectFit: 'cover',
                  }}
                />
                {/* Floating promo badge */}
                <Paper
                  elevation={4}
                  sx={{
                    position: 'absolute',
                    bottom: -15,
                    left: 20,
                    p: 1.5,
                    px: 2,
                    borderRadius: 3,
                    bgcolor: 'background.paper',
                    border: '1px solid',
                    borderColor: 'rgba(198,255,62,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <Box
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 2,
                      bgcolor: 'rgba(198,255,62,0.15)',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <CardGiftcardRoundedIcon fontSize="small" />
                  </Box>
                  <Box sx={{ textAlign: 'left' }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, display: 'block', color: 'primary.main' }}>
                      Cashback Immédiat
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                      5% en points de fidélité
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Card>

        {/* ===================== TRUST & GUARANTEES STRIP ===================== */}
        <Grid container spacing={2} sx={{ mb: 4 }}>
          {TRUST_BENEFITS.map((b, i) => (
            <Grid item xs={12} sm={6} lg={3} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3.5,
                  bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  border: '1px solid',
                  borderColor: 'divider',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  height: '100%',
                  transition: 'all .25s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(198,255,62,0.03)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 3,
                    bgcolor: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {b.icon}
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3, mb: 0.25 }}>
                    {b.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500, lineHeight: 1.3, display: 'block' }}>
                    {b.subtitle}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {/* ===================== CATEGORY PILLS BAR ===================== */}
        <Box sx={{ mb: 3.5 }}>
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{
              overflowX: 'auto',
              pb: 1.5,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {/* All Products Tab */}
            <Button
              variant={selectedCategory === 'all' ? 'contained' : 'outlined'}
              onClick={() => handleCategorySelect('all')}
              startIcon={<StorefrontRoundedIcon />}
              sx={{
                borderRadius: 3,
                px: 2.5,
                py: 1,
                fontWeight: 800,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                boxShadow: selectedCategory === 'all' ? '0 8px 20px rgba(198,255,62,0.25)' : 'none',
              }}
            >
              Tous les Produits
            </Button>

            {/* Special Packs Tab */}
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
                  boxShadow: selectedCategory === 'packs' ? '0 8px 20px rgba(255,77,77,0.3)' : 'none',
                  '&:hover': {
                    bgcolor: selectedCategory === 'packs' ? '#E03E3E' : 'rgba(255, 77, 77, 0.16)',
                    borderColor: '#FF4D4D',
                  },
                }}
              >
                Packs Promo ({packs.length})
              </Button>
            )}

            {/* Backend Categories */}
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant={isSelected ? 'contained' : 'outlined'}
                  onClick={() => handleCategorySelect(cat.id)}
                  startIcon={getCategoryIcon(cat.name)}
                  sx={{
                    borderRadius: 3,
                    px: 2.5,
                    py: 1,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: isSelected ? '0 8px 20px rgba(198,255,62,0.2)' : 'none',
                  }}
                >
                  {cat.name}
                </Button>
              );
            })}
          </Stack>
        </Box>

        {/* ===================== SPECIAL OFFERS & PACKS SHOWCASE ===================== */}
        {packs.length > 0 && (selectedCategory === 'all' || selectedCategory === 'packs') && !searchQuery.trim() && (
          <Box sx={{ mb: 6 }}>
            <Box
              sx={{
                p: { xs: 2.5, sm: 3.5, md: 4 },
                borderRadius: 4.5,
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'linear-gradient(135deg, rgba(255, 77, 77, 0.1) 0%, rgba(198, 255, 62, 0.06) 50%, rgba(15, 18, 24, 0.9) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 77, 77, 0.06) 0%, rgba(198, 255, 62, 0.06) 100%)',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255, 77, 77, 0.3)' : 'rgba(255, 77, 77, 0.25)',
                boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
              }}
            >
              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={1.5} sx={{ mb: 3 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                    <Chip
                      icon={<LocalFireDepartmentRoundedIcon sx={{ fontSize: '1rem !important', color: '#FF4D4D' }} />}
                      label="OFFRES LIMITÉES"
                      size="small"
                      sx={{
                        fontWeight: 900,
                        fontSize: '0.7rem',
                        bgcolor: 'rgba(255, 77, 77, 0.15)',
                        color: '#FF4D4D',
                        border: '1px solid rgba(255, 77, 77, 0.35)',
                      }}
                    />
                    <Chip
                      label="Économisez jusqu'à 30%"
                      size="small"
                      sx={{ bgcolor: 'rgba(198,255,62,0.18)', color: 'primary.main', fontWeight: 800, fontSize: '0.7rem' }}
                    />
                  </Stack>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>
                    Packs Promo &amp; Bundles Musculation
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Packs complets nutrition et compléments combinés au meilleur prix garanti.
                  </Typography>
                </Box>
                {selectedCategory !== 'packs' && (
                  <Button
                    variant="text"
                    onClick={() => handleCategorySelect('packs')}
                    endIcon={<ArrowForwardRoundedIcon />}
                    sx={{ fontWeight: 800, color: 'primary.main' }}
                  >
                    Voir tous les packs ({packs.length})
                  </Button>
                )}
              </Stack>

              <Grid container spacing={3}>
                {(selectedCategory === 'packs' ? packs : packs.slice(0, 3)).map((pack) => {
                  const isAdded = addedPackIds.has(pack.id);
                  const savings = (pack.originalPrice || pack.price) - pack.price;

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
                            theme.palette.mode === 'dark' ? 'rgba(255, 77, 77, 0.25)' : 'rgba(0,0,0,0.1)',
                          bgcolor: 'background.paper',
                          overflow: 'hidden',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            borderColor: '#FF4D4D',
                            boxShadow: '0 20px 45px rgba(255,77,77,0.25)',
                            '& .pack-img': {
                              transform: 'scale(1.06)',
                            },
                          },
                        }}
                      >
                        {/* Image & Badges */}
                        <Box sx={{ position: 'relative', pt: '56%', bgcolor: '#0A0C0F', overflow: 'hidden' }}>
                          <Box
                            component="img"
                            className="pack-img"
                            src={pack.images?.[0] || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80'}
                            alt={pack.name}
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
                                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                              }}
                            />
                          )}
                          {savings > 0 && (
                            <Chip
                              label={`Économie ${savings.toFixed(0)} TND`}
                              sx={{
                                position: 'absolute',
                                top: 12,
                                right: 12,
                                bgcolor: '#FF4D4D',
                                color: '#FFFFFF',
                                fontWeight: 900,
                                fontSize: '0.72rem',
                              }}
                            />
                          )}
                        </Box>

                        {/* Pack Content */}
                        <Box sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                          <Typography variant="h6" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", mb: 0.5 }}>
                            {pack.name}
                          </Typography>

                          {pack.tagline && (
                            <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: 'block', lineHeight: 1.4 }}>
                              {pack.tagline}
                            </Typography>
                          )}

                          {/* Items included in pack */}
                          {pack.items && pack.items.length > 0 && (
                            <Box
                              sx={{
                                p: 1.5,
                                mb: 2.5,
                                borderRadius: 2.5,
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.75 }}>
                                Le pack comprend :
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

                          {/* Price & Action */}
                          <Box sx={{ mt: 'auto' }}>
                            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 1.5 }}>
                              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                                {Number(pack.price).toFixed(2)} TND
                              </Typography>
                              {pack.originalPrice && pack.originalPrice > pack.price && (
                                <Typography variant="caption" sx={{ color: 'text.secondary', textDecoration: 'line-through', fontWeight: 600 }}>
                                  {Number(pack.originalPrice).toFixed(2)} TND
                                </Typography>
                              )}
                            </Stack>

                            <Button
                              fullWidth
                              variant="contained"
                              startIcon={isAdded ? <CheckRoundedIcon /> : <AddShoppingCartRoundedIcon />}
                              onClick={() => handleAddPackToCart(pack)}
                              sx={{
                                fontWeight: 800,
                                py: 1.1,
                                borderRadius: 2.5,
                                fontSize: '0.85rem',
                                bgcolor: isAdded ? '#00E676' : 'primary.main',
                                color: '#0A0C0F',
                                '&:hover': {
                                  bgcolor: isAdded ? '#00C853' : 'primary.dark',
                                },
                              }}
                            >
                              {isAdded ? 'Ajouté au panier ✓' : 'Ajouter le Pack au Panier'}
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

        {/* ===================== SEARCH, SORT & FILTER TOOLBAR ===================== */}
        {selectedCategory !== 'packs' && (
          <>
            <Paper
              elevation={0}
              sx={{
                p: { xs: 2, md: 2.5 },
                mb: 4,
                borderRadius: 3.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Grid container spacing={2} alignItems="center" justifyContent="space-between">
                {/* Left: Search input */}
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    placeholder="Filtrer par nom ou marque..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    size="small"
                    fullWidth
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                        </InputAdornment>
                      ),
                      endAdornment: searchQuery ? (
                        <InputAdornment position="end">
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearRoundedIcon fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                      sx: { borderRadius: 2.5 },
                    }}
                  />
                </Grid>

                {/* Middle: Quick Toggle Chips */}
                <Grid item xs={12} sm={6} md={4}>
                  <Stack direction="row" spacing={1} flexWrap="wrap" gap={0.5}>
                    <Chip
                      icon={<CheckCircleRoundedIcon sx={{ fontSize: '15px !important' }} />}
                      label="En Stock"
                      clickable
                      onClick={() => setInStockOnly(!inStockOnly)}
                      color={inStockOnly ? 'primary' : 'default'}
                      variant={inStockOnly ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                    <Chip
                      icon={<AttachMoneyRoundedIcon sx={{ fontSize: '15px !important' }} />}
                      label="En Promo %"
                      clickable
                      onClick={() => setOnSaleOnly(!onSaleOnly)}
                      color={onSaleOnly ? 'primary' : 'default'}
                      variant={onSaleOnly ? 'filled' : 'outlined'}
                      size="small"
                      sx={{ fontWeight: 700, borderRadius: 2 }}
                    />
                    {hasActiveFilters && (
                      <Button
                        size="small"
                        onClick={handleResetFilters}
                        startIcon={<ClearRoundedIcon fontSize="small" />}
                        sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'error.main' }}
                      >
                        Effacer tout
                      </Button>
                    )}
                  </Stack>
                </Grid>

                {/* Right: Sort dropdown */}
                <Grid item xs={12} md={3.5} sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                  <FormControl size="small" sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}>
                    <InputLabel>Trier par</InputLabel>
                    <Select value={sortOption} label="Trier par" onChange={handleSortChange} sx={{ borderRadius: 2.5 }}>
                      <MenuItem value="popularity">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <LocalFireDepartmentRoundedIcon sx={{ fontSize: 18, color: '#FF6B35' }} />
                          <span>Plus Populaires</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="price_asc">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AttachMoneyRoundedIcon sx={{ fontSize: 18, color: '#4CAF50' }} />
                          <span>Prix : Croissant</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="price_desc">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <DiamondRoundedIcon sx={{ fontSize: 18, color: '#7C4DFF' }} />
                          <span>Prix : Décroissant</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="rating">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <StarRoundedIcon sx={{ fontSize: 18, color: '#FFD700' }} />
                          <span>Mieux Notés</span>
                        </Stack>
                      </MenuItem>
                      <MenuItem value="newest">
                        <Stack direction="row" spacing={1} alignItems="center">
                          <AutoAwesomeRoundedIcon sx={{ fontSize: 18, color: '#C6FF3E' }} />
                          <span>Nouveautés</span>
                        </Stack>
                      </MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </Paper>

            {/* Results count indicator */}
            {!loading && (
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5, px: 0.5 }}>
                <Typography variant="body2" color="text.secondary">
                  Affichage de <strong>{displayedProducts.length}</strong> produit{displayedProducts.length > 1 ? 's' : ''}
                  {totalElements > 0 && ` sur ${totalElements}`}
                </Typography>
                {selectedCategory !== 'all' && (
                  <Chip
                    label={`Catégorie : ${categories.find((c) => c.id === selectedCategory)?.name || selectedCategory}`}
                    onDelete={() => setSelectedCategory('all')}
                    size="small"
                    sx={{ fontWeight: 700 }}
                  />
                )}
              </Stack>
            )}

            {/* ===================== PRODUCT GRID ===================== */}
            {loading ? (
              <Grid container spacing={3}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
                    <Skeleton variant="rounded" height={420} sx={{ borderRadius: 4 }} />
                  </Grid>
                ))}
              </Grid>
            ) : displayedProducts.length === 0 ? (
              <Card
                elevation={0}
                sx={{
                  p: { xs: 4, sm: 6 },
                  borderRadius: 4,
                  border: '1px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                }}
              >
                <Box
                  sx={{
                    width: 72,
                    height: 72,
                    borderRadius: 3.5,
                    bgcolor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                    color: 'text.secondary',
                  }}
                >
                  <ShoppingBagRoundedIcon sx={{ fontSize: 36 }} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1, fontFamily: "'Sora', sans-serif" }}>
                  Aucun produit ne correspond à votre recherche
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, maxWidth: 440, mx: 'auto' }}>
                  Essayez d'ajuster vos mots-clés ou de réinitialiser vos filtres de stock et de catégorie.
                </Typography>
                <Button
                  variant="outlined"
                  onClick={handleResetFilters}
                  startIcon={<ClearRoundedIcon />}
                  sx={{ fontWeight: 800, borderRadius: 2.5, px: 3 }}
                >
                  Réinitialiser les Filtres
                </Button>
              </Card>
            ) : (
              <Grid container spacing={3}>
                {displayedProducts.map((product) => {
                  const hasDiscount = product.originalPrice && product.originalPrice > product.price;
                  const discountPercent = hasDiscount
                    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                    : 0;
                  const isAdded = addedProductIds.has(product.id);
                  const rewardPoints = Math.round(Number(product.price) * 0.05 * 10);

                  return (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                      <Card
                        elevation={0}
                        sx={{
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          borderRadius: 4,
                          border: '1px solid',
                          borderColor: (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0,0,0,0.08)',
                          bgcolor: 'background.paper',
                          overflow: 'hidden',
                          position: 'relative',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          '&:hover': {
                            transform: 'translateY(-6px)',
                            borderColor: 'rgba(198,255,62,0.45)',
                            boxShadow: '0 20px 45px rgba(0,0,0,0.4)',
                            '& .product-image': {
                              transform: 'scale(1.08)',
                            },
                          },
                        }}
                      >
                        {/* Media Box */}
                        <Box sx={{ position: 'relative', pt: '78%', bgcolor: 'rgba(255,255,255,0.02)', overflow: 'hidden' }}>
                          <CardMedia
                            component="img"
                            className="product-image"
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
                              transition: 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)',
                            }}
                          />

                          {/* Badges on Image (Top Left) */}
                          <Box sx={{ position: 'absolute', top: 12, left: 12, display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                            {hasDiscount && (
                              <Chip
                                label={`-${discountPercent}%`}
                                size="small"
                                sx={{
                                  bgcolor: '#FF3B30',
                                  color: '#FFFFFF',
                                  fontWeight: 900,
                                  fontSize: '0.72rem',
                                  height: 24,
                                  borderRadius: 1.5,
                                  boxShadow: '0 4px 10px rgba(255,59,48,0.4)',
                                }}
                              />
                            )}
                            {product.featured && (
                              <Chip
                                label="Bestseller"
                                size="small"
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: '#0A0C0F',
                                  fontWeight: 900,
                                  fontSize: '0.7rem',
                                  height: 24,
                                  borderRadius: 1.5,
                                }}
                              />
                            )}
                          </Box>

                          {/* Stock status badge (Top Right) */}
                          <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
                            {product.stockQuantity <= 0 ? (
                              <Chip
                                label="Épuisé"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 69, 58, 0.2)',
                                  color: '#FF453A',
                                  border: '1px solid rgba(255, 69, 58, 0.4)',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  height: 22,
                                  backdropFilter: 'blur(6px)',
                                }}
                              />
                            ) : product.stockQuantity <= 5 ? (
                              <Chip
                                label={`Plus que ${product.stockQuantity}`}
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(255, 179, 0, 0.2)',
                                  color: '#FFB300',
                                  border: '1px solid rgba(255, 179, 0, 0.4)',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  height: 22,
                                  backdropFilter: 'blur(6px)',
                                }}
                              />
                            ) : (
                              <Chip
                                label="En Stock"
                                size="small"
                                sx={{
                                  bgcolor: 'rgba(0, 230, 118, 0.16)',
                                  color: '#00E676',
                                  border: '1px solid rgba(0, 230, 118, 0.35)',
                                  fontWeight: 800,
                                  fontSize: '0.68rem',
                                  height: 22,
                                  backdropFilter: 'blur(6px)',
                                }}
                              />
                            )}
                          </Box>
                        </Box>

                        {/* Card Content */}
                        <CardContent sx={{ flex: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
                          {/* Category & Rating Row */}
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.6, fontWeight: 700, fontSize: '0.7rem' }}>
                              {product.categoryName || 'Complément'}
                            </Typography>
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Rating value={product.rating || 5} precision={0.1} size="small" readOnly sx={{ fontSize: '0.85rem' }} />
                              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700 }}>
                                ({product.reviewCount || 1})
                              </Typography>
                            </Stack>
                          </Stack>

                          {/* Product Title */}
                          <Typography
                            component={RouterLink}
                            to={`/shop/${product.id}`}
                            variant="subtitle1"
                            sx={{
                              fontWeight: 800,
                              lineHeight: 1.35,
                              color: 'text.primary',
                              textDecoration: 'none',
                              mb: 1.5,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                              transition: 'color .2s ease',
                              fontFamily: "'Sora', sans-serif",
                              fontSize: '0.98rem',
                              '&:hover': { color: 'primary.main' },
                            }}
                          >
                            {product.name}
                          </Typography>

                          {/* Seller / Store Tag */}
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <Avatar
                              src={product.sellerStoreLogo}
                              alt={product.sellerStoreName || 'Store'}
                              sx={{
                                width: 20,
                                height: 20,
                                bgcolor: 'rgba(138,124,255,0.2)',
                                color: '#8A7CFF',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                border: '1px solid rgba(138,124,255,0.35)',
                                flexShrink: 0,
                              }}
                            >
                              {(product.sellerStoreName || product.sellerName || 'S').charAt(0).toUpperCase()}
                            </Avatar>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: 150,
                              }}
                            >
                              {product.sellerStoreName || product.sellerName || 'GymPilot Official'}
                            </Typography>
                            <VerifiedRoundedIcon sx={{ fontSize: 13, color: 'primary.main', flexShrink: 0 }} />
                          </Stack>

                          {/* Price & Reward points row */}
                          <Box sx={{ mt: 'auto', pt: 1 }}>
                            <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 0.5 }}>
                              <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                                {Number(product.price).toFixed(2)} TND
                              </Typography>
                              {hasDiscount && (
                                <Typography variant="body2" sx={{ color: 'text.secondary', textDecoration: 'line-through', fontWeight: 600 }}>
                                  {Number(product.originalPrice).toFixed(2)} TND
                                </Typography>
                              )}
                            </Stack>
                            <Typography variant="caption" sx={{ color: '#FFB800', fontWeight: 700, display: 'block' }}>
                              +{rewardPoints} pts de fidélité
                            </Typography>
                          </Box>
                        </CardContent>

                        {/* Actions */}
                        <CardActions sx={{ px: 2.5, pb: 2.5, pt: 0 }}>
                          <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                            <Tooltip
                              title={
                                product.stockQuantity <= 0
                                  ? 'Actuellement en rupture de stock'
                                  : `Ajouter 1 unité (${Number(product.price).toFixed(2)} TND)`
                              }
                              arrow
                              placement="top"
                            >
                              <span style={{ flex: 1 }}>
                                <Button
                                  variant="contained"
                                  fullWidth
                                  startIcon={isAdded ? <CheckRoundedIcon /> : <AddShoppingCartRoundedIcon />}
                                  disabled={product.stockQuantity <= 0}
                                  onClick={() => handleAddProductToCart(product)}
                                  sx={{
                                    fontWeight: 800,
                                    borderRadius: 2.5,
                                    py: 1.05,
                                    fontSize: '0.84rem',
                                    bgcolor: isAdded ? '#00E676' : 'primary.main',
                                    color: '#0A0C0F',
                                    transition: 'all .25s ease',
                                    '&:hover': {
                                      bgcolor: isAdded ? '#00C853' : 'primary.dark',
                                    },
                                  }}
                                >
                                  {product.stockQuantity <= 0 ? 'Rupture' : isAdded ? 'Ajouté ✓' : 'Ajouter au Panier'}
                                </Button>
                              </span>
                            </Tooltip>

                            <Tooltip title="Copier le lien direct du produit" arrow placement="top">
                              <IconButton
                                onClick={(e) => handleCopyProductUrl(e, product.id)}
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
                          </Stack>
                        </CardActions>
                      </Card>
                    </Grid>
                  );
                })}
              </Grid>
            )}

            {/* ===================== PAGINATION ===================== */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, val) => setPage(val - 1)}
                  color="primary"
                  shape="rounded"
                  size="large"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 800,
                      borderRadius: 2,
                    },
                  }}
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
            boxShadow: '0 14px 40px rgba(198,255,62,0.45)',
            zIndex: 1000,
            transition: 'transform .2s ease',
            '&:hover': {
              transform: 'scale(1.08)',
            },
          }}
        >
          <Badge badgeContent={itemCount} color="error" sx={{ '& .MuiBadge-badge': { fontWeight: 900 } }}>
            <ShoppingBagRoundedIcon sx={{ color: '#0A0C0F', fontSize: 26 }} />
          </Badge>
        </Fab>
      </Container>

      <Snackbar
        open={Boolean(copyNotification)}
        autoHideDuration={3000}
        onClose={() => setCopyNotification('')}
        message={copyNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      />

      <Footer />
    </>
  );
}
