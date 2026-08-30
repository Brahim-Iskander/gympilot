import { useEffect, useState, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  Typography,
  Tooltip,
} from '@mui/material';
import {
  AddRounded,
  DeleteOutlineRounded,
  OpenInNewRounded,
  HandshakeRounded,
  LinkRounded,
  ImageRounded,
} from '@mui/icons-material';

import { partnerService } from '../../services/partnerService';

export default function AdminPartners() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add Partner Dialog State
  const [addOpen, setAddOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    description: '',
    websiteUrl: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // Delete Partner State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      const data = await partnerService.getAdminPartners();
      setPartners(data ?? []);
    } catch (err) {
      console.error('Failed to fetch admin partners', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.imageUrl || !formData.description || !formData.websiteUrl) return;

    try {
      setSubmitting(true);
      await partnerService.createPartner(formData);
      setFormData({ name: '', imageUrl: '', description: '', websiteUrl: '' });
      setAddOpen(false);
      fetchPartners();
    } catch (err) {
      console.error('Failed to create partner', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePrompt = (partner) => {
    setDeleteTarget(partner);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await partnerService.deletePartner(deleteTarget.id);
      fetchPartners();
    } catch (err) {
      console.error('Failed to delete partner', err);
    } finally {
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Header */}
      <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2} sx={{ mb: 4 }}>
        <Box>
          <Typography variant="h4" fontWeight={800}>
            Partner Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Add or remove official platform partners displayed on the main home page
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddRounded />}
          onClick={() => setAddOpen(true)}
          sx={{ borderRadius: 2.5, fontWeight: 700 }}
        >
          Add New Partner
        </Button>
      </Stack>

      {/* Partners Grid */}
      {loading ? (
        <Typography color="text.secondary">Loading partners...</Typography>
      ) : partners.length === 0 ? (
        <Paper elevation={0} sx={{ p: 6, textAlign: 'center', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
          <HandshakeRounded sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" fontWeight={700}>
            No Partners Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Click "Add New Partner" above to add your first official gym or nutrition partner.
          </Typography>
          <Button variant="contained" startIcon={<AddRounded />} onClick={() => setAddOpen(true)}>
            Add First Partner
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {partners.map((partner) => (
            <Grid item xs={12} sm={6} md={4} key={partner.id}>
              <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, position: 'relative', overflow: 'hidden' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={partner.imageUrl}
                  alt={partner.name}
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80';
                  }}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent sx={{ p: 2.5 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 1 }}>
                    <Typography variant="h6" fontWeight={800}>
                      {partner.name}
                    </Typography>
                    <Stack direction="row" spacing={0.5}>
                      <Tooltip title="Visit Partner Website">
                        <IconButton size="small" component="a" href={partner.websiteUrl} target="_blank" rel="noopener noreferrer">
                          <OpenInNewRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Partner">
                        <IconButton size="small" color="error" onClick={() => handleDeletePrompt(partner)}>
                          <DeleteOutlineRounded fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40, lineHeight: 1.5 }}>
                    {partner.description}
                  </Typography>

                  <Typography variant="caption" color="primary.main" fontWeight={600} noWrap sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LinkRounded sx={{ fontSize: 14 }} /> {partner.websiteUrl}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Add Partner Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleAddSubmit}>
          <DialogTitle fontWeight={800}>Add Platform Partner</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5} sx={{ pt: 1 }}>
              <TextField
                label="Partner Name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="e.g. Gymshark, Rogue Fitness"
              />
              <TextField
                label="Image / Logo URL"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="https://images.unsplash.com/..."
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <ImageRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                fullWidth
                multiline
                rows={2}
                placeholder="Short partner description or category (e.g. Official Apparel & Fitness Gear)"
              />
              <TextField
                label="Website URL"
                name="websiteUrl"
                value={formData.websiteUrl}
                onChange={handleInputChange}
                required
                fullWidth
                placeholder="https://www.partner-domain.com"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LinkRounded fontSize="small" />
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Partner'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Partner Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle fontWeight={800}>Delete Partner</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? It will no longer appear on the home page.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" color="error" onClick={handleConfirmDelete}>
            Delete Partner
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
