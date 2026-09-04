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
  Tooltip,
} from '@mui/material';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import VisibilityRoundedIcon from '@mui/icons-material/VisibilityRounded';
import PrintRoundedIcon from '@mui/icons-material/PrintRounded';

import SEO from '../../components/SEO';
import SellerNavTabs from './components/SellerNavTabs';
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

  const handlePrintDeliveryLabel = (order) => {
    if (!order) return;
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) {
      alert('Please allow popups to generate and print delivery labels.');
      return;
    }

    const addr = order.shippingAddress || {};
    const fullName = addr.fullName || order.buyerName || 'Valued Athlete';
    const phone = addr.phone || 'Not provided';
    const street = addr.address || 'Address not specified';
    const city = addr.city || '';
    const postalCode = addr.postalCode || '';
    const country = addr.country || 'Tunisia';
    const dateStr = order.createdAt ? new Date(order.createdAt).toLocaleDateString() : new Date().toLocaleDateString();

    const itemsRows = (order.items || [])
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-weight: 600;">${item.productName || 'Fitness Item'}</td>
          <td style="padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: center; font-weight: 800;">x${item.quantity || 1}</td>
        </tr>`
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Delivery Label - #${order.orderNumber}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          * { box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
            margin: 0;
            padding: 24px;
            color: #0f172a;
            background: #f8fafc;
          }
          .no-print {
            text-align: center;
            margin-bottom: 24px;
          }
          .btn-print {
            background: #0f172a;
            color: #ffffff;
            padding: 12px 28px;
            font-size: 15px;
            font-weight: 800;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          }
          .btn-print:hover { background: #1e293b; }
          .label-card {
            max-width: 580px;
            margin: 0 auto;
            border: 2px dashed #0f172a;
            border-radius: 12px;
            padding: 28px;
            background: #ffffff;
            box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 18px;
          }
          .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #0f172a;
          }
          .badge {
            background: #0f172a;
            color: #C6FF3E;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .ref-row {
            display: flex;
            justify-content: space-between;
            align-items: baseline;
            margin-bottom: 18px;
          }
          .order-ref {
            font-size: 20px;
            font-weight: 900;
            color: #0f172a;
          }
          .order-date {
            font-size: 13px;
            color: #64748b;
            font-weight: 600;
          }
          .section-title {
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            color: #475569;
            margin-bottom: 8px;
          }
          .deliver-box {
            background: #f1f5f9;
            border: 2px solid #cbd5e1;
            border-radius: 8px;
            padding: 18px;
            margin-bottom: 20px;
          }
          .customer-name {
            font-size: 22px;
            font-weight: 900;
            color: #0f172a;
            margin-bottom: 6px;
          }
          .customer-phone {
            font-size: 17px;
            font-weight: 800;
            color: #0284c7;
            margin-bottom: 10px;
          }
          .customer-address {
            font-size: 15px;
            line-height: 1.5;
            color: #334155;
            font-weight: 500;
          }
          .cod-badge {
            background: #fef2f2;
            border: 2px solid #ef4444;
            border-radius: 8px;
            padding: 14px 18px;
            text-align: center;
            margin-bottom: 20px;
          }
          .cod-label {
            font-size: 12px;
            font-weight: 800;
            color: #dc2626;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          .cod-amount {
            font-size: 26px;
            font-weight: 900;
            color: #0f172a;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-bottom: 20px;
          }
          table th {
            background: #f1f5f9;
            padding: 8px 10px;
            text-align: left;
            font-size: 11px;
            text-transform: uppercase;
            color: #475569;
            border-bottom: 2px solid #cbd5e1;
          }
          .footer-note {
            border-top: 1px dashed #cbd5e1;
            padding-top: 12px;
            font-size: 11px;
            color: #64748b;
            text-align: center;
            line-height: 1.5;
          }
          @media print {
            .no-print { display: none; }
            body { background: #fff; padding: 0; }
            .label-card {
              box-shadow: none;
              border: 2px solid #000;
              max-width: 100%;
            }
          }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn-print" onclick="window.print()">Print Delivery Label</button>
        </div>
        <div class="label-card">
          <div class="header">
            <div class="logo" style="display: flex; align-items: center; gap: 10px;">
              <img src="${window.location.origin}/favicon1.png" alt="GymPilot Logo" style="width: 42px; height: 42px; object-fit: contain;" />
              <span style="font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #0f172a;">
                Gym<span style="color: #3A7D1A;">Pilot</span>
              </span>
            </div>
            <div class="badge">Parcel Delivery Slip</div>
          </div>

          <div class="ref-row">
            <div class="order-ref">ORDER #${order.orderNumber}</div>
            <div class="order-date">Date: ${dateStr}</div>
          </div>

          <div class="section-title">SHIP TO / DESTINATION:</div>
          <div class="deliver-box">
            <div class="customer-name">${fullName}</div>
            <div class="customer-phone">Phone: ${phone}</div>
            <div class="customer-address">
              ${street}<br>
              ${city}${postalCode ? ', ' + postalCode : ''}<br>
              <strong>${country}</strong>
            </div>
          </div>

          <div class="cod-badge">
            <div class="cod-label">Cash on Delivery (Collect from Buyer)</div>
            <div class="cod-amount">${Number(order.totalAmount || 0).toFixed(2)} TND</div>
          </div>

          <div class="section-title">PARCEL CONTENTS:</div>
          <table>
            <thead>
              <tr>
                <th>Product Description</th>
                <th style="text-align: center; width: 70px;">Qty</th>
              </tr>
            </thead>
            <tbody>
              ${itemsRows}
            </tbody>
          </table>

          <div class="footer-note">
            <strong>Courier Instructions:</strong> Call buyer prior to delivery &bull; Inspect package integrity &bull; Collect exact COD amount &bull; Return signed voucher.
          </div>
        </div>
        <script>
          window.onload = function() {
            setTimeout(function() { window.print(); }, 350);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();
  };

  return (
    <>
      <SEO title="Orders Received — Seller Portal" description="Manage customer orders and shipments." path="/seller/orders" noIndex />

      <Container maxWidth="xl" disableGutters>
        <SellerNavTabs />

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
                        {Number(order.totalAmount).toFixed(2)} TND
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
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <Tooltip title="Print courier delivery label & parcel coordinates" arrow>
                            <Button
                              variant="outlined"
                              size="small"
                              startIcon={<PrintRoundedIcon />}
                              onClick={() => handlePrintDeliveryLabel(order)}
                              sx={{
                                fontWeight: 700,
                                borderRadius: 2,
                                borderColor: 'divider',
                                color: 'text.primary',
                                '&:hover': { borderColor: 'primary.main', bgcolor: 'rgba(198,255,62,0.06)' },
                              }}
                            >
                              Print Label
                            </Button>
                          </Tooltip>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleOpenStatusDialog(order)}
                            sx={{ fontWeight: 700, borderRadius: 2 }}
                          >
                            Fulfill
                          </Button>
                        </Stack>
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

              <DialogActions sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <Button
                  variant="outlined"
                  startIcon={<PrintRoundedIcon />}
                  onClick={() => handlePrintDeliveryLabel(selectedOrder)}
                  sx={{ fontWeight: 700, borderRadius: 2 }}
                >
                  Print Delivery Label
                </Button>
                <Stack direction="row" spacing={1}>
                  <Button onClick={() => setSelectedOrder(null)}>Close</Button>
                  <Button variant="contained" disabled={updating} onClick={handleUpdateStatus} sx={{ fontWeight: 700, borderRadius: 2 }}>
                    {updating ? 'Updating...' : 'Save Fulfillment Status'}
                  </Button>
                </Stack>
              </DialogActions>
            </>
          )}
        </Dialog>
      </Container>
    </>
  );
}
