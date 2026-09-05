import { useState, useRef } from 'react';
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
import PhotoCameraRoundedIcon from '@mui/icons-material/PhotoCameraRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';

import SEO from '../../components/SEO';
import SellerNavTabs from './components/SellerNavTabs';
import { sellerService } from '../../services/sellerService';
import { uploadImage } from '../../services/uploadService';
import { useAuth } from '../../context/AuthContext';

export default function SellerSettings() {
  const { user, updateUser } = useAuth();

  const [storeName, setStoreName] = useState(user?.storeName || `${user?.firstName || 'Seller'} Store`);
  const [storeBio, setStoreBio] = useState(user?.storeBio || 'Official authentic supplements & gym gear vendor on GymPilot.');

  // Logo file upload state (same pattern as profile avatar)
  const [logoPreview, setLogoPreview] = useState(user?.storeLogo || null);
  const [logoFile, setLogoFile] = useState(undefined); // undefined = untouched, '' = removed, string = new base64
  const [logoError, setLogoError] = useState('');
  const logoInputRef = useRef(null);

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setLogoError('Only JPG, PNG, or WebP images are allowed.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setLogoError('Image size must be less than 2MB.');
      return;
    }

    setLogoError('');
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result);
      setLogoFile(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile('');
    setLogoError('');
    if (logoInputRef.current) logoInputRef.current.value = '';
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      setError('');
      setSuccess('');

      const payload = {
        storeName: storeName.trim(),
        storeBio: storeBio.trim(),
      };

      // Only include storeLogo if it was actually changed
      if (logoFile !== undefined) {
        if (logoFile && logoFile.startsWith('data:image/')) {
          try {
            // Upload to Cloudinary folder gympilot/stores to save space in MongoDB
            const cloudinaryUrl = await uploadImage(logoFile, 'gympilot/stores');
            payload.storeLogo = cloudinaryUrl;
          } catch (uploadErr) {
            console.warn('Cloudinary upload failed or not configured, falling back to base64:', uploadErr);
            payload.storeLogo = logoFile;
          }
        } else {
          payload.storeLogo = logoFile; // empty string to remove or existing URL
        }
      }

      const updatedUser = await sellerService.updateStoreProfile(payload);
      updateUser(updatedUser);
      setLogoFile(undefined); // reset "dirty" state
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
        <SellerNavTabs />

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
              {/* Hidden file input for logo upload */}
              <input
                type="file"
                ref={logoInputRef}
                accept="image/jpeg,image/png,image/webp"
                onChange={handleLogoSelect}
                style={{ display: 'none' }}
              />

              {/* Store Logo Upload Section */}
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'action.hover',
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2.5,
                }}
              >
                <Avatar
                  src={logoPreview || user?.avatar}
                  sx={{
                    width: 72,
                    height: 72,
                    bgcolor: '#8A7CFF',
                    color: '#fff',
                    fontSize: '1.75rem',
                    fontWeight: 800,
                    border: '2px solid',
                    borderColor: 'primary.main',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
                  }}
                >
                  {storeName.charAt(0)?.toUpperCase()}
                </Avatar>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={800} sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
                    Store Logo
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                    Supports JPG, PNG, or WebP. Max 2MB file size.
                  </Typography>

                  <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PhotoCameraRoundedIcon />}
                      onClick={() => logoInputRef.current?.click()}
                      sx={{ borderRadius: 2 }}
                    >
                      Upload Logo
                    </Button>

                    {(logoPreview || user?.storeLogo) && (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<DeleteOutlineRoundedIcon />}
                        onClick={handleRemoveLogo}
                        sx={{ borderRadius: 2 }}
                      >
                        Remove Logo
                      </Button>
                    )}
                  </Stack>

                  {logoError && (
                    <Typography variant="caption" color="error.main" fontWeight={600} sx={{ display: 'block', mt: 1 }}>
                      {logoError}
                    </Typography>
                  )}
                  {logoFile !== undefined && (
                    <Typography variant="caption" color="primary.main" fontWeight={600} sx={{ display: 'block', mt: 1 }}>
                      Logo selected. Click "Save Profile Changes" below to commit.
                    </Typography>
                  )}
                </Box>
              </Box>

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

