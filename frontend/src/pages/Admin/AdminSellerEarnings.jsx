import { useEffect, useState, useMemo } from 'react';
import SEO from '../../components/SEO';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Tabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
  Alert,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import {
  StorefrontRounded,
  MonetizationOnRounded,
  TrendingUpRounded,
  AccountBalanceWalletRounded,
  PendingActionsRounded,
  CheckCircleRounded,
  Inventory2Rounded,
  SearchRounded,
  RefreshRounded,
  ReceiptLongRounded,
  PaymentRounded,
  PersonRounded,
  EmailRounded,
  PhoneRounded,
  CalendarTodayRounded,
  VerifiedRounded,
  CancelRounded,
  EditRounded,
  CloseRounded,
  PercentRounded,
  LocalShippingRounded,
  AccessTimeRounded,
  WarningAmberRounded,
  HistoryRounded,
  ArrowUpwardRounded,
  ArrowDownwardRounded,
  AddBusinessRounded,
  PaymentsRounded,
} from '@mui/icons-material';

import { sellerEarningsService } from '../../services/sellerEarningsService';
import AddSellerModal from '../../components/admin/AddSellerModal';

// Format currency in TND
function formatCurrency(val) {
  if (val === null || val === undefined) return '0.00 TND';
  return `${Number(val).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TND`;
}

// Format date
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

