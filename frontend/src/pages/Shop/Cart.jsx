import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Stack,
  Button,
  IconButton,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Slider,
} from '@mui/material';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';

import SEO from '../../components/SEO';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

export default function Cart() {
  const { items, totals, updateQuantity, removeFromCart, pointsToUse, setPointsToUse } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userPoints = user?.points || 0;
  const maxPointsApplicable = Math.min(userPoints, Math.floor(totals.subtotal * 5)); // 10 pts = $1

  const handlePointsSlider = (_, val) => {
    setPointsToUse(val);
  };

  if (items.length === 0) {
    return (
      <>
        <SEO title="Your Cart — GymPilot Shop" description="Review your selected supplements and training tools." path="/shop/cart" />
        <Container maxWidth="md" sx={{ py: 10, textAlign: 'center' }}>
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: 4,
              bgcolor: 'rgba(255,255,255,0.03)',
              border: '1px dashed',
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              color: 'text.secondary',
            }}
          >
            <ShoppingBagRoundedIcon sx={{ fontSize: 40 }} />
          </Box>
          <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 1.5 }}>
            Your Cart is Empty
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 460, mx: 'auto' }}>
            Explore our laboratory-tested supplements, protein powders, and heavy-duty gym equipment.
          </Typography>
          <Button
            component={RouterLink}
            to="/shop"
            variant="contained"
            size="large"
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ fontWeight: 800, borderRadius: 2, px: 4, py: 1.4 }}
          >
            Start Shopping
          </Button>
        </Container>
      </>
    );
  }

  return (
    <>
      <SEO title="Your Cart — GymPilot Shop" description="Review your selected supplements and training tools." path="/shop/cart" />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 4 }}>
          Shopping Cart ({totals.itemCount} items)
        </Typography>

        <Grid container spacing={4}>
          {/* Items Table */}
          <Grid item xs={12} lg={8}>
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3.5, overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Product</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>Quantity</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Total</TableCell>
                    <TableCell align="center" sx={{ width: 60 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.productId} hover>
                      {/* Product details */}
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            src={item.image}
                            variant="rounded"
                            sx={{ width: 64, height: 64, bgcolor: 'background.elevated', borderRadius: 2 }}
                          />
                          <Box>
                            <Typography
                              component={RouterLink}
                              to={`/shop/${item.productId}`}
                              variant="body2"
                              sx={{ fontWeight: 700, color: 'text.primary', textDecoration: 'none', '&:hover': { color: 'primary.main' } }}
                            >
                              {item.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                              ${Number(item.price).toFixed(2)} each · {item.sellerStoreName || 'GymPilot Store'}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>

                      {/* Quantity selector */}
                      <TableCell align="center">
                        <Box
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            p: 0.25,
                          }}
                        >
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            sx={{ p: 0.5 }}
                          >
                            <RemoveRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                          <Typography variant="body2" sx={{ px: 1.5, fontWeight: 700 }}>
                            {item.quantity}
                          </Typography>
                          <IconButton
                            size="small"
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            sx={{ p: 0.5 }}
                          >
                            <AddRoundedIcon sx={{ fontSize: 14 }} />
                          </IconButton>
                        </Box>
                      </TableCell>

                      {/* Total */}
                      <TableCell align="right">
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                          ${(Number(item.price) * item.quantity).toFixed(2)}
                        </Typography>
                      </TableCell>

                      {/* Remove */}
                      <TableCell align="center">
                        <IconButton
                          size="small"
                          onClick={() => removeFromCart(item.productId)}
                          sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                        >
                          <DeleteOutlineRoundedIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Button
                component={RouterLink}
                to="/shop"
                startIcon={<ArrowBackRoundedIcon />}
                sx={{ fontWeight: 700, color: 'text.secondary' }}
              >
                Continue Shopping
              </Button>
            </Box>
          </Grid>

          {/* Order Summary Sidebar */}
          <Grid item xs={12} lg={4}>
            <Card
              elevation={0}
              sx={{
                p: 3.5,
                borderRadius: 3.5,
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
            >
              <Typography variant="h6" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 2.5 }}>
                Order Summary
              </Typography>

              <Stack spacing={2} sx={{ mb: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">Subtotal</Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>${totals.subtotal.toFixed(2)}</Typography>
                </Stack>

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <LocalShippingRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">Shipping</Typography>
                  </Stack>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: totals.shipping === 0 ? 'success.main' : 'text.primary' }}>
                    {totals.shipping === 0 ? 'FREE' : `$${totals.shipping.toFixed(2)}`}
                  </Typography>
                </Stack>

                {/* Reward points redemption box */}
                {userPoints > 0 && maxPointsApplicable > 0 && (
                  <Paper
                    elevation={0}
                    sx={{
                      p: 2,
                      borderRadius: 2.5,
                      border: '1px solid rgba(198,255,62,0.25)',
                      bgcolor: 'rgba(198,255,62,0.05)',
                    }}
                  >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <EmojiEventsRoundedIcon sx={{ color: '#FFD700', fontSize: 18 }} />
                        <Typography variant="caption" sx={{ fontWeight: 800 }}>
                          Redeem Points ({userPoints} pts available)
                        </Typography>
                      </Stack>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        -${totals.pointsDiscount.toFixed(2)}
                      </Typography>
                    </Stack>
                    <Slider
                      value={pointsToUse}
                      min={0}
                      max={maxPointsApplicable}
                      step={10}
                      onChange={handlePointsSlider}
                      sx={{ color: 'primary.main' }}
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                      Using {pointsToUse} points for a ${ (pointsToUse * 0.10).toFixed(2) } discount
                    </Typography>
                  </Paper>
                )}

                <Divider />

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Total</Typography>
                  <Typography variant="h5" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                    ${totals.total.toFixed(2)}
                  </Typography>
                </Stack>

                <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: 'rgba(255,255,255,0.03)', textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    <MonetizationOnRoundedIcon sx={{ fontSize: 14, verticalAlign: 'middle', mr: 0.5, color: '#FFD700' }} /> You will earn <strong style={{ color: '#C6FF3E' }}>+{totals.pointsEarned} GymPilot Points</strong> with this purchase!
                  </Typography>
                </Box>
              </Stack>

              <Button
                variant="contained"
                fullWidth
                size="large"
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={() => navigate('/shop/checkout')}
                sx={{ fontWeight: 800, py: 1.5, borderRadius: 2.5 }}
              >
                Proceed to Checkout
              </Button>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}
