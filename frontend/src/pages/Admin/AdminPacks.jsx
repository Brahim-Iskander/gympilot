import { useState, useEffect, useCallback } from 'react';
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

import SEO from '../../components/SEO';
import { productPackService } from '../../services/productPackService';

export default function AdminPacks() {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
    featured: true,
    stockQuantity: 50,
  });

  const fetchPacks = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await productPackService.getAllPacksForAdmin();
      setPacks(data || []);
    } catch (err) {
      console.error('Failed to load packs:', err);
      setError('Failed to load product packs.');
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
      images: ['https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80'],
      items: [
        { name: '', quantity: 1, description: '', dosage: '' },
        { name: '', quantity: 1, description: '', dosage: '' },
      ],
      active: true,
      featured: true,
      stockQuantity: 50,
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
      items: pack.items && pack.items.length > 0
        ? pack.items.map((it) => ({
            name: it.name || '',
            quantity: it.quantity || 1,
            description: it.description || '',
            dosage: it.dosage || '',
          }))
        : [{ name: '', quantity: 1, description: '', dosage: '' }],
      active: pack.active !== false,
      featured: Boolean(pack.featured),
      stockQuantity: pack.stockQuantity || 50,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleAddItemRow = () => {
    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: '', quantity: 1, description: '', dosage: '' }],
    }));
  };

  const handleRemoveItemRow = (idx) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));
  };

  const handleItemChange = (idx, field, value) => {
    setFormData((prev) => {
      const next = [...prev.items];
      next[idx] = { ...next[idx], [field]: value };
      return { ...prev, items: next };
    });
  };

  const handleAddImageRow = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleRemoveImageRow = (idx) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleImageChange = (idx, val) => {
    setFormData((prev) => {
      const next = [...prev.images];
      next[idx] = val;
      return { ...prev, images: next };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('Pack name is required.');
      return;
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setFormError('Valid offer price is required.');
      return;
    }

    const validItems = formData.items.filter((it) => it.name && it.name.trim());
    if (validItems.length === 0) {
      setFormError('Please add at least one product or item to the pack.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      const payload = {
        name: formData.name.trim(),
        tagline: formData.tagline.trim(),
        badge: formData.badge.trim(),
        description: formData.description.trim(),
        originalPrice: parseFloat(formData.originalPrice || formData.price),
        price: parseFloat(formData.price),
        images: formData.images.filter((img) => img && img.trim()),
        items: validItems.map((it) => ({
          name: it.name.trim(),
          quantity: parseInt(it.quantity || 1, 10),
          description: it.description?.trim() || '',
          dosage: it.dosage?.trim() || '',
        })),
        active: formData.active,
        featured: formData.featured,
        stockQuantity: parseInt(formData.stockQuantity || 50, 10),
      };

      if (editingPack) {
        await productPackService.updatePack(editingPack.id, payload);
        setSuccess(`Updated "${payload.name}" successfully.`);
      } else {
        await productPackService.createPack(payload);
        setSuccess(`Created "${payload.name}" offer pack successfully.`);
      }

      setDialogOpen(false);
      fetchPacks();
    } catch (err) {
      console.error('Failed to save pack:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to save pack.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (packId) => {
    try {
      const updated = await productPackService.toggleActive(packId);
      setPacks((prev) => prev.map((p) => (p.id === packId ? updated : p)));
    } catch (err) {
      console.error('Failed to toggle pack active status:', err);
    }
  };

  const handleToggleFeatured = async (packId) => {
    try {
      const updated = await productPackService.toggleFeatured(packId);
      setPacks((prev) => prev.map((p) => (p.id === packId ? updated : p)));
    } catch (err) {
      console.error('Failed to toggle pack featured status:', err);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      await productPackService.deletePack(deleteTarget.id);
      setSuccess(`Deleted pack "${deleteTarget.name}".`);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchPacks();
    } catch (err) {
      console.error('Failed to delete pack:', err);
      setError('Failed to delete pack.');
    }
  };

  // Calculated stats
  const totalPacks = packs.length;
  const activePacks = packs.filter((p) => p.active).length;
  const featuredPacks = packs.filter((p) => p.featured && p.active).length;
  const maxSavings = packs.reduce((max, p) => {
    if (p.originalPrice > p.price) {
      const diff = p.originalPrice - p.price;
      return Math.max(max, diff);
    }
    return max;
  }, 0);

  // Live discount preview in dialog
  const calcOrig = parseFloat(formData.originalPrice || 0);
  const calcOffer = parseFloat(formData.price || 0);
  const savingsPct = calcOrig > calcOffer && calcOrig > 0
    ? Math.round(((calcOrig - calcOffer) / calcOrig) * 100)
    : 0;

  return (
    <>
      <SEO title="Special Offers & Product Packs — Admin Control" description="Manage special product packs and promotional offers." path="/admin/packs" noIndex />

      <Container maxWidth="xl" disableGutters>
        {/* Header */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
              Special Offers &amp; Product Packs
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create product bundles, discount packs, and promotional stacks displayed in the Shop and Home page.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#0A0C0F', borderRadius: 2 }}
          >
            Create Offer Pack
          </Button>
        </Stack>

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

        {/* 4 Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                    Total Packs
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", mt: 0.5 }}>
                    {totalPacks}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(198,255,62,0.1)', color: 'primary.main' }}>
                  <LayersRoundedIcon sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                    Active In Shop
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", mt: 0.5, color: '#00E676' }}>
                    {activePacks}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(0,230,118,0.1)', color: '#00E676' }}>
                  <LocalOfferRoundedIcon sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                    Featured on Home
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", mt: 0.5, color: '#8A7CFF' }}>
                    {featuredPacks}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(138,124,255,0.1)', color: '#8A7CFF' }}>
                  <StarRoundedIcon sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                    Max Customer Savings
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", mt: 0.5, color: 'primary.main' }}>
                    {maxSavings > 0 ? `${maxSavings.toFixed(0)} TND` : '0 TND'}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(198,255,62,0.1)', color: 'primary.main' }}>
                  <PercentRoundedIcon sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Packs Table */}
        <Card elevation={0} sx={{ p: 0, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Pack Details</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Badge</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Included Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Original</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Offer Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Savings</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Featured</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={36} sx={{ color: '#8A7CFF' }} />
                    </TableCell>
                  </TableRow>
                ) : packs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No product packs created yet. Click "Create Offer Pack" above to create one.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  packs.map((pack) => {
                    const diff = (pack.originalPrice || pack.price) - pack.price;
                    const discountPct = pack.originalPrice > pack.price
                      ? Math.round(((pack.originalPrice - pack.price) / pack.originalPrice) * 100)
                      : 0;

                    return (
                      <TableRow key={pack.id} hover>
                        {/* Thumbnail & Title */}
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                              src={pack.images?.[0] || 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80'}
                              variant="rounded"
                              sx={{ width: 48, height: 48, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
                            />
                            <Box sx={{ maxWidth: 220 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                                {pack.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.25 }}>
                                {pack.tagline || 'Special promotional pack'}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Badge */}
                        <TableCell>
                          {pack.badge ? (
                            <Chip
                              label={pack.badge}
                              size="small"
                              sx={{
                                fontWeight: 800,
                                fontSize: '0.72rem',
                                bgcolor: 'rgba(198,255,62,0.15)',
                                color: 'primary.main',
                                border: '1px solid rgba(198,255,62,0.3)',
                              }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">—</Typography>
                          )}
                        </TableCell>

                        {/* Items */}
                        <TableCell sx={{ maxWidth: 200 }}>
                          <Stack direction="row" flexWrap="wrap" gap={0.5}>
                            {pack.items && pack.items.map((it, idx) => (
                              <Chip
                                key={idx}
                                label={`${it.quantity}x ${it.name}`}
                                size="small"
                                sx={{ fontSize: '0.68rem', fontWeight: 600, height: 20 }}
                              />
                            ))}
                          </Stack>
                        </TableCell>

                        {/* Original Price */}
                        <TableCell sx={{ color: 'text.secondary', textDecoration: 'line-through' }}>
                          {pack.originalPrice ? `${Number(pack.originalPrice).toFixed(2)} TND` : '—'}
                        </TableCell>

                        {/* Offer Price */}
                        <TableCell sx={{ fontWeight: 900, color: 'primary.main', fontSize: '1rem' }}>
                          {Number(pack.price).toFixed(2)} TND
                        </TableCell>

                        {/* Savings */}
                        <TableCell>
                          {discountPct > 0 ? (
                            <Chip
                              label={`Save ${discountPct}% (${diff.toFixed(0)} TND)`}
                              size="small"
                              color="success"
                              sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                            />
                          ) : (
                            <Typography variant="caption" color="text.secondary">Standard</Typography>
                          )}
                        </TableCell>

                        {/* Active Switch */}
                        <TableCell>
                          <Switch
                            checked={Boolean(pack.active)}
                            onChange={() => handleToggleActive(pack.id)}
                            color="success"
                            size="small"
                          />
                        </TableCell>

                        {/* Featured Switch */}
                        <TableCell>
                          <Switch
                            checked={Boolean(pack.featured)}
                            onChange={() => handleToggleFeatured(pack.id)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="Edit Offer Pack">
                              <IconButton size="small" onClick={() => handleOpenEdit(pack)} sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}>
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
        </Card>

        {/* CREATE / EDIT PACK MODAL */}
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3.5, bgcolor: 'background.paper' } }}>
          <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            {editingPack ? `Edit Pack: ${editingPack.name}` : 'Create New Special Offer Pack'}
          </DialogTitle>
          <form onSubmit={handleSave}>
            <DialogContent dividers>
              {formError && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                  {formError}
                </Alert>
              )}

              <Grid container spacing={2.5}>
                {/* Pack Name */}
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Pack Name *"
                    fullWidth
                    size="small"
                    required
                    placeholder="e.g. Ultimate Mass & Power Stack"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>

                {/* Badge Label */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Discount / Promo Badge"
                    fullWidth
                    size="small"
                    placeholder="e.g. -25% OFF, BEST VALUE"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  />
                </Grid>

                {/* Tagline */}
                <Grid item xs={12}>
                  <TextField
                    label="Tagline / Short Hook"
                    fullWidth
                    size="small"
                    placeholder="e.g. Hyper Mass Gainer 3kg + Quamtrax Creatine + Free Shaker Pro"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </Grid>

                {/* Pricing & Stock */}
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Original Value (Before Discount) *"
                    fullWidth
                    size="small"
                    type="number"
                    required
                    InputProps={{ endAdornment: <InputAdornment position="end">TND</InputAdornment> }}
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Offer / Pack Price *"
                    fullWidth
                    size="small"
                    type="number"
                    required
                    InputProps={{ endAdornment: <InputAdornment position="end">TND</InputAdornment> }}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Available Stock *"
                    fullWidth
                    size="small"
                    type="number"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  />
                </Grid>

                {/* Real-time calculated discount pill */}
                {savingsPct > 0 && (
                  <Grid item xs={12}>
                    <Paper elevation={0} sx={{ p: 1.5, bgcolor: 'rgba(198,255,62,0.1)', border: '1px solid rgba(198,255,62,0.3)', borderRadius: 2 }}>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        🎉 Customer Saves: {savingsPct}% ({(calcOrig - calcOffer).toFixed(2)} TND discount off individual items)
                      </Typography>
                    </Paper>
                  </Grid>
                )}

                {/* Description */}
                <Grid item xs={12}>
                  <TextField
                    label="Detailed Pack Description"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="Describe the synergy between products in this pack, target audience, and benefits..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>

                {/* Pack Image URLs */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Pack Image(s)
                  </Typography>
                  {formData.images.map((img, idx) => (
                    <Stack direction="row" spacing={1} key={idx} sx={{ mb: 1 }}>
                      <TextField
                        size="small"
                        fullWidth
                        placeholder="https://..."
                        value={img}
                        onChange={(e) => handleImageChange(idx, e.target.value)}
                      />
                      {formData.images.length > 1 && (
                        <IconButton size="small" color="error" onClick={() => handleRemoveImageRow(idx)}>
                          <RemoveCircleOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      )}
                    </Stack>
                  ))}
                  <Button size="small" onClick={handleAddImageRow} sx={{ fontWeight: 700 }}>
                    + Add Another Image URL
                  </Button>
                </Grid>

                {/* INCLUDED PRODUCTS / ITEMS BUILDER */}
                <Grid item xs={12}>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mt: 1, mb: 0.5 }}>
                    Included Items in This Pack
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    List the individual supplements, accessories, or gifts bundled inside this pack.
                  </Typography>

                  {formData.items.map((it, idx) => (
                    <Paper key={idx} elevation={0} sx={{ p: 2, mb: 1.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.02)' }}>
                      <Grid container spacing={1.5} alignItems="center">
                        <Grid item xs={12} sm={5}>
                          <TextField
                            size="small"
                            fullWidth
                            label={`Item #${idx + 1} Name *`}
                            placeholder="e.g. Quamtrax Pure Creatine"
                            value={it.name}
                            onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={4} sm={2}>
                          <TextField
                            size="small"
                            fullWidth
                            type="number"
                            label="Qty"
                            value={it.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={8} sm={4}>
                          <TextField
                            size="small"
                            fullWidth
                            label="Spec / Size / Flavor"
                            placeholder="e.g. 300g (100 servings)"
                            value={it.description}
                            onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                          />
                        </Grid>
                        <Grid item xs={12} sm={1} textAlign="right">
                          {formData.items.length > 1 && (
                            <IconButton size="small" color="error" onClick={() => handleRemoveItemRow(idx)}>
                              <RemoveCircleOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Grid>
                      </Grid>
                    </Paper>
                  ))}

                  <Button size="small" onClick={handleAddItemRow} sx={{ fontWeight: 700 }}>
                    + Add Another Item to Pack
                  </Button>
                </Grid>

                {/* Toggles */}
                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      color="success"
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Active (Visible in Catalog)</Typography>
                  </Stack>
                </Grid>

                <Grid item xs={6}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Switch
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                      color="primary"
                    />
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>Featured (Shown on Home Page)</Typography>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDialogOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                disabled={saving}
                startIcon={saving ? <CircularProgress size={18} /> : null}
                sx={{ fontWeight: 800, px: 3 }}
              >
                {saving ? 'Saving...' : editingPack ? 'Update Pack' : 'Create Offer Pack'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* DELETE CONFIRMATION DIALOG */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 3 } }}>
          <DialogTitle sx={{ fontWeight: 800 }}>Delete Offer Pack?</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete <strong>"{deleteTarget?.name}"</strong>? This will permanently remove the pack from the store and home page.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteOpen(false)} sx={{ fontWeight: 600, color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button onClick={handleDeleteConfirm} variant="contained" color="error" sx={{ fontWeight: 800 }}>
              Delete Pack
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
