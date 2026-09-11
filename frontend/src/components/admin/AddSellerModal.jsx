import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  Typography,
  TextField,
  Button,
  Avatar,
  Chip,
  InputAdornment,
  CircularProgress,
  Alert,
  Autocomplete,
  Paper,
  Divider,
} from '@mui/material';
import {
  AddBusinessRounded,
  PercentRounded,
  StorefrontRounded,
  PersonRounded,
  CheckCircleRounded,
  InfoOutlined,
  PaymentsRounded,
} from '@mui/icons-material';
import { adminService } from '../../services/adminService';
import { sellerEarningsService } from '../../services/sellerEarningsService';

const COMMISSION_PRESETS = [
  { value: 5, label: '5% (Low)' },
  { value: 10, label: '10% (Default)' },
  { value: 15, label: '15% (Standard)' },
  { value: 20, label: '20% (High)' },
];

export default function AddSellerModal({ open, onClose, onSellerAdded, preselectedUser = null }) {
  const [selectedUser, setSelectedUser] = useState(preselectedUser);
  const [userOptions, setUserOptions] = useState([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const [storeName, setStoreName] = useState('');
  const [commissionRate, setCommissionRate] = useState(10.0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (preselectedUser) {
      setSelectedUser(preselectedUser);
      const name = `${preselectedUser.firstName || ''} ${preselectedUser.lastName || ''}`.trim() || 'Seller';
      setStoreName(preselectedUser.storeName || `${name} Store`);
      setCommissionRate(preselectedUser.commissionRate ?? 10.0);
    } else {
      setSelectedUser(null);
      setStoreName('');
      setCommissionRate(10.0);
    }
    setNotes('');
    setError('');
  }, [preselectedUser, open]);

  // Search users dynamically when query changes and no user preselected
  useEffect(() => {
    if (!open || preselectedUser) return;

    let active = true;
    const fetchUsers = async () => {
      setUserSearchLoading(true);
      try {
        const res = await adminService.getUsers({ search: userSearchQuery, size: 8 });
        if (active) {
          setUserOptions(res.content || []);
        }
      } catch (err) {
        console.error('Failed to search users:', err);
      } finally {
        if (active) setUserSearchLoading(false);
      }
    };

    const timer = setTimeout(fetchUsers, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [userSearchQuery, open, preselectedUser]);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    if (user) {
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Vendor';
      setStoreName(user.storeName || `${name} Store`);
      if (user.commissionRate != null) {
        setCommissionRate(user.commissionRate);
      }
    }
  };

  const numRate = parseFloat(commissionRate) || 0;
  const sampleOrder = 100.0;
  const platformCut = (sampleOrder * (numRate / 100)).toFixed(2);
  const sellerCut = (sampleOrder * (1 - numRate / 100)).toFixed(2);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!selectedUser) {
      setError('Please select a user to promote to Seller.');
      return;
    }
    if (numRate < 0 || numRate > 100) {
      setError('Commission percentage must be between 0% and 100%.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        userId: selectedUser.id,
        email: selectedUser.email,
        storeName: storeName.trim() || undefined,
        commissionRate: numRate,
        notes: notes.trim() || undefined,
      };

      const result = await sellerEarningsService.assignSeller(payload);
      if (onSellerAdded) {
        onSellerAdded(result);
      }
      onClose();
    } catch (err) {
      console.error('Failed to assign seller:', err);
      setError(err.response?.data?.message || 'Failed to assign seller. Please check inputs and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => !submitting && onClose()}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        },
      }}
    >
      <form onSubmit={handleSubmit}>
        <DialogTitle sx={{ pb: 1, pt: 2.5 }}>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Box
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2.5,
                bgcolor: 'rgba(0, 230, 118, 0.12)',
                color: '#00E676',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <AddBusinessRounded />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight={800}>
                Add Marketplace Seller
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Assign vendor capabilities and define platform commission percentage
              </Typography>
            </Box>
          </Stack>
        </DialogTitle>

        <Divider />

        <DialogContent sx={{ py: 2.5 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={2.5}>
            {/* Step 1: User Selection */}
            {!preselectedUser ? (
              <Box>
                <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                  1. Select User Account
                </Typography>
                <Autocomplete
                  options={userOptions}
                  getOptionLabel={(opt) => `${opt.firstName || ''} ${opt.lastName || ''} (${opt.email})`}
                  value={selectedUser}
                  onChange={(e, val) => handleSelectUser(val)}
                  onInputChange={(e, val) => setUserSearchQuery(val)}
                  loading={userSearchLoading}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      placeholder="Search user by name or email..."
                      size="small"
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: (
                          <>
                            <PersonRounded sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />
                            {params.InputProps.startAdornment}
                          </>
                        ),
                        endAdornment: (
                          <>
                            {userSearchLoading ? <CircularProgress color="inherit" size={20} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                    />
                  )}
                  renderOption={(props, option) => {
                    const isAlreadySeller = option.isSeller || (option.roles || []).includes('SELLER');
                    return (
                      <Box component="li" {...props} key={option.id}>
                        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
                          <Avatar
                            src={option.avatar}
                            sx={{ width: 32, height: 32, bgcolor: 'primary.main', fontSize: '0.8rem' }}
                          >
                            {(option.firstName || 'U')[0]}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} noWrap>
                              {option.firstName} {option.lastName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                              {option.email}
                            </Typography>
                          </Box>
                          {isAlreadySeller && (
                            <Chip
                              label={`Seller (${option.commissionRate ?? 10}%)`}
                              size="small"
                              sx={{
                                height: 22,
                                fontSize: '0.7rem',
                                bgcolor: 'rgba(0, 230, 118, 0.1)',
                                color: '#00E676',
                              }}
                            />
                          )}
                        </Stack>
                      </Box>
                    );
                  }}
                />
              </Box>
            ) : (
              /* Preselected user display card */
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'action.hover',
                  border: '1px solid',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={selectedUser.avatar}
                    sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontWeight: 700 }}
                  >
                    {(selectedUser.firstName || 'U')[0]}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      {selectedUser.firstName} {selectedUser.lastName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedUser.email}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<CheckCircleRounded sx={{ '&&': { color: '#00E676' } }} />}
                    label="Selected Account"
                    size="small"
                    sx={{ bgcolor: 'rgba(0, 230, 118, 0.1)', color: '#00E676', fontWeight: 600 }}
                  />
                </Stack>
              </Paper>
            )}

            {/* Step 2: Store / Vendor Name */}
            <Box>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                2. Store Details
              </Typography>
              <TextField
                fullWidth
                size="small"
                label="Store / Brand Name"
                placeholder="e.g. Optimum Nutrition Official"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StorefrontRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
                helperText="Name displayed on products and marketplace store profiles"
              />
            </Box>

            {/* Step 3: Platform Commission Percentage */}
            <Box>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                <Typography variant="subtitle2" fontWeight={700}>
                  3. Platform Sales Commission (%)
                </Typography>
                <Typography variant="caption" color="primary.main" fontWeight={700}>
                  GymPilot Platform Fee
                </Typography>
              </Stack>

              <TextField
                fullWidth
                required
                size="small"
                type="number"
                label="Commission Rate"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value)}
                inputProps={{ min: 0, max: 100, step: 0.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PercentRounded fontSize="small" sx={{ color: '#00E5FF' }} />
                    </InputAdornment>
                  ),
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                sx={{ mb: 1.5 }}
              />

              {/* Presets */}
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 1.5 }}>
                {COMMISSION_PRESETS.map((p) => {
                  const isSelected = numRate === p.value;
                  return (
                    <Chip
                      key={p.value}
                      label={p.label}
                      size="small"
                      clickable
                      onClick={() => setCommissionRate(p.value)}
                      variant={isSelected ? 'filled' : 'outlined'}
                      color={isSelected ? 'primary' : 'default'}
                      sx={{
                        fontWeight: isSelected ? 700 : 500,
                        borderRadius: 1.5,
                      }}
                    />
                  );
                })}
              </Stack>

              {/* Dynamic Fee Split Preview */}
              <Paper
                elevation={0}
                sx={{
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: 'rgba(0, 229, 255, 0.04)',
                  border: '1px solid rgba(0, 229, 255, 0.2)',
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.75 }}>
                  <PaymentsRounded sx={{ fontSize: 18, color: '#00E5FF' }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: '#00E5FF' }}>
                    REVENUE SPLIT EXAMPLE (ON A 100.00 TND ORDER)
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="caption" color="text.secondary">
                      Platform Fee ({numRate}%)
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="#00E5FF">
                      +{platformCut} TND
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="caption" color="text.secondary">
                      Seller Net Payout ({100 - numRate}%)
                    </Typography>
                    <Typography variant="body2" fontWeight={800} color="#00E676">
                      +{sellerCut} TND
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            </Box>

            {/* Step 4: Notes / Audit reason */}
            <Box>
              <TextField
                fullWidth
                size="small"
                label="Admin Audit Notes (Optional)"
                placeholder="e.g., Onboarded verified supplier with agreed 10% platform fee"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={2}
              />
            </Box>
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button
            onClick={onClose}
            disabled={submitting}
            color="inherit"
            sx={{ borderRadius: 2, textTransform: 'none' }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={submitting || !selectedUser}
            startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRounded />}
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontWeight: 700,
              bgcolor: '#00E676',
              color: '#000',
              '&:hover': {
                bgcolor: '#00C853',
              },
            }}
          >
            {submitting ? 'Adding Seller...' : 'Confirm & Add Seller'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
