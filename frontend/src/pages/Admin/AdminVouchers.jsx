import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Stack,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Chip,
  Tooltip,
  Alert,
  CircularProgress,
  LinearProgress,
} from '@mui/material';
import {
  AddRounded,
  DeleteOutlineRounded,
  LocalOfferRounded,
  CheckCircleOutlineRounded,
  ContentCopyRounded,
  PercentRounded,
  AttachMoneyRounded,
  TrendingUpRounded,
  AccessTimeRounded,
  EventBusyRounded,
  VisibilityRounded,
  ReceiptLongRounded,
} from '@mui/icons-material';

import SEO from '../../components/SEO';
import { voucherService } from '../../services/voucherService';

const INITIAL_FORM_STATE = {
  code: '',
  discountType: 'PERCENTAGE',
  discountValue: '',
  minOrderAmount: '',
  maxDiscountAmount: '',
  maxUses: '',
  expiresAt: '',
  description: '',
};

export default function AdminVouchers() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bannerMessage, setBannerMessage] = useState({ type: '', text: '' });

  // Create Dialog State
  const [createOpen, setCreateOpen] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // View Redemptions modal state
  const [selectedVoucherForUsage, setSelectedVoucherForUsage] = useState(null);
  const [voucherOrders, setVoucherOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [usageDialogOpen, setUsageDialogOpen] = useState(false);

  // Copy code feedback
  const [copiedCode, setCopiedCode] = useState(null);

  const handleViewUsage = async (voucher) => {
    setSelectedVoucherForUsage(voucher);
    setUsageDialogOpen(true);
    setVoucherOrders([]);
    try {
      setLoadingOrders(true);
      const orders = await voucherService.getVoucherOrders(voucher.code);
      setVoucherOrders(Array.isArray(orders) ? orders : []);
    } catch (err) {
      console.error('Failed to load voucher redemption orders:', err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchVouchers = useCallback(async () => {
    try {
      setLoading(true);
      const data = await voucherService.getAdminVouchers();
      setVouchers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load vouchers:', err);
      setBannerMessage({
        type: 'error',
        text: 'Failed to load vouchers. Please check your network or try again.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'code' ? value.toUpperCase().trim() : value,
    }));
    setFormError('');
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code) {
      setFormError('Voucher code is required.');
      return;
    }
    const val = parseFloat(formData.discountValue);
    if (isNaN(val) || val <= 0) {
      setFormError('Please enter a valid positive discount value.');
      return;
    }
    if (formData.discountType === 'PERCENTAGE' && val > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        code: formData.code.trim().toUpperCase(),
        discountType: formData.discountType,
        discountValue: val,
        minOrderAmount: formData.minOrderAmount ? parseFloat(formData.minOrderAmount) : null,
        maxDiscountAmount: formData.maxDiscountAmount ? parseFloat(formData.maxDiscountAmount) : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses, 10) : null,
        expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        description: formData.description?.trim() || null,
      };

      await voucherService.createAdminVoucher(payload);
      setCreateOpen(false);
      setFormData(INITIAL_FORM_STATE);
      setBannerMessage({ type: 'success', text: `Voucher ${payload.code} created successfully!` });
      fetchVouchers();
    } catch (err) {
      console.error('Failed to create voucher:', err);
      setFormError(err.response?.data?.message || err.message || 'Failed to create voucher.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (voucher) => {
    try {
      const updated = await voucherService.toggleAdminVoucher(voucher.id);
      setVouchers((prev) => prev.map((v) => (v.id === voucher.id ? updated : v)));
    } catch (err) {
      console.error('Failed to toggle voucher active status:', err);
      setBannerMessage({ type: 'error', text: 'Could not toggle voucher status.' });
    }
  };

  const handleDeletePrompt = (voucher) => {
    setDeleteTarget(voucher);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await voucherService.deleteAdminVoucher(deleteTarget.id);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
      setBannerMessage({ type: 'success', text: 'Voucher removed successfully.' });
      fetchVouchers();
    } catch (err) {
      console.error('Failed to delete voucher:', err);
      setBannerMessage({ type: 'error', text: 'Failed to delete voucher.' });
    } finally {
      setDeleting(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  // Metrics summary
  const totalVouchers = vouchers.length;
  const activeVouchers = vouchers.filter((v) => v.active).length;
  const totalUses = vouchers.reduce((sum, v) => sum + (v.usedCount || 0), 0);

  return (
    <>
      <SEO title="Admin Vouchers & Promo Codes — GymPilot" description="Manage store discount vouchers." path="/admin/vouchers" noIndex />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <LocalOfferRounded sx={{ color: 'primary.main', fontSize: 32 }} />
              <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                Store Vouchers & Promo Codes
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Create and manage promotional discount vouchers for GymPilot store checkout.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddRounded />}
            onClick={() => {
              setFormData(INITIAL_FORM_STATE);
              setFormError('');
              setCreateOpen(true);
            }}
            sx={{ fontWeight: 800, px: 3, py: 1.2, borderRadius: 2.5 }}
          >
            Create Voucher
          </Button>
        </Stack>

        {bannerMessage.text && (
          <Alert severity={bannerMessage.type} sx={{ mb: 3 }} onClose={() => setBannerMessage({ type: '', text: '' })}>
            {bannerMessage.text}
          </Alert>
        )}

        {/* Stats Metrics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Promo Codes
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", mt: 0.5 }}>
                    {totalVouchers}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.04)', color: 'text.secondary' }}>
                  <LocalOfferRounded sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Active Vouchers
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", color: 'primary.main', mt: 0.5 }}>
                    {activeVouchers}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(198,255,62,0.1)', color: 'primary.main' }}>
                  <CheckCircleOutlineRounded sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Total Times Redeemed
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", color: '#FFD700', mt: 0.5 }}>
                    {totalUses}
                  </Typography>
                </Box>
                <Box sx={{ p: 1.5, borderRadius: 2.5, bgcolor: 'rgba(255,215,0,0.1)', color: '#FFD700' }}>
                  <TrendingUpRounded sx={{ fontSize: 28 }} />
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Vouchers Table */}
        <Card elevation={0} sx={{ borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 800 }}>Code</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Discount</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Min Order</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Times Used / Redemptions</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Expiry</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Active</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} color="primary" />
                    </TableCell>
                  </TableRow>
                ) : vouchers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <LocalOfferRounded sx={{ fontSize: 40, color: 'text.secondary', mb: 1, opacity: 0.5 }} />
                      <Typography variant="body1" sx={{ fontWeight: 700 }}>
                        No vouchers created yet
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Click "Create Voucher" to launch your first promotional discount.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchers.map((v) => {
                    const isExpired = v.expiresAt && new Date(v.expiresAt) < new Date();
                    const isMaxedOut = v.maxUses != null && v.usedCount >= v.maxUses;

                    return (
                      <TableRow key={v.id} hover sx={{ '&:hover': { bgcolor: 'rgba(255,255,255,0.02)' } }}>
                        {/* Code */}
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={v.code}
                              variant="outlined"
                              onClick={() => handleCopyCode(v.code)}
                              icon={copiedCode === v.code ? <CheckCircleOutlineRounded fontSize="small" /> : <ContentCopyRounded fontSize="small" />}
                              sx={{
                                fontWeight: 800,
                                fontFamily: "'Sora', sans-serif",
                                borderColor: 'primary.main',
                                color: 'primary.main',
                                cursor: 'pointer',
                                '&:hover': { bgcolor: 'rgba(198,255,62,0.1)' },
                              }}
                            />
                          </Stack>
                          {v.description && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                              {v.description}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Discount */}
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            {v.discountType === 'PERCENTAGE'
                              ? `${v.discountValue}% OFF`
                              : `TND ${Number(v.discountValue).toFixed(2)} OFF`}
                          </Typography>
                          {v.maxDiscountAmount && (
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              Cap: TND {v.maxDiscountAmount.toFixed(2)}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Min Order */}
                        <TableCell>
                          <Typography variant="body2">
                            {v.minOrderAmount ? `TND ${v.minOrderAmount.toFixed(2)}` : 'None'}
                          </Typography>
                        </TableCell>

                        {/* Times Used / Redemptions */}
                        <TableCell sx={{ minWidth: 170 }}>
                          <Stack spacing={0.6}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                size="small"
                                label={`${v.usedCount} time${v.usedCount === 1 ? '' : 's'} used`}
                                sx={{
                                  fontWeight: 800,
                                  fontSize: '0.75rem',
                                  bgcolor: v.usedCount > 0 ? 'rgba(198, 255, 62, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                                  color: v.usedCount > 0 ? 'primary.main' : 'text.secondary',
                                  border: '1px solid',
                                  borderColor: v.usedCount > 0 ? 'primary.main' : 'divider',
                                }}
                              />
                              {isMaxedOut && (
                                <Chip size="small" label="Limit Reached" color="error" sx={{ height: 22, fontSize: '0.68rem', fontWeight: 700 }} />
                              )}
                            </Stack>

                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                              {v.maxUses != null ? `${v.usedCount} of ${v.maxUses} max usages` : 'Unlimited max usages'}
                            </Typography>

                            {v.maxUses != null && (
                              <Box sx={{ width: '100%', pr: 1 }}>
                                <LinearProgress
                                  variant="determinate"
                                  value={Math.min(100, Math.round((v.usedCount / v.maxUses) * 100))}
                                  sx={{
                                    height: 5,
                                    borderRadius: 3,
                                    bgcolor: 'rgba(255,255,255,0.08)',
                                    '& .MuiLinearProgress-bar': {
                                      bgcolor: isMaxedOut ? 'error.main' : 'primary.main',
                                    },
                                  }}
                                />
                              </Box>
                            )}

                            {v.usedCount > 0 && (
                              <Button
                                size="small"
                                variant="text"
                                startIcon={<VisibilityRounded sx={{ fontSize: '0.85rem !important' }} />}
                                onClick={() => handleViewUsage(v)}
                                sx={{
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                  color: 'primary.main',
                                  p: 0,
                                  justifyContent: 'flex-start',
                                  textTransform: 'none',
                                  minWidth: 0,
                                  '&:hover': { textDecoration: 'underline', bgcolor: 'transparent' },
                                }}
                              >
                                View {v.usedCount} order{v.usedCount === 1 ? '' : 's'}
                              </Button>
                            )}
                          </Stack>
                        </TableCell>

                        {/* Expiry */}
                        <TableCell>
                          {v.expiresAt ? (
                            <Box>
                              <Typography variant="body2" color={isExpired ? 'error.main' : 'text.primary'}>
                                {new Date(v.expiresAt).toLocaleDateString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </Typography>
                              {isExpired && (
                                <Chip size="small" label="Expired" color="error" sx={{ height: 20, fontSize: '0.68rem', mt: 0.5 }} />
                              )}
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Never
                            </Typography>
                          )}
                        </TableCell>

                        {/* Active Switch */}
                        <TableCell>
                          <Switch
                            checked={v.active}
                            onChange={() => handleToggleActive(v)}
                            color="primary"
                            size="small"
                          />
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="right">
                          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                            <Tooltip title="View Redemptions" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleViewUsage(v)}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                              >
                                <VisibilityRounded fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Voucher" arrow>
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePrompt(v)}
                                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                              >
                                <DeleteOutlineRounded fontSize="small" />
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

        {/* Create Voucher Dialog */}
        <Dialog
          open={createOpen}
          onClose={() => !submitting && setCreateOpen(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          <form onSubmit={handleCreateSubmit}>
            <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", pb: 1 }}>
              Create New Discount Voucher
            </DialogTitle>
            <DialogContent dividers>
              {formError && (
                <Alert severity="error" sx={{ mb: 2.5 }}>
                  {formError}
                </Alert>
              )}

              <Stack spacing={2.5} sx={{ mt: 1 }}>
                <TextField
                  label="Voucher Code"
                  name="code"
                  value={formData.code}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. SUMMER20, PILOTFREE"
                  helperText="Unique uppercase promo code athletes will enter."
                  fullWidth
                  inputProps={{ style: { textTransform: 'uppercase', fontWeight: 800, letterSpacing: 1 } }}
                />

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      label="Discount Type"
                      name="discountType"
                      value={formData.discountType}
                      onChange={handleInputChange}
                      fullWidth
                    >
                      <MenuItem value="PERCENTAGE">Percentage (%)</MenuItem>
                      <MenuItem value="FIXED">Fixed Amount (TND)</MenuItem>
                    </TextField>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      label={formData.discountType === 'PERCENTAGE' ? 'Discount Rate (%)' : 'Discount Value (TND)'}
                      name="discountValue"
                      type="number"
                      step="any"
                      required
                      value={formData.discountValue}
                      onChange={handleInputChange}
                      placeholder={formData.discountType === 'PERCENTAGE' ? '15' : '20.00'}
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            {formData.discountType === 'PERCENTAGE' ? <PercentRounded fontSize="small" /> : <AttachMoneyRounded fontSize="small" />}
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </Grid>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Min Order Amount (TND)"
                      name="minOrderAmount"
                      type="number"
                      step="any"
                      value={formData.minOrderAmount}
                      onChange={handleInputChange}
                      placeholder="e.g. 50 (optional)"
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      label="Max Usage Limit"
                      name="maxUses"
                      type="number"
                      value={formData.maxUses}
                      onChange={handleInputChange}
                      placeholder="e.g. 100 (blank = unlimited)"
                      fullWidth
                    />
                  </Grid>
                </Grid>

                {formData.discountType === 'PERCENTAGE' && (
                  <TextField
                    label="Max Discount Cap (TND, optional)"
                    name="maxDiscountAmount"
                    type="number"
                    step="any"
                    value={formData.maxDiscountAmount}
                    onChange={handleInputChange}
                    placeholder="e.g. 30 (caps max percentage deduction)"
                    fullWidth
                  />
                )}

                <TextField
                  label="Expiration Date (Optional)"
                  name="expiresAt"
                  type="date"
                  value={formData.expiresAt}
                  onChange={handleInputChange}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                />

                <TextField
                  label="Description / Purpose"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="e.g. 15% Welcome discount for new athletes"
                  multiline
                  rows={2}
                  fullWidth
                />
              </Stack>
            </DialogContent>

            <DialogActions sx={{ p: 2.5 }}>
              <Button onClick={() => setCreateOpen(false)} disabled={submitting} sx={{ color: 'text.secondary', fontWeight: 700 }}>
                Cancel
              </Button>
              <Button type="submit" variant="contained" disabled={submitting} sx={{ fontWeight: 800, px: 3, borderRadius: 2 }}>
                {submitting ? <CircularProgress size={20} /> : 'Create Voucher'}
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteDialogOpen}
          onClose={() => !deleting && setDeleteDialogOpen(false)}
          PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800 }}>Confirm Voucher Deletion</DialogTitle>
          <DialogContent>
            <Typography variant="body2" color="text.secondary">
              Are you sure you want to delete voucher <strong>{deleteTarget?.code}</strong>?
              This action is immediate and customers will no longer be able to apply it.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setDeleteDialogOpen(false)} disabled={deleting} sx={{ color: 'text.secondary' }}>
              Cancel
            </Button>
            <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={deleting} sx={{ fontWeight: 800 }}>
              {deleting ? <CircularProgress size={18} /> : 'Delete'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Voucher Redemption History Dialog */}
        <Dialog
          open={usageDialogOpen}
          onClose={() => setUsageDialogOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            },
          }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", pb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ReceiptLongRounded sx={{ color: 'primary.main', fontSize: 28 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  Redemption History: {selectedVoucherForUsage?.code}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  This voucher has been used <strong>{selectedVoucherForUsage?.usedCount || 0} times</strong> across customer store orders.
                </Typography>
              </Box>
            </Stack>
          </DialogTitle>
          <DialogContent dividers sx={{ p: 0 }}>
            {loadingOrders ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <CircularProgress size={32} color="primary" />
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
                  Loading order redemptions...
                </Typography>
              </Box>
            ) : voucherOrders.length === 0 ? (
              <Box sx={{ py: 6, textAlign: 'center' }}>
                <LocalOfferRounded sx={{ fontSize: 44, color: 'text.secondary', opacity: 0.4, mb: 1 }} />
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  No order redemptions recorded
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  This voucher hasn't been redeemed by any customer yet.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 420 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 800 }}>Order #</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Customer</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Order Total</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Discount Saved</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 800 }}>Date</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {voucherOrders.map((order) => (
                      <TableRow key={order.id || order.orderNumber} hover>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700, fontFamily: 'monospace' }}>
                            #{order.orderNumber}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {order.buyerName || 'Customer'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            {order.buyerEmail}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            TND {Number(order.totalAmount).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            -TND {Number(order.discountAmount).toFixed(2)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={order.status}
                            sx={{
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              height: 22,
                              bgcolor:
                                order.status === 'DELIVERED'
                                  ? 'rgba(198, 255, 62, 0.15)'
                                  : order.status === 'CANCELLED'
                                  ? 'rgba(255, 75, 75, 0.15)'
                                  : 'rgba(255, 255, 255, 0.08)',
                              color:
                                order.status === 'DELIVERED'
                                  ? 'primary.main'
                                  : order.status === 'CANCELLED'
                                  ? 'error.main'
                                  : 'text.secondary',
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" color="text.secondary">
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleString(undefined, {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : '—'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setUsageDialogOpen(false)} variant="outlined" sx={{ fontWeight: 700 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}

