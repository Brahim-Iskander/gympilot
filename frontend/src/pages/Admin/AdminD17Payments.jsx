import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Stack,
  Chip,
  Button,
  IconButton,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Alert,
  Tooltip,
  Snackbar,
  Avatar,
  Tabs,
  Tab,
  Divider,
  Switch,
  FormControlLabel,
} from '@mui/material';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import RefreshRoundedIcon from '@mui/icons-material/RefreshRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import SettingsRoundedIcon from '@mui/icons-material/SettingsRounded';
import ZoomInRoundedIcon from '@mui/icons-material/ZoomInRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import HistoryRoundedIcon from '@mui/icons-material/HistoryRounded';
import PhoneIphoneRoundedIcon from '@mui/icons-material/PhoneIphoneRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import CardMembershipRoundedIcon from '@mui/icons-material/CardMembershipRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import PublicRoundedIcon from '@mui/icons-material/PublicRounded';
import FlagRoundedIcon from '@mui/icons-material/FlagRounded';
import AccountBalanceWalletRoundedIcon from '@mui/icons-material/AccountBalanceWalletRounded';

import SEO from '../../components/SEO';
import { d17Service } from '../../services/d17Service';
import { paymentService } from '../../services/paymentService';
import { useAuth } from '../../context/AuthContext';

function CoinIcon({ code, sx = {} }) {
  if (code === 'D17') {
    return (
      <Box
        component="img"
        src="/d17-logo.webp"
        alt="D17"
        sx={{ width: 22, height: 22, objectFit: 'contain', ...sx }}
      />
    );
  }
  if (code === 'USDT_TRC20' || code === 'USDT') {
    return (
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: '#26A17B',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.7rem',
          ...sx,
        }}
      >
        ₮
      </Box>
    );
  }
  if (code === 'BTC') {
    return (
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: '#F7931A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.75rem',
          ...sx,
        }}
      >
        ₿
      </Box>
    );
  }
  if (code === 'ETH') {
    return (
      <Box
        sx={{
          width: 22,
          height: 22,
          borderRadius: '50%',
          bgcolor: '#627EEA',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.7rem',
          ...sx,
        }}
      >
        Ξ
      </Box>
    );
  }
  return <AccountBalanceWalletRoundedIcon sx={{ fontSize: 20, ...sx }} />;
}

const REJECTION_REASONS = [
  'Transaction hash (TXID) not found on blockchain',
  'Incorrect crypto network used (e.g. not TRC20)',
  'Crypto transfer amount less than required amount',
  'Unclear or cropped screenshot proof',
  'Transfer amount does not match payable total',
  'Payment not received in GymPilot wallet / D17 account',
  'Transaction timestamp is older than order creation',
  'Duplicate receipt or TXID submission',
  'Invalid recipient phone number / wallet address',
  'Other / Unverified transaction',
];

