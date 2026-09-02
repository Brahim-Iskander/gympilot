import { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  TextField,
  Button,
  Avatar,
  Alert,
  CircularProgress,
  Grid,
} from '@mui/material';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';

import SEO from '../../components/SEO';
import { sellerService } from '../../services/sellerService';
import { useAuth } from '../../context/AuthContext';

export default function SellerSettings() {
  const { user, updateUser } = useAuth();

  const [storeName, setStoreName] = useState(user?.storeName || `${user?.firstName || 'Seller'} Store`);
  const [storeBio, setStoreBio] = useState(user?.storeBio || 'Official authentic supplements & gym gear vendor on GymPilot.');
  const [storeLogo, setStoreLogo] = useState(user?.storeLogo || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');
      const updatedUser = await sellerService.updateStoreProfile({
        storeName: storeName.trim(),
        storeBio: storeBio.trim(),
        storeLogo: storeLogo.trim(),
      });
      updateUser(updatedUser);
      setSuccess('Store profile updated successfully!');
    } catch (err) {
      console.error('Failed to update store profile:', err);
      setError('Failed to update store profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <SEO title="Store Profile — Seller Portal" description="Customize your store branding on GymPilot." path="/seller/settings" noIndex />

      <Container maxWidth="md" disableGutters>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
            Store Profile & Branding
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Customize how your seller store appears to buyers across GymPilot catalog listings.
          </Typography>
        </Box>

        {success && <Alert severity="success" sx={{ mb: 3 }}>{success}</Alert>}
        {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

        <Card elevation={0} sx={{ p: 4, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <form onSubmit={handleSave}>
            <Stack spacing={3}>
              <Stack direction="row" spacing={2.5} alignItems="center">
                <Avatar
                  src={storeLogo || user?.avatar}
                  sx={{ width: 64, height: 64, bgcolor: '#8A7CFF', color: '#fff', fontSize: '1.5rem', fontWeight: 800 }}
                >
                  {storeName.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{storeName || 'My Store'}</Typography>
                  <Typography variant="caption" color="text.secondary">Storefront ID: {user?.id}</Typography>
                </Box>
              </Stack>

              <Grid container spacing={2.5}>
                <Grid item xs={12}>
                  <TextField
                    label="Store Name *"
                    fullWidth
                    size="small"
                    required
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Store Bio / Tagline"
                    fullWidth
                    multiline
                    rows={3}
                    size="small"
                    placeholder="Tell buyers about your quality standards, brand partnerships, or fitness philosophy."
                    value={storeBio}
                    onChange={(e) => setStoreBio(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="Store Logo (Image URL)"
                    fullWidth
                    size="small"
                    placeholder="https://..."
                    value={storeLogo}
                    onChange={(e) => setStoreLogo(e.target.value)}
                  />
                </Grid>
              </Grid>

              <Box sx={{ pt: 1 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={saving}
                  startIcon={saving ? <CircularProgress size={18} /> : <SaveRoundedIcon />}
                  sx={{ fontWeight: 800, borderRadius: 2, px: 3.5, py: 1.2 }}
                >
                  {saving ? 'Saving...' : 'Save Profile Changes'}
                </Button>
              </Box>
            </Stack>
          </form>
        </Card>
      </Container>
    </>
  );
}
