import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Stack,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Switch,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
} from '@mui/material';
import {
  AddRounded,
  DeleteRounded,
  EditRounded,
  CampaignRounded,
  CheckCircleRounded,
  WarningAmberRounded,
  ErrorRounded,
  ArrowForwardRounded,
  CloseRounded,
  LinkRounded,
  AccessTimeRounded,
  TimerOffRounded,
} from '@mui/icons-material';
import { announcementService } from '../../services/announcementService';

const TYPES = [
  { value: 'SUCCESS', label: 'Success (Green)', color: '#2ecc71' },
  { value: 'WARNING', label: 'Warning (Yellow)', color: '#f1c40f' },
  { value: 'DANGER', label: 'Danger (Red)', color: '#e74c3c' },
];

const DURATION_PRESETS = [
  { value: 'never', label: 'Permanent (No expiration)' },
  { value: '1h', label: '1 Hour' },
  { value: '24h', label: '24 Hours (1 Day)' },
  { value: '3d', label: '3 Days' },
  { value: '7d', label: '7 Days (1 Week)' },
  { value: 'custom', label: 'Custom Date & Time...' },
];

function toLocalDatetimeString(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatExpiration(expiresAt) {
  if (!expiresAt) {
    return {
      label: 'Permanent',
      isExpired: false,
      color: 'default',
      tooltip: 'Always active until manually turned off',
    };
  }
  const exp = new Date(expiresAt);
  const now = new Date();
  const diffMs = exp - now;

  if (diffMs <= 0) {
    return {
      label: 'Expired',
      isExpired: true,
      color: 'error',
      tooltip: `Expired on ${exp.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
    };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  let relLabel = '';
  if (diffDays > 1) {
    relLabel = `Expires in ${diffDays}d`;
  } else if (diffDays === 1) {
    relLabel = 'Expires in 1d';
  } else if (diffHours > 1) {
    relLabel = `Expires in ${diffHours}h`;
  } else {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    relLabel = `Expires in ${diffMins}m`;
  }

  return {
    label: relLabel,
    isExpired: false,
    color: diffHours < 12 ? 'warning' : 'info',
    tooltip: `Active until ${exp.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
  };
}

const TYPE_CHIP = {
  SUCCESS: { label: 'Success', color: '#2ecc71', bg: 'rgba(46,204,113,0.14)' },
  WARNING: { label: 'Warning', color: '#f1c40f', bg: 'rgba(241,196,15,0.14)' },
  DANGER: { label: 'Danger', color: '#e74c3c', bg: 'rgba(231,76,60,0.14)' },
};

const TYPE_PREVIEW = {
  SUCCESS: {
    icon: <CheckCircleRounded sx={{ fontSize: 20 }} />,
    bg: 'linear-gradient(135deg, rgba(46,204,113,0.15) 0%, rgba(39,174,96,0.10) 100%)',
    border: 'rgba(46,204,113,0.35)',
    color: '#2ecc71',
    btnBg: 'rgba(46,204,113,0.18)',
  },
  WARNING: {
    icon: <WarningAmberRounded sx={{ fontSize: 20 }} />,
    bg: 'linear-gradient(135deg, rgba(241,196,15,0.15) 0%, rgba(243,156,18,0.10) 100%)',
    border: 'rgba(241,196,15,0.35)',
    color: '#f1c40f',
    btnBg: 'rgba(241,196,15,0.18)',
  },
  DANGER: {
    icon: <ErrorRounded sx={{ fontSize: 20 }} />,
    bg: 'linear-gradient(135deg, rgba(231,76,60,0.15) 0%, rgba(192,57,43,0.10) 100%)',
    border: 'rgba(231,76,60,0.35)',
    color: '#e74c3c',
    btnBg: 'rgba(231,76,60,0.18)',
  },
};

const EMPTY_FORM = {
  message: '',
  type: 'SUCCESS',
  linkUrl: '',
  linkLabel: '',
  active: true,
  durationPreset: 'never',
  expiresAt: '',
};

export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = create, object = edit
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [snack, setSnack] = useState({ open: false, msg: '', severity: 'success' });

  const fetchAll = useCallback(() => {
    setLoading(true);
    announcementService
      .getAll()
      .then((data) => setAnnouncements(data || []))
      .catch(() => showSnack('Failed to load announcements', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const showSnack = (msg, severity = 'success') => setSnack({ open: true, msg, severity });

  // ── Dialog Handlers ────────────────────────────────────────

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setDialogOpen(true);
  };

  const openEdit = (ann) => {
    setEditing(ann);
    let preset = 'never';
    let expiresAt = '';
    if (ann.expiresAt) {
      preset = 'custom';
      expiresAt = toLocalDatetimeString(ann.expiresAt);
    }
    setForm({
      message: ann.message || '',
      type: ann.type || 'SUCCESS',
      linkUrl: ann.linkUrl || '',
      linkLabel: ann.linkLabel || '',
      active: ann.active,
      durationPreset: preset,
      expiresAt: expiresAt,
    });
    setDialogOpen(true);
  };

  const handlePresetChange = (preset) => {
    let expiresAt = '';
    const now = Date.now();
    if (preset === '1h') {
      expiresAt = toLocalDatetimeString(new Date(now + 3600 * 1000));
    } else if (preset === '24h') {
      expiresAt = toLocalDatetimeString(new Date(now + 24 * 3600 * 1000));
    } else if (preset === '3d') {
      expiresAt = toLocalDatetimeString(new Date(now + 3 * 24 * 3600 * 1000));
    } else if (preset === '7d') {
      expiresAt = toLocalDatetimeString(new Date(now + 7 * 24 * 3600 * 1000));
    } else if (preset === 'custom') {
      expiresAt = form.expiresAt || toLocalDatetimeString(new Date(now + 24 * 3600 * 1000));
    }
    setForm((prev) => ({
      ...prev,
      durationPreset: preset,
      expiresAt: expiresAt,
    }));
  };

  const handleClose = () => {
    setDialogOpen(false);
    setEditing(null);
  };

  const handleSave = async () => {
    if (!form.message.trim()) return;
    setSaving(true);
    const payload = {
      message: form.message.trim(),
      type: form.type,
      linkUrl: form.linkUrl.trim() || null,
      linkLabel: form.linkLabel.trim() || null,
      active: form.active,
      expiresAt:
        form.durationPreset !== 'never' && form.expiresAt
          ? new Date(form.expiresAt).toISOString()
          : null,
    };
    try {
      if (editing) {
        await announcementService.update(editing.id, payload);
        showSnack('Announcement updated');
      } else {
        await announcementService.create(payload);
        showSnack('Announcement created');
      }
      handleClose();
      fetchAll();
    } catch {
      showSnack('Failed to save', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (ann) => {
    try {
      await announcementService.update(ann.id, { active: !ann.active });
      fetchAll();
    } catch {
      showSnack('Failed to toggle', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await announcementService.remove(deleteTarget.id);
      showSnack('Announcement deleted');
      setDeleteTarget(null);
      fetchAll();
    } catch {
      showSnack('Failed to delete', 'error');
    }
  };

  // ── Preview ────────────────────────────────────────────────

  const previewCfg = TYPE_PREVIEW[form.type] || TYPE_PREVIEW.SUCCESS;

  return (
    <Box>
      {/* Header */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CampaignRounded sx={{ fontSize: 32, color: 'primary.main' }} />
          <Box>
            <Typography variant="h5" fontWeight={800}>
              Announcements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Manage site-wide banners shown on all user pages
            </Typography>
          </Box>
        </Stack>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={openCreate}
          sx={{
            textTransform: 'none',
            fontWeight: 700,
            borderRadius: 2,
            px: 2.5,
          }}
        >
          New Announcement
        </Button>
      </Stack>

      {/* Table */}
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: 'background.elevated',
                '& th': {
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  color: 'text.secondary',
                  py: 1.5,
                },
              }}
            >
              <TableCell>Message</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Link</TableCell>
              <TableCell>Duration / Expiry</TableCell>
              <TableCell align="center">Active</TableCell>
              <TableCell>Created</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : announcements.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    No announcements yet. Create your first one!
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              announcements.map((ann) => {
                const chip = TYPE_CHIP[ann.type] || TYPE_CHIP.SUCCESS;
                const exp = formatExpiration(ann.expiresAt);
                return (
                  <TableRow
                    key={ann.id}
                    hover
                    sx={{
                      '&:last-child td': { borderBottom: 0 },
                      opacity: !ann.active || exp.isExpired ? 0.55 : 1,
                    }}
                  >
                    <TableCell sx={{ maxWidth: 340 }}>
                      <Typography
                        variant="body2"
                        fontWeight={600}
                        noWrap
                        title={ann.message}
                      >
                        {ann.message}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={chip.label}
                        size="small"
                        sx={{
                          bgcolor: chip.bg,
                          color: chip.color,
                          fontWeight: 700,
                          fontSize: '0.7rem',
                          height: 22,
                          border: `1px solid ${chip.color}33`,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      {ann.linkUrl ? (
                        <Tooltip title={ann.linkUrl}>
                          <Chip
                            icon={<LinkRounded sx={{ fontSize: 14 }} />}
                            label={ann.linkLabel || 'Link'}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 22,
                              fontSize: '0.7rem',
                              fontWeight: 600,
                              borderColor: 'divider',
                            }}
                          />
                        </Tooltip>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          —
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title={exp.tooltip}>
                        <Chip
                          icon={
                            exp.isExpired ? (
                              <TimerOffRounded sx={{ fontSize: '13px !important' }} />
                            ) : (
                              <AccessTimeRounded sx={{ fontSize: '13px !important' }} />
                            )
                          }
                          label={exp.label}
                          size="small"
                          color={exp.color}
                          variant={exp.color === 'default' ? 'outlined' : 'filled'}
                          sx={{
                            height: 22,
                            fontSize: '0.7rem',
                            fontWeight: 700,
                          }}
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Switch
                        checked={ann.active}
                        onChange={() => handleToggle(ann)}
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {ann.createdAt
                          ? new Date(ann.createdAt).toLocaleDateString('en-GB', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })
                          : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        <Tooltip title="Edit">
                          <IconButton size="small" onClick={() => openEdit(ann)}>
                            <EditRounded sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => setDeleteTarget(ann)}
                          >
                            <DeleteRounded sx={{ fontSize: 18 }} />
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

      {/* ─── Create / Edit Dialog ───────────────────────────── */}
      <Dialog
        open={dialogOpen}
        onClose={handleClose}
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
        <DialogTitle sx={{ fontWeight: 800, pb: 0 }}>
          {editing ? 'Edit Announcement' : 'New Announcement'}
        </DialogTitle>
        <DialogContent sx={{ pt: '16px !important' }}>
          <Stack spacing={2.5}>
            <TextField
              label="Message"
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              placeholder="e.g. New products just arrived! Use code SUMMER20 for 20% off"
            />

            <TextField
              select
              label="Type"
              fullWidth
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
            >
              {TYPES.map((t) => (
                <MenuItem key={t.value} value={t.value}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        bgcolor: t.color,
                        flexShrink: 0,
                      }}
                    />
                    <span>{t.label}</span>
                  </Stack>
                </MenuItem>
              ))}
            </TextField>

            <Divider sx={{ opacity: 0.5 }} />

            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Optional Link / Button
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="Button Label"
                fullWidth
                value={form.linkLabel}
                onChange={(e) => setForm({ ...form, linkLabel: e.target.value })}
                placeholder="e.g. Shop Now"
              />
              <TextField
                label="Link URL"
                fullWidth
                value={form.linkUrl}
                onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                placeholder="e.g. /shop or https://..."
              />
            </Stack>

            <Divider sx={{ opacity: 0.5 }} />

            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Duration / Expiration (Durée)
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                select
                label="Duration"
                fullWidth
                value={form.durationPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
              >
                {DURATION_PRESETS.map((p) => (
                  <MenuItem key={p.value} value={p.value}>
                    {p.label}
                  </MenuItem>
                ))}
              </TextField>

              {form.durationPreset !== 'never' && (
                <TextField
                  type="datetime-local"
                  label="Expires At"
                  fullWidth
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm({ ...form, expiresAt: e.target.value, durationPreset: 'custom' })
                  }
                  InputLabelProps={{ shrink: true }}
                  helperText={
                    form.expiresAt
                      ? `Auto-hides after: ${new Date(form.expiresAt).toLocaleString()}`
                      : 'Select expiration date and time'
                  }
                />
              )}
            </Stack>

            {/* Preview */}
            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Preview
            </Typography>
            <Box
              sx={{
                background: previewCfg.bg,
                border: '1px solid',
                borderColor: previewCfg.border,
                borderRadius: 2,
                py: 1.25,
                px: 2,
              }}
            >
              <Stack direction="row" alignItems="center" spacing={1.5} justifyContent="center">
                <Box sx={{ color: previewCfg.color, display: 'flex', alignItems: 'center' }}>
                  {previewCfg.icon}
                </Box>
                <Typography variant="body2" fontWeight={600} sx={{ fontSize: '0.85rem', flex: 1, textAlign: 'center' }}>
                  {form.message || 'Your announcement message here...'}
                </Typography>
                {form.linkUrl && (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardRounded sx={{ fontSize: '14px !important' }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                      color: previewCfg.color,
                      bgcolor: previewCfg.btnBg,
                      border: '1px solid',
                      borderColor: previewCfg.border,
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.3,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {form.linkLabel || 'View'}
                  </Button>
                )}
                <CloseRounded sx={{ fontSize: 16, color: 'text.secondary', opacity: 0.5 }} />
              </Stack>
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={handleClose} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !form.message.trim()}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
          >
            {saving ? <CircularProgress size={20} /> : editing ? 'Save Changes' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ─── Delete Confirmation ────────────────────────────── */}
      <Dialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        PaperProps={{
          sx: { borderRadius: 3, border: '1px solid', borderColor: 'divider' },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>Delete Announcement?</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            This will permanently remove the announcement. Users will no longer see it.
          </Typography>
          {deleteTarget && (
            <Alert severity="warning" sx={{ mt: 2, borderRadius: 2 }}>
              "{deleteTarget.message}"
            </Alert>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setDeleteTarget(null)} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDelete}
            sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ borderRadius: 2, fontWeight: 600 }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
