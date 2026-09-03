import { useState } from 'react';
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

import SEO from '../../components/SEO';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { orderService } from '../../services/orderService';
import { voucherService } from '../../services/voucherService';

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
                      <Paper
                        elevation={0}
                        sx={{
                          p: 2,
                          mb: 1.5,
                          borderRadius: 2,
                          border: '1px solid',
                          borderColor: paymentMethod === 'CASH_ON_DELIVERY' ? 'primary.main' : 'divider',
                          bgcolor: paymentMethod === 'CASH_ON_DELIVERY' ? 'rgba(198,255,62,0.04)' : 'transparent',
                        }}
                      >
                        <FormControlLabel
                          value="CASH_ON_DELIVERY"
                          control={<Radio sx={{ color: 'primary.main', '&.Mui-checked': { color: 'primary.main' } }} />}
                          label={
                            <Box>
                              <Typography variant="body2" sx={{ fontWeight: 700 }}>Cash on Delivery / Pay on Hand</Typography>
                              <Typography variant="caption" color="text.secondary">Pay with cash or card upon delivery to your address.</Typography>
                            </Box>
                          }
                        />
                      </Paper>

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
                      : `Confirm and place your order for TND ${finalPayableTotal.toFixed(2)} (Cash on Delivery)`
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
                      {submitting ? 'Confirming Order...' : `Place Order (TND ${finalPayableTotal.toFixed(2)})`}
                    </Typography>
                    <Typography component="span" sx={{ fontSize: '0.72rem', opacity: 0.85, fontWeight: 600, textTransform: 'none' }}>
                      Cash on Delivery · Standard 7 TND / Free &ge; 150 TND
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
              borderColor: 'primary.main',
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
                bgcolor: 'rgba(198,255,62,0.15)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
              }}
            >
              <CheckCircleOutlineRoundedIcon sx={{ fontSize: 44 }} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
              Order Confirmed!
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Order Reference #{confirmedOrder?.orderNumber}
            </Typography>
          </DialogTitle>

          <DialogContent>
            <Paper elevation={0} sx={{ p: 2.5, my: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 2.5, textAlign: 'left' }}>
              <Stack spacing={1}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">Total Amount Paid:</Typography>
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
                    {confirmedOrder?.paymentMethod === 'CASH_ON_DELIVERY' ? 'Cash on Delivery' : 'Card Payment'}
                  </Typography>
                </Stack>
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