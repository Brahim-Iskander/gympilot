import { useEffect, useState, useCallback } from 'react';
import SEO from '../../components/SEO';
import {
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Drawer,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
  CircularProgress,
  Alert,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  SearchRounded,
  BlockRounded,
  CheckCircleOutlineRounded,
  VisibilityRounded,
  AdminPanelSettingsRounded,
  PersonRounded,
  SportsRounded,
  CardMembershipRounded,
  WorkspacePremiumRounded,
  StarRounded,
  LockRounded,
  StorefrontRounded,
  HistoryRounded,
  CloseRounded,
  VerifiedUserRounded,
} from '@mui/icons-material';

import { adminService } from '../../services/adminService';

// ─── helpers ────────────────────────────────────────────────────────────────

const MEMBERSHIP_TIER_OPTIONS = [
  { value: 'FREE',    label: 'Free',    color: '#98A1AC' },
  { value: 'BASIC',   label: 'Basic',   color: '#8A7CFF' },
  { value: 'PREMIUM', label: 'Premium', color: '#FFB800' },
];

const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Active',   color: 'success' },
  { value: 'INACTIVE', label: 'Inactive', color: 'default' },
];

function tierChipSx(tier) {
  const t = (tier || 'FREE').toUpperCase();
  if (t === 'PREMIUM') return { bgcolor: 'rgba(255,184,0,0.15)', color: '#FFB800', border: '1px solid rgba(255,184,0,0.35)' };
  if (t === 'BASIC')   return { bgcolor: 'rgba(138,124,255,0.15)', color: '#8A7CFF', border: '1px solid rgba(138,124,255,0.35)' };
  return { bgcolor: 'rgba(152,161,172,0.15)', color: '#98A1AC', border: '1px solid rgba(152,161,172,0.3)' };
}

