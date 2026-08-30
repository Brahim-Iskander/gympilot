import { useEffect, useState, useCallback } from 'react';
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
} from '@mui/icons-material';

import { adminService } from '../../services/adminService';

// ─── helpers ────────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { value: 'USER',  label: 'Simple User', icon: <PersonRounded fontSize="small" />,          color: 'default' },
  { value: 'COACH', label: 'Coach',       icon: <SportsRounded fontSize="small" />,           color: 'secondary' },
  { value: 'ADMIN', label: 'Admin',       icon: <AdminPanelSettingsRounded fontSize="small" />, color: 'error' },
];

const MEMBERSHIP_TIER_OPTIONS = [
  { value: 'FREE',    label: 'Free',    color: '#98A1AC' },
  { value: 'BASIC',   label: 'Basic',   color: '#8A7CFF' },
  { value: 'PREMIUM', label: 'Premium', color: '#FFB800' },
];

const MEMBERSHIP_STATUS_OPTIONS = [
  { value: 'ACTIVE',   label: 'Active',   color: 'success' },
  { value: 'INACTIVE', label: 'Inactive', color: 'default' },
];

function roleChipColor(role) {
  if (role === 'ADMIN') return 'error';
  if (role === 'COACH') return 'secondary';
  return 'default';
}

function roleIcon(role) {
  if (role === 'ADMIN') return <AdminPanelSettingsRounded fontSize="small" />;
  if (role === 'COACH') return <SportsRounded fontSize="small" />;
  return <PersonRounded fontSize="small" />;
}

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