function formatDateTime(dateStr) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return `${d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })} ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } catch (e) {
    return dateStr;
  }
}

export default function AdminSellerEarnings() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState('all');
  const [sort, setSort] = useState('revenue_desc');
  const [search, setSearch] = useState('');
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Pagination for sellers list
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Drilldown dialog state
  const [selectedSellerId, setSelectedSellerId] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [sellerDetail, setSellerDetail] = useState(null);
  const [detailTab, setDetailTab] = useState(0);

  // Payout dialog state
  const [payoutDialogOpen, setPayoutDialogOpen] = useState(false);
  const [payoutSeller, setPayoutSeller] = useState(null);
  const [payoutAmount, setPayoutAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState('BANK_TRANSFER');
  const [payoutRef, setPayoutRef] = useState('');
  const [payoutNotes, setPayoutNotes] = useState('');
  const [payoutSubmitting, setPayoutSubmitting] = useState(false);

  // Commission editing dialog
  const [commissionDialogOpen, setCommissionDialogOpen] = useState(false);
  const [editSeller, setEditSeller] = useState(null);
  const [newCommissionRate, setNewCommissionRate] = useState(10);
  const [commissionSubmitting, setCommissionSubmitting] = useState(false);
  const [addSellerOpen, setAddSellerOpen] = useState(false);

  // Fetch overview data
  const fetchData = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);
      setError(null);

      const data = await sellerEarningsService.getOverview({
        period,
        sort,
        search: search.trim() || undefined,
      });
      setOverview(data);
    } catch (err) {
      console.error('Failed to load seller earnings:', err);
      setError('Unable to load seller earnings data. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [period, sort]);

  // Handle search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  // Open seller detail
  const handleOpenDetail = async (sellerId) => {
    setSelectedSellerId(sellerId);
    setDetailTab(0);
    try {
      setDetailLoading(true);
      const detail = await sellerEarningsService.getSellerDetail(sellerId, { period });
      setSellerDetail(detail);
    } catch (err) {
      console.error('Failed to load seller detail:', err);
      setError('Failed to fetch detailed seller data.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetail = () => {
    setSelectedSellerId(null);
    setSellerDetail(null);
  };

  // Quick Open Payout Dialog
  const handleOpenPayout = (seller) => {
    setPayoutSeller(seller);
    setPayoutAmount(seller.pendingPayout > 0 ? String(seller.pendingPayout) : '');
    setPayoutMethod('BANK_TRANSFER');
    setPayoutRef('');
    setPayoutNotes('');
    setPayoutDialogOpen(true);
  };

  const handleClosePayout = () => {
    setPayoutDialogOpen(false);
    setPayoutSeller(null);
    setPayoutAmount('');
    setPayoutRef('');
    setPayoutNotes('');
  };

  const handleSubmitPayout = async (e) => {
    e.preventDefault();
    if (!payoutSeller) return;
    const numAmount = parseFloat(payoutAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Please enter a valid positive payout amount.');
      return;
    }

    try {
      setPayoutSubmitting(true);
      await sellerEarningsService.recordPayout(payoutSeller.sellerId, {
        amount: numAmount,
        paymentMethod: payoutMethod,
        referenceNumber: payoutRef.trim() || undefined,
        notes: payoutNotes.trim() || undefined,
      });

      setActionSuccess(`Successfully disbursed ${formatCurrency(numAmount)} to ${payoutSeller.sellerName || payoutSeller.storeName}!`);
      handleClosePayout();

      // Refresh data
      fetchData(true);
      if (selectedSellerId === payoutSeller.sellerId) {
        handleOpenDetail(payoutSeller.sellerId);
      }
    } catch (err) {
      console.error('Failed to record payout:', err);
      alert(err.response?.data?.message || 'Failed to record payout disbursement.');
    } finally {
      setPayoutSubmitting(false);
    }
  };

  // Open commission edit dialog
  const handleOpenCommissionEdit = (seller) => {
    setEditSeller(seller);
    setNewCommissionRate(seller.commissionRate ?? 10);
    setCommissionDialogOpen(true);
  };

  const handleCloseCommissionEdit = () => {
    setCommissionDialogOpen(false);
    setEditSeller(null);
  };

  const handleSaveCommission = async (e) => {
    e.preventDefault();
    if (!editSeller) return;
    const rate = parseFloat(newCommissionRate);
    if (isNaN(rate) || rate < 0 || rate > 100) {
      alert('Commission rate must be between 0% and 100%.');
      return;
    }

    try {
      setCommissionSubmitting(true);
      await sellerEarningsService.updateCommission(editSeller.sellerId, rate);
      setActionSuccess(`Updated commission rate for ${editSeller.sellerName || editSeller.storeName} to ${rate}%`);
      handleCloseCommissionEdit();
      fetchData(true);
      if (selectedSellerId === editSeller.sellerId) {
        handleOpenDetail(editSeller.sellerId);
      }
    } catch (err) {
      console.error('Failed to update commission rate:', err);
      alert(err.response?.data?.message || 'Failed to update commission rate.');
    } finally {
      setCommissionSubmitting(false);
    }
  };

  // Sellers pagination
  const sellersList = overview?.sellers || [];
  const paginatedSellers = useMemo(() => {
    return sellersList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [sellersList, page, rowsPerPage]);

  return (
    <>
      <SEO title="Seller Earnings & Finances | GymPilot Admin" description="Monitor marketplace sales, seller net revenues, commission payouts, and orders." />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header Bar */}
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          justifyContent="space-between"
          alignItems={{ xs: 'flex-start', md: 'center' }}
          spacing={2}
          sx={{ mb: 3.5 }}
        >
          <Box>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <StorefrontRounded sx={{ fontSize: 32, color: 'primary.main' }} />
              <Typography variant="h4" fontWeight={800} letterSpacing="-0.5px">
                Seller Earnings & Payouts
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Track seller sales performance, inspect platform commission, and manage disbursement payouts.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
            {/* Add Seller Button */}
            <Button
              variant="contained"
              startIcon={<AddBusinessRounded />}
              onClick={() => setAddSellerOpen(true)}
              sx={{
                borderRadius: 2.5,
                textTransform: 'none',
                fontWeight: 700,
                bgcolor: '#00E676',
                color: '#000',
                px: 2,
                '&:hover': {
                  bgcolor: '#00C853',
                },
              }}
            >
              Add Seller
            </Button>

            {/* Period Toggle */}
            <ToggleButtonGroup
              size="small"
              value={period}
              exclusive
              onChange={(e, val) => {
                if (val) setPeriod(val);
              }}
              sx={{
                bgcolor: 'background.paper',
                borderRadius: 2.5,
                border: '1px solid',
                borderColor: 'divider',
                '& .MuiToggleButton-root': {
                  px: 1.5,
                  py: 0.5,
                  fontWeight: 600,
                  fontSize: '0.8rem',
                  textTransform: 'none',
                },
              }}
            >
              <ToggleButton value="all">All Time</ToggleButton>
              <ToggleButton value="today">Today</ToggleButton>
              <ToggleButton value="week">7 Days</ToggleButton>
              <ToggleButton value="month">30 Days</ToggleButton>
              <ToggleButton value="year">1 Year</ToggleButton>
            </ToggleButtonGroup>

            {/* Refresh Button */}
            <Tooltip title="Refresh financial data">
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => fetchData(true)}
                disabled={refreshing}
                startIcon={refreshing ? <CircularProgress size={16} color="inherit" /> : <RefreshRounded />}
                sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 600 }}
              >
                {refreshing ? 'Updating...' : 'Refresh'}
              </Button>
            </Tooltip>
          </Stack>
        </Stack>

        {/* Feedback alerts */}
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {actionSuccess && (
          <Alert severity="success" sx={{ mb: 3, borderRadius: 2.5 }} onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}

        {/* Key KPI Overview Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          {/* Total Gross Revenue */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
                      Gross Sales
                    </Typography>
                    {loading ? (
                      <Skeleton width={100} height={36} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: '#C6FF3E' }}>
                        {formatCurrency(overview?.totalPlatformGrossRevenue)}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Total sales generated
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(198,255,62,0.12)', color: '#C6FF3E' }}>
                    <TrendingUpRounded />
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Platform Commission Earned */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
                      Platform Fees
                    </Typography>
                    {loading ? (
                      <Skeleton width={90} height={36} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: '#00E5FF' }}>
                        {formatCurrency(overview?.totalPlatformCommissionEarned)}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      GymPilot commission
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(0,229,255,0.12)', color: '#00E5FF' }}>
                    <PercentRounded />
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Net Seller Earnings */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
                      Net Seller Payouts
                    </Typography>
                    {loading ? (
                      <Skeleton width={90} height={36} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: '#64B5F6' }}>
                        {formatCurrency(overview?.totalNetSellerPayouts)}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Net earned by sellers
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(100,181,246,0.12)', color: '#64B5F6' }}>
                    <AccountBalanceWalletRounded />
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Pending Payouts */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
                      Pending Payouts
                    </Typography>
                    {loading ? (
                      <Skeleton width={90} height={36} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: '#FFB74D' }}>
                        {formatCurrency(overview?.totalPendingPayouts)}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Owed to sellers
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(255,183,77,0.12)', color: '#FFB74D' }}>
                    <PendingActionsRounded />
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Total Paid Out */}
          <Grid item xs={12} sm={6} md={4} lg={2.4}>
            <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, height: '100%' }}>
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={700} textTransform="uppercase" letterSpacing={0.5}>
                      Already Paid Out
                    </Typography>
                    {loading ? (
                      <Skeleton width={90} height={36} />
                    ) : (
                      <Typography variant="h5" fontWeight={800} sx={{ mt: 0.5, color: '#81C784' }}>
                        {formatCurrency(overview?.totalPaidOut)}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary">
                      Disbursed to date
                    </Typography>
                  </Box>
                  <Paper elevation={0} sx={{ p: 1, borderRadius: 2, bgcolor: 'rgba(129,199,132,0.12)', color: '#81C784' }}>
                    <CheckCircleRounded />
                  </Paper>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search & Sort Toolbar */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 3 }}>
          <CardContent sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="center">
              {/* Search input */}
              <Grid item xs={12} sm={6} md={5}>
                <form onSubmit={handleSearchSubmit}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Search by seller name, email, or store..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                      endAdornment: search ? (
                        <InputAdornment position="end">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSearch('');
                              setTimeout(fetchData, 10);
                            }}
                          >
                            <CloseRounded fontSize="small" />
                          </IconButton>
                        </InputAdornment>
                      ) : null,
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                      },
                    }}
                  />
                </form>
              </Grid>

              {/* Ranking & Sort */}
              <Grid item xs={12} sm={6} md={4}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Ranking / Sort by"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                >
                  <MenuItem value="revenue_desc">Top Earning First (Highest Revenue)</MenuItem>
                  <MenuItem value="revenue_asc">Lowest Earning First</MenuItem>
                  <MenuItem value="sales_desc">Most Products Sold (Units Sold)</MenuItem>
                  <MenuItem value="orders_desc">Most Orders Completed</MenuItem>
                  <MenuItem value="pending_desc">Highest Pending Payout</MenuItem>
                  <MenuItem value="newest">Recently Joined</MenuItem>
                </TextField>
              </Grid>

              {/* Active count stats */}
              <Grid item xs={12} md={3} sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                <Stack direction="row" spacing={2} justifyContent={{ xs: 'flex-start', md: 'flex-end' }}>
                  <Chip
                    icon={<StorefrontRounded fontSize="small" />}
                    label={`${overview?.totalActiveSellers ?? 0} Active Sellers`}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                  <Chip
                    icon={<Inventory2Rounded fontSize="small" />}
                    label={`${overview?.totalProductsSold ?? 0} Units Sold`}
                    variant="outlined"
                    size="small"
                    sx={{ fontWeight: 600 }}
                  />
                </Stack>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Sellers Financial Table */}
        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700, width: 60 }}>Rank</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Seller / Store</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Contact Info</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Sold Items</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Gross Revenue</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Platform Fee</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Net Earnings</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Payout Status</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Actions</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {loading ? (
                  Array.from(new Array(5)).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton width={24} /></TableCell>
                      <TableCell><Skeleton width={140} height={32} /></TableCell>
                      <TableCell><Skeleton width={120} /></TableCell>
                      <TableCell><Skeleton width={70} /></TableCell>
                      <TableCell align="right"><Skeleton width={50} /></TableCell>
                      <TableCell align="right"><Skeleton width={80} /></TableCell>
                      <TableCell align="right"><Skeleton width={70} /></TableCell>
                      <TableCell align="right"><Skeleton width={80} /></TableCell>
                      <TableCell align="right"><Skeleton width={90} /></TableCell>
                      <TableCell align="center"><Skeleton width={100} /></TableCell>
                    </TableRow>
                  ))
                ) : paginatedSellers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} align="center" sx={{ py: 6 }}>
                      <StorefrontRounded sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 1 }} />
                      <Typography variant="h6" color="text.secondary">
                        No sellers found matching the criteria.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSellers.map((s, index) => {
                    const globalRank = page * rowsPerPage + index + 1;
                    const isTopRank = globalRank <= 3;
                    const rankColor = globalRank === 1 ? '#FFD700' : globalRank === 2 ? '#C0C0C0' : globalRank === 3 ? '#CD7F32' : 'text.secondary';

                    return (
                      <TableRow
                        key={s.sellerId}
                        hover
                        sx={{
                          '&:last-child td, &:last-child th': { border: 0 },
                          transition: 'background-color 0.15s ease',
                        }}
                      >
                        {/* Rank */}
                        <TableCell>
                          <Typography variant="body2" fontWeight={800} sx={{ color: rankColor }}>
                            #{globalRank}
                          </Typography>
                        </TableCell>

                        {/* Seller / Store */}
                        <TableCell>
                          <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                              src={s.storeLogo || s.avatar}
                              alt={s.storeName || s.sellerName}
                              sx={{
                                width: 44,
                                height: 44,
                                bgcolor: 'primary.dark',
                                fontWeight: 700,
                                fontSize: '1rem',
                                border: '1px solid',
                                borderColor: 'divider',
                              }}
                            >
                              {(s.storeName || s.sellerName || 'S').charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2" fontWeight={700} sx={{ lineHeight: 1.2 }}>
                                {s.storeName || s.sellerName}
                              </Typography>
                              {s.sellerName && s.storeName && s.sellerName !== s.storeName && (
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {s.sellerName}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25 }}>
                                <CalendarTodayRounded sx={{ fontSize: 11 }} /> Joined {formatDate(s.joinedAt)}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>

                        {/* Contact Info */}
                        <TableCell>
                          <Stack spacing={0.3}>
                            <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 500 }}>
                              <EmailRounded sx={{ fontSize: 13, color: 'text.secondary' }} /> {s.sellerEmail || 'N/A'}
                            </Typography>
                            {s.phone && (
                              <Typography variant="caption" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                <PhoneRounded sx={{ fontSize: 13 }} /> {s.phone}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              Last Sale: {s.lastSaleAt ? formatDate(s.lastSaleAt) : 'Never'}
                            </Typography>
                          </Stack>
                        </TableCell>

                        {/* Status */}
                        <TableCell>
                          <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                            <Chip
                              size="small"
                              label={s.banned ? 'Suspended' : 'Active'}
                              color={s.banned ? 'error' : 'success'}
                              variant="outlined"
                              sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                            />
                            {s.isVerified && (
                              <Chip
                                size="small"
                                icon={<VerifiedRounded sx={{ fontSize: '13px !important' }} />}
                                label="Verified"
                                color="info"
                                variant="outlined"
                                sx={{ fontWeight: 600, fontSize: '0.7rem', height: 22 }}
                              />
                            )}
                          </Stack>
                        </TableCell>

                        {/* Sold Items / Orders */}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700}>
                            {s.totalUnitsSold.toLocaleString()} items
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {s.totalOrdersCount.toLocaleString()} orders
                          </Typography>
                          {s.cancelledOrdersCount > 0 && (
                            <Typography variant="caption" color="error.main" display="block">
                              ({s.cancelledOrdersCount} cancelled)
                            </Typography>
                          )}
                        </TableCell>

                        {/* Gross Revenue */}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={800} color="#C6FF3E">
                            {formatCurrency(s.grossRevenue)}
                          </Typography>
                          {s.refundedAmount > 0 && (
                            <Typography variant="caption" color="text.secondary" display="block">
                              Ref: -{formatCurrency(s.refundedAmount)}
                            </Typography>
                          )}
                        </TableCell>

                        {/* Platform Fee & Rate */}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={700} color="#00E5FF">
                            {formatCurrency(s.platformCommission)}
                          </Typography>
                          <Tooltip title="Click to adjust commission rate">
                            <Chip
                              size="small"
                              label={`${s.commissionRate}% fee`}
                              onClick={() => handleOpenCommissionEdit(s)}
                              sx={{
                                height: 20,
                                fontSize: '0.68rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                bgcolor: 'rgba(0,229,255,0.1)',
                                color: '#00E5FF',
                                '&:hover': { bgcolor: 'rgba(0,229,255,0.2)' },
                              }}
                            />
                          </Tooltip>
                        </TableCell>

                        {/* Net Earnings */}
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={800} color="#64B5F6">
                            {formatCurrency(s.netEarnings)}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Gross - Fee
                          </Typography>
                        </TableCell>

                        {/* Payout Status */}
                        <TableCell align="right">
                          {s.pendingPayout > 0 ? (
                            <Box>
                              <Chip
                                size="small"
                                icon={<PendingActionsRounded sx={{ fontSize: '13px !important' }} />}
                                label={`Pending ${formatCurrency(s.pendingPayout)}`}
                                color="warning"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24, mb: 0.5 }}
                              />
                              <Typography variant="caption" color="text.secondary" display="block">
                                Paid: {formatCurrency(s.totalPaidOut)}
                              </Typography>
                            </Box>
                          ) : s.netEarnings > 0 ? (
                            <Box>
                              <Chip
                                size="small"
                                icon={<CheckCircleRounded sx={{ fontSize: '13px !important' }} />}
                                label="Paid in Full"
                                color="success"
                                variant="outlined"
                                sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                              />
                              <Typography variant="caption" color="text.secondary" display="block">
                                Total: {formatCurrency(s.totalPaidOut)}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.secondary">
                              No balance
                            </Typography>
                          )}
                        </TableCell>

                        {/* Actions */}
                        <TableCell align="center">
                          <Stack direction="row" spacing={1} justifyContent="center">
                            <Tooltip title="View full sales breakdown, orders, and products">
                              <Button
                                size="small"
                                variant="contained"
                                color="inherit"
                                onClick={() => handleOpenDetail(s.sellerId)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  px: 1.5,
                                  py: 0.5,
                                  bgcolor: 'rgba(255,255,255,0.08)',
                                  '&:hover': { bgcolor: 'rgba(255,255,255,0.15)' },
                                }}
                              >
                                View Details
                              </Button>
                            </Tooltip>

                            <Tooltip title="Record payout disbursement to this seller">
                              <Button
                                size="small"
                                variant="outlined"
                                color={s.pendingPayout > 0 ? 'warning' : 'inherit'}
                                onClick={() => handleOpenPayout(s)}
                                sx={{
                                  borderRadius: 2,
                                  textTransform: 'none',
                                  fontSize: '0.75rem',
                                  fontWeight: 700,
                                  px: 1.5,
                                  py: 0.5,
                                }}
                              >
                                Pay Out
                              </Button>
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

          {/* Table Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={sellersList.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Card>
      </Container>

      {/* ----------------- SELLER DEEP DIVE MODAL ----------------- */}
      <Dialog
        open={Boolean(selectedSellerId)}
        onClose={handleCloseDetail}
        maxWidth="lg"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            border: '1px solid',
            borderColor: 'divider',
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ p: 2.5, pb: 1.5 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={sellerDetail?.summary?.storeLogo || sellerDetail?.summary?.avatar}
                alt={sellerDetail?.summary?.storeName}
                sx={{ width: 48, height: 48, bgcolor: 'primary.dark', fontWeight: 800 }}
              >
                {(sellerDetail?.summary?.storeName || 'S').charAt(0).toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  {sellerDetail?.summary?.storeName || sellerDetail?.summary?.sellerName || 'Seller'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {sellerDetail?.summary?.sellerEmail} • Member since {formatDate(sellerDetail?.summary?.joinedAt)}
                </Typography>
              </Box>
            </Stack>

            <IconButton onClick={handleCloseDetail} size="small">
              <CloseRounded />
            </IconButton>
          </Stack>

          {/* Tabs */}
          <Tabs
            value={detailTab}
            onChange={(e, val) => setDetailTab(val)}
            sx={{
              mt: 2,
              borderBottom: '1px solid',
              borderColor: 'divider',
              '& .MuiTab-root': {
                fontWeight: 700,
                textTransform: 'none',
                minWidth: 100,
              },
            }}
          >
            <Tab label="Financial Summary" />
            <Tab label={`Products Sold (${sellerDetail?.products?.length ?? 0})`} />
            <Tab label={`Order History (${sellerDetail?.transactions?.length ?? 0})`} />
            <Tab label={`Payout History (${sellerDetail?.payouts?.length ?? 0})`} />
          </Tabs>
        </DialogTitle>

        <DialogContent dividers sx={{ p: 3 }}>
          {detailLoading ? (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 8 }}>
              <CircularProgress color="primary" />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                Loading seller metrics & transactions...
              </Typography>
            </Stack>
          ) : !sellerDetail ? (
            <Alert severity="warning">No detail data found for this seller.</Alert>
          ) : (
            <>
              {/* TAB 0: FINANCIAL SUMMARY */}
              {detailTab === 0 && (
                <Stack spacing={3}>
                  {/* Financial cards */}
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          GROSS SALES
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#C6FF3E" sx={{ mt: 0.5 }}>
                          {formatCurrency(sellerDetail.summary.grossRevenue)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sellerDetail.summary.totalUnitsSold} items in {sellerDetail.summary.totalOrdersCount} orders
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          PLATFORM COMMISSION ({sellerDetail.summary.commissionRate}%)
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#00E5FF" sx={{ mt: 0.5 }}>
                          {formatCurrency(sellerDetail.summary.platformCommission)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Retained platform fee
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          NET SELLER EARNINGS
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#64B5F6" sx={{ mt: 0.5 }}>
                          {formatCurrency(sellerDetail.summary.netEarnings)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Total owed after fees
                        </Typography>
                      </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2.5,
                          border: '1px solid',
                          borderColor: sellerDetail.summary.pendingPayout > 0 ? 'warning.main' : 'divider',
                          bgcolor: sellerDetail.summary.pendingPayout > 0 ? 'rgba(255,183,77,0.06)' : 'inherit',
                        }}
                      >
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          PENDING PAYOUT BALANCE
                        </Typography>
                        <Typography variant="h5" fontWeight={800} color="#FFB74D" sx={{ mt: 0.5 }}>
                          {formatCurrency(sellerDetail.summary.pendingPayout)}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Paid out so far: {formatCurrency(sellerDetail.summary.totalPaidOut)}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>

                  {/* Seller Profile & Settings info */}
                  <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2.5, border: '1px solid', borderColor: 'divider' }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
                      Seller Details & Commission Configuration
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Seller Full Name
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {sellerDetail.summary.sellerName || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Store Name
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {sellerDetail.summary.storeName || 'N/A'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Contact Email
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {sellerDetail.summary.sellerEmail}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Contact Phone
                        </Typography>
                        <Typography variant="body2" fontWeight={600}>
                          {sellerDetail.summary.phone || 'Not provided'}
                        </Typography>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Account Status
                        </Typography>
                        <Chip
                          size="small"
                          label={sellerDetail.summary.banned ? 'Suspended / Banned' : 'Active Account'}
                          color={sellerDetail.summary.banned ? 'error' : 'success'}
                          variant="outlined"
                          sx={{ fontWeight: 700, mt: 0.5 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Verification Status
                        </Typography>
                        <Chip
                          size="small"
                          label={sellerDetail.summary.isVerified ? 'Verified Seller' : 'Unverified'}
                          color={sellerDetail.summary.isVerified ? 'info' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 700, mt: 0.5 }}
                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Current Platform Commission
                        </Typography>
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
                          <Typography variant="body2" fontWeight={800} color="#00E5FF">
                            {sellerDetail.summary.commissionRate}%
                          </Typography>
                          <Button
                            size="small"
                            variant="text"
                            startIcon={<EditRounded sx={{ fontSize: 14 }} />}
                            onClick={() => handleOpenCommissionEdit(sellerDetail.summary)}
                            sx={{ textTransform: 'none', fontSize: '0.75rem', p: 0.5 }}
                          >
                            Change Rate
                          </Button>
                        </Stack>
                      </Grid>

                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Quick Action
                        </Typography>
                        <Button
                          variant="contained"
                          color="warning"
                          size="small"
                          startIcon={<PaymentRounded />}
                          onClick={() => handleOpenPayout(sellerDetail.summary)}
                          sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, mt: 0.5 }}
                        >
                          Disburse Payout
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Stack>
              )}

              {/* TAB 1: PRODUCTS SOLD BREAKDOWN */}
              {detailTab === 1 && (
                <Box>
                  {sellerDetail.products.length === 0 ? (
                    <Alert severity="info">No products have been sold by this seller yet.</Alert>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Unit Price</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Units Sold</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Total Revenue</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Revenue Share</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sellerDetail.products.map((p, idx) => {
                            const revShare = sellerDetail.summary.grossRevenue > 0
                              ? Math.round((p.totalRevenue / sellerDetail.summary.grossRevenue) * 100)
                              : 0;

                            return (
                              <TableRow key={p.productId || idx} hover>
                                <TableCell>
                                  <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Avatar
                                      src={p.productImage}
                                      variant="rounded"
                                      sx={{ width: 40, height: 40, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}
                                    />
                                    <Typography variant="body2" fontWeight={600}>
                                      {p.productName}
                                    </Typography>
                                  </Stack>
                                </TableCell>
                                <TableCell align="right">{formatCurrency(p.price)}</TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={700}>
                                    {p.unitsSold} units
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Typography variant="body2" fontWeight={800} color="#C6FF3E">
                                    {formatCurrency(p.totalRevenue)}
                                  </Typography>
                                </TableCell>
                                <TableCell align="right">
                                  <Chip size="small" label={`${revShare}%`} sx={{ fontWeight: 700, height: 20, fontSize: '0.7rem' }} />
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* TAB 2: ORDER HISTORY */}
              {detailTab === 2 && (
                <Box>
                  {sellerDetail.transactions.length === 0 ? (
                    <Alert severity="info">No orders found for this seller.</Alert>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Order #</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Buyer</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Order Status</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Payment</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Seller Gross</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Platform Fee</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Seller Net</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sellerDetail.transactions.map((tx) => (
                            <TableRow
                              key={tx.orderId}
                              hover
                              sx={{
                                bgcolor: tx.isCancelledOrRefunded ? 'rgba(244,67,54,0.04)' : 'inherit',
                              }}
                            >
                              <TableCell>
                                <Typography variant="body2" fontWeight={700}>
                                  #{tx.orderNumber}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {formatDateTime(tx.createdAt)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="body2" fontWeight={500}>
                                  {tx.buyerName}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" display="block">
                                  {tx.buyerEmail}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Stack spacing={0.25}>
                                  {tx.sellerItems.map((item, idx) => (
                                    <Typography key={idx} variant="caption">
                                      {item.quantity}x {item.productName}
                                    </Typography>
                                  ))}
                                </Stack>
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={tx.status}
                                  color={
                                    tx.status === 'DELIVERED'
                                      ? 'success'
                                      : tx.status === 'CANCELLED'
                                      ? 'error'
                                      : tx.status === 'SHIPPED'
                                      ? 'info'
                                      : 'warning'
                                  }
                                  variant="outlined"
                                  sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  size="small"
                                  label={tx.paymentStatus}
                                  color={tx.paymentStatus === 'PAID' ? 'success' : tx.paymentStatus === 'REFUNDED' ? 'error' : 'default'}
                                  sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                                />
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  fontWeight={700}
                                  sx={{ textDecoration: tx.isCancelledOrRefunded ? 'line-through' : 'none' }}
                                >
                                  {formatCurrency(tx.sellerRevenue)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="caption" color="#00E5FF" fontWeight={600}>
                                  {formatCurrency(tx.commissionAmount)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography
                                  variant="body2"
                                  fontWeight={800}
                                  color={tx.isCancelledOrRefunded ? 'error.main' : '#64B5F6'}
                                >
                                  {tx.isCancelledOrRefunded ? '0.00 TND' : formatCurrency(tx.sellerNet)}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}

              {/* TAB 3: PAYOUT HISTORY */}
              {detailTab === 3 && (
                <Box>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700}>
                      Disbursed Payout Records ({sellerDetail.payouts.length})
                    </Typography>
                    <Button
                      variant="contained"
                      color="warning"
                      size="small"
                      startIcon={<PaymentRounded />}
                      onClick={() => handleOpenPayout(sellerDetail.summary)}
                      sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                    >
                      Record New Payout
                    </Button>
                  </Stack>

                  {sellerDetail.payouts.length === 0 ? (
                    <Alert severity="info">No payout disbursements recorded for this seller yet.</Alert>
                  ) : (
                    <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700 }}>Amount Disbursed</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Method</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Reference / Tx ID</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Notes</TableCell>
                            <TableCell sx={{ fontWeight: 700 }}>Authorized By</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {sellerDetail.payouts.map((pay) => (
                            <TableRow key={pay.id} hover>
                              <TableCell>
                                <Typography variant="caption" fontWeight={600}>
                                  {formatDateTime(pay.createdAt)}
                                </Typography>
                              </TableCell>
                              <TableCell align="right">
                                <Typography variant="body2" fontWeight={800} color="#81C784">
                                  {formatCurrency(pay.amount)}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Chip size="small" label={pay.paymentMethod} sx={{ fontWeight: 700, fontSize: '0.7rem' }} />
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                                  {pay.referenceNumber || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {pay.notes || '—'}
                                </Typography>
                              </TableCell>
                              <TableCell>
                                <Typography variant="caption" color="text.secondary">
                                  {pay.processedByAdmin || 'Admin'}
                                </Typography>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDetail} variant="outlined" color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* ----------------- RECORD PAYOUT DIALOG ----------------- */}
      <Dialog
        open={payoutDialogOpen}
        onClose={handleClosePayout}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <form onSubmit={handleSubmitPayout}>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PaymentRounded sx={{ color: 'warning.main' }} />
              <Typography variant="h6" fontWeight={800}>
                Disburse Seller Payout
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Recording a payout marks funds as transferred to{' '}
              <strong>{payoutSeller?.storeName || payoutSeller?.sellerName}</strong> and reduces their pending balance.
            </Typography>

            <Paper elevation={0} sx={{ p: 1.5, mb: 2.5, borderRadius: 2, bgcolor: 'rgba(255,183,77,0.1)', border: '1px solid', borderColor: 'warning.dark' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" fontWeight={700} color="warning.main">
                  Current Pending Balance:
                </Typography>
                <Typography variant="subtitle2" fontWeight={800} color="warning.main">
                  {formatCurrency(payoutSeller?.pendingPayout)}
                </Typography>
              </Stack>
            </Paper>

            <Stack spacing={2}>
              <TextField
                required
                fullWidth
                label="Payout Amount (TND)"
                type="number"
                inputProps={{ step: '0.01', min: '0.01' }}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                helperText="Enter the exact amount sent to the seller"
              />

              <TextField
                select
                fullWidth
                label="Payment Method"
                value={payoutMethod}
                onChange={(e) => setPayoutMethod(e.target.value)}
              >
                <MenuItem value="BANK_TRANSFER">Bank Wire Transfer (Virement)</MenuItem>
                <MenuItem value="D17">La Poste / D17</MenuItem>
                <MenuItem value="FLOUCI">Flouci</MenuItem>
                <MenuItem value="CASH">Cash / Espèces</MenuItem>
                <MenuItem value="CHECK">Cheque</MenuItem>
                <MenuItem value="OTHER">Other Gateway</MenuItem>
              </TextField>

              <TextField
                fullWidth
                label="Transaction Reference / Receipt #"
                placeholder="e.g. VIR-9283401 or D17-REF-44"
                value={payoutRef}
                onChange={(e) => setPayoutRef(e.target.value)}
              />

              <TextField
                fullWidth
                multiline
                rows={2}
                label="Internal Admin Notes (Optional)"
                placeholder="Notes about transfer date or payment confirmation..."
                value={payoutNotes}
                onChange={(e) => setPayoutNotes(e.target.value)}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={handleClosePayout} color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="warning"
              disabled={payoutSubmitting}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {payoutSubmitting ? 'Recording...' : 'Confirm Disbursement'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ----------------- EDIT COMMISSION DIALOG ----------------- */}
      <Dialog
        open={commissionDialogOpen}
        onClose={handleCloseCommissionEdit}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <form onSubmit={handleSaveCommission}>
          <DialogTitle sx={{ pb: 1 }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <PercentRounded sx={{ color: '#00E5FF' }} />
              <Typography variant="h6" fontWeight={800}>
                Set Commission Rate
              </Typography>
            </Stack>
          </DialogTitle>

          <DialogContent>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>
              Adjust the platform commission fee percentage for{' '}
              <strong>{editSeller?.storeName || editSeller?.sellerName}</strong>. Default platform commission is 10%.
            </Typography>

            <TextField
              required
              fullWidth
              label="Commission Fee (%)"
              type="number"
              inputProps={{ min: 0, max: 100, step: 0.5 }}
              value={newCommissionRate}
              onChange={(e) => setNewCommissionRate(e.target.value)}
              InputProps={{
                endAdornment: <InputAdornment position="end">%</InputAdornment>,
              }}
              helperText="E.g. 10 for 10% platform fee, 5 for 5%, 0 for fee-free"
            />

            {/* Quick Presets */}
            <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
              {[5, 10, 15, 20].map((val) => (
                <Chip
                  key={val}
                  label={`${val}%`}
                  size="small"
                  clickable
                  onClick={() => setNewCommissionRate(val)}
                  variant={parseFloat(newCommissionRate) === val ? 'filled' : 'outlined'}
                  color={parseFloat(newCommissionRate) === val ? 'primary' : 'default'}
                  sx={{ fontWeight: 700, borderRadius: 1.5 }}
                />
              ))}
            </Stack>

            {/* Revenue Split Preview */}
            <Paper
              elevation={0}
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: 'rgba(0, 229, 255, 0.04)',
                border: '1px solid rgba(0, 229, 255, 0.2)',
              }}
            >
              <Typography variant="caption" color="text.secondary" display="block">
                Sample 100 TND order revenue split:
              </Typography>
              <Typography variant="caption" fontWeight={700} color="#00E5FF">
                Platform fee: {(100 * ((parseFloat(newCommissionRate) || 0) / 100)).toFixed(2)} TND
              </Typography>
              {' • '}
              <Typography variant="caption" fontWeight={700} color="#00E676">
                Seller payout: {(100 * (1 - (parseFloat(newCommissionRate) || 0) / 100)).toFixed(2)} TND
              </Typography>
            </Paper>
          </DialogContent>

          <DialogActions sx={{ p: 2.5, pt: 1 }}>
            <Button onClick={handleCloseCommissionEdit} color="inherit" sx={{ borderRadius: 2, textTransform: 'none' }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={commissionSubmitting}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
            >
              {commissionSubmitting ? 'Saving...' : 'Save Rate'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ----------------- ADD SELLER MODAL ----------------- */}
      <AddSellerModal
        open={addSellerOpen}
        onClose={() => setAddSellerOpen(false)}
        onSellerAdded={() => {
          fetchData(true);
          setActionSuccess('New seller onboarded successfully with specified commission rate!');
        }}
      />
    </>
  );
}
