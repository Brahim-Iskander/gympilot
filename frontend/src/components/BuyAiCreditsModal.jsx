import { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  Stack,
  Grid,
  Card,
  Button,
  IconButton,
  Chip,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Alert,
  CircularProgress,
  Tooltip,
  Paper,
  Divider,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import StarsRoundedIcon from '@mui/icons-material/StarsRounded';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';

import { aiCreditService } from '../services/aiCreditService';
import { d17Service } from '../services/d17Service';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PACKS = [
  {
    id: 'AI_PACK_3',
    title: 'Starter Pack',
    badge: 'Popular',
    credits: 3,
    priceTnd: 5.0,
    pointsPrice: 150,
    pricePerScan: 1.67,
    savingsPercent: 0,
    description: '3 AI Body Scans & Progress Analyses',
  },
  {
    id: 'AI_PACK_5',
    title: 'Pro Pack',
    badge: 'Best Value',
    credits: 5,
    priceTnd: 8.0,
    pointsPrice: 240,
    pricePerScan: 1.6,
    savingsPercent: 20,
    description: '5 AI Body Scans & Progress Analyses',
  },
  {
    id: 'AI_PACK_10',
    title: 'Power Pack',
    badge: 'Max Savings',
    credits: 10,
    priceTnd: 14.0,
    pointsPrice: 400,
    pricePerScan: 1.4,
    savingsPercent: 30,
    description: '10 AI Body Scans & Progress Analyses',
  },
];

export default function BuyAiCreditsModal({ open, onClose, onCreditUpdated }) {
  const { user } = useAuth();

  const [packs, setPacks] = useState(DEFAULT_PACKS);
  const [selectedPackId, setSelectedPackId] = useState('AI_PACK_5');
  const [paymentMethod, setPaymentMethod] = useState('D17'); // 'D17', 'INSTANT_CARD', 'POINTS'

  // User balances
  const [balance, setBalance] = useState({ aiCredits: user?.aiCredits || 0, points: user?.points || 0 });

  // D17 Config & form
  const [d17Config, setD17Config] = useState({
    phoneNumber: '+216 21 214 512',
    recipientName: 'GymPilot Official',
  });
  const [d17Copied, setD17Copied] = useState(false);
  const [d17SenderPhone, setD17SenderPhone] = useState('');
  const [d17Notes, setD17Notes] = useState('');
  const [d17File, setD17File] = useState(null);
  const [d17Preview, setD17Preview] = useState(null);
  const [d17Base64, setD17Base64] = useState('');
  const [d17FileType, setD17FileType] = useState('image/jpeg');
  const d17FileInputRef = useRef(null);
  const d17CameraInputRef = useRef(null);

  // Instant card simulated fields
  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Flow status
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successResult, setSuccessResult] = useState(null); // { type: 'INSTANT'|'D17', message, ticketNumber }

  useEffect(() => {
    if (open) {
      setError('');
      setSuccessResult(null);
      aiCreditService.getPacks().then(setPacks).catch(() => {});
      aiCreditService.getBalance().then((res) => {
        if (res) setBalance({ aiCredits: res.aiCredits, points: res.points });
      }).catch(() => {});
      d17Service.getConfig().then((cfg) => {
        if (cfg) setD17Config(cfg);
      }).catch(() => {});
    }
  }, [open]);

  const selectedPack = packs.find((p) => p.id === selectedPackId) || packs[1] || packs[0];

  const handleCopyPhone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(d17Config.phoneNumber);
      setD17Copied(true);
      setTimeout(() => setD17Copied(false), 2500);
    }
  };

  const handleD17FileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPEG, WebP).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot file is too large (max 5MB).');
      return;
    }

    setError('');
    setD17File(file);
    setD17FileType(file.type);

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      setD17Preview(dataUrl);
      setD17Base64(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveD17File = () => {
    setD17File(null);
    setD17Preview(null);
    setD17Base64('');
    if (d17FileInputRef.current) d17FileInputRef.current.value = '';
    if (d17CameraInputRef.current) d17CameraInputRef.current.value = '';
  };

  const handleSubmit = async () => {
    setError('');

    if (paymentMethod === 'D17') {
      if (!d17Base64) {
        setError('Please attach your D17 payment receipt screenshot.');
        return;
      }

      try {
        setSubmitting(true);
        const ticket = await d17Service.submitPaymentProof({
          type: 'AI_CREDIT',
          aiCredits: selectedPack.credits,
          amount: selectedPack.priceTnd,
          senderPhoneNumber: d17SenderPhone.trim() || undefined,
          userNotes: d17Notes.trim() || undefined,
          screenshotBase64: d17Base64,
          screenshotType: d17FileType,
        });

        setSuccessResult({
          type: 'D17',
          message: `Your payment proof for ${selectedPack.credits} AI Credits has been submitted! Our accounting team verifies transfers to ${d17Config.recipientName || 'GymPilot Official'} within 24 to 48 hours.`,
          ticketNumber: ticket.ticketNumber,
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Failed to submit payment proof.');
      } finally {
        setSubmitting(false);
      }
    } else if (paymentMethod === 'INSTANT_CARD') {
      try {
        setSubmitting(true);
        const res = await aiCreditService.purchaseInstant(selectedPack.id);
        setBalance((prev) => ({ ...prev, aiCredits: res.newCreditBalance }));
        setSuccessResult({
          type: 'INSTANT',
          message: `Payment successful! ${res.creditsAdded} AI Credits have been deposited to your account.`,
          newBalance: res.newCreditBalance,
        });
        if (onCreditUpdated) onCreditUpdated(res.newCreditBalance);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Payment simulation failed.');
      } finally {
        setSubmitting(false);
      }
    } else if (paymentMethod === 'POINTS') {
      if (balance.points < selectedPack.pointsPrice) {
        setError(`Insufficient points. You have ${balance.points} pts, but ${selectedPack.pointsPrice} pts are required.`);
        return;
      }

      try {
        setSubmitting(true);
        const res = await aiCreditService.redeemPoints(selectedPack.id);
        setBalance({ aiCredits: res.newCreditBalance, points: res.remainingPoints });
        setSuccessResult({
          type: 'POINTS',
          message: `Redeemed ${selectedPack.pointsPrice} points! ${res.creditsAdded} AI Credits have been added to your account.`,
          newBalance: res.newCreditBalance,
        });
        if (onCreditUpdated) onCreditUpdated(res.newCreditBalance);
      } catch (err) {
        setError(err.response?.data?.message || err.message || 'Points redemption failed.');
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleModalClose = () => {
    if (!submitting) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleModalClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: { xs: 1.5, sm: 2.5 },
        },
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', pb: 1 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: 2.5,
              bgcolor: 'rgba(198,255,62,0.15)',
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AutoAwesomeRoundedIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
              Get AI Analysis Credits
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Unlock instant body scans &amp; personalized workout/diet insights
            </Typography>
          </Box>
        </Stack>

        <IconButton onClick={handleModalClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        {/* User Balance Header */}
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            borderRadius: 2.5,
            bgcolor: 'rgba(255,255,255,0.02)',
            border: '1px solid',
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <BoltRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Your Balance:
            </Typography>
            <Chip
              label={`${balance.aiCredits} AI Credits`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: 'rgba(198,255,62,0.15)', color: 'primary.main' }}
            />
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center">
            <StarsRoundedIcon sx={{ color: '#FFD700', fontSize: 20 }} />
            <Typography variant="body2" sx={{ fontWeight: 700 }}>
              Reward Points:
            </Typography>
            <Chip
              label={`${balance.points} pts`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: 'rgba(255,215,0,0.12)', color: '#FFD700' }}
            />
          </Stack>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        {/* If Success Result */}
        {successResult ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <Box
              sx={{
                width: 68,
                height: 68,
                borderRadius: '50%',
                bgcolor: successResult.type === 'D17' ? 'rgba(2,136,209,0.15)' : 'rgba(198,255,62,0.15)',
                color: successResult.type === 'D17' ? 'info.main' : 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              {successResult.type === 'D17' ? (
                <AccessTimeRoundedIcon sx={{ fontSize: 40 }} />
              ) : (
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 40 }} />
              )}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", mb: 1 }}>
              {successResult.type === 'D17' ? 'Payment Proof Submitted!' : 'Credits Added Successfully!'}
            </Typography>

            {successResult.ticketNumber && (
              <Chip
                label={`Ticket Reference: #${successResult.ticketNumber}`}
                size="small"
                sx={{ mb: 2, fontWeight: 700 }}
              />
            )}

            <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 500, mx: 'auto', mb: 3 }}>
              {successResult.message}
            </Typography>

            <Button
              variant="contained"
              onClick={handleModalClose}
              sx={{ fontWeight: 800, borderRadius: 2.5, px: 4 }}
            >
              Continue with AI Analysis
            </Button>
          </Box>
        ) : (
          <>
            {/* Step 1: Select Pack */}
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              1. Choose an AI Credit Pack
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3.5 }}>
              {packs.map((pack) => {
                const isSelected = selectedPackId === pack.id;
                return (
                  <Grid item xs={12} sm={4} key={pack.id}>
                    <Card
                      elevation={0}
                      onClick={() => setSelectedPackId(pack.id)}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        cursor: 'pointer',
                        border: '2px solid',
                        borderColor: isSelected ? 'primary.main' : 'divider',
                        bgcolor: isSelected ? 'rgba(198,255,62,0.04)' : 'transparent',
                        transition: 'all 0.2s ease',
                        position: 'relative',
                        '&:hover': {
                          borderColor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.2)',
                          transform: 'translateY(-2px)',
                        },
                      }}
                    >
                      {pack.badge && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            px: 1,
                            py: 0.2,
                            borderRadius: 1,
                            bgcolor: isSelected ? 'primary.main' : 'rgba(255,255,255,0.1)',
                            color: isSelected ? '#000' : 'text.primary',
                            fontSize: '0.65rem',
                            fontWeight: 800,
                            textTransform: 'uppercase',
                          }}
                        >
                          {pack.badge}
                        </Box>
                      )}

                      <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                        {pack.title}
                      </Typography>

                      <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', my: 1, fontFamily: "'Sora', sans-serif" }}>
                        {pack.credits} Credits
                      </Typography>

                      <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mb: 0.5 }}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {pack.priceTnd.toFixed(2)} TND
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ({pack.pricePerScan.toFixed(2)} TND/scan)
                        </Typography>
                      </Stack>

                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        or {pack.pointsPrice} reward points
                      </Typography>

                      <Typography variant="caption" color="text.secondary">
                        {pack.description}
                      </Typography>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Step 2: Payment Method */}
            <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              2. Select Payment Method
            </Typography>

            <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              {/* D17 Mobile Payment */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  border: '2px solid',
                  borderColor: paymentMethod === 'D17' ? 'primary.main' : 'divider',
                  bgcolor: paymentMethod === 'D17' ? 'rgba(198,255,62,0.03)' : 'transparent',
                }}
              >
                <FormControlLabel
                  value="D17"
                  control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        component="img"
                        src="/d17-logo.webp"
                        alt="D17"
                        sx={{ height: 26, width: 'auto', bgcolor: '#fff', p: 0.4, borderRadius: 0.8 }}
                      />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          D17 Mobile Payment (Tunisia Post)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Transfer to {d17Config.recipientName || 'GymPilot Official'} and attach confirmation screenshot.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0, width: '100%' }}
                />

                {paymentMethod === 'D17' && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Paper
                      elevation={0}
                      sx={{ p: 2, mb: 2, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid', borderColor: 'divider' }}
                    >
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                            Amount to Transfer
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                            {selectedPack.priceTnd.toFixed(2)} TND
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700 }}>
                            D17 Number ({d17Config.recipientName || 'GymPilot Official'})
                          </Typography>
                          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                            <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                              {d17Config.phoneNumber}
                            </Typography>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={handleCopyPhone}
                              startIcon={d17Copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                              sx={{
                                minWidth: 0,
                                px: 1.5,
                                py: 0.25,
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                color: d17Copied ? 'success.main' : 'text.primary',
                              }}
                            >
                              {d17Copied ? 'Copied' : 'Copy'}
                            </Button>
                          </Stack>
                        </Grid>
                      </Grid>
                    </Paper>

                    {/* Screenshot Upload Box */}
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', color: 'text.secondary', display: 'block', mb: 1 }}>
                        Payment Screenshot Proof *
                      </Typography>

                      <input
                        ref={d17FileInputRef}
                        type="file"
                        accept="image/png,image/jpeg,image/webp,image/jpg"
                        style={{ display: 'none' }}
                        onChange={handleD17FileChange}
                      />
                      <input
                        ref={d17CameraInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        style={{ display: 'none' }}
                        onChange={handleD17FileChange}
                      />

                      {!d17Preview ? (
                        <Paper
                          variant="outlined"
                          onClick={() => d17FileInputRef.current?.click()}
                          sx={{
                            p: 2.5,
                            border: '2px dashed',
                            borderColor: 'divider',
                            borderRadius: 2.5,
                            textAlign: 'center',
                            cursor: 'pointer',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(198,255,62,0.03)' },
                          }}
                        >
                          <CloudUploadRoundedIcon sx={{ fontSize: 36, color: 'text.secondary', mb: 1 }} />
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            Upload D17 Confirmation Screenshot
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                            PNG, JPG, or WebP (up to 5MB)
                          </Typography>
                          <Stack direction="row" spacing={1.5} justifyContent="center" onClick={(e) => e.stopPropagation()}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CloudUploadRoundedIcon />}
                              onClick={() => d17FileInputRef.current?.click()}
                              sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                              Choose File
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<CameraAltRoundedIcon />}
                              onClick={() => d17CameraInputRef.current?.click()}
                              sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                              Take Photo
                            </Button>
                          </Stack>
                        </Paper>
                      ) : (
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, borderColor: 'primary.main' }}>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                              component="img"
                              src={d17Preview}
                              alt="Receipt"
                              sx={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}
                            />
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 800 }}>Screenshot Attached</Typography>
                              <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                                {d17File?.name}
                              </Typography>
                            </Box>
                            <Button
                              size="small"
                              color="error"
                              variant="outlined"
                              startIcon={<DeleteOutlineRoundedIcon />}
                              onClick={handleRemoveD17File}
                              sx={{ borderRadius: 2, fontWeight: 700 }}
                            >
                              Remove
                            </Button>
                          </Stack>
                        </Paper>
                      )}
                    </Box>

                    <Grid container spacing={2} sx={{ mb: 1 }}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Your D17 Phone (Optional)"
                          placeholder="+216 XX XXX XXX"
                          value={d17SenderPhone}
                          onChange={(e) => setD17SenderPhone(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Reference / Notes (Optional)"
                          placeholder="e.g., Transaction ID"
                          value={d17Notes}
                          onChange={(e) => setD17Notes(e.target.value)}
                        />
                      </Grid>
                    </Grid>

                    <Alert severity="info" icon={<AccessTimeRoundedIcon fontSize="small" />} sx={{ mt: 1.5, fontSize: '0.78rem' }}>
                      <strong>24–48h SLA:</strong> D17 manual transfers are verified by our team. Credits are added automatically upon approval.
                    </Alert>
                  </Box>
                )}
              </Paper>

              {/* Instant Simulated Card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  mb: 1.5,
                  borderRadius: 2.5,
                  border: '2px solid',
                  borderColor: paymentMethod === 'INSTANT_CARD' ? 'primary.main' : 'divider',
                  bgcolor: paymentMethod === 'INSTANT_CARD' ? 'rgba(198,255,62,0.03)' : 'transparent',
                }}
              >
                <FormControlLabel
                  value="INSTANT_CARD"
                  control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <CreditCardRoundedIcon sx={{ color: 'primary.main', fontSize: 26 }} />
                      <Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Typography variant="body2" sx={{ fontWeight: 800 }}>
                            Instant Card Checkout (Simulation)
                          </Typography>
                          <Chip label="INSTANT ACCESS" size="small" sx={{ fontSize: '0.65rem', fontWeight: 800, bgcolor: 'rgba(198,255,62,0.15)', color: 'primary.main', height: 20 }} />
                        </Stack>
                        <Typography variant="caption" color="text.secondary">
                          Credits deposited to your account immediately without waiting.
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0, width: '100%' }}
                />

                {paymentMethod === 'INSTANT_CARD' && (
                  <Box sx={{ mt: 2, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Card Number"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          size="small"
                          fullWidth
                          label="Expiry"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <TextField
                          size="small"
                          fullWidth
                          label="CVC"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                )}
              </Paper>

              {/* Reward Points Redemption */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  borderRadius: 2.5,
                  border: '2px solid',
                  borderColor: paymentMethod === 'POINTS' ? 'primary.main' : 'divider',
                  bgcolor: paymentMethod === 'POINTS' ? 'rgba(198,255,62,0.03)' : 'transparent',
                }}
              >
                <FormControlLabel
                  value="POINTS"
                  control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                  label={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <StarsRoundedIcon sx={{ color: '#FFD700', fontSize: 26 }} />
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Redeem with Reward Points ({selectedPack.pointsPrice} pts)
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Your points balance: <strong>{balance.points} pts</strong> ({balance.points >= selectedPack.pointsPrice ? 'Sufficient balance' : 'Insufficient balance'})
                        </Typography>
                      </Box>
                    </Stack>
                  }
                  sx={{ m: 0, width: '100%' }}
                />
              </Paper>
            </RadioGroup>
          </>
        )}
      </DialogContent>

      {!successResult && (
        <DialogActions sx={{ p: 2.5, pt: 1, justifyContent: 'space-between' }}>
          <Button onClick={handleModalClose} sx={{ fontWeight: 700 }}>
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={submitting}
            onClick={handleSubmit}
            startIcon={submitting ? <CircularProgress size={18} color="inherit" /> : <AutoAwesomeRoundedIcon />}
            sx={{ fontWeight: 800, borderRadius: 2.5, px: 3, py: 1 }}
          >
            {submitting ? 'Processing...' : (
              paymentMethod === 'POINTS'
                ? `Redeem ${selectedPack.pointsPrice} Points for ${selectedPack.credits} Credits`
                : (paymentMethod === 'D17'
                  ? `Submit D17 Proof (${selectedPack.priceTnd.toFixed(2)} TND)`
                  : `Pay ${selectedPack.priceTnd.toFixed(2)} TND & Get Credits`)
            )}
          </Button>
        </DialogActions>
      )}
    </Dialog>
  );
}
