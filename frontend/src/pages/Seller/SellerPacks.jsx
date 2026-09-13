import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
  Tooltip,
  InputAdornment,
  Divider,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';
import PercentRoundedIcon from '@mui/icons-material/PercentRounded';
import LayersRoundedIcon from '@mui/icons-material/LayersRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import SavingsRoundedIcon from '@mui/icons-material/SavingsRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';

import SEO from '../../components/SEO';
import SellerNavTabs from './components/SellerNavTabs';
import { productPackService } from '../../services/productPackService';
import PackDurationField from '../../components/packs/PackDurationField';
import PackDurationBadge from '../../components/packs/PackDurationBadge';
import MultiImageInput from '../../components/common/MultiImageInput';

export default function SellerPacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const filteredPacks = useMemo(() => {
    let list = packs;
    if (statusFilter === 'ACTIVE') {
      list = list.filter((p) => p.active && !p.isExpired);
    } else if (statusFilter === 'INACTIVE') {
      list = list.filter((p) => !p.active || p.isExpired);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase().trim();
    return list.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.tagline && p.tagline.toLowerCase().includes(q)) ||
        (p.badge && p.badge.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.items && p.items.some((it) => it.name && it.name.toLowerCase().includes(q)))
    );
  }, [packs, searchQuery, statusFilter]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPack, setEditingPack] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    tagline: '',
    badge: '-20% OFF',
    description: '',
    originalPrice: '',
    price: '',
    images: [''],
    items: [{ name: '', quantity: 1, description: '', dosage: '' }],
    active: true,
    stockQuantity: 50,
    durationUnit: 'LIFETIME',
    durationValue: 1,
    validUntil: null,
  });

  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productPackService.getSellerPacks();
      setPacks(data || []);
    } catch (err) {
      console.error('Failed to load seller packs:', err);
      setError('Failed to load special offer packs.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPacks();
  }, [fetchPacks]);

  const handleOpenCreate = () => {
    setEditingPack(null);
    setFormData({
      name: '',
      tagline: '',
      badge: '-25% OFF',
      description: '',
      originalPrice: '',
      price: '',
      images: [''],
      items: [{ name: '', quantity: 1, description: '', dosage: '' }],
      active: true,
      stockQuantity: 50,
      durationUnit: 'LIFETIME',
      durationValue: 1,
      validUntil: null,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (pack) => {
    setEditingPack(pack);
    setFormData({
      name: pack.name || '',
      tagline: pack.tagline || '',
      badge: pack.badge || '',
      description: pack.description || '',
      originalPrice: pack.originalPrice || '',
      price: pack.price || '',
      images: pack.images && pack.images.length > 0 ? pack.images : [''],
      items:
        pack.items && pack.items.length > 0
          ? pack.items.map((i) => ({
              name: i.name || '',
              quantity: i.quantity || 1,
              description: i.description || '',
              dosage: i.dosage || '',
            }))
          : [{ name: '', quantity: 1, description: '', dosage: '' }],
      active: pack.active !== undefined ? pack.active : true,
      stockQuantity: pack.stockQuantity || 50,
      durationUnit: pack.durationUnit || (pack.validUntil ? 'DAYS' : 'LIFETIME'),
      durationValue: pack.durationValue || 1,
      validUntil: pack.validUntil || null,
    });
    setFormError('');
    setDialogOpen(true);
  };

  // Stack Items helpers
  const handleItemChange = (index, field, value) => {
    const updated = [...formData.items];
    updated[index][field] = value;
    setFormData((prev) => ({ ...prev, items: updated }));
  };

  const handleAddItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, description: '', dosage: '' }],
    }));
  };

  const handleRemoveItem = (index) => {
    if (formData.items.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim()) {
      setFormError('Pack name is required.');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      setFormError('A valid offer price is required.');
      return;
    }
    if (!formData.originalPrice || Number(formData.originalPrice) <= 0) {
      setFormError('Original total value (before discount) is required.');
      return;
    }
    if (Number(formData.price) >= Number(formData.originalPrice)) {
      setFormError('Offer price should be less than original total value to constitute a discount deal.');
      return;
    }

    const cleanItems = formData.items.filter((item) => item.name.trim().length > 0);
    if (cleanItems.length === 0) {
      setFormError('At least 1 stack product item must be specified.');
      return;
    }

    const cleanImages = formData.images.filter((img) => img.trim().length > 0);

    const payload = {
      name: formData.name.trim(),
      tagline: formData.tagline.trim(),
      badge: formData.badge.trim(),
      description: formData.description.trim(),
      originalPrice: Number(formData.originalPrice),
      price: Number(formData.price),
      images: cleanImages.length > 0 ? cleanImages : ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80'],
      items: cleanItems,
      active: formData.active,
      featured: false,
      stockQuantity: Number(formData.stockQuantity) || 50,
      durationUnit: formData.durationUnit || 'LIFETIME',
      durationValue: formData.durationValue ? parseInt(formData.durationValue, 10) : null,
      validUntil: formData.validUntil,
    };

    try {
      setSaving(true);
      if (editingPack) {
        await productPackService.updateSellerPack(editingPack.id, payload);
        setSuccess(`Special offer pack "${payload.name}" updated successfully!`);
      } else {
        await productPackService.createSellerPack(payload);
        setSuccess(`Special offer pack "${payload.name}" launched successfully!`);
      }
      setDialogOpen(false);
      fetchPacks();
    } catch (err) {
      console.error('Failed to save seller pack:', err);
      setFormError(err.response?.data?.message || 'Failed to save product pack. Please verify inputs.');
    } finally {
      setSaving(false);
    }
  };

  // Toggle Active
  const handleToggleActive = async (pack) => {
    try {
      await productPackService.toggleSellerPackActive(pack.id);
      setPacks((prev) =>
        prev.map((p) => (p.id === pack.id ? { ...p, active: !p.active } : p))
      );
    } catch (err) {
      console.error('Failed to toggle pack active status:', err);
      setError('Failed to update status.');
    }
  };

  // Delete
  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setSaving(true);
      await productPackService.deleteSellerPack(deleteTarget.id);
      setSuccess(`Pack "${deleteTarget.name}" deleted.`);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchPacks();
    } catch (err) {
      console.error('Failed to delete pack:', err);
      setError('Failed to delete pack.');
    } finally {
      setSaving(false);
    }
  };

  // Metric stats
  const totalPacks = packs.length;
  const activeOffers = packs.filter((p) => p.active).length;
  const totalItemsCount = packs.reduce((acc, p) => acc + (p.items?.length || 0), 0);
  const avgDiscount =
    totalPacks > 0
      ? Math.round(
          packs.reduce((acc, p) => {
            const diff = (p.originalPrice || 0) - (p.price || 0);
            const pct = p.originalPrice > 0 ? (diff / p.originalPrice) * 100 : 0;
            return acc + (pct > 0 ? pct : 0);
          }, 0) / totalPacks
        )
      : 0;

  // Calculated preview discount in modal
  const orig = Number(formData.originalPrice) || 0;
  const curr = Number(formData.price) || 0;
  const discountPct = orig > curr && orig > 0 ? Math.round(((orig - curr) / orig) * 100) : 0;
  const savingsAmount = orig > curr ? (orig - curr).toFixed(2) : '0.00';

  return (
    <>
      <SEO
        title="Seller Special Offer Packs | GymPilot"
        description="Create and manage your bundled promotional stacks and discounted product packages."
      />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <SellerNavTabs />

        {/* Top Header */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={2}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
              Special Offer & Product Packs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Combine products from your store into high-converting bundle stacks, bundles, and discount deals.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{
              fontWeight: 800,
              bgcolor: 'primary.main',
              color: '#0A0C0F',
              borderRadius: 2,
              px: 3,
              py: 1,
              '&:hover': { bgcolor: 'primary.light' },
            }}
          >
            Create Offer Pack
          </Button>
        </Stack>

        {/* Alerts */}
        {success && (
          <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* Quick Stats */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(198, 255, 62, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#C6FF3E',
                  }}
                >
                  <LocalOfferRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    My Total Packs
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>
                    {totalPacks}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(0, 230, 118, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#00E676',
                  }}
                >
                  <Inventory2RoundedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Active in Storefront
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>
                    {activeOffers}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(138, 124, 255, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8A7CFF',
                  }}
                >
                  <LayersRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Stack Items
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>
                    {totalItemsCount}
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Box
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: 2,
                    bgcolor: 'rgba(255, 107, 107, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FF6B6B',
                  }}
                >
                  <PercentRoundedIcon />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Avg. Savings Discount
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif" }}>
                    ~{avgDiscount}%
                  </Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Search & Filter Toolbar */}
        <Card
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Grid container spacing={2} alignItems="center">
            {/* Search Input */}
            <Grid item xs={12} md={7}>
              <TextField
                fullWidth
                size="small"
                placeholder="Rechercher un pack ou un produit inclus (ex: Créatine, Gainer, 10/10)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery ? (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery('')}>
                        <CloseRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    borderRadius: 2.5,
                    bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)'),
                  },
                }}
              />
            </Grid>

            {/* Filter by Status */}
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                size="small"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                InputProps={{
                  sx: { borderRadius: 2.5 },
                }}
              >
                <MenuItem value="ALL">Tous les statuts ({packs.length})</MenuItem>
                <MenuItem value="ACTIVE">Actifs uniquement ({activeOffers})</MenuItem>
                <MenuItem value="INACTIVE">Inactifs uniquement ({packs.length - activeOffers})</MenuItem>
              </TextField>
            </Grid>

            {/* Results Count & Clear Button */}
            <Grid
              item
              xs={12}
              sm={6}
              md={2}
              sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' }, alignItems: 'center' }}
            >
              {searchQuery || statusFilter !== 'ALL' ? (
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => {
                    setSearchQuery('');
                    setStatusFilter('ALL');
                  }}
                  sx={{ borderRadius: 2, fontSize: '0.78rem', textTransform: 'none' }}
                >
                  Effacer filtres
                </Button>
              ) : (
                <Chip
                  label={`${packs.length} pack${packs.length > 1 ? 's' : ''}`}
                  size="small"
                  sx={{ fontWeight: 700, bgcolor: 'background.default' }}
                />
              )}
            </Grid>
          </Grid>
        </Card>

        {/* Table of Packs */}
        <Card
          elevation={0}
          sx={{
            borderRadius: 3.5,
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
            overflow: 'hidden',
          }}
        >
          {loading ? (
            <Box sx={{ py: 10, textAlign: 'center' }}>
              <CircularProgress size={40} sx={{ color: 'primary.main', mb: 2 }} />
              <Typography variant="body2" color="text.secondary">
                Loading your special offer packs...
              </Typography>
            </Box>
          ) : packs.length === 0 ? (
            <Box sx={{ py: 10, textAlign: 'center', px: 3 }}>
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  borderRadius: 3,
                  bgcolor: 'rgba(198, 255, 62, 0.1)',
                  color: '#C6FF3E',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mx: 'auto',
                  mb: 2,
                }}
              >
                <LocalOfferRoundedIcon sx={{ fontSize: 32 }} />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                No Special Offer Packs Yet
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: 'auto', mb: 3 }}>
                Bundles and stack deals sell up to 3x faster than single products. Launch your first special offer pack now!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={handleOpenCreate}
                sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#0A0C0F', borderRadius: 2 }}
              >
                Create First Pack
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0}>
              <Table sx={{ minWidth: 750 }}>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800, py: 2 }}>Pack Details</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Included Items</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Pricing & Deal</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Duration / Status</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Active</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredPacks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                          Aucun pack ne correspond à votre recherche "{searchQuery}".
                        </Typography>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => {
                            setSearchQuery('');
                            setStatusFilter('ALL');
                          }}
                          sx={{ borderRadius: 2 }}
                        >
                          Réinitialiser la recherche
                        </Button>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPacks.map((pack) => {
                    const savings = (pack.originalPrice || pack.price) - pack.price;
                    const pct =
                      pack.originalPrice > pack.price
                        ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                        : 0;

                    return (
                      <TableRow key={pack.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        {/* Pack Details */}
                        <TableCell sx={{ py: 2.5 }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={pack.images?.[0]}
                              variant="rounded"
                              sx={{
                                width: 56,
                                height: 56,
                                borderRadius: 2,
                                bgcolor: 'rgba(255,255,255,0.05)',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              <LocalOfferRoundedIcon />
                            </Avatar>
                            <Box sx={{ maxWidth: 260 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.3 }}>
                                {pack.name}
                              </Typography>
                              {pack.tagline && (
                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>
                                  {pack.tagline}
                                </Typography>
                              )}
                              <Stack direction="row" spacing={1} sx={{ mt: 0.75 }}>
                                {pack.badge && (
                                  <Chip
                                    label={pack.badge}
                                    size="small"
                                    sx={{
                                      bgcolor: 'rgba(198,255,62,0.15)',
                                      color: 'primary.main',
                                      fontWeight: 800,
                                      fontSize: '0.68rem',
                                      height: 20,
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Included Items */}
                        <TableCell>
                          <Stack spacing={0.5}>
                            {pack.items && pack.items.length > 0 ? (
                              pack.items.map((item, idx) => (
                                <Typography key={idx} variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                                  <Box component="span" sx={{ color: 'primary.main', fontWeight: 800 }}>
                                    {item.quantity}x
                                  </Box>
                                  <Box component="span" sx={{ fontWeight: 600 }}>
                                    {item.name}
                                  </Box>
                                  {item.description && (
                                    <Box component="span" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                                      ({item.description})
                                    </Box>
                                  )}
                                </Typography>
                              ))
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                No items defined
                              </Typography>
                            )}
                          </Stack>
                        </TableCell>

                        {/* Pricing & Savings */}
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                              {Number(pack.price).toFixed(2)} TND
                            </Typography>
                            {pack.originalPrice && pack.originalPrice > pack.price && (
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="caption" sx={{ textDecoration: 'line-through', color: 'text.secondary' }}>
                                  {Number(pack.originalPrice).toFixed(2)} TND
                                </Typography>
                                <Chip
                                  label={`-${pct}%`}
                                  size="small"
                                  sx={{
                                    height: 18,
                                    fontSize: '0.65rem',
                                    fontWeight: 800,
                                    bgcolor: 'rgba(0, 230, 118, 0.15)',
                                    color: '#00E676',
                                  }}
                                />
                              </Stack>
                            )}
                          </Box>
                        </TableCell>

                        {/* Duration & Expiry Status */}
                        <TableCell>
                          <PackDurationBadge pack={pack} />
                        </TableCell>

                        {/* Stock */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {pack.stockQuantity || 0}
                          </Typography>
                        </TableCell>

                        {/* Active Switch */}
                        <TableCell align="center">
                          <Switch
                            checked={pack.active}
                            onChange={() => handleToggleActive(pack)}
                            color="success"
                            size="small"
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit Pack Offer">
                              <IconButton
                                size="small"
                                onClick={() => handleOpenEdit(pack)}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                              >
                                <EditRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Pack">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setDeleteTarget(pack);
                                  setDeleteOpen(true);
                                }}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                              >
                                <DeleteOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Card>

        {/* Create / Edit Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => !saving && setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              backgroundImage: 'none',
            },
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, pb: 1 }}>
            {editingPack ? 'Edit Special Offer Pack' : 'Launch New Special Offer Pack'}
          </DialogTitle>
          <form onSubmit={handleSubmit}>
            <DialogContent dividers sx={{ borderColor: 'divider' }}>
              {formError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {formError}
                </Alert>
              )}

              <Grid container spacing={2.5}>
                {/* Pack Name */}
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Pack Title *"
                    fullWidth
                    size="small"
                    required
                    placeholder="e.g. Mass Gainer Bulking Combo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>

                {/* Promotional Badge */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Promo Badge Tag"
                    fullWidth
                    size="small"
                    placeholder="e.g. -25% OFF or SPECIAL DUO"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </Grid>

                {/* Tagline */}
                <Grid item xs={12}>
                  <TextField
                    label="Tagline / Short Summary"
                    fullWidth
                    size="small"
                    placeholder="e.g. Pure Whey 2kg + Micronized Creatine 300g + Free Shaker Pro"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </Grid>

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    label="Detailed Pack Overview"
                    fullWidth
                    multiline
                    rows={2.5}
                    size="small"
                    placeholder="Explain the advantages and synergistic benefits of buying this pack..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>

                {/* Pricing row */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Original Value (TND) *"
                    type="number"
                    fullWidth
                    size="small"
                    required
                    inputProps={{ step: '0.50', min: '0' }}
                    placeholder="e.g. 250.00"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Offer Price (TND) *"
                    type="number"
                    fullWidth
                    size="small"
                    required
                    inputProps={{ step: '0.50', min: '0' }}
                    placeholder="e.g. 189.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Stock Quantity *"
                    type="number"
                    fullWidth
                    size="small"
                    required
                    inputProps={{ min: '1' }}
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  />
                </Grid>

                {/* Discount calculation banner */}
                {discountPct > 0 && (
                  <Grid item xs={12}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(0, 230, 118, 0.08)',
                        border: '1px solid rgba(0, 230, 118, 0.25)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#00E676', display: 'flex', alignItems: 'center' }}>
                        <SavingsRoundedIcon sx={{ fontSize: 18, mr: 0.75 }} />
                        Customer Deal: -{discountPct}% Discount
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Customer saves {savingsAmount} TND
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* Pack Images (Device Upload or Image URL) */}
                <Grid item xs={12}>
                  <MultiImageInput
                    images={formData.images}
                    onChange={(newImages) =>
                      setFormData({
                        ...formData,
                        images: newImages,
                        imageUrl: newImages[0] || '',
                      })
                    }
                    maxImages={5}
                    folder="gympilot/packs"
                    label="Pack Cover Images"
                    helperText="Upload photos from your local device or paste online image URLs from CDN/web."
                  />
                </Grid>

                {/* Included Stack Items */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ my: 1.5 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        Included Products in Stack *
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Specify all products and free bonus items bundled in this pack.
                      </Typography>
                    </Box>
                    <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAddItem} sx={{ fontWeight: 700 }}>
                      Add Item
                    </Button>
                  </Stack>

                  <Stack spacing={1.5}>
                    {formData.items.map((item, index) => (
                      <Box
                        key={index}
                        sx={{
                          p: 1.75,
                          borderRadius: 2,
                          bgcolor: 'rgba(255,255,255,0.02)',
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Grid container spacing={1.5} alignItems="center">
                          <Grid item xs={12} sm={5}>
                            <TextField
                              label={`Product ${index + 1} Name *`}
                              size="small"
                              fullWidth
                              required
                              placeholder="e.g. Quamtrax Pure Creatine"
                              value={item.name}
                              onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={4} sm={2}>
                            <TextField
                              label="Qty"
                              type="number"
                              size="small"
                              fullWidth
                              inputProps={{ min: '1' }}
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            />
                          </Grid>
                          <Grid item xs={8} sm={4}>
                            <TextField
                              label="Details / Weight"
                              size="small"
                              fullWidth
                              placeholder="e.g. 300g (100 servings)"
                              value={item.description}
                              onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                            />
                          </Grid>
                          <Grid item xs={12} sm={1} textAlign="right">
                            {formData.items.length > 1 && (
                              <IconButton size="small" onClick={() => handleRemoveItem(index)} color="error">
                                <RemoveCircleOutlineRoundedIcon fontSize="small" />
                              </IconButton>
                            )}
                          </Grid>
                        </Grid>
                      </Box>
                    ))}
                  </Stack>
                </Grid>

                {/* Duration & Expiration Configuration */}
                <Grid item xs={12}>
                  <PackDurationField
                    durationUnit={formData.durationUnit}
                    durationValue={formData.durationValue}
                    validUntil={formData.validUntil}
                    isEditing={Boolean(editingPack)}
                    onChange={(updates) => setFormData((prev) => ({ ...prev, ...updates }))}
                  />
                </Grid>

                {/* Active switch */}
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      color="success"
                    />
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>
                      Publish actively to Shop and Catalog upon saving
                    </Typography>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={() => setDialogOpen(false)} disabled={saving} sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                sx={{
                  fontWeight: 800,
                  bgcolor: 'primary.main',
                  color: '#0A0C0F',
                  px: 3,
                  borderRadius: 2,
                  '&:hover': { bgcolor: 'primary.light' },
                }}
              >
                {saving ? 'Saving...' : editingPack ? 'Update Offer Pack' : 'Launch Offer Pack'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog
          open={deleteOpen}
          onClose={() => !saving && setDeleteOpen(false)}
          PaperProps={{
            sx: { borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Confirm Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to permanently delete the special offer pack &ldquo;
              <strong>{deleteTarget?.name}</strong>&rdquo;? This bundle will no longer appear in the Shop or on your store page.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setDeleteOpen(false)} disabled={saving} sx={{ color: 'text.secondary', fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={saving}
              onClick={handleDeleteConfirm}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              {saving ? 'Deleting...' : 'Delete Pack'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
