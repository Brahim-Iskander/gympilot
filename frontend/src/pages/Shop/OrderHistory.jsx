import { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  Chip,
  Button,
  Avatar,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  CircularProgress,
  Paper,
  IconButton,
} from '@mui/material';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ReceiptLongRoundedIcon from '@mui/icons-material/ReceiptLongRounded';

import SEO from '../../components/SEO';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../context/AuthContext';

function statusChipConfig(status) {
  switch ((status || '').toUpperCase()) {
    case 'DELIVERED':
      return { label: 'Delivered', color: 'success', icon: <CheckCircleRoundedIcon sx={{ fontSize: 16 }} /> };
    case 'SHIPPED':
      return { label: 'In Transit / Shipped', color: 'info', icon: <LocalShippingRoundedIcon sx={{ fontSize: 16 }} /> };
    case 'PROCESSING':
      return { label: 'Processing', color: 'warning', icon: <AccessTimeRoundedIcon sx={{ fontSize: 16 }} /> };
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'error', icon: <CloseRoundedIcon sx={{ fontSize: 16 }} /> };
    default:
      return { label: 'Order Placed', color: 'default', icon: <AccessTimeRoundedIcon sx={{ fontSize: 16 }} /> };
  }
}

export default function OrderHistory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await orderService.getMyOrders({ page, size: 8 });
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <>
      <SEO title="My Orders & Purchases — GymPilot Shop" description="Track your GymPilot supplement deliveries and orders." path="/shop/orders" />

      <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }} flexWrap="wrap" gap={2}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800, mb: 0.5 }}>
              Order History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Track fulfillment status, delivery addresses, and receipts for your GymPilot marketplace orders.
            </Typography>
          </Box>
          <Button component={RouterLink} to="/shop" variant="outlined" startIcon={<ShoppingBagRoundedIcon />} sx={{ fontWeight: 700, borderRadius: 2 }}>
            Continue Shopping
          </Button>
        </Stack>

        {loading ? (
          <Box sx={{ py: 12, textAlign: 'center' }}>
            <CircularProgress size={44} sx={{ color: 'primary.main', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">Loading your order history...</Typography>
          </Box>
        ) : orders.length === 0 ? (
          <Card
            elevation={0}
            sx={{
              p: 8,
              borderRadius: 4,
              border: '1px dashed',
              borderColor: 'divider',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.03)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                color: 'text.secondary',
              }}
            >
              <ReceiptLongRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              No orders placed yet
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              You haven't bought any supplements or workout equipment yet.
            </Typography>
            <Button component={RouterLink} to="/shop" variant="contained" sx={{ fontWeight: 800, borderRadius: 2, px: 3 }}>
              Explore Shop
            </Button>
          </Card>
        ) : (
          <Stack spacing={3}>
            {orders.map((order) => {
              const st = statusChipConfig(order.status);
              return (
                <Card
                  key={order.id}
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                    transition: 'border-color .2s ease',
                    '&:hover': { borderColor: 'rgba(198,255,62,0.3)' },
                  }}
                >
                  {/* Order header */}
                  <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 2.5 }}>
                    <Box>
                      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                          Order #{order.orderNumber}
                        </Typography>
                        <Chip
                          label={st.label}
                          size="small"
                          color={st.color}
                          icon={st.icon}
                          sx={{ fontWeight: 700, fontSize: '0.72rem', height: 24 }}
                        />
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        Placed on {order.createdAt ? new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>Total Paid</Typography>
                        <Typography variant="h6" sx={{ fontWeight: 900, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                          {Number(order.totalAmount).toFixed(2)} TND
                        </Typography>
                      </Box>
                      <Button
                        variant="outlined"
                        size="small"
                        onClick={() => setSelectedOrder(order)}
                        sx={{ fontWeight: 700, borderRadius: 2 }}
                      >
                        Details
                      </Button>
                    </Stack>
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Order items preview */}
                  <Stack spacing={1.5}>
                    {order.items?.map((item, idx) => (
                      <Stack key={idx} direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={item.productImage}
                          variant="rounded"
                          sx={{ width: 44, height: 44, bgcolor: 'background.elevated', borderRadius: 1.5 }}
                        />
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                            {item.productName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {item.quantity}x @ {Number(item.price).toFixed(2)} TND · Sold by {item.sellerName || 'GymPilot Seller'}
                          </Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {Number(item.subtotal || item.price * item.quantity).toFixed(2)} TND
                        </Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Card>
              );
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page + 1}
                  onChange={(_, val) => setPage(val - 1)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            )}
          </Stack>
        )}

        {/* Order Details Dialog */}
        <Dialog
          open={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          maxWidth="sm"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 3.5,
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              backgroundImage: 'none',
              p: 2,
            },
          }}
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                  Order Details (#{selectedOrder.orderNumber})
                </Typography>
                <IconButton size="small" onClick={() => setSelectedOrder(null)}>
                  <CloseRoundedIcon />
                </IconButton>
              </DialogTitle>

              <DialogContent>
                <Paper elevation={0} sx={{ p: 2, mb: 2, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, display: 'block', mb: 1 }}>
                    Delivery Address
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOrder.shippingAddress?.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.shippingAddress?.address}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode} ({selectedOrder.shippingAddress?.country})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Phone: {selectedOrder.shippingAddress?.phone}</Typography>
                </Paper>

                <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, display: 'block', mb: 1 }}>
                  Ordered Items
                </Typography>
                <Stack spacing={1.5} sx={{ mb: 2 }}>
                  {selectedOrder.items?.map((item, idx) => (
                    <Stack key={idx} direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={item.productImage} variant="rounded" sx={{ width: 40, height: 40 }} />
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>{item.productName}</Typography>
                        <Typography variant="caption" color="text.secondary">{item.quantity}x @ {item.price} TND</Typography>
                      </Box>
                      <Typography variant="body2" sx={{ fontWeight: 800 }}>{item.subtotal || item.price * item.quantity} TND</Typography>
                    </Stack>
                  ))}
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack spacing={1}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" color="text.secondary">Total Paid:</Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 900, color: 'primary.main' }}>
                      {selectedOrder.totalAmount?.toFixed(2)} TND
                    </Typography>
                  </Stack>
                  {selectedOrder.pointsEarned > 0 && (
                    <Stack direction="row" justifyContent="space-between">
                      <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 700 }}>Points Earned:</Typography>
                      <Typography variant="body2" sx={{ color: '#FFD700', fontWeight: 800 }}>+{selectedOrder.pointsEarned} pts</Typography>
                    </Stack>
                  )}
                </Stack>
              </DialogContent>

              <DialogActions>
                <Button onClick={() => setSelectedOrder(null)} variant="outlined" sx={{ borderRadius: 2 }}>
                  Close
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </>
  );
}
