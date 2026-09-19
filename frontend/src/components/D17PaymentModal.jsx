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
  Tabs,
  Tab,
  Grid,
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
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import QrCode2RoundedIcon from '@mui/icons-material/QrCode2Rounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { QRCodeSVG } from 'qrcode.react';

import { paymentService } from '../services/paymentService';
import { useGeoCurrency } from '../utils/geoCurrency';

// Icons for crypto coins
function CoinIcon({ code, sx = {} }) {
  if (code === 'D17') {
    return (
      <Box
        component="img"
        src="/d17-logo.webp"
        alt="D17"
        sx={{ width: 24, height: 24, objectFit: 'contain', ...sx }}
      />
    );
  }
  if (code === 'USDT_TRC20' || code === 'USDT') {
    return (
      <Box
        sx={{
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: '#26A17B',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.75rem',
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
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: '#F7931A',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.85rem',
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
          width: 24,
          height: 24,
          borderRadius: '50%',
          bgcolor: '#627EEA',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 900,
          fontSize: '0.75rem',
          ...sx,
        }}
      >
        Ξ
      </Box>
    );
  }
  return <VerifiedUserRoundedIcon sx={{ fontSize: 24, ...sx }} />;
}

export default function D17PaymentModal({
  open,
  onClose,
  type = 'SUBSCRIPTION', // 'SUBSCRIPTION' | 'ORDER'
  amount = 49,
  currency: initialCurrency,
  targetDetails = {}, // { tier: 'BASIC', planName: 'Basic Plan' } or { orderId: '...', orderNumber: '...' }
  selectedMethod: propSelectedMethod,
  onSuccess,
}) {
  const navigate = useNavigate();
  const geo = useGeoCurrency();
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const [availableMethods, setAvailableMethods] = useState([]);
  const [activeMethodCode, setActiveMethodCode] = useState(propSelectedMethod || 'D17');
  const [loadingMethods, setLoadingMethods] = useState(true);

  const [copied, setCopied] = useState(false);
  const [txidCopied, setTxidCopied] = useState(false);
  const [showQrCode, setShowQrCode] = useState(true);

  // Form state
  const [senderPhone, setSenderPhone] = useState('');
  const [txid, setTxid] = useState('');
  const [userNotes, setUserNotes] = useState('');
  const [screenshotFile, setScreenshotFile] = useState(null);
  const [screenshotPreview, setScreenshotPreview] = useState(null);
  const [screenshotBase64, setScreenshotBase64] = useState('');
  const [screenshotType, setScreenshotType] = useState('image/jpeg');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [confirmedTicket, setConfirmedTicket] = useState(null);

  // Load available payment methods based on country
  useEffect(() => {
    if (open) {
      setError('');
      setConfirmedTicket(null);
      setSubmitting(false);

      const country = geo?.countryCode || localStorage.getItem('gympilot_geo_country') || 'TN';
      const storedRegion = localStorage.getItem('gympilot_selected_region');
      const isTn = storedRegion === 'TN' || (!storedRegion && (country === 'TN' || geo?.currency === 'TND'));

      paymentService.getActiveMethods(country)
        .then((methods) => {
          let filtered = methods || [];
          if (isTn) {
            filtered = filtered.filter((m) => m.code === 'D17');
            if (filtered.length === 0) {
              filtered = [{
                code: 'D17',
                name: 'D17 Mobile Payment',
                network: 'D17',
                receivingAddress: '99 123 456',
                recipientName: 'GymPilot Administration',
                instructions: 'Effectuez le transfert vers notre numéro D17 puis joignez la capture de confirmation.',
                warningNotice: 'Transfert postal national tunisien. Montant exact requis.',
              }];
            }
          } else {
            filtered = filtered.filter((m) => m.code !== 'D17');
          }

          if (filtered && filtered.length > 0) {
            setAvailableMethods(filtered);
            // Default active method
            if (propSelectedMethod && filtered.some((m) => m.code === propSelectedMethod)) {
              setActiveMethodCode(propSelectedMethod);
            } else {
              setActiveMethodCode(filtered[0].code);
            }
          }
        })
        .catch((err) => {
          console.error('Failed to load active payment methods:', err);
        })
        .finally(() => {
          setLoadingMethods(false);
        });
    }
  }, [open, geo?.countryCode, propSelectedMethod]);

  const activeMethod = availableMethods.find((m) => m.code === activeMethodCode) || availableMethods[0] || {
    code: 'D17',
    name: 'D17 Mobile Payment',
    receivingAddress: '+216 21 214 512',
    recipientName: 'GymPilot Official',
    instructions: 'Send the exact amount to this number via D17, then take a screenshot of the payment confirmation.',
    warningNotice: null,
  };

  const isCrypto = activeMethod.code !== 'D17';

  const handleCopyAddress = () => {
    if (navigator.clipboard && activeMethod?.receivingAddress) {
      navigator.clipboard.writeText(activeMethod.receivingAddress);
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
      setError('Image file is too large (Maximum 5MB). Please compress or take another screenshot.');
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

    if (!isCrypto && !screenshotBase64) {
      setError('Please attach a screenshot of your D17 payment confirmation.');
      return;
    }

    if (isCrypto && !screenshotBase64 && !txid.trim()) {
      setError('For cryptocurrency, please provide a payment screenshot and/or transaction hash (TXID).');
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
        paymentMethod: activeMethod.code,
        walletAddress: activeMethod.receivingAddress,
        txid: txid.trim() || undefined,
        senderPhoneNumber: senderPhone.trim() || undefined,
        userNotes: userNotes.trim() || undefined,
        screenshotBase64: screenshotBase64 || undefined,
        screenshotType: screenshotType || 'image/jpeg',
      };

      const result = await paymentService.submitPaymentProof(payload);
      setConfirmedTicket(result);
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      console.error('Failed to submit manual payment proof:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to submit payment proof. Please try again.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!submitting) {
      setError('');
      setConfirmedTicket(null);
      handleRemoveImage();
      setTxid('');
      setSenderPhone('');
      setUserNotes('');
      onClose();
    }
  };

  const currencySymbol = isCrypto ? (initialCurrency || 'USD') : 'TND';

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
          backgroundImage: 'none',
          boxShadow: '0 24px 64px rgba(0,0,0,0.6)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        },
      }}
    >
      {confirmedTicket ? (
        // ================= CONFIRMATION SCREEN =================
        <Box sx={{ p: { xs: 3, sm: 4 }, textAlign: 'center' }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: 'rgba(0,230,118,0.12)',
              color: 'success.main',
              mx: 'auto',
              mb: 2.5,
              border: '2px solid rgba(0,230,118,0.3)',
            }}
          >
            <VerifiedUserRoundedIcon sx={{ fontSize: 38 }} />
          </Avatar>

          <Chip
            size="small"
            color="warning"
            label="PENDING VERIFICATION"
            sx={{ fontWeight: 800, fontSize: '0.75rem', mb: 1.5, letterSpacing: 0.5 }}
          />

          <Typography variant="h5" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 1 }}>
            Payment Proof Received!
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: 'auto', mb: 3 }}>
            Our financial operations team will verify your {activeMethod.name} transfer and activate your{' '}
            {type === 'SUBSCRIPTION' ? 'membership plan' : 'order'}.
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              borderRadius: 3,
              bgcolor: 'rgba(255,255,255,0.02)',
              borderColor: 'divider',
              textAlign: 'left',
              mb: 3,
            }}
          >
            <Stack spacing={1.5}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">Ticket Reference</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: 'primary.main' }}>
                  {confirmedTicket.ticketNumber}
                </Typography>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">Method</Typography>
                <Stack direction="row" spacing={0.75} alignItems="center">
                  <CoinIcon code={confirmedTicket.paymentMethod || activeMethod.code} />
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {activeMethod.name}
                  </Typography>
                </Stack>
              </Stack>

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">Amount</Typography>
                <Typography variant="body2" sx={{ fontWeight: 800 }}>
                  {Number(confirmedTicket.amount).toFixed(2)} {confirmedTicket.currency || currencySymbol}
                </Typography>
              </Stack>

              {confirmedTicket.txid && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary">TXID</Typography>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <Typography
                      variant="caption"
                      sx={{
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        maxWidth: 180,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {confirmedTicket.txid}
                    </Typography>
                    {confirmedTicket.explorerUrl && (
                      <IconButton
                        size="small"
                        component="a"
                        href={confirmedTicket.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ color: 'primary.main', p: 0.2 }}
                      >
                        <OpenInNewRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                    )}
                  </Stack>
                </Stack>
              )}

              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="caption" color="text.secondary">SLA Turnaround</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                  Within 24 to 48 hours
                </Typography>
              </Stack>
            </Stack>
          </Paper>

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
                    bgcolor: 'background.paper',
                    width: 44,
                    height: 44,
                    p: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 2.5,
                  }}
                >
                  <CoinIcon code={activeMethod.code} sx={{ width: 28, height: 28 }} />
                </Avatar>
                <Box>
                  <Typography variant="h6" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
                    {activeMethod.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {isCrypto ? `Direct ${activeMethod.network || 'Crypto'} Transfer` : 'Tunisian Post Mobile Payment'}
                  </Typography>
                </Box>
              </Stack>
              <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}>
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            {/* Method selection tabs if multiple methods available */}
            {availableMethods.length > 1 && (
              <Tabs
                value={activeMethodCode}
                onChange={(e, val) => {
                  setActiveMethodCode(val);
                  setError('');
                }}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  mt: 1.5,
                  minHeight: 36,
                  '& .MuiTab-root': {
                    minHeight: 36,
                    py: 0.5,
                    px: 1.5,
                    fontSize: '0.8rem',
                    fontWeight: 700,
                  },
                }}
              >
                {availableMethods.map((m) => (
                  <Tab
                    key={m.code}
                    value={m.code}
                    label={m.code.replace('_', ' ')}
                    icon={<CoinIcon code={m.code} sx={{ width: 16, height: 16 }} />}
                    iconPosition="start"
                  />
                ))}
              </Tabs>
            )}
          </DialogTitle>

          <DialogContent sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 2.5, borderRadius: 2.5 }} onClose={() => setError('')}>
                {error}
              </Alert>
            )}

            {/* Prominent Warning for Crypto Networks */}
            {activeMethod.warningNotice && (
              <Alert
                severity="warning"
                icon={<WarningAmberRoundedIcon />}
                sx={{
                  mb: 2.5,
                  borderRadius: 2.5,
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  '& .MuiAlert-message': { py: 0.5 },
                }}
              >
                {activeMethod.warningNotice}
              </Alert>
            )}

            {/* Amount & Receiving Address Callout */}
            <Paper
              elevation={0}
              sx={{
                p: 2.5,
                mb: 3,
                borderRadius: 3,
                bgcolor: 'rgba(198,255,62,0.04)',
                border: '1px solid rgba(198,255,62,0.2)',
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={isCrypto && showQrCode ? 7 : 8}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    Amount to Send
                  </Typography>
                  <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 900, color: 'primary.main', mb: 0.5 }}>
                    {currencySymbol} {Number(amount).toFixed(2)}
                  </Typography>
                  {isCrypto && activeMethod.code !== 'USDT_TRC20' && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontStyle: 'italic' }}>
                      (Send equivalent value in {activeMethod.code})
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
                    {type === 'SUBSCRIPTION' ? `${targetDetails.planName || 'Membership'} (1 Month)` : `Order Payment`}
                  </Typography>

                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
                    {isCrypto ? `${activeMethod.name} Receiving Address` : 'D17 Recipient Phone Number'}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        fontSize: '0.85rem',
                        bgcolor: 'background.paper',
                        px: 1.5,
                        py: 0.75,
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        wordBreak: 'break-all',
                        flex: 1,
                      }}
                    >
                      {activeMethod.receivingAddress}
                    </Typography>
                    <Tooltip title={copied ? 'Copied!' : 'Copy'}>
                      <IconButton
                        onClick={handleCopyAddress}
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
                  {activeMethod.recipientName && (
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                      Account / Vault: <strong>{activeMethod.recipientName}</strong>
                    </Typography>
                  )}
                </Grid>

                {/* QR Code */}
                {isCrypto && activeMethod.receivingAddress && (
                  <Grid item xs={12} sm={showQrCode ? 5 : 4} sx={{ textAlign: 'center' }}>
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: '#FFFFFF',
                        borderRadius: 2.5,
                        display: 'inline-block',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                      }}
                    >
                      <QRCodeSVG
                        value={activeMethod.receivingAddress}
                        size={110}
                        level="M"
                        includeMargin={false}
                      />
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5, fontSize: '0.7rem' }}>
                      Scan via Mobile Wallet
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Paper>

            {/* Instructions */}
            {activeMethod.instructions && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.75 }}>
                  Instructions:
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ whiteSpace: 'pre-line', fontSize: '0.85rem', lineHeight: 1.6 }}
                >
                  {activeMethod.instructions}
                </Typography>
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* Crypto TXID Input */}
            {isCrypto && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                  Blockchain Transaction Hash (TXID)
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., 0x4f3a... or 7d8c..."
                  value={txid}
                  onChange={(e) => setTxid(e.target.value)}
                  helperText="Recommended. Allows our team to verify your transaction instantly on the blockchain explorer."
                  InputProps={{
                    sx: { fontFamily: 'monospace', fontSize: '0.85rem' },
                  }}
                />
              </Box>
            )}

            {/* Screenshot Upload Field */}
            <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 1 }}>
              Payment Confirmation Screenshot {isCrypto ? '(Recommended)' : '*'}
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
                  mb: 2,
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
                    alt="Proof Preview"
                    sx={{
                      width: 70,
                      height: 70,
                      borderRadius: 2,
                      objectFit: 'cover',
                      border: '1px solid',
                      borderColor: 'divider',
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="body2" sx={{ fontWeight: 800 }}>
                      Screenshot Attached
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                      {screenshotFile?.name || 'proof.jpg'}
                    </Typography>
                    <Typography variant="caption" color="success.main" sx={{ fontWeight: 700 }}>
                      Ready to submit
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ) : (
              <Paper
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  p: 2.5,
                  mb: 2,
                  borderRadius: 3,
                  border: '2px dashed',
                  borderColor: 'divider',
                  bgcolor: 'rgba(255,255,255,0.01)',
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    borderColor: 'primary.main',
                    bgcolor: 'rgba(198,255,62,0.03)',
                  },
                }}
              >
                <CloudUploadRoundedIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 0.5 }} />
                <Typography variant="body2" sx={{ fontWeight: 700 }}>
                  Click to upload screenshot or drag &amp; drop
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                  PNG, JPG, or WebP up to 5MB
                </Typography>
                <Stack direction="row" spacing={1} justifyContent="center" onClick={(e) => e.stopPropagation()}>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CloudUploadRoundedIcon />}
                    onClick={() => fileInputRef.current?.click()}
                    sx={{ borderRadius: 2, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Choose File
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<CameraAltRoundedIcon />}
                    onClick={() => cameraInputRef.current?.click()}
                    sx={{ borderRadius: 2, fontSize: '0.75rem', fontWeight: 700 }}
                  >
                    Take Photo
                  </Button>
                </Stack>
              </Paper>
            )}

            {/* Extra details: Sender Phone (for D17) and Notes */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              {!isCrypto && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Your D17 Phone Number (Optional)"
                    placeholder="+216 XX XXX XXX"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    helperText="Helps match your payment faster"
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={!isCrypto ? 6 : 12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Notes / Reference (Optional)"
                  placeholder="e.g. Sender account name or order note"
                  value={userNotes}
                  onChange={(e) => setUserNotes(e.target.value)}
                />
              </Grid>
            </Grid>

            {/* SLA Alert */}
            <Alert
              severity="info"
              icon={<AccessTimeRoundedIcon fontSize="small" />}
              sx={{
                py: 0.5,
                px: 1.5,
                borderRadius: 2,
                fontSize: '0.78rem',
                '& .MuiAlert-message': { py: 0.5 },
              }}
            >
              <strong>Verification Turnaround:</strong> Manual {activeMethod.name} payments are verified within <strong>24 to 48 hours</strong>. You will receive an instant email notification once activated.
            </Alert>
          </DialogContent>

          <DialogActions sx={{ px: { xs: 2, sm: 3 }, pb: 2.5, pt: 1 }}>
            <Button disabled={submitting} onClick={handleClose} sx={{ fontWeight: 700 }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={submitting || (!isCrypto && !screenshotBase64) || (isCrypto && !screenshotBase64 && !txid.trim())}
              startIcon={submitting ? <CircularProgress size={16} color="inherit" /> : <ArrowForwardRoundedIcon />}
              sx={{
                fontWeight: 800,
                borderRadius: 2.5,
                px: 3,
              }}
            >
              {submitting ? 'Submitting Proof...' : 'Submit Payment Proof'}
            </Button>
          </DialogActions>
        </form>
      )}
    </Dialog>
  );
}