export default function AdminD17Payments() {
  const { user } = useAuth();

  const [payments, setPayments] = useState([]);
  const [stats, setStats] = useState({
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    slaWarningCount: 0,
    slaBreachCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL'); // ALL, PENDING_VERIFICATION, APPROVED, REJECTED, SLA_WARNINGS
  const [typeFilter, setTypeFilter] = useState('ALL'); // ALL, SUBSCRIPTION, ORDER, AI_CREDIT
  const [methodFilter, setMethodFilter] = useState('ALL'); // ALL, D17, USDT_TRC20, BTC, ETH

  // Lightbox modal for full screenshot preview
  const [previewImage, setPreviewImage] = useState(null);

  // Approve dialog state
  const [approvingPayment, setApprovingPayment] = useState(null);
  const [approveNote, setApproveNote] = useState('');
  const [actionSubmitting, setActionSubmitting] = useState(false);

  // Reject dialog state
  const [rejectingPayment, setRejectingPayment] = useState(null);
  const [rejectReason, setRejectReason] = useState(REJECTION_REASONS[0]);
  const [rejectCustomNote, setRejectCustomNote] = useState('');

  // Audit log dialog
  const [auditLogPayment, setAuditLogPayment] = useState(null);

  // Payment Methods & Regional Routing Configuration Dialog
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [adminMethods, setAdminMethods] = useState([]);
  const [loadingMethods, setLoadingMethods] = useState(false);
  const [selectedMethodTab, setSelectedMethodTab] = useState('D17');
  const [savingMethodCode, setSavingMethodCode] = useState(null);

  // Toast notifications
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' });
  const [copiedId, setCopiedId] = useState(null);

  const fetchPayments = useCallback(async () => {
    try {
      setLoading(true);
      const [paymentsData, statsData] = await Promise.all([
        paymentService.getAdminPayments({
          status: statusFilter === 'SLA_WARNINGS' ? 'PENDING_VERIFICATION' : statusFilter,
          search: searchQuery.trim() || undefined,
          method: methodFilter !== 'ALL' ? methodFilter : undefined,
        }),
        paymentService.getAdminStats().catch(() => null),
      ]);

      let items = paymentsData || [];
      if (statusFilter === 'SLA_WARNINGS') {
        items = items.filter((p) => p.slaStatus === 'WARNING' || p.slaStatus === 'BREACHED');
      }
      if (typeFilter !== 'ALL') {
        items = items.filter((p) => p.type === typeFilter);
      }

      setPayments(items);
      if (statsData) {
        setStats({
          pendingCount: statsData.pendingCount ?? statsData.pending ?? 0,
          approvedCount: statsData.approvedCount ?? statsData.approved ?? 0,
          rejectedCount: statsData.rejectedCount ?? statsData.rejected ?? 0,
          slaWarningCount: statsData.slaWarningCount ?? statsData.slaWarnings ?? 0,
          slaBreachCount: statsData.slaBreachCount ?? statsData.slaBreached ?? 0,
          total: statsData.total ?? statsData.totalCount ?? 0,
        });
      }
    } catch (err) {
      console.error('Failed to load manual & crypto payments:', err);
      setToast({ open: true, message: 'Failed to load payments data', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery, typeFilter, methodFilter]);

  const fetchAdminMethods = useCallback(async () => {
    try {
      setLoadingMethods(true);
      const data = await paymentService.getAdminMethods();
      if (data) {
        setAdminMethods(data);
        if (data.length > 0 && !data.some((m) => m.code === selectedMethodTab)) {
          setSelectedMethodTab(data[0].code);
        }
      }
    } catch (err) {
      console.error('Failed to load admin payment methods:', err);
    } finally {
      setLoadingMethods(false);
    }
  }, [selectedMethodTab]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    if (settingsOpen) {
      fetchAdminMethods();
    }
  }, [settingsOpen, fetchAdminMethods]);

  const handleCopy = (text, id) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleUpdateMethodField = (code, field, value) => {
    setAdminMethods((prev) =>
      prev.map((m) => (m.code === code ? { ...m, [field]: value } : m))
    );
  };

  const handleSaveMethod = async (method) => {
    if (!method) return;
    try {
      setSavingMethodCode(method.code);
      await paymentService.updateMethod(method.code, {
        isActiveGlobal: method.isActiveGlobal,
        isActiveTunisia: method.isActiveTunisia,
        isActiveInternational: method.isActiveInternational,
        receivingAddress: method.receivingAddress,
        recipientName: method.recipientName,
        instructions: method.instructions,
        warningNotice: method.warningNotice,
        explorerUrlPrefix: method.explorerUrlPrefix,
      });
      setToast({
        open: true,
        message: `${method.name} configuration saved successfully!`,
        severity: 'success',
      });
      fetchAdminMethods();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to update payment method.',
        severity: 'error',
      });
    } finally {
      setSavingMethodCode(null);
    }
  };

  const handleApprove = async () => {
    if (!approvingPayment) return;
    try {
      setActionSubmitting(true);
      await d17Service.approvePayment(approvingPayment.id, approveNote.trim());
      setToast({
        open: true,
        message: `Payment for ${approvingPayment.ticketNumber} approved! Subscribed/Order updated & email sent.`,
        severity: 'success',
      });
      setApprovingPayment(null);
      setApproveNote('');
      fetchPayments();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to approve payment.',
        severity: 'error',
      });
    } finally {
      setActionSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!rejectingPayment) return;
    try {
      setActionSubmitting(true);
      await d17Service.rejectPayment(rejectingPayment.id, rejectReason, rejectCustomNote.trim());
      setToast({
        open: true,
        message: `Payment ${rejectingPayment.ticketNumber} rejected. Email notification sent to athlete.`,
        severity: 'info',
      });
      setRejectingPayment(null);
      setRejectReason(REJECTION_REASONS[0]);
      setRejectCustomNote('');
      fetchPayments();
    } catch (err) {
      setToast({
        open: true,
        message: err.response?.data?.message || err.message || 'Failed to reject payment.',
        severity: 'error',
      });
    } finally {
      setActionSubmitting(false);
    }
  };

  const renderSlaBadge = (payment) => {
    if (payment.status === 'APPROVED') {
      return (
        <Chip
          size="small"
          color="success"
          icon={<CheckCircleRoundedIcon sx={{ fontSize: 14 }} />}
          label="Verified & Completed"
          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
        />
      );
    }
    if (payment.status === 'REJECTED') {
      return (
        <Chip
          size="small"
          color="error"
          icon={<CancelRoundedIcon sx={{ fontSize: 14 }} />}
          label="Rejected"
          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
        />
      );
    }

    if (payment.slaStatus === 'BREACHED') {
      return (
        <Tooltip title="Exceeded 48h SLA guarantee! Immediate verification needed.">
          <Chip
            size="small"
            color="error"
            icon={<ErrorOutlineRoundedIcon sx={{ fontSize: 14 }} />}
            label="SLA BREACHED (>48h)"
            sx={{ fontWeight: 800, fontSize: '0.7rem', animation: 'pulse 1.5s infinite' }}
          />
        </Tooltip>
      );
    }

    if (payment.slaStatus === 'WARNING') {
      return (
        <Tooltip title="Pending for more than 24 hours.">
          <Chip
            size="small"
            color="warning"
            icon={<WarningAmberRoundedIcon sx={{ fontSize: 14 }} />}
            label="SLA WARNING (>24h)"
            sx={{ fontWeight: 800, fontSize: '0.7rem' }}
          />
        </Tooltip>
      );
    }

    return (
      <Chip
        size="small"
        color="info"
        icon={<AccessTimeRoundedIcon sx={{ fontSize: 14 }} />}
        label="Pending (<24h)"
        sx={{ fontWeight: 700, fontSize: '0.7rem' }}
      />
    );
  };

  return (
    <>
      <SEO title="Manual & Crypto Payments Hub — GymPilot Admin" description="Manual verification portal for D17 and Cryptocurrency payments." path="/admin/d17-payments" noIndex />

      <Container maxWidth="xl" sx={{ py: 4 }}>
        {/* Header */}
        <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} gap={2} sx={{ mb: 4 }}>
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
              <Box
                component="img"
                src="/d17-logo.webp"
                alt="D17 Logo"
                sx={{ height: 32, width: 'auto', bgcolor: '#fff', p: 0.5, borderRadius: 1 }}
              />
              <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
                Manual &amp; Crypto Payments
              </Typography>
              {(stats.pendingCount || stats.pending || 0) > 0 && (
                <Chip
                  label={`${stats.pendingCount ?? stats.pending} PENDING`}
                  color="warning"
                  size="small"
                  sx={{
                    fontWeight: 900,
                    fontSize: '0.72rem',
                    height: 24,
                    letterSpacing: 0.5,
                    boxShadow: '0 2px 8px rgba(255,167,38,0.4)',
                  }}
                />
              )}
            </Stack>
            <Typography variant="body2" color="text.secondary">
              Review and triage manual payments (D17, USDT TRC20, BTC, ETH), verify receipt proofs &amp; blockchain hashes, and activate subscriptions or orders.
            </Typography>
          </Box>

          <Stack direction="row" spacing={1.5}>
            <Button
              variant="outlined"
              startIcon={<SettingsRoundedIcon />}
              onClick={() => setSettingsOpen(true)}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Payment Methods &amp; Routing
            </Button>
            <Button
              variant="contained"
              startIcon={<RefreshRoundedIcon />}
              onClick={fetchPayments}
              sx={{ fontWeight: 800, borderRadius: 2 }}
            >
              Refresh
            </Button>
          </Stack>
        </Stack>

        {/* KPI Stat Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: (stats.pendingCount || stats.pending || 0) > 0 ? 'warning.main' : 'divider',
                boxShadow: (stats.pendingCount || stats.pending || 0) > 0 ? '0 4px 20px rgba(255,167,38,0.2)' : 'none',
                bgcolor: (stats.pendingCount || stats.pending || 0) > 0 ? 'rgba(255,167,38,0.05)' : 'background.paper',
                transition: 'all 0.25s ease',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Pending Verification
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'warning.main', mt: 0.5, fontFamily: "'Sora', sans-serif" }}>
                    {stats.pendingCount ?? stats.pending ?? 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,167,38,0.15)', color: 'warning.main', width: 44, height: 44 }}>
                  <AccessTimeRoundedIcon />
                </Avatar>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Approved &amp; Active
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'success.main', mt: 0.5, fontFamily: "'Sora', sans-serif" }}>
                    {stats.approvedCount ?? stats.approved ?? 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(102,187,106,0.15)', color: 'success.main', width: 44, height: 44 }}>
                  <CheckCircleRoundedIcon />
                </Avatar>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    Rejected Proofs
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', mt: 0.5, fontFamily: "'Sora', sans-serif" }}>
                    {stats.rejectedCount ?? stats.rejected ?? 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(239,83,80,0.15)', color: 'error.main', width: 44, height: 44 }}>
                  <CancelRoundedIcon />
                </Avatar>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card elevation={0} sx={{ p: 2.5, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    SLA Warning (&gt;24h)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: '#FFA726', mt: 0.5, fontFamily: "'Sora', sans-serif" }}>
                    {stats.slaWarningCount ?? stats.slaWarnings ?? 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(255,167,38,0.15)', color: '#FFA726', width: 44, height: 44 }}>
                  <WarningAmberRoundedIcon />
                </Avatar>
              </Stack>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={2.4}>
            <Card
              elevation={0}
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: '1px solid',
                borderColor: (stats.slaBreachCount || stats.slaBreached || 0) > 0 ? 'error.main' : 'divider',
                boxShadow: (stats.slaBreachCount || stats.slaBreached || 0) > 0 ? '0 4px 20px rgba(239,83,80,0.2)' : 'none',
                bgcolor: (stats.slaBreachCount || stats.slaBreached || 0) > 0 ? 'rgba(239,83,80,0.05)' : 'background.paper',
                transition: 'all 0.25s ease',
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase' }}>
                    SLA Breached (&gt;48h)
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 900, color: 'error.main', mt: 0.5, fontFamily: "'Sora', sans-serif" }}>
                    {stats.slaBreachCount ?? stats.slaBreached ?? 0}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: 'rgba(239,83,80,0.15)', color: 'error.main', width: 44, height: 44 }}>
                  <ErrorOutlineRoundedIcon />
                </Avatar>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* Filter and Search Bar */}
        <Paper elevation={0} sx={{ p: 2, mb: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                size="small"
                fullWidth
                placeholder="Search ticket #, user, email, TXID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3.2}>
              <Tabs
                value={statusFilter}
                onChange={(_, val) => setStatusFilter(val)}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  minHeight: 38,
                  '& .MuiTab-root': {
                    minHeight: 38,
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    textTransform: 'none',
                    borderRadius: 1.5,
                  },
                }}
              >
                <Tab label="All Status" value="ALL" />
                <Tab label={`Pending (${stats.pendingCount || 0})`} value="PENDING_VERIFICATION" />
                <Tab label="Approved" value="APPROVED" />
                <Tab label="Rejected" value="REJECTED" />
                <Tab label="SLA Warnings" value="SLA_WARNINGS" />
              </Tabs>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Category</InputLabel>
                <Select value={typeFilter} label="Category" onChange={(e) => setTypeFilter(e.target.value)}>
                  <MenuItem value="ALL">All Categories</MenuItem>
                  <MenuItem value="SUBSCRIPTION">GymPilot Subscription</MenuItem>
                  <MenuItem value="AI_CREDIT">AI Credit Pack</MenuItem>
                  <MenuItem value="ORDER">Shop Marketplace Order</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <FormControl size="small" fullWidth>
                <InputLabel>Method</InputLabel>
                <Select value={methodFilter} label="Method" onChange={(e) => setMethodFilter(e.target.value)}>
                  <MenuItem value="ALL">All Methods</MenuItem>
                  <MenuItem value="D17">D17 Mobile</MenuItem>
                  <MenuItem value="USDT_TRC20">USDT (TRC20)</MenuItem>
                  <MenuItem value="BTC">Bitcoin (BTC)</MenuItem>
                  <MenuItem value="ETH">Ethereum (ETH)</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>

        {/* Table of Submissions */}
        <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Table sx={{ minWidth: 1050 }}>
            <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Ticket # &amp; Date</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Athlete Details</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Target</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Method</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Amount</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Proof / TXID</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>SLA / Status</TableCell>
                <TableCell align="right" sx={{ fontWeight: 800, fontSize: '0.75rem', textTransform: 'uppercase' }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <CircularProgress size={36} sx={{ color: 'primary.main', mb: 2 }} />
                    <Typography variant="body2" color="text.secondary">Loading verification queue...</Typography>
                  </TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>No payments found</Typography>
                    <Typography variant="body2" color="text.secondary">No payment tickets match the selected criteria.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((p) => {
                  const isPending = p.status === 'PENDING_VERIFICATION';
                  const isCopied = copiedId === p.id;
                  return (
                    <TableRow
                      key={p.id}
                      hover
                      sx={{
                        bgcolor: isPending ? 'rgba(255,167,38,0.04)' : 'transparent',
                        '&:last-child td, &:last-child th': { border: 0 },
                      }}
                    >
                      {/* Ticket # and Date */}
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Stack direction="row" spacing={0.75} alignItems="center">
                            {isPending && (
                              <Chip
                                label="PENDING"
                                size="small"
                                color="warning"
                                sx={{
                                  fontWeight: 900,
                                  fontSize: '0.62rem',
                                  height: 18,
                                  px: 0.2,
                                }}
                              />
                            )}
                            <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                              {p.ticketNumber}
                            </Typography>
                            <Tooltip title={isCopied ? 'Copied' : 'Copy ticket #'}>
                              <IconButton size="small" onClick={() => handleCopy(p.ticketNumber, p.id)}>
                                {isCopied ? <CheckRoundedIcon sx={{ fontSize: 14, color: 'success.main' }} /> : <ContentCopyRoundedIcon sx={{ fontSize: 14 }} />}
                              </IconButton>
                            </Tooltip>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            {p.createdAt ? new Date(p.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                          </Typography>
                        </Stack>
                      </TableCell>

                      {/* Athlete Details */}
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{ width: 34, height: 34, bgcolor: 'primary.main', color: 'primary.contrastText', fontWeight: 800, fontSize: '0.8rem' }}>
                            {p.userName ? p.userName.charAt(0).toUpperCase() : 'U'}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                              {p.userName || 'Athlete'}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              {p.userEmail}
                            </Typography>
                            {p.senderPhoneNumber && (
                              <Typography variant="caption" sx={{ color: 'primary.main', fontWeight: 600, display: 'block' }}>
                                Sender: {p.senderPhoneNumber}
                              </Typography>
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Target */}
                      <TableCell>
                        {p.type === 'SUBSCRIPTION' ? (
                          <Chip
                            size="small"
                            icon={<CardMembershipRoundedIcon sx={{ fontSize: 14 }} />}
                            label={`${p.subscriptionTier || 'MEMBERSHIP'} (${p.subscriptionDurationDays || 30}d)`}
                            sx={{ fontWeight: 700, bgcolor: 'rgba(198,255,62,0.1)', color: 'primary.main' }}
                          />
                        ) : p.type === 'AI_CREDIT' ? (
                          <Chip
                            size="small"
                            icon={<AutoAwesomeRoundedIcon sx={{ fontSize: 14 }} />}
                            label={`${p.aiCredits || 3} AI Credits`}
                            sx={{ fontWeight: 700, bgcolor: 'rgba(138,124,255,0.15)', color: '#8A7CFF' }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            icon={<ShoppingBagRoundedIcon sx={{ fontSize: 14 }} />}
                            label={`Order #${p.orderNumber || p.orderId?.slice(-6) || 'SHOP'}`}
                            sx={{ fontWeight: 700, bgcolor: 'rgba(33,150,243,0.1)', color: '#2196F3' }}
                          />
                        )}
                      </TableCell>

                      {/* Payment Method */}
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <CoinIcon code={p.paymentMethod || 'D17'} />
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                              {p.paymentMethod === 'USDT_TRC20'
                                ? 'USDT'
                                : p.paymentMethod === 'BTC'
                                ? 'BTC'
                                : p.paymentMethod === 'ETH'
                                ? 'ETH'
                                : 'D17'}
                            </Typography>
                            {p.paymentMethod === 'USDT_TRC20' && (
                              <Chip
                                label="TRC20"
                                size="small"
                                sx={{ fontSize: '0.62rem', height: 16, fontWeight: 800, bgcolor: 'rgba(38,161,123,0.15)', color: '#26A17B' }}
                              />
                            )}
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Amount */}
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                          {Number(p.amount || 0).toFixed(2)} TND
                        </Typography>
                        {p.cryptoAmount && (
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontWeight: 700 }}>
                            ~{p.cryptoAmount} {p.paymentMethod?.replace('_TRC20', '')}
                          </Typography>
                        )}
                        {p.userNotes && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', maxWidth: 140 }} noWrap title={p.userNotes}>
                            Note: {p.userNotes}
                          </Typography>
                        )}
                      </TableCell>

                      {/* Proof Screenshot / TXID */}
                      <TableCell>
                        <Stack spacing={0.75} alignItems="flex-start">
                          {p.screenshotBase64 && (
                            <Box
                              sx={{
                                position: 'relative',
                                width: 48,
                                height: 48,
                                borderRadius: 1.5,
                                overflow: 'hidden',
                                border: '1px solid',
                                borderColor: 'divider',
                                cursor: 'pointer',
                                '&:hover .zoom-overlay': { opacity: 1 },
                              }}
                              onClick={() => setPreviewImage(p.screenshotBase64)}
                            >
                              <Box
                                component="img"
                                src={p.screenshotBase64}
                                alt="Receipt proof"
                                sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                              <Box
                                className="zoom-overlay"
                                sx={{
                                  position: 'absolute',
                                  inset: 0,
                                  bgcolor: 'rgba(0,0,0,0.6)',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  opacity: 0,
                                  transition: 'opacity 0.2s',
                                }}
                              >
                                <ZoomInRoundedIcon sx={{ color: '#fff', fontSize: 18 }} />
                              </Box>
                            </Box>
                          )}

                          {p.txid ? (
                            <Stack direction="row" spacing={0.5} alignItems="center">
                              <Typography
                                variant="caption"
                                sx={{
                                  fontFamily: 'monospace',
                                  fontWeight: 800,
                                  bgcolor: 'rgba(255,255,255,0.05)',
                                  px: 0.8,
                                  py: 0.2,
                                  borderRadius: 1,
                                  border: '1px solid',
                                  borderColor: 'divider',
                                  fontSize: '0.68rem',
                                }}
                              >
                                TX: {p.txid.slice(0, 6)}...{p.txid.slice(-4)}
                              </Typography>
                              <Tooltip title={copiedId === `txid-${p.id}` ? 'Copied' : 'Copy TXID'}>
                                <IconButton size="small" onClick={() => handleCopy(p.txid, `txid-${p.id}`)}>
                                  {copiedId === `txid-${p.id}` ? (
                                    <CheckRoundedIcon sx={{ fontSize: 13, color: 'success.main' }} />
                                  ) : (
                                    <ContentCopyRoundedIcon sx={{ fontSize: 13 }} />
                                  )}
                                </IconButton>
                              </Tooltip>
                              {p.explorerUrl && (
                                <Tooltip title="Verify on Blockchain Explorer">
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={p.explorerUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <OpenInNewRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
                                  </IconButton>
                                </Tooltip>
                              )}
                            </Stack>
                          ) : !p.screenshotBase64 ? (
                            <Typography variant="caption" color="text.secondary">No proof</Typography>
                          ) : null}
                        </Stack>
                      </TableCell>

                      {/* SLA / Status */}
                      <TableCell>
                        <Stack spacing={0.5} alignItems="flex-start">
                          {renderSlaBadge(p)}
                          {isPending && p.createdAt && (
                            <Typography variant="caption" color="text.secondary">
                              Submitted {Math.max(0, Math.floor((new Date() - new Date(p.createdAt)) / (1000 * 60 * 60)))}h ago
                            </Typography>
                          )}
                          {p.rejectionReason && (
                            <Typography variant="caption" color="error.main" sx={{ display: 'block', maxWidth: 160 }} noWrap title={p.rejectionReason}>
                              {p.rejectionReason}
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          {isPending && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleRoundedIcon />}
                                onClick={() => {
                                  setApprovingPayment(p);
                                  setApproveNote('');
                                }}
                                sx={{ fontWeight: 800, borderRadius: 1.5, textTransform: 'none', px: 1.5 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelRoundedIcon />}
                                onClick={() => {
                                  setRejectingPayment(p);
                                  setRejectReason(REJECTION_REASONS[0]);
                                  setRejectCustomNote('');
                                }}
                                sx={{ fontWeight: 700, borderRadius: 1.5, textTransform: 'none' }}
                              >
                                Reject
                              </Button>
                            </>
                          )}

                          <Tooltip title="View Audit Trail">
                            <IconButton
                              size="small"
                              onClick={() => setAuditLogPayment(p)}
                              sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5 }}
                            >
                              <HistoryRoundedIcon fontSize="small" />
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

        {/* Lightbox Modal */}
        <Dialog
          open={!!previewImage}
          onClose={() => setPreviewImage(null)}
          maxWidth="md"
          PaperProps={{
            sx: {
              bgcolor: 'background.paper',
              borderRadius: 3,
              p: 2,
              textAlign: 'center',
            },
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Payment Receipt Screenshot</Typography>
            <IconButton onClick={() => setPreviewImage(null)} size="small">
              <CloseRoundedIcon />
            </IconButton>
          </Box>
          <Box sx={{ maxHeight: '75vh', overflow: 'auto' }}>
            <Box
              component="img"
              src={previewImage}
              alt="Full receipt"
              sx={{ width: '100%', height: 'auto', borderRadius: 2, border: '1px solid', borderColor: 'divider' }}
            />
          </Box>
        </Dialog>

        {/* Approve Confirmation Dialog */}
        <Dialog
          open={!!approvingPayment}
          onClose={() => !actionSubmitting && setApprovingPayment(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            Confirm Payment Approval
          </DialogTitle>
          <DialogContent>
            {approvingPayment && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Alert severity="success" icon={<CheckCircleRoundedIcon />}>
                  Approving will automatically mark this payment as <strong>VERIFIED</strong>,{' '}
                  {approvingPayment.type === 'SUBSCRIPTION'
                    ? `activate the ${approvingPayment.subscriptionTier} membership for ${approvingPayment.subscriptionDurationDays} days,`
                    : approvingPayment.type === 'AI_CREDIT'
                    ? `credit ${approvingPayment.aiCredits || 3} AI scan tokens to athlete's balance,`
                    : `mark Order #${approvingPayment.orderNumber || approvingPayment.orderId} as PAID,`}{' '}
                  and dispatch an approval confirmation email to <strong>{approvingPayment.userEmail}</strong>.
                </Alert>

                <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Ticket #:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{approvingPayment.ticketNumber}</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Athlete:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>{approvingPayment.userName} ({approvingPayment.userEmail})</Typography>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                      <Stack direction="row" spacing={0.75} alignItems="center">
                        <CoinIcon code={approvingPayment.paymentMethod || 'D17'} sx={{ width: 18, height: 18 }} />
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          {approvingPayment.paymentMethod || 'D17'}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" color="text.secondary">Transfer Amount:</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {Number(approvingPayment.amount).toFixed(2)} TND
                        {approvingPayment.cryptoAmount && ` (~${approvingPayment.cryptoAmount} ${approvingPayment.paymentMethod?.replace('_TRC20', '')})`}
                      </Typography>
                    </Stack>
                    {approvingPayment.senderPhoneNumber && (
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Sender Phone:</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{approvingPayment.senderPhoneNumber}</Typography>
                      </Stack>
                    )}
                    {approvingPayment.txid && (
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="body2" color="text.secondary">Transaction Hash (TXID):</Typography>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                          <Typography variant="caption" sx={{ fontFamily: 'monospace', fontWeight: 800 }}>
                            {approvingPayment.txid.slice(0, 10)}...{approvingPayment.txid.slice(-8)}
                          </Typography>
                          {approvingPayment.explorerUrl && (
                            <Tooltip title="View on Blockchain Explorer">
                              <IconButton size="small" component="a" href={approvingPayment.explorerUrl} target="_blank" rel="noopener noreferrer">
                                <OpenInNewRoundedIcon sx={{ fontSize: 15, color: 'primary.main' }} />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Paper>

                <TextField
                  fullWidth
                  size="small"
                  label="Internal Admin Notes (Optional)"
                  placeholder="e.g., Matched in bank / blockchain explorer"
                  value={approveNote}
                  onChange={(e) => setApproveNote(e.target.value)}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button disabled={actionSubmitting} onClick={() => setApprovingPayment(null)} sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="success"
              disabled={actionSubmitting}
              onClick={handleApprove}
              startIcon={actionSubmitting ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRoundedIcon />}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
            >
              {actionSubmitting ? 'Approving...' : 'Confirm Approval'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog
          open={!!rejectingPayment}
          onClose={() => !actionSubmitting && setRejectingPayment(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            Reject Payment Proof
          </DialogTitle>
          <DialogContent>
            {rejectingPayment && (
              <Stack spacing={2} sx={{ mt: 1 }}>
                <Alert severity="warning">
                  Rejecting will decline ticket <strong>{rejectingPayment.ticketNumber}</strong> and dispatch an email instructing the athlete to resubmit proof or contact support.
                </Alert>

                <FormControl fullWidth size="small">
                  <InputLabel>Rejection Reason *</InputLabel>
                  <Select
                    value={rejectReason}
                    label="Rejection Reason *"
                    onChange={(e) => setRejectReason(e.target.value)}
                  >
                    {REJECTION_REASONS.map((r) => (
                      <MenuItem key={r} value={r}>
                        {r}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  label="Detailed Explanation for Athlete (Included in Email)"
                  placeholder="e.g., The screenshot provided does not display the transaction reference clearly, or the TXID could not be found on the blockchain."
                  value={rejectCustomNote}
                  onChange={(e) => setRejectCustomNote(e.target.value)}
                />
              </Stack>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button disabled={actionSubmitting} onClick={() => setRejectingPayment(null)} sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={actionSubmitting}
              onClick={handleReject}
              startIcon={actionSubmitting ? <CircularProgress size={16} color="inherit" /> : <CancelRoundedIcon />}
              sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
            >
              {actionSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Audit Log Drawer/Dialog */}
        <Dialog
          open={!!auditLogPayment}
          onClose={() => setAuditLogPayment(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>Audit Trail — #{auditLogPayment?.ticketNumber}</span>
            <IconButton size="small" onClick={() => setAuditLogPayment(null)}>
              <CloseRoundedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {auditLogPayment?.auditLogs?.length ? (
              <Stack spacing={2} sx={{ mt: 1 }}>
                {auditLogPayment.auditLogs.map((log, index) => (
                  <Paper
                    key={index}
                    variant="outlined"
                    sx={{ p: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.02)', borderColor: 'divider' }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                          size="small"
                          label={log.oldStatus || 'INITIAL'}
                          sx={{ fontSize: '0.68rem', fontWeight: 600 }}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>&rarr;</Typography>
                        <Chip
                          size="small"
                          color={log.newStatus === 'APPROVED' ? 'success' : (log.newStatus === 'REJECTED' ? 'error' : 'warning')}
                          label={log.newStatus}
                          sx={{ fontSize: '0.68rem', fontWeight: 700 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {log.timestamp ? new Date(log.timestamp).toLocaleString() : 'N/A'}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                      Admin / Actor ID: <strong>{log.changedByAdminId || 'System'}</strong>
                    </Typography>
                    {log.reasonOrNotes && (
                      <Typography variant="body2" sx={{ mt: 0.5, fontStyle: 'italic' }}>
                        &ldquo;{log.reasonOrNotes}&rdquo;
                      </Typography>
                    )}
                  </Paper>
                ))}
              </Stack>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ py: 3, textAlign: 'center' }}>
                No status transitions recorded yet for this ticket.
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAuditLogPayment(null)} sx={{ fontWeight: 700 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Payment Methods & Regional Routing Configuration Dialog */}
        <Dialog
          open={settingsOpen}
          onClose={() => !savingMethodCode && setSettingsOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{ sx: { borderRadius: 3.5, p: 2 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            Payment Methods &amp; Regional Routing
          </DialogTitle>
          <DialogContent>
            <Stack spacing={2.5} sx={{ mt: 1 }}>
              <Alert severity="info" sx={{ borderRadius: 2 }}>
                Configure receiving wallet addresses, phone numbers, instructions, and geographical availability (Tunisia vs. International) for all payment methods. These settings apply immediately to both <strong>Membership Checkout</strong> and <strong>Shop Checkout</strong>.
              </Alert>

              {loadingMethods ? (
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <CircularProgress size={32} sx={{ color: 'primary.main', mb: 1.5 }} />
                  <Typography variant="body2" color="text.secondary">Loading payment configurations...</Typography>
                </Box>
              ) : (
                <>
                  {/* Method Switch Tabs */}
                  <Tabs
                    value={selectedMethodTab}
                    onChange={(_, val) => setSelectedMethodTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                      borderBottom: '1px solid',
                      borderColor: 'divider',
                      '& .MuiTab-root': {
                        fontWeight: 800,
                        textTransform: 'none',
                        minHeight: 48,
                      },
                    }}
                  >
                    {adminMethods.map((m) => (
                      <Tab
                        key={m.code}
                        value={m.code}
                        icon={<CoinIcon code={m.code} sx={{ mr: 1 }} />}
                        iconPosition="start"
                        label={m.name}
                      />
                    ))}
                  </Tabs>

                  {/* Active Tab Configuration Panel */}
                  {(() => {
                    const current = adminMethods.find((m) => m.code === selectedMethodTab);
                    if (!current) return null;
                    const isSaving = savingMethodCode === current.code;

                    return (
                      <Stack spacing={2.5} sx={{ pt: 1 }}>
                        {/* Master Global Toggle */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <FormControlLabel
                            control={
                              <Switch
                                checked={current.isActiveGlobal ?? true}
                                onChange={(e) => handleUpdateMethodField(current.code, 'isActiveGlobal', e.target.checked)}
                                color="success"
                              />
                            }
                            label={
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                  Active Globally (Master Switch)
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Enable or disable this payment method entirely across GymPilot.
                                </Typography>
                              </Box>
                            }
                          />
                        </Paper>

                        {/* Regional Routing Controls */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.02)' }}>
                          <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1.5, letterSpacing: 0.5 }}>
                            Regional Availability Routing
                          </Typography>
                          <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={current.isActiveTunisia ?? true}
                                    onChange={(e) => handleUpdateMethodField(current.code, 'isActiveTunisia', e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Box>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <FlagRoundedIcon fontSize="small" sx={{ color: 'error.main' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        Tunisia (Local Athletes)
                                      </Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                      Available to users inside Tunisia.
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                              <FormControlLabel
                                control={
                                  <Switch
                                    checked={current.isActiveInternational ?? true}
                                    onChange={(e) => handleUpdateMethodField(current.code, 'isActiveInternational', e.target.checked)}
                                    color="primary"
                                  />
                                }
                                label={
                                  <Box>
                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                      <PublicRoundedIcon fontSize="small" sx={{ color: 'info.main' }} />
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        International (Outside Tunisia)
                                      </Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                      Available to worldwide athletes outside Tunisia.
                                    </Typography>
                                  </Box>
                                }
                              />
                            </Grid>
                          </Grid>
                        </Paper>

                        {/* Receiving Address / Phone */}
                        <TextField
                          fullWidth
                          size="small"
                          label={current.category === 'CRYPTO' ? 'Official Receiving Wallet Address *' : 'Receiving Phone Number *'}
                          value={current.receivingAddress || ''}
                          onChange={(e) => handleUpdateMethodField(current.code, 'receivingAddress', e.target.value)}
                          helperText={
                            current.category === 'CRYPTO'
                              ? `Official GymPilot wallet address where athletes send ${current.name} payments.`
                              : 'Tunisian mobile phone number linked to D17.'
                          }
                          inputProps={{ style: current.category === 'CRYPTO' ? { fontFamily: 'monospace' } : {} }}
                        />

                        {/* Recipient Name */}
                        <TextField
                          fullWidth
                          size="small"
                          label="Recipient Name / Label *"
                          value={current.recipientName || ''}
                          onChange={(e) => handleUpdateMethodField(current.code, 'recipientName', e.target.value)}
                          helperText="e.g., GymPilot Official"
                        />

                        {/* Network Warning Banner */}
                        {current.category === 'CRYPTO' && (
                          <TextField
                            fullWidth
                            size="small"
                            label="Network Warning / Alert Notice"
                            value={current.warningNotice || ''}
                            onChange={(e) => handleUpdateMethodField(current.code, 'warningNotice', e.target.value)}
                            helperText="High-visibility warning banner shown to athletes before making payment."
                          />
                        )}

                        {/* Instructions */}
                        <TextField
                          fullWidth
                          multiline
                          rows={3}
                          size="small"
                          label="Athlete Instructions *"
                          value={current.instructions || ''}
                          onChange={(e) => handleUpdateMethodField(current.code, 'instructions', e.target.value)}
                          helperText="Step-by-step instructions shown to athlete during checkout."
                        />

                        {/* Explorer URL Prefix */}
                        {current.category === 'CRYPTO' && (
                          <TextField
                            fullWidth
                            size="small"
                            label="Blockchain Explorer URL Prefix"
                            value={current.explorerUrlPrefix || ''}
                            onChange={(e) => handleUpdateMethodField(current.code, 'explorerUrlPrefix', e.target.value)}
                            helperText="e.g., https://tronscan.org/#/transaction/ (used to generate clickable 1-click explorer verification links)"
                            inputProps={{ style: { fontFamily: 'monospace' } }}
                          />
                        )}

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
                          <Button
                            variant="contained"
                            disabled={isSaving}
                            onClick={() => handleSaveMethod(current)}
                            startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : <CheckCircleRoundedIcon />}
                            sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}
                          >
                            {isSaving ? 'Saving...' : `Save ${current.name} Settings`}
                          </Button>
                        </Box>
                      </Stack>
                    );
                  })()}
                </>
              )}
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button disabled={!!savingMethodCode} onClick={() => setSettingsOpen(false)} sx={{ fontWeight: 700 }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Global Toast */}
        <Snackbar
          open={toast.open}
          autoHideDuration={5000}
          onClose={() => setToast((prev) => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            severity={toast.severity}
            onClose={() => setToast((prev) => ({ ...prev, open: false }))}
            sx={{ borderRadius: 2, fontWeight: 700 }}
          >
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </>
  );
}