// ─── component ──────────────────────────────────────────────────────────────

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

  // Inline update loading states
  const [updatingRole, setUpdatingRole] = useState(false);
  const [updatingMembership, setUpdatingMembership] = useState(false);
  const [drawerRoleValue, setDrawerRoleValue] = useState('');
  const [drawerTierValue, setDrawerTierValue] = useState('');
  const [drawerStatusValue, setDrawerStatusValue] = useState('');
  const [updateError, setUpdateError] = useState('');

  // Ban confirmation dialog state
  const [banTarget, setBanTarget] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

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
    setDrawerRoleValue(user.role ?? 'USER');
    setDrawerTierValue(user.membershipTier ?? 'FREE');
    setDrawerStatusValue(user.membershipStatus ?? 'INACTIVE');
    setUpdateError('');
    setDrawerOpen(true);
  };

  // ── Role update ──────────────────────────────────────────────────────────
  const handleApplyRole = async () => {
    if (!selectedUser || drawerRoleValue === selectedUser.role) return;
    try {
      setUpdatingRole(true);
      setUpdateError('');
      const updated = await adminService.updateUserRole(selectedUser.id, drawerRoleValue);
      setSelectedUser(updated);
      fetchUsers();
    } catch (err) {
      setUpdateError('Failed to update role. Please try again.');
      console.error(err);
    } finally {
      setUpdatingRole(false);
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
    setDialogOpen(true);
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
      setDialogOpen(false);
      setBanTarget(null);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Container maxWidth="xl" disableGutters>

      {/* Page Title & Search */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <Box>
          <Typography variant="h4" fontWeight={800}>User Management</Typography>
          <Typography variant="body2" color="text.secondary">
            Search, inspect, and manage GymPilot user accounts, memberships, and roles
          </Typography>
        </Box>

        <TextField
          placeholder="Search by name or email..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          sx={{ width: { xs: '100%', sm: 320 }, '& .MuiOutlinedInput-root': { bgcolor: 'background.paper', borderRadius: 2.5 } }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchRounded fontSize="small" sx={{ color: 'text.secondary' }} />
              </InputAdornment>
            ),
          }}
        />
      </Stack>

      {/* Users Table */}
      <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
        <TableContainer>
          <Table sx={{ minWidth: 700 }}>
            <TableHead sx={{ bgcolor: 'background.paper' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>User</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Membership</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Joined</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Last Login</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">Loading users...</Typography>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    <Typography color="text.secondary">No users found matching your search.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.id} hover>
                    {/* User */}
                    <TableCell>
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <Avatar sx={{
                          bgcolor: user.role === 'ADMIN' ? 'error.main' : user.role === 'COACH' ? '#8A7CFF' : 'primary.main',
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

                    {/* Role */}
                    <TableCell>
                      <Chip
                        icon={roleIcon(user.role)}
                        label={user.role ?? 'USER'}
                        size="small"
                        color={roleChipColor(user.role)}
                        variant="outlined"
                        sx={{ fontWeight: 700, height: 24 }}
                      />
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

                    {/* Last Login */}
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
                      </Typography>
                    </TableCell>

                    {/* Actions */}
                    <TableCell align="right">
                      <Stack direction="row" spacing={1} justifyContent="flex-end">
                        <Tooltip title="View & Manage">
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
                ))
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

      {/* ── User Details & Management Drawer ─────────────────────────────── */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: { xs: '100%', sm: 400 }, p: 3, overflowY: 'auto' } }}
      >
        {selectedUser && (
          <Stack spacing={3}>

            {/* Header */}
            <Box>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 0.5 }}>User Management</Typography>
              <Typography variant="body2" color="text.secondary">
                Edit role, membership tier and status for this user.
              </Typography>
            </Box>

            {/* Avatar + Name */}
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{
                width: 56, height: 56,
                bgcolor: selectedUser.role === 'ADMIN' ? 'error.main' : selectedUser.role === 'COACH' ? '#8A7CFF' : 'primary.main',
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

            {/* Error Alert */}
            {updateError && (
              <Alert severity="error" onClose={() => setUpdateError('')}>{updateError}</Alert>
            )}

            {/* Info Panel */}
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Stack spacing={1.5}>
                <Box>
                  <Typography variant="caption" color="text.secondary">User ID</Typography>
                  <Typography variant="body2" fontWeight={600} sx={{ wordBreak: 'break-all' }}>{selectedUser.id}</Typography>
                </Box>
                <Divider />
                <Box>
                  <Typography variant="caption" color="text.secondary">Account Status</Typography>
                  <Typography variant="body2" fontWeight={700} color={selectedUser.banned ? 'error.main' : 'success.main'}>
                    {selectedUser.banned ? 'Banned' : 'Active'}
                  </Typography>
                </Box>
                {selectedUser.banned && selectedUser.bannedAt && (
                  <Box>
                    <Typography variant="caption" color="text.secondary">Banned At</Typography>
                    <Typography variant="body2">{new Date(selectedUser.bannedAt).toLocaleString()}</Typography>
                  </Box>
                )}
                <Box>
                  <Typography variant="caption" color="text.secondary">Registered</Typography>
                  <Typography variant="body2">{selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : 'N/A'}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Last Login</Typography>
                  <Typography variant="body2">{selectedUser.lastLoginAt ? new Date(selectedUser.lastLoginAt).toLocaleString() : 'Never'}</Typography>
                </Box>
              </Stack>
            </Paper>

            {/* ── Role Management ── */}
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AdminPanelSettingsRounded fontSize="small" /> User Role
              </Typography>

              <FormControl fullWidth size="small" disabled={selectedUser.role === 'ADMIN' || updatingRole}>
                <InputLabel>Role</InputLabel>
                <Select
                  value={drawerRoleValue}
                  label="Role"
                  onChange={(e) => setDrawerRoleValue(e.target.value)}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <MenuItem key={r.value} value={r.value}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {r.icon}
                        <span>{r.label}</span>
                      </Stack>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, mb: 2 }}>
                {drawerRoleValue === 'COACH'
                  ? 'Coach role grants access to the coach panel and live chat responses.'
                  : drawerRoleValue === 'ADMIN'
                  ? 'Admin role grants full access. Cannot be changed here.'
                  : 'Standard user role with access to all regular features.'}
              </Typography>

              <Button
                variant="contained"
                fullWidth
                onClick={handleApplyRole}
                disabled={updatingRole || drawerRoleValue === selectedUser.role || selectedUser.role === 'ADMIN'}
                sx={{ bgcolor: '#8A7CFF', color: '#fff', fontWeight: 700, '&:hover': { bgcolor: '#7362ff' } }}
              >
                {updatingRole ? <CircularProgress size={18} sx={{ color: '#fff' }} /> : 'Apply Role Change'}
              </Button>
            </Paper>

            {/* ── Membership Management ── */}
            <Paper elevation={0} sx={{ p: 2.5, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <CardMembershipRounded fontSize="small" /> Membership
              </Typography>

              {/* Current membership badge */}
              <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
                <Chip
                  icon={tierIcon(selectedUser.membershipTier)}
                  label={selectedUser.membershipTier ?? 'FREE'}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 700, ...tierChipSx(selectedUser.membershipTier) }}
                />
                <Chip
                  label={selectedUser.membershipStatus ?? 'INACTIVE'}
                  size="small"
                  color={selectedUser.membershipStatus === 'ACTIVE' ? 'success' : 'default'}
                  variant="outlined"
                  sx={{ fontWeight: 700 }}
                />
                {selectedUser.hasActiveMembership && (
                  <Chip label="Live Chat Unlocked" size="small" sx={{ bgcolor: 'rgba(198,255,62,0.15)', color: '#C6FF3E', border: '1px solid rgba(198,255,62,0.3)', fontWeight: 700 }} />
                )}
              </Stack>

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

                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                  {drawerTierValue !== 'FREE' && drawerStatusValue === 'ACTIVE' ? (
                    <>
                      <CheckCircleOutlineRounded sx={{ fontSize: 16, color: '#00E676' }} />
                      This user will have access to live coach chat.
                    </>
                  ) : (
                    <>
                      <LockRounded sx={{ fontSize: 16, color: 'text.secondary' }} />
                      This user will only have access to AI support chat.
                    </>
                  )}
                </Typography>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleApplyMembership}
                  disabled={
                    updatingMembership ||
                    (drawerTierValue === selectedUser.membershipTier && drawerStatusValue === selectedUser.membershipStatus)
                  }
                  sx={{ bgcolor: 'primary.main', color: '#000', fontWeight: 700, '&:hover': { bgcolor: 'primary.dark' } }}
                >
                  {updatingMembership ? <CircularProgress size={18} /> : 'Apply Membership Changes'}
                </Button>
              </Stack>
            </Paper>

            {/* ── Ban / Unban ── */}
            {selectedUser.role !== 'ADMIN' && (
              <Button
                variant="outlined"
                color={selectedUser.banned ? 'success' : 'error'}
                startIcon={selectedUser.banned ? <CheckCircleOutlineRounded /> : <BlockRounded />}
                onClick={() => handleBanTogglePrompt(selectedUser)}
                fullWidth
              >
                {selectedUser.banned ? 'Unban Account' : 'Ban Account'}
              </Button>
            )}

          </Stack>
        )}
      </Drawer>

      {/* ── Ban Confirmation Dialog ─────────────────────────────────────── */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle fontWeight={700}>
          {banTarget?.banned ? 'Confirm Account Unban' : 'Confirm Account Ban'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {banTarget?.banned
              ? `Are you sure you want to unban ${banTarget?.firstName} ${banTarget?.lastName} (${banTarget?.email})? They will regain access to GymPilot immediately.`
              : `Are you sure you want to ban ${banTarget?.firstName} ${banTarget?.lastName} (${banTarget?.email})? They will be immediately blocked from logging in.`}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color={banTarget?.banned ? 'success' : 'error'} onClick={handleConfirmBanToggle}>
            {banTarget?.banned ? 'Unban' : 'Ban User'}
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}
