import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  Pagination,
  CircularProgress,
  Alert,
  Tooltip,
} from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import RemoveCircleOutlineRoundedIcon from '@mui/icons-material/RemoveCircleOutlineRounded';

import SEO from '../../components/SEO';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import { sellerService } from '../../services/sellerService';

export default function SellerProducts() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form fields
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    price: '',
    originalPrice: '',
    stockQuantity: '',
    description: '',
    images: [''],
    specs: [{ key: '', value: '' }],
    active: true,
    featured: false,
  });

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sellerService.getMyProducts({ page, size: 10 });
      setProducts(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load seller products:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    categoryService.getAll().then((data) => {
      setCategories(data || []);
      if (data && data.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({ ...prev, categoryId: data[0].id }));
      }
    });
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Open add modal if ?action=new is in URL
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      handleOpenCreate();
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      price: '',
      originalPrice: '',
      stockQuantity: '20',
      description: '',
      images: [''],
      specs: [{ key: 'Serving Size', value: '30g' }, { key: 'Protein per Serving', value: '25g' }],
      active: true,
      featured: false,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    const specsArray = product.specs
      ? Object.entries(product.specs).map(([key, value]) => ({ key, value }))
      : [{ key: '', value: '' }];

    setFormData({
      name: product.name || '',
      categoryId: product.categoryId || (categories.length > 0 ? categories[0].id : ''),
      price: product.price ? String(product.price) : '',
      originalPrice: product.originalPrice ? String(product.originalPrice) : '',
      stockQuantity: product.stockQuantity !== undefined ? String(product.stockQuantity) : '',
      description: product.description || '',
      images: product.images && product.images.length > 0 ? product.images : [''],
      specs: specsArray.length > 0 ? specsArray : [{ key: '', value: '' }],
      active: product.active ?? true,
      featured: product.featured ?? false,
    });
    setFormError('');
    setDialogOpen(true);
  };

  const handleAddImageRow = () => {
    setFormData((prev) => ({ ...prev, images: [...prev.images, ''] }));
  };

  const handleImageChange = (index, value) => {
    setFormData((prev) => {
      const next = [...prev.images];
      next[index] = value;
      return { ...prev, images: next };
    });
  };

  const handleRemoveImageRow = (index) => {
    setFormData((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
  };

  const handleAddSpecRow = () => {
    setFormData((prev) => ({ ...prev, specs: [...prev.specs, { key: '', value: '' }] }));
  };

  const handleSpecChange = (index, field, value) => {
    setFormData((prev) => {
      const next = [...prev.specs];
      next[index][field] = value;
      return { ...prev, specs: next };
    });
  };

  const handleRemoveSpecRow = (index) => {
    setFormData((prev) => ({ ...prev, specs: prev.specs.filter((_, i) => i !== index) }));
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.categoryId || !formData.price) {
      setFormError('Name, category, and price are required.');
      return;
    }

    try {
      setSaving(true);
      setFormError('');

      // Build specs map
      const specsMap = {};
      formData.specs.forEach((item) => {
        if (item.key && item.key.trim()) {
          specsMap[item.key.trim()] = item.value || '';
        }
      });

      const filteredImages = formData.images.filter((img) => img && img.trim());

      const payload = {
        name: formData.name.trim(),
        categoryId: formData.categoryId,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
        stockQuantity: parseInt(formData.stockQuantity || '0', 10),
        description: formData.description,
        images: filteredImages.length > 0 ? filteredImages : ['https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80'],
        specs: specsMap,
        active: formData.active,
        featured: formData.featured,
      };

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, payload);
      } else {
        await productService.createProduct(payload);
      }

      setDialogOpen(false);
      fetchProducts();
    } catch (err) {
      console.error('Failed to save product:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (productId) => {
    try {
      await productService.toggleActive(productId);
      fetchProducts();
    } catch (err) {
      console.error('Failed to toggle product status:', err);
    }
  };

  const handleDeletePrompt = (product) => {
    setDeleteTarget(product);
    setDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await productService.deleteProduct(deleteTarget.id);
      setDeleteOpen(false);
      setDeleteTarget(null);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  return (
    <>
      <SEO title="My Products — Seller Portal" description="Manage supplement and gear products." path="/seller/products" noIndex />

      <Container maxWidth="xl" disableGutters>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
              My Product Catalog
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Create, edit, toggle visibility, and update stock quantities for your store listings.
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={handleOpenCreate}
            sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#0A0C0F', borderRadius: 2 }}
          >
            Add New Product
          </Button>
        </Stack>

        <Card elevation={0} sx={{ p: 0, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Price</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Stock</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Sold</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Live</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: 'primary.main' }} />
                    </TableCell>
                  </TableRow>
                ) : products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No products added yet. Click "Add New Product" to list your first supplement or equipment.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={p.images && p.images.length > 0 ? p.images[0] : ''}
                            variant="rounded"
                            sx={{ width: 48, height: 48, bgcolor: 'background.elevated', borderRadius: 2 }}
                          />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>{p.name}</Typography>
                            {p.featured && (
                              <Chip label="Featured" size="small" sx={{ height: 18, fontSize: '0.62rem', fontWeight: 800, bgcolor: 'rgba(198,255,62,0.15)', color: 'primary.main' }} />
                            )}
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Chip label={p.categoryName || 'General'} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {Number(p.price).toFixed(2)} TND
                      </TableCell>
                      <TableCell>
                        {p.stockQuantity > 0 ? (
                          <Chip label={`${p.stockQuantity} in stock`} size="small" color="success" variant="outlined" sx={{ fontWeight: 700 }} />
                        ) : (
                          <Chip label="Out of Stock" size="small" color="error" sx={{ fontWeight: 700 }} />
                        )}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{p.unitsSold || 0}</TableCell>
                      <TableCell>
                        <Switch
                          checked={p.active}
                          onChange={() => handleToggleActive(p.id)}
                          color="primary"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Edit Product">
                            <IconButton size="small" onClick={() => handleOpenEdit(p)}>
                              <EditRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete Product">
                            <IconButton size="small" color="error" onClick={() => handleDeletePrompt(p)}>
                              <DeleteOutlineRoundedIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, val) => setPage(val - 1)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Card>

        {/* Add / Edit Product Dialog */}
        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              p: 1,
            },
          }}
        >
          <DialogTitle sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
            {editingProduct ? 'Edit Product' : 'Add New Product to Store'}
          </DialogTitle>

          <form onSubmit={handleSaveProduct}>
            <DialogContent dividers>
              {formError && (
                <Alert severity="error" sx={{ mb: 3 }} onClose={() => setFormError('')}>
                  {formError}
                </Alert>
              )}

              <Grid container spacing={2.5}>
                <Grid item xs={12} sm={8}>
                  <TextField
                    label="Product Name *"
                    fullWidth
                    size="small"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    label="Category *"
                    fullWidth
                    size="small"
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                  >
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={c.id}>
                        {c.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Sale Price ($) *"
                    type="number"
                    step="0.01"
                    fullWidth
                    size="small"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Original / List Price ($)"
                    type="number"
                    step="0.01"
                    fullWidth
                    size="small"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <TextField
                    label="Stock Quantity *"
                    type="number"
                    fullWidth
                    size="small"
                    required
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                  />
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    label="Description"
                    multiline
                    rows={3}
                    fullWidth
                    size="small"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </Grid>

                {/* Multi Image URLs */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Product Images (URLs)
                  </Typography>
                  <Stack spacing={1.5}>
                    {formData.images.map((img, idx) => (
                      <Stack key={idx} direction="row" spacing={1} alignItems="center">
                        <TextField
                          placeholder="https://images.unsplash.com/..."
                          size="small"
                          fullWidth
                          value={img}
                          onChange={(e) => handleImageChange(idx, e.target.value)}
                        />
                        {formData.images.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => handleRemoveImageRow(idx)}>
                            <RemoveCircleOutlineRoundedIcon />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                    <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAddImageRow} sx={{ alignSelf: 'flex-start' }}>
                      Add Another Image
                    </Button>
                  </Stack>
                </Grid>

                {/* Dynamic Nutrition Facts / Specifications Builder */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
                    Nutrition Facts / Specifications Table
                  </Typography>
                  <Stack spacing={1.5}>
                    {formData.specs.map((spec, idx) => (
                      <Stack key={idx} direction="row" spacing={1.5} alignItems="center">
                        <TextField
                          placeholder="Property (e.g., Protein per Serving)"
                          size="small"
                          sx={{ flex: 1 }}
                          value={spec.key}
                          onChange={(e) => handleSpecChange(idx, 'key', e.target.value)}
                        />
                        <TextField
                          placeholder="Value (e.g., 25g)"
                          size="small"
                          sx={{ flex: 1 }}
                          value={spec.value}
                          onChange={(e) => handleSpecChange(idx, 'value', e.target.value)}
                        />
                        {formData.specs.length > 1 && (
                          <IconButton size="small" color="error" onClick={() => handleRemoveSpecRow(idx)}>
                            <RemoveCircleOutlineRoundedIcon />
                          </IconButton>
                        )}
                      </Stack>
                    ))}
                    <Button size="small" startIcon={<AddRoundedIcon />} onClick={handleAddSpecRow} sx={{ alignSelf: 'flex-start' }}>
                      Add Specification Row
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button type="submit" variant="contained" disabled={saving} sx={{ fontWeight: 700, borderRadius: 2 }}>
                {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation */}
        <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
          <DialogTitle sx={{ fontWeight: 700 }}>Confirm Product Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="contained" color="error" onClick={handleConfirmDelete}>
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}
