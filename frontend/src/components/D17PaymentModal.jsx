import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Button,
  TextField,
  Paper,
  Chip,
  IconButton,
  Alert,
  CircularProgress,
  Avatar,
  Divider,
  Tooltip,
} from '@mui/material';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import PhoneAndroidRoundedIcon from '@mui/icons-material/PhoneAndroidRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import { d17Service } from '../services/d17Service';

export default function D17PaymentModal({
  open,
  onClose,
  type = 'SUBSCRIPTION', // 'SUBSCRIPTION' | 'ORDER'
  amount = 49,
  targetDetails = {}, // { tier: 'BASIC', planName: 'Basic Plan' } or { orderId: '...', orderNumber: '...' }
  onSuccess,
}) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [config, setConfig] = useState({
    phoneNumber: '+216 21 214 512',
    recipientName: 'GymPilot Official',
    instructions: 'Send the exact amount to this number via D17, then take a screenshot of the payment confirmation.',
    slaHours: 48,
    currency: 'TND',
  });

  const [copied, setCopied] = useState(false);
  const [senderPhone, setSenderPhone] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotBase64, setScreenshotBase64] = useState('');
  const [screenshotType, setScreenshotType] = useState('image/jpeg');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  useEffect(() => {
    if (open) {
      setError('');
      setConfirmedTicket(null);
      // Fetch latest phone number setting
      d17Service.getConfig()
        .then((cfg) => {
          if (cfg) setConfig(cfg);
        })
        .catch(() => {
          // fallback to default
        });
    }
  }, [open]);

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(config.phoneNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPEG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Image file is too large (Maximum 5MB). Please take another screenshot.');
      return;
    }

    setError('');
    setScreenshotFile(file);
    setScreenshotType(file.type);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setScreenshotPreview(dataUrl);
      setScreenshotBase64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setScreenshotFile(null);
    setScreenshotPreview(null);
    setScreenshotBase64('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!screenshotBase64) {
      setError('Please attach a screenshot of your D17 payment confirmation.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const payload = {
        type,
        amount: Number(amount),
        subscriptionTier: type === 'SUBSCRIPTION' ? (targetDetails.tier || 'BASIC') : undefined,
        orderId: type === 'ORDER' ? targetDetails.orderId : undefined,
        senderPhoneNumber: senderPhone.trim() || undefined,
        userNotes: userNotes.trim() || undefined,
        screenshotBase64,
        screenshotType: screenshotType || 'image/jpeg',
      };

      const result = await d17Service.submitPaymentProof(payload);
      setConfirmedTicket(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Failed to submit D17 payment proof:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit payment proof. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (submitting) return;
    handleRemoveImage();
    setSenderPhone('');
    setUserNotes('');
    setError('');
    setConfirmedTicket(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
          p: { xs: 1, sm: 2 },
          backgroundImage: 'none',
        },
      }}
    >
      {confirmedTicket ? (
        // ================= SUCCESS VIEW =================
        <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 64,
              height: 64,
              bgcolor: 'rgba(0,230,118,0.15)',
              color: '#00E676',
              mx: 'auto',
              mb: 2,
            }}
          >
            <VerifiedUserRoundedIcon sx={{ fontSize: 38 }} />
          </Avatar>

          <Typography variant="h5" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 1 }}>
            Payment Proof Received!
          </Typography>

          <Chip
            label={`Ticket #${confirmedTicket.ticketNumber}`}
            sx={{
              bgcolor: 'rgba(198,255,62,0.12)',
              color: 'primary.main',
              fontWeight: 800,
              fontSize: '0.85rem',
              mb: 2,
              px: 1,
            }}
          />

          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              my: 2,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'left',
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
              <AccessTimeRoundedIcon sx={{ color: '#00E676', fontSize: 20 }} />
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Verification SLA: 24–48h
              </Typography>
            </Stack>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              Your payment proof has been received. Our team will verify it within <strong>24–48h</strong>. You&apos;ll get a notification and email once it&apos;s confirmed.
            </Typography>
          </Paper>

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 3 }}>
            A support ticket has been created in your account. You can communicate with our billing team there if needed.
          </Typography>

          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="center">
            <Button
              variant="outlined"
              onClick={() => {
                handleClose();
                navigate('/support');
              }}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              View Support Ticket
            </Button>
            <Button
              variant="contained"
              onClick={handleClose}
              sx={{ fontWeight: 800, borderRadius: 2.5 }}
            >
              Done
            </Button>
          </Stack>
        </Box>
      ) : (
        // ================= INSTRUCTIONS & UPLOAD FORM =================
        <form onSubmit={handleSubmit}>
          <DialogTitle sx={{ px: { xs: 2, sm: 3 }, pt: 2, pb: 1 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Avatar
                  sx={{
                    bgcolor: '#FFFFFF',
                    width: 44,
                    height: 44,
                    p: 0.5,
                    border: '1px solid rgba(255,255,255,0.2)',
                    borderRadius: 2.5,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  }}
                >
                  <Box
                    component="img"
                    src="/d17-logo.webp"
                    alt="D17 Logo"
                    sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
                    Pay via D17 Mobile
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Tunisian Post Mobile Payment
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>
          </DialogTitle>

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Amount & Phone Callout */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                bgcolor: 'rgba(198,255,62,0.06)',
                border: '1px solid rgba(198,255,62,0.25)',
              }}
            >
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                justifyContent="space-between"
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                spacing={2}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Amount to Transfer
                  </Typography>
                  <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, color: 'primary.main' }}>
                    {Number(amount).toFixed(2)} TND
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {type === 'SUBSCRIPTION' ? `${targetDetails.planName || 'Membership'} (1 Month)` : `Order Payment`}
                  </Typography>
                </Box>

                <Box sx={{ width: { xs: '100%', sm: 'auto' } }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    D17 Recipient Phone Number
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 900,
                        fontFamily: 'monospace',
                        fontSize: '1.1rem',
                        bgcolor: 'background.paper',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      {config.phoneNumber}
                    </Typography>
                    <Tooltip title={copied ? 'Copied!' : 'Copy Phone Number'}>
                      <IconButton
                        onClick={handleCopyPhone}
                        sx={{
                          bgcolor: copied ? 'rgba(0,230,118,0.15)' : 'rgba(198,255,62,0.15)',
                          color: copied ? '#00E676' : 'primary.main',
                          '&:hover': { bgcolor: 'primary.main', color: '#000' },
                        }}
                      >
                        {copied ? <CheckRoundedIcon fontSize="small" /> : <ContentCopyRoundedIcon fontSize="small" />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                    Account: {config.recipientName}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            {/* Step Instructions */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1.5 }}>
              Instructions:
            </Typography>
            <Stack spacing={1} sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary">
                1. Open your <strong>D17 Mobile App</strong> on your phone.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                2. Send exactly <strong>{Number(amount).toFixed(2)} TND</strong> to <strong style={{ color: '#C6FF3E' }}>{config.phoneNumber}</strong>.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                3. Take a screenshot of the <strong>payment confirmation</strong> screen.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                4. Attach your screenshot below and click <strong>Submit Payment Proof</strong>.
              </Typography>
            </Stack>

            <Divider sx={{ my: 2.5 }} />

            {/* Screenshot Upload Field */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Attach Screenshot Proof *
            </Typography>

            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />
            <input
              type="file"
              ref={cameraInputRef}
              accept="image/*"
              capture="environment"
              style={{ display: 'none' }}
              onChange={handleFileChange}
            />

            {screenshotPreview ? (
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 2.5,
                  borderRadius: 3,
                  border: '1px solid',
                  borderColor: 'primary.main',
                  bgcolor: 'rgba(198,255,62,0.03)',
                  position: 'relative',
                }}
              >
                <IconButton
                  onClick={handleRemoveImage}
                  size="small"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: '#fff',
                    '&:hover': { bgcolor: 'error.main' },
                  }}
                >
                  <CloseRoundedIcon fontSize="small" />
                </IconButton>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    component="img"
                    src={screenshotPreview}
                    alt="D17 Proof"
                    sx={{
                      width: 80,
                      height: 80,
                      objectFit: 'cover',
                      borderRadius: 2,
                      border: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" fontWeight={700} noWrap>
                      {screenshotFile?.name || 'Screenshot attached'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {screenshotFile ? `${(screenshotFile.size / 1024).toFixed(1)} KB` : 'Ready for upload'}
                    </Typography>
                    <Chip
                      icon={<CheckRoundedIcon sx={{ fontSize: 14 }} />}
                      label="Proof Ready"
                      size="small"
                      color="success"
                      sx={{ mt: 1, height: 22, fontSize: '0.7rem', fontWeight: 800 }}
                    />
                  </Box>
                </Stack>
              </Paper>
            ) : (
              <Box
                sx={{
                  p: 3,
                  mb: 2.5,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  textAlign: 'center',
                  bgcolor: 'rgba(255,255,255,0.01)',
                  transition: 'all 0.2s',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(198,255,62,0.02)',
                  },
                }}
              >
                <CloudUploadRoundedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                  Drop your screenshot here or select
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                  PNG, JPEG or WebP (Max 5MB)
                </Typography>

                <Stack direction="row" spacing={1.5} justifyContent="center">
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CloudUploadRoundedIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Choose Photo
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<CameraAltRoundedIcon />}
                    onClick={() => cameraInputRef.current?.click()}
                    sx={{ borderRadius: 2, fontWeight: 700 }}
                  >
                    Take Photo
                  </Button>
                </Stack>
              </Box>
            )}

            {/* Optional Fields */}
            <Stack spacing={2}>
              <TextField
                label="Sender Phone Number (Optional)"
                placeholder="e.g. +216 98 123 456"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                fullWidth
                size="small"
                helperText="Phone number of the D17 account you transferred from"
              />
              <TextField
                label="Transaction Reference / Note (Optional)"
                placeholder="e.g. D17 transaction code or notes"
                value={userNotes}
                onChange={(e) => setUserNotes(e.target.value)}
                fullWidth
                size="small"
                multiline
                rows={2}
              />
            </Stack>
          </DialogContent>

          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 3, pt: 1 }}>
            <Button onClick={handleClose} disabled={submitting} sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || !screenshotBase64}
              startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <ArrowForwardRoundedIcon />}
              sx={{
                bgcolor: 'primary.main',
                color: '#000',
                fontWeight: 800,
                borderRadius: 2.5,
                px: 3,
                '&:hover': { bgcolor: '#b3f520' },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Payment Proof'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
