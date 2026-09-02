import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Avatar,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Pagination,
  CircularProgress,
  IconButton,
} from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';

import SEO from '../../components/SEO';
import { sellerService } from '../../services/sellerService';

export default function SellerOrders() {
  const [orders, setOrders] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Status edit modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('PENDING');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await sellerService.getOrders({ page, size: 10 });
      setOrders(res.content || []);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to load seller orders:', err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleOpenStatusDialog = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status || 'PENDING');
    setStatusNotes(order.notes || '');
  };

  const handleUpdateStatus = async () => {
    if (!selectedOrder) return;
    try {
      setUpdating(true);
      await sellerService.updateOrderStatus(selectedOrder.id, {
        status: newStatus,
        notes: statusNotes,
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (err) {
      console.error('Failed to update order status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <SEO title="Orders Received — Seller Portal" description="Manage customer orders and shipments." path="/seller/orders" noIndex />

      <Container maxWidth="xl" disableGutters>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
            Customer Orders Received
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Process orders, view customer delivery addresses, and update fulfillment tracking.
          </Typography>
        </Box>

        <Card elevation={0} sx={{ p: 0, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper', overflow: 'hidden' }}>
          <TableContainer>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order Ref</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items Ordered</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700 }}>Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={32} sx={{ color: 'primary.main' }} />
                    </TableCell>
                  </TableRow>
                ) : orders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                      <Typography variant="body2" color="text.secondary">
                        No customer orders received yet.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  orders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>#{order.orderNumber}</TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>{order.buyerName || 'Athlete'}</Typography>
                        <Typography variant="caption" color="text.secondary">{order.buyerEmail}</Typography>
                      </TableCell>
                      <TableCell>
                        <Stack spacing={0.5}>
                          {order.items?.map((item, idx) => (
                            <Typography key={idx} variant="caption" sx={{ fontWeight: 600 }}>
                              {item.quantity}x {item.productName}
                            </Typography>
                          ))}
                        </Stack>
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                        ${Number(order.totalAmount).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={order.status}
                          size="small"
                          color={
                            order.status === 'DELIVERED'
                              ? 'success'
                              : order.status === 'SHIPPED'
                              ? 'info'
                              : order.status === 'PROCESSING'
                              ? 'warning'
                              : 'default'
                          }
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                      <TableCell color="text.secondary">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell align="right">
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleOpenStatusDialog(order)}
                          sx={{ fontWeight: 700, borderRadius: 2 }}
                        >
                          Fulfill
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {totalPages > 1 && (
            <Box sx={{ p: 2.5, display: 'flex', justifyContent: 'center' }}>
              <Pagination
                count={totalPages}
                page={page + 1}
                onChange={(_, val) => setPage(val - 1)}
                color="primary"
                shape="rounded"
              />
            </Box>
          )}
        </Card>

        {/* Fulfillment & Status Dialog */}
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
              p: 1.5,
            },
          }}
        >
          {selectedOrder && (
            <>
              <DialogTitle sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
                Order Fulfillment (#{selectedOrder.orderNumber})
              </DialogTitle>

              <DialogContent dividers>
                {/* Shipping Address */}
                <Paper elevation={0} sx={{ p: 2, mb: 3, bgcolor: 'rgba(255,255,255,0.02)', border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
                  <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700, display: 'block', mb: 1 }}>
                    Ship To Customer
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>{selectedOrder.shippingAddress?.fullName}</Typography>
                  <Typography variant="body2" color="text.secondary">{selectedOrder.shippingAddress?.address}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.postalCode} ({selectedOrder.shippingAddress?.country})
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Phone: {selectedOrder.shippingAddress?.phone}</Typography>
                </Paper>

                {/* Status Selector */}
                <FormControl fullWidth size="small" sx={{ mb: 2.5 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    Update Fulfillment Status
                  </Typography>
                  <Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                    <MenuItem value="PENDING">Pending (Order Placed)</MenuItem>
                    <MenuItem value="PROCESSING">Processing (Packing Item)</MenuItem>
                    <MenuItem value="SHIPPED">Shipped (In Transit)</MenuItem>
                    <MenuItem value="DELIVERED">Delivered (Completed)</MenuItem>
                    <MenuItem value="CANCELLED">Cancelled</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  label="Fulfillment / Tracking Notes"
                  placeholder="e.g. Tracking # DHL-9982341 dispatched via express delivery"
                  multiline
                  rows={2}
                  fullWidth
                  size="small"
                  value={statusNotes}
                  onChange={(e) => setStatusNotes(e.target.value)}
                />
              </DialogContent>

              <DialogActions sx={{ p: 2 }}>
                <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                <Button variant="contained" disabled={updating} onClick={handleUpdateStatus} sx={{ fontWeight: 700, borderRadius: 2 }}>
                  {updating ? 'Updating...' : 'Save Fulfillment Status'}
                </Button>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </>
  );
}
