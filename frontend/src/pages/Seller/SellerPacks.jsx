import { useState, useEffect, useCallback, useRef } from 'react';
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
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import SEO from '../../components/SEO';
import SellerNavTabs from './components/SellerNavTabs';
import { productPackService } from '../../services/productPackService';
import { uploadImage } from '../../services/uploadService';

export default function SellerPacks() {
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
    stockQuantity: 50,
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

  const packImageInputRef = useRef(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Compress image client-side before uploading
  const compressImageFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Failed to load image.'));
        img.src = event.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file.'));
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const maxImages = 5;
    const currentValidImages = formData.images.filter((img) => img && img.trim());
    const slotsLeft = maxImages - currentValidImages.length;
    if (slotsLeft <= 0) {
      setFormError('Maximum 5 pack images allowed.');
      return;
    }

    const filesToUpload = files.slice(0, slotsLeft);

    try {
      setUploadingImage(true);
      setFormError('');

      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 10 * 1024 * 1024) {
          setFormError('Image too large (max 10MB). Skipping.');
          continue;
        }

        const base64 = await compressImageFile(file);
        const cloudinaryUrl = await uploadImage(base64, 'gympilot/packs');

        setFormData((prev) => {
          const newImages = [...prev.images.filter((img) => img && img.trim()), cloudinaryUrl];
          return { ...prev, images: newImages };
        });
      }
    } catch (err) {
      console.error('Pack image upload failed:', err);
      setFormError(err.response?.data?.message || 'Pack image upload failed. Check Cloudinary config.');
    } finally {
      setUploadingImage(false);
      if (packImageInputRef.current) packImageInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => {
      const next = prev.images.filter((_, i) => i !== index);
      return { ...prev, images: next.length > 0 ? next : [''] };
    });
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
                    <TableCell sx={{ fontWeight: 800 }}>Stock</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="center">Active</TableCell>
                    <TableCell sx={{ fontWeight: 800 }} align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {packs.map((pack) => {
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
                  })}
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
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#00E676' }}>
                        🎉 Customer Deal: -{discountPct}% Discount
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        Customer saves {savingsAmount} TND
                      </Typography>
                    </Box>
                  </Grid>
                )}

                {/* Pack Images — Upload to Cloudinary */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Pack Cover Images {uploadingImage && <CircularProgress size={14} sx={{ ml: 1 }} />}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Upload up to 5 pack photos. Images are hosted on Cloudinary for fast delivery.
                  </Typography>

                  {/* Hidden file input */}
                  <input
                    type="file"
                    ref={packImageInputRef}
                    accept="image/jpeg,image/png,image/webp"
                    multiple
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />

                  {/* Image Thumbnails Grid */}
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5, mb: 1.5 }}>
                    {formData.images.filter((img) => img && img.trim()).map((img, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          position: 'relative',
                          width: 90,
                          height: 90,
                          borderRadius: 2,
                          overflow: 'hidden',
                          border: '2px solid',
                          borderColor: idx === 0 ? 'primary.main' : 'divider',
                          bgcolor: '#111',
                        }}
                      >
                        <Box
                          component="img"
                          src={img}
                          alt={`Pack ${idx + 1}`}
                          sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <IconButton
                          size="small"
                          onClick={() => handleRemoveImage(idx)}
                          sx={{
                            position: 'absolute',
                            top: 2,
                            right: 2,
                            width: 22,
                            height: 22,
                            bgcolor: 'rgba(0,0,0,0.7)',
                            color: '#fff',
                            '&:hover': { bgcolor: 'error.main' },
                          }}
                        >
                          <CloseRoundedIcon sx={{ fontSize: 14 }} />
                        </IconButton>
                        {idx === 0 && (
                          <Chip
                            label="Cover"
                            size="small"
                            sx={{
                              position: 'absolute',
                              bottom: 2,
                              left: 2,
                              height: 18,
                              fontSize: '0.6rem',
                              fontWeight: 800,
                              bgcolor: 'primary.main',
                              color: '#000',
                            }}
                          />
                        )}
                      </Box>
                    ))}
                  </Box>

                  <Button
                    variant="outlined"
                    size="small"
                    disabled={uploadingImage || formData.images.filter((img) => img && img.trim()).length >= 5}
                    startIcon={uploadingImage ? <CircularProgress size={16} /> : <CloudUploadRoundedIcon />}
                    onClick={() => packImageInputRef.current?.click()}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Pack Images'}
                  </Button>
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