function tierIcon(tier) {
  if ((tier || '').toUpperCase() === 'PREMIUM') return <WorkspacePremiumRounded fontSize="small" />;
  if ((tier || '').toUpperCase() === 'BASIC')   return <StarRounded fontSize="small" />;
  return <CardMembershipRounded fontSize="small" />;
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // User detail drawer state
  const [selectedUser, setSelectedUser] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Capability switches state in drawer
  const [drawerIsCoach, setDrawerIsCoach] = useState(false);
  const [drawerIsSeller, setDrawerIsSeller] = useState(false);
  const [drawerIsAdmin, setDrawerIsAdmin] = useState(false);
  const [drawerNotes, setDrawerNotes] = useState('');

  // Inline update loading states
  const [updatingCapabilities, setUpdatingCapabilities] = useState(false);
  const [updatingMembership, setUpdatingMembership] = useState(false);
  const [drawerTierValue, setDrawerTierValue] = useState('');
  const [drawerStatusValue, setDrawerStatusValue] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Ban confirmation dialog state
  const [banTarget, setBanTarget] = useState(null);
  const [banDialogOpen, setBanDialogOpen] = useState(false);

  // Sensitive Role Confirmation dialog state
  const [pendingPromotion, setPendingPromotion] = useState(null);
  const [confirmRoleOpen, setConfirmRoleOpen] = useState(false);

  // Audit Logs drawer state
  const [auditDrawerOpen, setAuditDrawerOpen] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers({ search: searchQuery, page, size: rowsPerPage });
      setUsers(res.content ?? []);
      setTotalElements(res.totalElements ?? 0);
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, page, rowsPerPage]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setPage(0);
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    const roles = user.roles || [user.role || 'USER'];
    setDrawerIsAdmin(user.isAdmin || roles.includes('ADMIN'));
    setDrawerIsCoach(user.isCoach || roles.includes('COACH'));
    setDrawerIsSeller(user.isSeller || roles.includes('SELLER'));
    setDrawerNotes('');
    setDrawerTierValue(user.membershipTier ?? 'FREE');
    setDrawerStatusValue(user.membershipStatus ?? 'INACTIVE');
    setUpdateError('');
    setDrawerOpen(true);
  };

  // ── Capability toggles & save ────────────────────────────────────────────
  const handleSaveCapabilities = async () => {
    if (!selectedUser) return;

    // Check if promoting to Admin
    const wasAdmin = selectedUser.isAdmin || (selectedUser.roles || []).includes('ADMIN');
    if (drawerIsAdmin && !wasAdmin) {
      setPendingPromotion({ isCoach: drawerIsCoach, isSeller: drawerIsSeller, isAdmin: true, notes: drawerNotes });
      setConfirmRoleOpen(true);
      return;
    }

    applyCapabilities({ isCoach: drawerIsCoach, isSeller: drawerIsSeller, isAdmin: drawerIsAdmin, notes: drawerNotes });
  };

  const applyCapabilities = async (payload) => {
    try {
      setUpdatingCapabilities(true);
      setUpdateError('');
      const updated = await adminService.updateUserCapabilities(selectedUser.id, payload);
      setSelectedUser(updated);
      fetchUsers();
    } catch (err) {
      setUpdateError('Failed to update capabilities. Please try again.');
      console.error(err);
    } finally {
      setUpdatingCapabilities(false);
      setConfirmRoleOpen(false);
      setPendingPromotion(null);
    }
  };

  // ── Audit Logs ───────────────────────────────────────────────────────────
  const handleOpenAuditLogs = async () => {
    setAuditDrawerOpen(true);
    try {
      setAuditLoading(true);
      const res = await adminService.getRoleAuditLogs({ page: 0, size: 25 });
      setAuditLogs(res.content || []);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setAuditLoading(false);
    }
  };

  // ── Membership update ────────────────────────────────────────────────────
  const handleApplyMembership = async () => {
    if (!selectedUser) return;
    const noChange =
      drawerTierValue === selectedUser.membershipTier &&
      drawerStatusValue === selectedUser.membershipStatus;
    if (noChange) return;
    try {
      setUpdatingMembership(true);
      setUpdateError('');
      const updated = await adminService.updateUserMembership(selectedUser.id, {
        membershipTier: drawerTierValue,
        membershipStatus: drawerStatusValue,
      });
      setSelectedUser(updated);
      fetchUsers();
    } catch (err) {
      setUpdateError('Failed to update membership. Please try again.');
      console.error(err);
    } finally {
      setUpdatingMembership(false);
    }
  };

  // ── Ban / Unban ──────────────────────────────────────────────────────────
  const handleBanTogglePrompt = (user) => {
    setBanTarget(user);
    setBanDialogOpen(true);
  };

  const handleConfirmBanToggle = async () => {
    if (!banTarget) return;
    try {
      const updated = banTarget.banned
        ? await adminService.unbanUser(banTarget.id)
        : await adminService.banUser(banTarget.id);
      fetchUsers();
      if (selectedUser?.id === banTarget.id) setSelectedUser(updated);
    } catch (err) {
      console.error('Failed to toggle ban status', err);
    } finally {
      setBanDialogOpen(false);
      setBanTarget(null);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters>
      <SEO
        title="User & Role Management — Admin"
        description="Search, inspect, and manage GymPilot user capabilities (Coach, Seller, Admin) and membership tiers."
        path="/admin/users"
        noIndex
      />

      {/* Page Title & Actions */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Manage multi-capability roles (Coach, Seller, Admin), memberships, and view role audit logs.
          </Typography>
        </Box>

        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ width: { xs: '100%', sm: 'auto' } }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<HistoryRounded />}
            onClick={handleOpenAuditLogs}
            sx={{ fontWeight: 700, borderRadius: 2 }}
          >
            Audit Log History
          </Button>

          <TextField
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={handleSearchChange}
            size="small"
            sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
          />
        </Stack>
      </Stack>

      {/* Users Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Capabilities & Roles</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Membership</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: 'primary.main' }} />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No users found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => {
                  const roles = user.roles || [user.role || 'USER'];
                  return (
                    <TableRow key={user.id} hover>
                      {/* User Avatar + Email */}
                      <TableCell>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Avatar sx={{
                            bgcolor: user.isAdmin || roles.includes('ADMIN') ? 'error.main' : user.isCoach || roles.includes('COACH') ? '#8A7CFF' : user.isSeller || roles.includes('SELLER') ? '#00E676' : 'primary.main',
                            color: '#0A0C0F', fontWeight: 700, width: 36, height: 36,
                          }}>
                            {user.firstName?.charAt(0)?.toUpperCase()}
                          </Avatar>
                          <Box>
                            <Typography variant="body2" fontWeight={700}>{user.firstName} {user.lastName}</Typography>
                            <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Capabilities Multi-Chips */}
                      <TableCell>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" gap={0.5}>
                          {(user.isAdmin || roles.includes('ADMIN')) && (
                            <Chip
                              icon={<AdminPanelSettingsRounded sx={{ fontSize: '14px !important' }} />}
                              label="Admin"
                              size="small"
                              color="error"
                              sx={{ fontWeight: 800, height: 22, fontSize: '0.68rem' }}
                            />
                          )}
                          {(user.isCoach || roles.includes('COACH')) && (
                            <Chip
                              icon={<SportsRounded sx={{ fontSize: '14px !important' }} />}
                              label="Coach"
                              size="small"
                              sx={{ bgcolor: 'rgba(138,124,255,0.18)', color: '#8A7CFF', fontWeight: 800, height: 22, fontSize: '0.68rem', border: '1px solid rgba(138,124,255,0.35)' }}
                            />
                          )}
                          {(user.isSeller || roles.includes('SELLER')) && (
                            <Chip
                              icon={<StorefrontRounded sx={{ fontSize: '14px !important' }} />}
                              label="Seller"
                              size="small"
                              sx={{ bgcolor: 'rgba(0,230,118,0.15)', color: '#00E676', fontWeight: 800, height: 22, fontSize: '0.68rem', border: '1px solid rgba(0,230,118,0.35)' }}
                            />
                          )}
                          {!user.isAdmin && !user.isCoach && !user.isSeller && !roles.includes('ADMIN') && !roles.includes('COACH') && !roles.includes('SELLER') && (
                            <Chip
                              icon={<PersonRounded sx={{ fontSize: '14px !important' }} />}
                              label="User"
                              size="small"
                              variant="outlined"
                              sx={{ fontWeight: 600, height: 22, fontSize: '0.68rem' }}
                            />
                          )}
                        </Stack>
                      </TableCell>

                      {/* Membership Tier + Status */}
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Chip
                            icon={tierIcon(user.membershipTier)}
                            label={user.membershipTier ?? 'FREE'}
                            size="small"
                            variant="outlined"
                            sx={{ fontWeight: 700, height: 22, fontSize: '0.68rem', ...tierChipSx(user.membershipTier) }}
                          />
                          <Chip
                            label={user.membershipStatus ?? 'INACTIVE'}
                            size="small"
                            color={user.membershipStatus === 'ACTIVE' ? 'success' : 'default'}
                            variant="outlined"
                            sx={{ fontWeight: 700, height: 20, fontSize: '0.65rem' }}
                          />
                        </Stack>
                      </TableCell>

                      {/* Account Status */}
                      <TableCell>
                        {user.banned
                          ? <Chip label="Banned" size="small" color="error" sx={{ fontWeight: 700, height: 22 }} />
                          : <Chip label="Active" size="small" color="success" variant="outlined" sx={{ fontWeight: 700, height: 22 }} />
                        }
                      </TableCell>

                      {/* Joined */}
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </Typography>
                      </TableCell>

                      {/* Actions */}
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <Tooltip title="Manage Roles & Capabilities">
                            <IconButton size="small" onClick={() => handleViewDetails(user)}>
                              <VisibilityRounded fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {user.role !== 'ADMIN' && (
                            <Tooltip title={user.banned ? 'Unban Account' : 'Ban Account'}>
                              <IconButton
                                size="small"
                                color={user.banned ? 'success' : 'error'}
                                onClick={() => handleBanTogglePrompt(user)}
                              >
                                {user.banned ? <CheckCircleOutlineRounded fontSize="small" /> : <BlockRounded fontSize="small" />}
                              </IconButton>
                            </Tooltip>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={totalElements}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      {/* ── User Details & Multi-Role Management Drawer ───────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 440 }, p: 3, overflowY: 'auto' } }}
      >
        {selectedUser && (
          <Stack spacing={3}>
            {/* Header */}
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>User Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Configure independent capabilities (Coach, Seller, Admin) and membership tier.
              </Typography>
            </Box>

            {/* Avatar + Name */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{
                width: 56, height: 56,
                bgcolor: drawerIsAdmin ? 'error.main' : drawerIsCoach ? '#8A7CFF' : drawerIsSeller ? '#00E676' : 'primary.main',
                fontSize: '1.4rem', fontWeight: 800,
              }}>
                {selectedUser.firstName?.charAt(0)?.toUpperCase()}
              </Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {selectedUser.firstName} {selectedUser.lastName}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  {selectedUser.email}
                </Typography>
              </Box>
            </Stack>

            {updateError && (
              <Alert severity="error" onClose={() => setUpdateError('')}>{updateError}</Alert>
            )}

            {/* ── Independent Capabilities Management ── */}
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2.5, bgcolor: 'background.paper' }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <VerifiedUserRounded fontSize="small" sx={{ color: 'primary.main' }} /> Multi-Role Capabilities
              </Typography>

              <Stack spacing={2} sx={{ mb: 2.5 }}>
                {/* Coach Switch */}
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: drawerIsCoach ? 'rgba(138,124,255,0.4)' : 'divider', bgcolor: drawerIsCoach ? 'rgba(138,124,255,0.05)' : 'transparent' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={drawerIsCoach}
                        onChange={(e) => setDrawerIsCoach(e.target.checked)}
                        color="secondary"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={700}>Coach Capability</Typography>
                        <Typography variant="caption" color="text.secondary">Access to Coach Live Desk & direct athlete inquiries.</Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Seller Switch */}
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: drawerIsSeller ? 'rgba(0,230,118,0.4)' : 'divider', bgcolor: drawerIsSeller ? 'rgba(0,230,118,0.05)' : 'transparent' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={drawerIsSeller}
                        onChange={(e) => setDrawerIsSeller(e.target.checked)}
                        sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: '#00E676' }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { backgroundColor: '#00E676' } }}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={700}>Seller / Marketplace Vendor</Typography>
                        <Typography variant="caption" color="text.secondary">List supplements/equipment and fulfill orders in Seller Dashboard.</Typography>
                      </Box>
                    }
                  />
                </Box>

                {/* Admin Switch */}
                <Box sx={{ p: 1.5, borderRadius: 2, border: '1px solid', borderColor: drawerIsAdmin ? 'rgba(255,82,82,0.4)' : 'divider', bgcolor: drawerIsAdmin ? 'rgba(255,82,82,0.05)' : 'transparent' }}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={drawerIsAdmin}
                        onChange={(e) => setDrawerIsAdmin(e.target.checked)}
                        color="error"
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="body2" fontWeight={700} color={drawerIsAdmin ? 'error.main' : 'inherit'}>Super Admin Privileges</Typography>
                        <Typography variant="caption" color="text.secondary">Full control center access, partner and user management.</Typography>
                      </Box>
                    }
                  />
                </Box>
              </Stack>

              <TextField
                label="Audit Reason / Notes (Optional)"
                placeholder="e.g., Granted verified supplement vendor status"
                size="small"
                fullWidth
                multiline
                rows={2}
                value={drawerNotes}
                onChange={(e) => setDrawerNotes(e.target.value)}
                sx={{ mb: 2 }}
              />

              <Button
                variant="contained"
                fullWidth
                disabled={updatingCapabilities}
                onClick={handleSaveCapabilities}
                sx={{ bgcolor: 'primary.main', color: '#0A0C0F', fontWeight: 800, borderRadius: 2 }}
              >
                {updatingCapabilities ? <CircularProgress size={18} /> : 'Save Role Capabilities'}
              </Button>
            </Paper>

            {/* ── Membership Management ── */}
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardMembershipRounded fontSize="small" /> Membership Tier
              </Typography>

              <Stack spacing={2}>
                <FormControl fullWidth size="small">
                  <InputLabel>Membership Tier</InputLabel>
                  <Select
                    value={drawerTierValue}
                    label="Membership Tier"
                    onChange={(e) => setDrawerTierValue(e.target.value)}
                  >
                    {MEMBERSHIP_TIER_OPTIONS.map((t) => (
                      <MenuItem key={t.value} value={t.value}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {tierIcon(t.value)}
                          <span style={{ color: t.color, fontWeight: 700 }}>{t.label}</span>
                        </Stack>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth size="small">
                  <InputLabel>Membership Status</InputLabel>
                  <Select
                    value={drawerStatusValue}
                    label="Membership Status"
                    onChange={(e) => setDrawerStatusValue(e.target.value)}
                  >
                    {MEMBERSHIP_STATUS_OPTIONS.map((s) => (
                      <MenuItem key={s.value} value={s.value}>
                        <Chip label={s.label} size="small" color={s.color} variant="outlined" sx={{ fontWeight: 700 }} />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleApplyMembership}
                  disabled={updatingMembership}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  {updatingMembership ? <CircularProgress size={18} /> : 'Apply Membership Changes'}
                </Button>
              </Stack>
            </Paper>

            {/* Ban / Unban */}
            {selectedUser.role !== 'ADMIN' && (
              <Button
                variant="outlined"
                color={selectedUser.banned ? 'success' : 'error'}
                startIcon={selectedUser.banned ? <CheckCircleOutlineRounded /> : <BlockRounded />}
                onClick={() => handleBanTogglePrompt(selectedUser)}
                fullWidth
                sx={{ borderRadius: 2, fontWeight: 700 }}
              >
                {selectedUser.banned ? 'Unban Account' : 'Ban Account'}
              </Button>
            )}
          </Stack>
        )}
      </Drawer>

      {/* ── Audit Logs Drawer ────────────────────────────────────────────── */}
      <Drawer
        anchor="right"
        open={auditDrawerOpen}
        onClose={() => setAuditDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 480 }, p: 3, overflowY: 'auto' } }}
      >
        <Stack spacing={2.5}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>
              Role Change Audit Log
            </Typography>
            <IconButton size="small" onClick={() => setAuditDrawerOpen(false)}>
              <CloseRounded />
            </IconButton>
          </Box>
          <Typography variant="body2" color="text.secondary">
            Permanent record of administrative role assignments and promotions.
          </Typography>

          <Divider />

          {auditLoading ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <CircularProgress size={28} sx={{ color: 'primary.main' }} />
            </Box>
          ) : auditLogs.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 6 }}>
              No audit logs recorded yet.
            </Typography>
          ) : (
            <Stack spacing={2}>
              {auditLogs.map((log) => (
                <Paper key={log.id} elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider', bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                    <Chip
                      label={log.action}
                      size="small"
                      color={log.action.includes('ADMIN') ? 'error' : log.action.includes('SELLER') ? 'success' : 'secondary'}
                      sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={700}>
                    Target: {log.targetUserName || log.targetUserEmail}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    Changed by: {log.changedByAdminEmail}
                  </Typography>
                  {log.notes && (
                    <Typography variant="caption" color="primary.main" sx={{ display: 'block', mt: 0.5 }}>
                      Notes: {log.notes}
                    </Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Drawer>

      {/* ── Sensitive Promotion Confirmation Dialog ──────────────────────── */}
      <Dialog open={confirmRoleOpen} onClose={() => setConfirmRoleOpen(false)}>
        <DialogTitle fontWeight={700} sx={{ color: 'error.main' }}>
          Confirm Admin Privilege Promotion
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            You are granting full <strong>ADMIN</strong> permissions to <strong>{selectedUser?.email}</strong>.
            They will have unrestricted access to all control center settings and user data.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setConfirmRoleOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={() => applyCapabilities(pendingPromotion)}>
            Confirm Admin Access
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Ban Confirmation Dialog ──────────────────────────────────────── */}
      <Dialog open={banDialogOpen} onClose={() => setBanDialogOpen(false)}>
        <DialogTitle fontWeight={700}>
          {banTarget?.banned ? 'Confirm Account Unban' : 'Confirm Account Ban'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {banTarget?.banned
              ? `Are you sure you want to unban ${banTarget?.firstName} ${banTarget?.lastName} (${banTarget?.email})?`
              : `Are you sure you want to ban ${banTarget?.firstName} ${banTarget?.lastName} (${banTarget?.email})?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setBanDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color={banTarget?.banned ? 'success' : 'error'} onClick={handleConfirmBanToggle}>
            {banTarget?.banned ? 'Unban' : 'Ban User'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
