import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Stack,
  TextField,
  Button,
  Divider,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Avatar,
  Paper,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
} from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded';
import CameraAltRoundedIcon from '@mui/icons-material/CameraAltRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import { QRCodeSVG } from 'qrcode.react';

import SEO from '../../components/SEO';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { voucherService } from '../../services/voucherService';
import { paymentService } from '../../services/paymentService';
import { d17Service } from '../../services/d17Service';

// Crypto & payment coin icon
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

export default function Checkout() {
  const { items, totals, pointsToUse, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [shippingAddress, setShippingAddress] = useState({
    fullName: user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : '',
    email: user?.email || '',
    address: '',
    city: '',
    postalCode: '',
    country: 'Tunisia',
    phone: '',
  });

  const [paymentMethod, setPaymentMethod] = useState('CASH_ON_DELIVERY');

  const [orderNotes, setOrderNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Voucher discount state (optional)
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [voucherError, setVoucherError] = useState('');

  // Confirmation modal
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  // Dynamic active payment methods from backend
  const [activePaymentMethods, setActivePaymentMethods] = useState([]);
  const [cryptoTxid, setCryptoTxid] = useState('');
  const [cryptoCopied, setCryptoCopied] = useState(false);

  // D17 & Manual payment state
  const d17FileInputRef = useRef(null);
  const d17CameraInputRef = useRef(null);
  const [d17Config, setD17Config] = useState({
    phoneNumber: '+216 21 214 512',
    recipientName: 'GymPilot Official',
    instructions: 'Send the exact amount to this number via D17, then take a screenshot of the payment confirmation.',
  });
  const [d17Copied, setD17Copied] = useState(false);
  const [d17SenderPhone, setD17SenderPhone] = useState('');
  const [d17Notes, setD17Notes] = useState('');
  const [d17File, setD17File] = useState(null);
  const [d17Preview, setD17Preview] = useState(null);
  const [d17Base64, setD17Base64] = useState('');
  const [d17FileType, setD17FileType] = useState('image/jpeg');
  const [d17TicketResult, setD17TicketResult] = useState(null);

  const isTunisia = !shippingAddress.country ||
    shippingAddress.country.toLowerCase() === 'tunisia' ||
    shippingAddress.country.toUpperCase() === 'TN';

  useEffect(() => {
    const country = shippingAddress.country || 'Tunisia';
    paymentService.getActiveMethods(country)
      .then((methods) => {
        if (methods) {
          setActivePaymentMethods(methods);
          const isTn = country.toLowerCase() === 'tunisia' || country.toUpperCase() === 'TN';
          if (isTn) {
            if (paymentMethod !== 'CASH_ON_DELIVERY' && paymentMethod !== 'D17' && !methods.some(m => m.code === paymentMethod)) {
              setPaymentMethod('CASH_ON_DELIVERY');
            }
          } else {
            if (paymentMethod === 'CASH_ON_DELIVERY' || (paymentMethod === 'D17' && !methods.some(m => m.code === 'D17'))) {
              if (methods.length > 0) {
                setPaymentMethod(methods[0].code);
              }
            }
          }
        }
      })
      .catch((err) => console.error('Failed to load active methods for checkout:', err));

    d17Service.getConfig()
      .then((cfg) => {
        if (cfg) setD17Config(cfg);
      })
      .catch(() => {});
  }, [shippingAddress.country]);

  const handleCopyD17Phone = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(d17Config.phoneNumber);
      setD17Copied(true);
      setTimeout(() => setD17Copied(false), 2500);
    }
  };

  const handleCopyCryptoAddress = (address) => {
    if (navigator.clipboard && address) {
      navigator.clipboard.writeText(address);
      setCryptoCopied(true);
      setTimeout(() => setCryptoCopied(false), 2500);
    }
  };

  const handleD17FileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPEG, or WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('Screenshot file is too large (Maximum 5MB). Please take another screenshot.');
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

  const handleRemoveD17Image = () => {
    setD17File(null);
    setD17Preview(null);
    setD17Base64('');
    if (d17FileInputRef.current) d17FileInputRef.current.value = '';
    if (d17CameraInputRef.current) d17CameraInputRef.current.value = '';
  };

  const handleAddressChange = (field) => (e) => {
    setShippingAddress((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleApplyVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    try {
      setVoucherLoading(true);
      setVoucherError('');
      const res = await voucherService.validateVoucher(
        voucherCodeInput.trim().toUpperCase(),
        totals.subtotal
      );
      if (res?.valid) {
        setAppliedVoucher(res);
      } else {
        setVoucherError(res?.message || 'Invalid voucher code.');
      }
    } catch (err) {
      setVoucherError(err.response?.data?.message || err.message || 'Invalid or expired voucher code.');
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleRemoveVoucher = () => {
    setAppliedVoucher(null);
    setVoucherCodeInput('');
    setVoucherError('');
  };

  const voucherDiscount = appliedVoucher ? (Number(appliedVoucher.discountAmount) || 0) : 0;
  const finalPayableTotal = Math.max(0, totals.total - voucherDiscount);

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (!shippingAddress.fullName || !shippingAddress.address || !shippingAddress.city || !shippingAddress.phone) {
      setError('Please fill in all required shipping details.');
      return;
    }

    const isManualMethod = paymentMethod === 'D17' || activePaymentMethods.some((m) => m.code === paymentMethod);
    const isCrypto = paymentMethod !== 'D17' && isManualMethod;

    if (paymentMethod === 'D17' && !d17Base64) {
      setError('Please attach your D17 payment confirmation screenshot before completing the order.');
      return;
    }

    if (isCrypto && !d17Base64 && !cryptoTxid.trim()) {
      setError('For cryptocurrency payments, please provide a payment screenshot and/or transaction hash (TXID).');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const orderPayload = {
        items: items.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
        })),
        shippingAddress,
        paymentMethod,
        pointsToUse,
        notes: orderNotes,
        voucherCode: appliedVoucher ? appliedVoucher.code : undefined,
      };

      const orderResult = await orderService.createOrder(orderPayload);

      // If manual/crypto payment, immediately submit payment proof linked to this order
      if (isManualMethod) {
        try {
          const selectedConfig = activePaymentMethods.find((m) => m.code === paymentMethod);
          const ticket = await paymentService.submitPaymentProof({
            type: 'ORDER',
            orderId: orderResult.id,
            amount: finalPayableTotal,
            paymentMethod,
            walletAddress: selectedConfig?.receivingAddress,
            txid: cryptoTxid.trim() || undefined,
            senderPhoneNumber: d17SenderPhone.trim() || undefined,
            userNotes: d17Notes.trim() || undefined,
            screenshotBase64: d17Base64 || undefined,
            screenshotType: d17FileType,
          });
          setD17TicketResult(ticket);
        } catch (proofErr) {
          console.error('Order created but failed to link payment proof automatically:', proofErr);
        }
      }

      clearCart();
      setConfirmedOrder(orderResult);
    } catch (err) {
      console.error('Failed to place order:', err);
      setError(err.response?.data?.message || err.message || 'Failed to complete order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !confirmedOrder) {
    return (
      <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>
          Your cart is empty
        </Typography>
        <Button component={RouterLink} to="/shop" variant="contained">
          Back to Shop
        </Button>
      </Container>
    );
  }

  return (
    <>
      <SEO title="Secure Checkout — GymPilot Shop" description="Complete your supplement and equipment order." path="/shop/checkout" noIndex />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 4 }}>
          <Button component={RouterLink} to="/shop/cart" startIcon={<ArrowBackRoundedIcon />} sx={{ color: 'text.secondary', fontWeight: 700 }}>
            Back to Cart
          </Button>
        </Stack>

        <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 4 }}>
          Secure Checkout
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 4 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmitOrder}>
          <Grid container spacing={4}>
            {/* Left Column: Shipping & Payment */}
            <Grid item xs={12} lg={7}>
              <Stack spacing={4}>
                {/* 1. Shipping Address */}
                <Card elevation={0} sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <LocalShippingRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                      1. Delivery Address
                    </Typography>
                  </Stack>

                  <Grid container spacing={2.5}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Full Name *"
                        value={shippingAddress.fullName}
                        onChange={handleAddressChange('fullName')}
                        fullWidth
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        label="Phone Number *"
                        value={shippingAddress.phone}
                        onChange={handleAddressChange('phone')}
                        fullWidth
                        size="small"
                        placeholder="+1 (555) 000-0000"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Street Address *"
                        value={shippingAddress.address}
                        onChange={handleAddressChange('address')}
                        fullWidth
                        size="small"
                        placeholder="House / Apt, Street Name"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="City *"
                        value={shippingAddress.city}
                        onChange={handleAddressChange('city')}
                        fullWidth
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Postal Code *"
                        value={shippingAddress.postalCode}
                        onChange={handleAddressChange('postalCode')}
                        fullWidth
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Country *"
                        value={shippingAddress.country}
                        onChange={handleAddressChange('country')}
                        fullWidth
                        size="small"
                        required
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        label="Order Notes / Delivery Instructions (Optional)"
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        fullWidth
                        multiline
                        rows={2}
                        size="small"
                        placeholder="e.g., Leave package at front door or call upon arrival"
                      />
                    </Grid>
                  </Grid>
                </Card>

                {/* 2. Payment Method */}
                <Card elevation={0} sx={{ p: 3.5, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 3 }}>
                    <CreditCardRoundedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
                    <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                      2. Payment Method
                    </Typography>
                  </Stack>

                  <FormControl component="fieldset" fullWidth>
                    <RadioGroup value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                      {/* Dynamically active manual & crypto payment methods */}
                      {activePaymentMethods.map((method) => {
                        const isSelected = paymentMethod === method.code;
                        const isD17 = method.code === 'D17';

                        if (isD17) {
                          return (
                            <Paper
                              key={method.code}
                              elevation={0}
                              sx={{
                                p: 2.5,
                                mb: 1.5,
                                borderRadius: 2.5,
                                border: '2px solid',
                                borderColor: isSelected ? 'primary.main' : 'divider',
                                bgcolor: isSelected ? 'rgba(198,255,62,0.04)' : 'transparent',
                                transition: 'all 0.2s ease',
                              }}
                            >
                              <FormControlLabel
                                value="D17"
                                control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                                label={
                                  <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                    <Box
                                      component="img"
                                      src="/d17-logo.webp"
                                      alt="D17"
                                      sx={{
                                        height: 28,
                                        width: 'auto',
                                        objectFit: 'contain',
                                        borderRadius: 1,
                                        bgcolor: '#fff',
                                        p: 0.5,
                                      }}
                                    />
                                    <Box>
                                      <Stack direction="row" spacing={1} alignItems="center">
                                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                          D17 Mobile Payment
                                        </Typography>
                                        <Box
                                          sx={{
                                            px: 1,
                                            py: 0.2,
                                            borderRadius: 1,
                                            bgcolor: 'rgba(198,255,62,0.15)',
                                            color: 'primary.main',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                          }}
                                        >
                                          FAST VERIFICATION
                                        </Box>
                                      </Stack>
                                      <Typography variant="caption" color="text.secondary">
                                        Pay via D17 mobile app to {method.recipientName || d17Config.recipientName || 'GymPilot Official'} &amp; upload payment receipt.
                                      </Typography>
                                    </Box>
                                  </Stack>
                                }
                                sx={{ m: 0, width: '100%' }}
                              />

                              {/* Collapsible D17 instruction & upload panel */}
                              {isSelected && (
                                <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                  {/* Target Payment details */}
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      p: 2,
                                      mb: 2.5,
                                      borderRadius: 2,
                                      bgcolor: 'rgba(255,255,255,0.03)',
                                      border: '1px solid',
                                      borderColor: 'divider',
                                    }}
                                  >
                                    <Grid container spacing={2} alignItems="center">
                                      <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                          Amount to Send
                                        </Typography>
                                        <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main' }}>
                                          TND {finalPayableTotal.toFixed(2)}
                                        </Typography>
                                      </Grid>
                                      <Grid item xs={12} sm={6}>
                                        <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                          D17 Recipient Phone ({method.recipientName || d17Config.recipientName || 'GymPilot Official'})
                                        </Typography>
                                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                          <Typography variant="body1" sx={{ fontWeight: 800, fontFamily: 'monospace', letterSpacing: 0.5 }}>
                                            {method.receivingAddress || d17Config.phoneNumber}
                                          </Typography>
                                          <Tooltip title={d17Copied ? 'Copied!' : 'Copy number'}>
                                            <Button
                                              size="small"
                                              variant="outlined"
                                              onClick={handleCopyD17Phone}
                                              startIcon={d17Copied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                                              sx={{
                                                minWidth: 0,
                                                px: 1.5,
                                                py: 0.25,
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                color: d17Copied ? 'success.main' : 'text.primary',
                                                borderColor: d17Copied ? 'success.main' : 'divider',
                                              }}
                                            >
                                              {d17Copied ? 'Copied' : 'Copy'}
                                            </Button>
                                          </Tooltip>
                                        </Stack>
                                      </Grid>
                                    </Grid>
                                  </Paper>

                                  {/* Step instructions */}
                                  <Stack spacing={1} sx={{ mb: 2.5 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                                      Instructions:
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      1. Open your <strong>D17</strong> app on your mobile device.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      2. Transfer exactly <strong>TND {finalPayableTotal.toFixed(2)}</strong> to phone number <strong>{method.receivingAddress || d17Config.phoneNumber}</strong> ({method.recipientName || d17Config.recipientName || 'GymPilot Official'}).
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      3. Take a clear screenshot of the completed transfer confirmation screen.
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                      4. Attach the screenshot below and click &quot;Submit D17 Order&quot;.
                                    </Typography>
                                  </Stack>

                                  {/* Screenshot Upload / Capture Box */}
                                  <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                                      Payment Confirmation Screenshot *
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
                                          p: 3,
                                          border: '2px dashed',
                                          borderColor: 'divider',
                                          borderRadius: 2.5,
                                          bgcolor: 'rgba(255,255,255,0.01)',
                                          textAlign: 'center',
                                          cursor: 'pointer',
                                          transition: 'all 0.2s ease',
                                          '&:hover': {
                                            borderColor: 'primary.main',
                                            bgcolor: 'rgba(198,255,62,0.04)',
                                          },
                                        }}
                                      >
                                        <CloudUploadRoundedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                          Click or Drag &amp; Drop screenshot here
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
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
                                      <Paper
                                        variant="outlined"
                                        sx={{
                                          p: 2,
                                          borderRadius: 2.5,
                                          borderColor: 'primary.main',
                                          bgcolor: 'rgba(198,255,62,0.02)',
                                        }}
                                      >
                                        <Stack direction="row" spacing={2} alignItems="center">
                                          <Box
                                            component="img"
                                            src={d17Preview}
                                            alt="Screenshot preview"
                                            sx={{
                                              width: 80,
                                              height: 80,
                                              objectFit: 'cover',
                                              borderRadius: 2,
                                              border: '1px solid',
                                              borderColor: 'divider',
                                            }}
                                          />
                                          <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Stack direction="row" spacing={1} alignItems="center">
                                              <CheckRoundedIcon sx={{ color: 'success.main', fontSize: 18 }} />
                                              <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                                Screenshot Attached
                                              </Typography>
                                            </Stack>
                                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
                                              {d17File?.name || 'receipt_screenshot.png'} ({((d17File?.size || 0) / 1024).toFixed(0)} KB)
                                            </Typography>
                                          </Box>
                                          <Button
                                            size="small"
                                            color="error"
                                            variant="outlined"
                                            startIcon={<DeleteOutlineRoundedIcon />}
                                            onClick={handleRemoveD17Image}
                                            sx={{ borderRadius: 2, fontWeight: 700 }}
                                          >
                                            Remove
                                          </Button>
                                        </Stack>
                                      </Paper>
                                    )}
                                  </Box>

                                  {/* Additional Details: Sender Phone & Notes */}
                                  <Grid container spacing={2} sx={{ mb: 1.5 }}>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        size="small"
                                        fullWidth
                                        label="Your D17 Phone Number (Optional)"
                                        placeholder="+216 XX XXX XXX"
                                        value={d17SenderPhone}
                                        onChange={(e) => setD17SenderPhone(e.target.value)}
                                        helperText="Helps our team match your payment faster"
                                      />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                      <TextField
                                        size="small"
                                        fullWidth
                                        label="Payment Reference / Note (Optional)"
                                        placeholder="e.g., Transaction ID or name on app"
                                        value={d17Notes}
                                        onChange={(e) => setD17Notes(e.target.value)}
                                      />
                                    </Grid>
                                  </Grid>

                                  {/* SLA Notice */}
                                  <Alert
                                    severity="info"
                                    icon={<AccessTimeRoundedIcon fontSize="small" />}
                                    sx={{
                                      py: 0.5,
                                      px: 1.5,
                                      borderRadius: 2,
                                      fontSize: '0.8rem',
                                      '& .MuiAlert-message': { py: 0.5 },
                                    }}
                                  >
                                    <strong>Verification SLA:</strong> Orders paid via D17 are verified by our team within <strong>24 to 48 hours</strong>. You&apos;ll receive instant email updates.
                                  </Alert>
                                </Box>
                              )}
                            </Paper>
                          );
                        }

                        // Crypto Payment Method Card
                        return (
                          <Paper
                            key={method.code}
                            elevation={0}
                            sx={{
                              p: 2.5,
                              mb: 1.5,
                              borderRadius: 2.5,
                              border: '2px solid',
                              borderColor: isSelected ? 'primary.main' : 'divider',
                              bgcolor: isSelected ? 'rgba(198,255,62,0.04)' : 'transparent',
                              transition: 'all 0.2s ease',
                            }}
                          >
                            <FormControlLabel
                              value={method.code}
                              control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                              label={
                                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap">
                                  <CoinIcon code={method.code} />
                                  <Box>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                        {method.name}
                                      </Typography>
                                      {method.network && (
                                        <Box
                                          sx={{
                                            px: 1,
                                            py: 0.2,
                                            borderRadius: 1,
                                            bgcolor: 'rgba(255,255,255,0.08)',
                                            color: 'primary.main',
                                            fontSize: '0.7rem',
                                            fontWeight: 800,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                          }}
                                        >
                                          {method.network}
                                        </Box>
                                      )}
                                      <Box
                                        sx={{
                                          px: 1,
                                          py: 0.2,
                                          borderRadius: 1,
                                          bgcolor: 'rgba(198,255,62,0.15)',
                                          color: 'primary.main',
                                          fontSize: '0.7rem',
                                          fontWeight: 800,
                                        }}
                                      >
                                        CRYPTO MANUAL
                                      </Box>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                      Send to GymPilot official receiving address &amp; provide TXID / receipt.
                                    </Typography>
                                  </Box>
                                </Stack>
                              }
                              sx={{ m: 0, width: '100%' }}
                            />

                            {/* Collapsible Crypto details & upload panel */}
                            {isSelected && (
                              <Box sx={{ mt: 2.5, pt: 2, borderTop: '1px dashed', borderColor: 'divider' }}>
                                {/* Network Warning Banner */}
                                {method.warningNotice && (
                                  <Alert
                                    severity="warning"
                                    icon={<WarningAmberRoundedIcon fontSize="small" />}
                                    sx={{
                                      mb: 2.5,
                                      borderRadius: 2,
                                      fontSize: '0.82rem',
                                      bgcolor: 'rgba(255,152,0,0.1)',
                                      border: '1px solid rgba(255,152,0,0.3)',
                                    }}
                                  >
                                    {method.warningNotice}
                                  </Alert>
                                )}

                                {/* Target Payment details with QR code & Copy */}
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 2.5,
                                    mb: 2.5,
                                    borderRadius: 2,
                                    bgcolor: 'rgba(255,255,255,0.03)',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                  }}
                                >
                                  <Grid container spacing={2.5} alignItems="center">
                                    {method.receivingAddress && (
                                      <Grid item xs={12} sm="auto">
                                        <Box
                                          sx={{
                                            p: 1.2,
                                            bgcolor: '#FFFFFF',
                                            borderRadius: 2,
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                                          }}
                                        >
                                          <QRCodeSVG
                                            value={method.receivingAddress}
                                            size={105}
                                            level="M"
                                            includeMargin={false}
                                          />
                                        </Box>
                                      </Grid>
                                    )}

                                    <Grid item xs={12} sm>
                                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                        Amount to Send
                                      </Typography>
                                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                                        TND {finalPayableTotal.toFixed(2)}{' '}
                                        <Typography component="span" variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                                          (send equivalent value in {method.name})
                                        </Typography>
                                      </Typography>

                                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 700, letterSpacing: 0.5 }}>
                                        GymPilot Official Receiving Address ({method.network || 'Mainnet'})
                                      </Typography>
                                      <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap', gap: 1 }}>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: 800,
                                            fontFamily: 'monospace',
                                            letterSpacing: 0.5,
                                            wordBreak: 'break-all',
                                            bgcolor: 'rgba(0,0,0,0.3)',
                                            p: 0.8,
                                            borderRadius: 1.5,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            flex: 1,
                                            minWidth: 200,
                                          }}
                                        >
                                          {method.receivingAddress}
                                        </Typography>
                                        <Tooltip title={cryptoCopied ? 'Copied to clipboard!' : 'Copy wallet address'}>
                                          <Button
                                            size="small"
                                            variant="outlined"
                                            onClick={() => handleCopyCryptoAddress(method.receivingAddress)}
                                            startIcon={cryptoCopied ? <CheckRoundedIcon /> : <ContentCopyRoundedIcon />}
                                            sx={{
                                              minWidth: 0,
                                              px: 1.5,
                                              py: 0.6,
                                              fontSize: '0.75rem',
                                              fontWeight: 700,
                                              color: cryptoCopied ? 'success.main' : 'text.primary',
                                              borderColor: cryptoCopied ? 'success.main' : 'divider',
                                            }}
                                          >
                                            {cryptoCopied ? 'Copied' : 'Copy'}
                                          </Button>
                                        </Tooltip>
                                      </Stack>
                                    </Grid>
                                  </Grid>
                                </Paper>

                                {/* Step instructions */}
                                <Stack spacing={1} sx={{ mb: 2.5 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                                    Instructions:
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    1. Open your crypto wallet or exchange ({method.network || 'appropriate network'}).
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    2. Transfer equivalent of <strong>TND {finalPayableTotal.toFixed(2)}</strong> to the address above.
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    3. Paste the transaction hash (TXID) and/or upload a screenshot below.
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary">
                                    4. Click &quot;Submit Order&quot; to place your order.
                                  </Typography>
                                </Stack>

                                {/* TXID Input */}
                                <Box sx={{ mb: 2 }}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    label="Transaction Hash / TXID"
                                    placeholder="e.g. 8f6b12a... or 0x4d9e..."
                                    value={cryptoTxid}
                                    onChange={(e) => setCryptoTxid(e.target.value)}
                                    helperText="Paste your blockchain transaction hash here for faster verification"
                                    inputProps={{ style: { fontFamily: 'monospace' } }}
                                  />
                                </Box>

                                {/* Screenshot Upload / Capture Box */}
                                <Box sx={{ mb: 2 }}>
                                  <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 1 }}>
                                    Payment Screenshot (Optional if TXID provided)
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
                                        p: 3,
                                        border: '2px dashed',
                                        borderColor: 'divider',
                                        borderRadius: 2.5,
                                        bgcolor: 'rgba(255,255,255,0.01)',
                                        textAlign: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                          borderColor: 'primary.main',
                                          bgcolor: 'rgba(198,255,62,0.04)',
                                        },
                                      }}
                                    >
                                      <CloudUploadRoundedIcon sx={{ fontSize: 40, color: 'text.secondary', mb: 1 }} />
                                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                        Click or Drag &amp; Drop screenshot here
                                      </Typography>
                                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 2 }}>
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
                                    <Paper
                                      variant="outlined"
                                      sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        borderColor: 'primary.main',
                                        bgcolor: 'rgba(198,255,62,0.02)',
                                      }}
                                    >
                                      <Stack direction="row" spacing={2} alignItems="center">
                                        <Box
                                          component="img"
                                          src={d17Preview}
                                          alt="Screenshot preview"
                                          sx={{
                                            width: 80,
                                            height: 80,
                                            objectFit: 'cover',
                                            borderRadius: 2,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                          }}
                                        />
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                          <Stack direction="row" spacing={1} alignItems="center">
                                            <CheckRoundedIcon sx={{ color: 'success.main', fontSize: 18 }} />
                                            <Typography variant="body2" sx={{ fontWeight: 800 }}>
                                              Screenshot Attached
                                            </Typography>
                                          </Stack>
                                          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block', mt: 0.5 }}>
                                            {d17File?.name || 'receipt_screenshot.png'} ({((d17File?.size || 0) / 1024).toFixed(0)} KB)
                                          </Typography>
                                        </Box>
                                        <Button
                                          size="small"
                                          color="error"
                                          variant="outlined"
                                          startIcon={<DeleteOutlineRoundedIcon />}
                                          onClick={handleRemoveD17Image}
                                          sx={{ borderRadius: 2, fontWeight: 700 }}
                                        >
                                          Remove
                                        </Button>
                                      </Stack>
                                    </Paper>
                                  )}
                                </Box>

                                {/* Additional Details: Notes */}
                                <Box sx={{ mb: 1.5 }}>
                                  <TextField
                                    size="small"
                                    fullWidth
                                    label="Payment Reference / Note (Optional)"
                                    placeholder="e.g., Sender wallet address or exchange used"
                                    value={d17Notes}
                                    onChange={(e) => setD17Notes(e.target.value)}
                                  />
                                </Box>

                                {/* SLA Notice */}
                                <Alert
                                  severity="info"
                                  icon={<AccessTimeRoundedIcon fontSize="small" />}
                                  sx={{
                                    py: 0.5,
                                    px: 1.5,
                                    borderRadius: 2,
                                    fontSize: '0.8rem',
                                    '& .MuiAlert-message': { py: 0.5 },
                                  }}
                                >
                                  <strong>Verification SLA:</strong> Crypto payments are verified by our team on the blockchain within <strong>24 to 48 hours</strong>. You&apos;ll receive instant email updates.
                                </Alert>
                              </Box>
                            )}
                          </Paper>
                        );
                      })}

                      {/* Cash on Delivery Option */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: paymentMethod === 'CASH_ON_DELIVERY' ? 'primary.main' : 'divider',
                          bgcolor: paymentMethod === 'CASH_ON_DELIVERY' ? 'rgba(198,255,62,0.04)' : 'transparent',
                          opacity: isTunisia ? 1 : 0.6,
                        }}
                      >
                        <FormControlLabel
                          value="CASH_ON_DELIVERY"
                          disabled={!isTunisia}
                          control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                          label={
                            <Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <Typography variant="body2" sx={{ fontWeight: 700, color: isTunisia ? 'text.primary' : 'text.disabled' }}>
                                  Cash on Delivery / Pay on Hand
                                </Typography>
                                {!isTunisia && (
                                  <Box
                                    sx={{
                                      px: 0.8,
                                      py: 0.2,
                                      borderRadius: 1,
                                      bgcolor: 'rgba(255,255,255,0.08)',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                      color: 'text.disabled',
                                    }}
                                  >
                                    Tunisia Only
                                  </Box>
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.secondary">
                                {isTunisia
                                  ? 'Pay with cash or card upon delivery to your address.'
                                  : 'Cash on delivery is only available for deliveries within Tunisia.'}
                              </Typography>
                            </Box>
                          }
                        />
                      </Paper>

                      {/* Credit Card Option (Disabled) */}
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: 'divider',
                          bgcolor: 'action.disabledBackground',
                          opacity: 0.6,
                        }}
                      >
                        <FormControlLabel
                          value="CREDIT_CARD"
                          disabled
                          control={<Radio disabled sx={{ color: 'text.disabled' }} />}
                          label={
                            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                              <Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                                  Credit / Debit Card
                                </Typography>
                                <Typography variant="caption" color="text.disabled">
                                  Encrypted 256-bit secure payment simulation.
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  ml: 1,
                                  px: 1,
                                  py: 0.25,
                                  borderRadius: 1,
                                  bgcolor: 'rgba(255,255,255,0.08)',
                                  border: '1px solid',
                                  borderColor: 'divider',
                                }}
                              >
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.disabled' }}>
                                  Not Available Yet
                                </Typography>
                              </Box>
                            </Stack>
                          }
                        />
                      </Paper>
                    </RadioGroup>
                  </FormControl>
                </Card>
              </Stack>
            </Grid>

            {/* Right Column: Order Review */}
            <Grid item xs={12} lg={5}>
              <Card
                elevation={0}
                sx={{
                  p: 3.5,
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  position: 'sticky',
                  top: 90,
                }}
              >
                <Typography variant="h6" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 2.5 }}>
                  Order Review ({totals.itemCount} items)
                </Typography>

                {/* Items preview */}
                <Stack spacing={2} sx={{ mb: 3, maxHeight: 240, overflowY: 'auto', pr: 1 }}>
                  {items.map((item) => (
                    <Stack key={item.productId} direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={item.image} variant="rounded" sx={{ width: 48, height: 48, borderRadius: 1.5 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                          {item.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {item.quantity}x @ TND {Number(item.price).toFixed(2)}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>
                        TND {(Number(item.price) * item.quantity).toFixed(2)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Optional Promo / Voucher Code */}
                <Box sx={{ mb: 2.5, p: 2, borderRadius: 2.5, bgcolor: 'rgba(255,255,255,0.03)', border: '1px solid', borderColor: 'divider' }}>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
                    <LocalOfferRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                    <Typography variant="caption" sx={{ fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'text.secondary' }}>
                      Discount Voucher (Optional)
                    </Typography>
                  </Stack>

                  {appliedVoucher ? (
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'rgba(198, 255, 62, 0.08)',
                        border: '1px solid',
                        borderColor: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LocalOfferRoundedIcon sx={{ color: 'primary.main', fontSize: 18 }} />
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', letterSpacing: 0.5 }}>
                            {appliedVoucher.code}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                            {appliedVoucher.message || `Savings of TND ${voucherDiscount.toFixed(2)}`}
                          </Typography>
                        </Box>
                      </Stack>
                      <Button
                        size="small"
                        color="inherit"
                        onClick={handleRemoveVoucher}
                        startIcon={<CloseRoundedIcon fontSize="small" />}
                        sx={{ fontSize: '0.75rem', fontWeight: 700, color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        Remove
                      </Button>
                    </Box>
                  ) : (
                    <Stack spacing={1}>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          fullWidth
                          placeholder="e.g. PILOT10"
                          value={voucherCodeInput}
                          onChange={(e) => {
                            setVoucherCodeInput(e.target.value.toUpperCase());
                            setVoucherError('');
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleApplyVoucher();
                            }
                          }}
                          disabled={voucherLoading}
                          inputProps={{ style: { textTransform: 'uppercase', fontWeight: 700, fontSize: '0.85rem' } }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 2,
                            },
                          }}
                        />
                        <Button
                          variant="outlined"
                          onClick={handleApplyVoucher}
                          disabled={!voucherCodeInput.trim() || voucherLoading}
                          sx={{
                            fontWeight: 800,
                            borderRadius: 2,
                            px: 2.5,
                            whiteSpace: 'nowrap',
                            borderColor: 'divider',
                          }}
                        >
                          {voucherLoading ? <CircularProgress size={16} /> : 'Apply'}
                        </Button>
                      </Stack>
                      {voucherError && (
                        <Typography variant="caption" sx={{ color: 'error.main', fontWeight: 600, px: 0.5 }}>
                          {voucherError}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>

                {/* Totals breakdown */}
                <Stack spacing={1.5} sx={{ mb: 3 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>TND {totals.subtotal.toFixed(2)}</Typography>
                  </Stack>

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Shipping</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 700, color: totals.shipping === 0 ? 'success.main' : 'text.primary' }}>
                      {totals.shipping === 0 ? 'FREE' : `TND ${totals.shipping.toFixed(2)}`}
                    </Typography>
                  </Stack>

                  {totals.pointsDiscount > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: 'primary.main' }}>Reward Points Discount</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        -TND {totals.pointsDiscount.toFixed(2)}
                      </Typography>
                    </Stack>
                  )}

                  {voucherDiscount > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" sx={{ color: 'success.main', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocalOfferRoundedIcon sx={{ fontSize: 16 }} /> Voucher ({appliedVoucher?.code})
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                        -TND {voucherDiscount.toFixed(2)}
                      </Typography>
                    </Stack>
                  )}

                  <Divider />

                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Final Total</Typography>
                    <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                      TND {finalPayableTotal.toFixed(2)}
                    </Typography>
                  </Stack>
                </Stack>

                <Tooltip
                  title={
                    submitting
                      ? 'Securely transmitting your order...'
                      : (paymentMethod === 'D17'
                        ? `Submit D17 payment proof for TND ${finalPayableTotal.toFixed(2)}`
                        : paymentMethod !== 'CASH_ON_DELIVERY' && paymentMethod !== 'CREDIT_CARD'
                        ? `Submit crypto payment proof for TND ${finalPayableTotal.toFixed(2)}`
                        : `Confirm and place your order for TND ${finalPayableTotal.toFixed(2)} (Cash on Delivery)`)
                  }
                  arrow
                  placement="top"
                >
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={submitting}
                    startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <LockRoundedIcon />}
                    sx={{
                      fontWeight: 800,
                      py: 1.3,
                      borderRadius: 2.5,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.25,
                    }}
                  >
                    <Typography component="span" sx={{ fontWeight: 800, fontSize: '1rem', lineHeight: 1.2 }}>
                      {submitting
                        ? (paymentMethod === 'D17'
                          ? 'Submitting D17 Proof...'
                          : paymentMethod !== 'CASH_ON_DELIVERY' && paymentMethod !== 'CREDIT_CARD'
                          ? 'Submitting Crypto Payment...'
                          : 'Confirming Order...')
                        : (paymentMethod === 'D17'
                          ? `Submit D17 Order (TND ${finalPayableTotal.toFixed(2)})`
                          : paymentMethod !== 'CASH_ON_DELIVERY' && paymentMethod !== 'CREDIT_CARD'
                          ? `Submit ${activePaymentMethods.find((m) => m.code === paymentMethod)?.name || 'Crypto'} Order (TND ${finalPayableTotal.toFixed(2)})`
                          : `Place Order (TND ${finalPayableTotal.toFixed(2)})`)}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600, textTransform: 'none' }}>
                      {paymentMethod === 'D17'
                        ? 'D17 Mobile Payment · Verification within 24–48h'
                        : paymentMethod !== 'CASH_ON_DELIVERY' && paymentMethod !== 'CREDIT_CARD'
                        ? 'Cryptocurrency · Blockchain verification within 24–48h'
                        : 'Cash on Delivery · Standard 7 TND / Free ≥ 150 TND'}
                    </Typography>
                  </Button>
                </Tooltip>

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mt: 2 }}>
                  By placing this order you agree to GymPilot's Storefront & Privacy Policies.
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </form>

        {/* Order Confirmation Modal */}
        <Dialog
          open={!!confirmedOrder}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 4,
              border: '1px solid',
              borderColor:
                confirmedOrder?.paymentMethod === 'D17' ||
                (confirmedOrder?.paymentMethod && confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' && confirmedOrder?.paymentMethod !== 'CREDIT_CARD')
                  ? 'info.main'
                  : 'primary.main',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              p: 2,
              textAlign: 'center',
            },
          }}
        >
          <DialogTitle>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: '50%',
                bgcolor:
                  confirmedOrder?.paymentMethod === 'D17' ||
                  (confirmedOrder?.paymentMethod && confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' && confirmedOrder?.paymentMethod !== 'CREDIT_CARD')
                    ? 'rgba(2,136,209,0.15)'
                    : 'rgba(198,255,62,0.15)',
                color:
                  confirmedOrder?.paymentMethod === 'D17' ||
                  (confirmedOrder?.paymentMethod && confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' && confirmedOrder?.paymentMethod !== 'CREDIT_CARD')
                    ? 'info.main'
                    : 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              {confirmedOrder?.paymentMethod === 'D17' ||
              (confirmedOrder?.paymentMethod && confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' && confirmedOrder?.paymentMethod !== 'CREDIT_CARD') ? (
                <AccessTimeRoundedIcon sx={{ fontSize: 44 }} />
              ) : (
                <CheckCircleOutlineRoundedIcon sx={{ fontSize: 44 }} />
              )}
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
              {confirmedOrder?.paymentMethod === 'D17'
                ? 'Payment Proof Submitted!'
                : confirmedOrder?.paymentMethod && confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' && confirmedOrder?.paymentMethod !== 'CREDIT_CARD'
                ? 'Crypto Payment Submitted!'
                : 'Order Confirmed!'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Order Reference #{confirmedOrder?.orderNumber}
              {d17TicketResult?.ticketNumber && ` · Ticket #${d17TicketResult.ticketNumber}`}
            </Typography>
          </DialogTitle>

          <DialogContent>
            {confirmedOrder?.paymentMethod === 'D17' && (
              <Alert severity="info" sx={{ mb: 2.5, textAlign: 'left', borderRadius: 2.5 }}>
                <strong>D17 Verification in Progress:</strong> We received your payment screenshot. Our team verifies transfers to <strong>{d17Config.recipientName || 'GymPilot Official'}</strong> within <strong>24 to 48 hours</strong>. Once approved, your order will be immediately prepared for dispatch.
              </Alert>
            )}

            {confirmedOrder?.paymentMethod &&
              confirmedOrder?.paymentMethod !== 'D17' &&
              confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' &&
              confirmedOrder?.paymentMethod !== 'CREDIT_CARD' && (
                <Alert severity="info" sx={{ mb: 2.5, textAlign: 'left', borderRadius: 2.5 }}>
                  <strong>Crypto Verification in Progress:</strong> We received your transaction details. Our team verifies blockchain transfers within <strong>24 to 48 hours</strong>. Once confirmed, your order will be prepared for dispatch.
                </Alert>
              )}

            <Paper elevation={0} sx={{ p: 2.5, my: 1, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 2.5, textAlign: 'left' }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total Payable:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                    TND {confirmedOrder?.totalAmount?.toFixed(2)}
                  </Typography>
                </Stack>
                {confirmedOrder?.voucherCode && (
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Voucher Applied:</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'success.main' }}>
                      {confirmedOrder.voucherCode}
                    </Typography>
                  </Stack>
                )}
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Payment Method:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {confirmedOrder?.paymentMethod === 'D17'
                      ? 'D17 Mobile Payment'
                      : confirmedOrder?.paymentMethod === 'USDT_TRC20'
                      ? 'USDT (TRC20 Network)'
                      : confirmedOrder?.paymentMethod === 'BTC'
                      ? 'Bitcoin (BTC)'
                      : confirmedOrder?.paymentMethod === 'ETH'
                      ? 'Ethereum (ETH)'
                      : confirmedOrder?.paymentMethod === 'CASH_ON_DELIVERY'
                      ? 'Cash on Delivery'
                      : confirmedOrder?.paymentMethod}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Payment Status:</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 800,
                      color:
                        confirmedOrder?.paymentMethod === 'D17' ||
                        (confirmedOrder?.paymentMethod && confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' && confirmedOrder?.paymentMethod !== 'CREDIT_CARD')
                          ? 'warning.main'
                          : 'info.main',
                    }}
                  >
                    {confirmedOrder?.paymentMethod === 'D17' ||
                    (confirmedOrder?.paymentMethod && confirmedOrder?.paymentMethod !== 'CASH_ON_DELIVERY' && confirmedOrder?.paymentMethod !== 'CREDIT_CARD')
                      ? 'Pending Verification (24–48h)'
                      : 'Pending Delivery'}
                  </Typography>
                </Stack>

                {/* Crypto TXID display & link */}
                {(d17TicketResult?.txid || cryptoTxid) && (
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Transaction Hash (TXID):</Typography>
                    <Stack direction="row" spacing={0.5} alignItems="center">
                      <Typography variant="caption" sx={{ fontWeight: 800, fontFamily: 'monospace' }}>
                        {(d17TicketResult?.txid || cryptoTxid).slice(0, 10)}...{(d17TicketResult?.txid || cryptoTxid).slice(-8)}
                      </Typography>
                      {d17TicketResult?.explorerUrl && (
                        <Tooltip title="View on Blockchain Explorer">
                          <Button
                            size="small"
                            component="a"
                            href={d17TicketResult.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            sx={{ minWidth: 0, p: 0.5 }}
                          >
                            <OpenInNewRoundedIcon sx={{ fontSize: 16 }} />
                          </Button>
                        </Tooltip>
                      )}
                    </Stack>
                  </Stack>
                )}

                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Estimated Delivery:</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>2 - 4 Business Days</Typography>
                </Stack>
                {confirmedOrder?.pointsEarned > 0 && (
                  <Stack direction="row" justifyContent="space-between" sx={{ pt: 1, borderTop: '1px dashed', borderColor: 'divider' }}>
                    <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 700 }}>Points Awarded:</Typography>
                    <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 800 }}>
                      +{confirmedOrder.pointsEarned} pts
                    </Typography>
                  </Stack>
                )}
              </Stack>
            </Paper>

            <Typography variant="body2" color="text.secondary">
              We've dispatched your order details to your registered email. You can track this order in your Athlete Profile anytime.
            </Typography>
          </DialogContent>

          <DialogActions sx={{ p: 2, justifyContent: 'center', gap: 2 }}>
            <Button
              component={RouterLink}
              to="/shop/orders"
              variant="contained"
              sx={{ fontWeight: 700, borderRadius: 2, px: 3 }}
            >
              View Order History
            </Button>
            <Button
              component={RouterLink}
              to="/shop"
              variant="outlined"
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Continue Shopping
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
}