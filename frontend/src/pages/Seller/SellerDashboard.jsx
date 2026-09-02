import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  Stack,
  Button,
  Avatar,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  IconButton,
} from '@mui/material';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import AttachMoneyRoundedIcon from '@mui/icons-material/AttachMoneyRounded';
import StarRoundedIcon from '@mui/icons-material/StarRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

import SEO from '../../components/SEO';
import { sellerService } from '../../services/sellerService';
import { useAuth } from '../../context/AuthContext';

function statusChip(status) {
  switch ((status || '').toUpperCase()) {
    case 'DELIVERED':
      return <Chip label="Delivered" size="small" color="success" sx={{ fontWeight: 700 }} />;
    case 'SHIPPED':
      return <Chip label="Shipped" size="small" color="info" sx={{ fontWeight: 700 }} />;
    case 'PROCESSING':
      return <Chip label="Processing" size="small" color="warning" sx={{ fontWeight: 700 }} />;
    default:
      return <Chip label="Pending" size="small" sx={{ fontWeight: 700 }} />;
  }
}

export default function SellerDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    sellerService
      .getStats()
      .then((data) => setStats(data))
      .catch((err) => console.error('Failed to load seller stats:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Box sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={44} sx={{ color: '#8A7CFF', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">Loading seller metrics...</Typography>
      </Box>
    );
  }

  const statCards = [
    {
      title: 'Total Products',
      value: stats?.totalProducts || 0,
      subtext: `${stats?.activeProducts || 0} active in catalog`,
      icon: <Inventory2RoundedIcon sx={{ fontSize: 28, color: '#C6FF3E' }} />,
      bg: 'rgba(198,255,62,0.1)',
      borderColor: 'rgba(198,255,62,0.3)',
    },
    {
      title: 'Orders Received',
      value: stats?.totalOrders || 0,
      subtext: 'Across all active listings',
      icon: <ShoppingCartRoundedIcon sx={{ fontSize: 28, color: '#8A7CFF' }} />,
      bg: 'rgba(138,124,255,0.1)',
      borderColor: 'rgba(138,124,255,0.3)',
    },
    {
      title: 'Total Sales Revenue',
      value: `${(stats?.totalRevenue || 0).toFixed(2)} TND`,
      subtext: `${(stats?.thisMonthRevenue || 0).toFixed(2)} TND in last 30 days`,
      icon: <AttachMoneyRoundedIcon sx={{ fontSize: 28, color: '#00E676' }} />,
      bg: 'rgba(0,230,118,0.1)',
      borderColor: 'rgba(0,230,118,0.3)',
    },
    {
      title: 'Out of Stock Alert',
      value: stats?.outOfStockProducts || 0,
      subtext: stats?.outOfStockProducts > 0 ? 'Requires stock replenishment' : 'All items in stock',
      icon: <StarRoundedIcon sx={{ fontSize: 28, color: '#FFB800' }} />,
      bg: 'rgba(255,184,0,0.1)',
      borderColor: 'rgba(255,184,0,0.3)',
    },
  ];

  return (
    <>
      <SEO title="Seller Portal Dashboard — GymPilot Marketplace" description="Manage your store catalog, orders, and sales performance." path="/seller" noIndex />

      <Container maxWidth="xl" disableGutters>
        {/* Header */}
        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} gap={2} sx={{ mb: 4 }}>
          <Box>
            <Typography variant="h4" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
              Welcome, {user?.storeName || user?.firstName || 'Seller'}!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Here is an overview of your marketplace sales, inventory, and recent orders.
            </Typography>
          </Box>
          <Button
            component={RouterLink}
            to="/seller/products?action=new"
            variant="contained"
            startIcon={<AddRoundedIcon />}
            sx={{ fontWeight: 800, bgcolor: 'primary.main', color: '#0A0C0F', borderRadius: 2 }}
          >
            Add New Product
          </Button>
        </Stack>

        {/* 4 Stat Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statCards.map((card, idx) => (
            <Grid item xs={12} sm={6} lg={3} key={idx}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" sx={{ fontWeight: 900, fontFamily: "'Sora', sans-serif", mt: 0.5 }}>
                      {card.value}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 2.5,
                      bgcolor: card.bg,
                      border: '1px solid',
                      borderColor: card.borderColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {card.icon}
                  </Box>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600 }}>
                  {card.subtext}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Best Selling Spotlight */}
        <Card
          elevation={0}
          sx={{
            p: 3,
            mb: 4,
            borderRadius: 3.5,
            border: '1px solid',
            borderColor: 'rgba(138,124,255,0.3)',
            bgcolor: 'rgba(138,124,255,0.04)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="caption" color="secondary.main" sx={{ textTransform: 'uppercase', letterSpacing: 1, fontWeight: 800 }}>
              Top Performer
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 800, mt: 0.5 }}>
              <EmojiEventsRoundedIcon sx={{ fontSize: 22, verticalAlign: 'middle', mr: 0.5, color: '#FFD700' }} /> Best Selling Product: <span style={{ color: '#C6FF3E' }}>{stats?.bestSellingProduct || 'None yet'}</span>
            </Typography>
          </Box>
          <Button component={RouterLink} to="/seller/products" variant="outlined" endIcon={<ArrowForwardRoundedIcon />} sx={{ fontWeight: 700, borderRadius: 2 }}>
            Manage Inventory
          </Button>
        </Card>

        {/* Recent Orders Table */}
        <Card elevation={0} sx={{ p: 3, borderRadius: 3.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
            <Typography variant="h6" sx={{ fontFamily: "'Sora', sans-serif", fontWeight: 800 }}>
              Recent Customer Orders
            </Typography>
            <Button component={RouterLink} to="/seller/orders" size="small" sx={{ fontWeight: 700 }}>
              View All Orders
            </Button>
          </Stack>

          <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2.5 }}>
            <Table>
              <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 700 }}>Order Ref</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Items</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Total</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!stats?.recentOrders || stats.recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                      <Typography variant="body2" color="text.secondary">No customer orders received yet.</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  stats.recentOrders.map((order) => (
                    <TableRow key={order.id} hover>
                      <TableCell sx={{ fontWeight: 700 }}>#{order.orderNumber}</TableCell>
                      <TableCell>{order.buyerName || order.buyerEmail}</TableCell>
                      <TableCell>{order.items?.length || 1} item(s)</TableCell>
                      <TableCell sx={{ fontWeight: 800, color: 'primary.main' }}>
                        {Number(order.totalAmount).toFixed(2)} TND
                      </TableCell>
                      <TableCell>{statusChip(order.status)}</TableCell>
                      <TableCell color="text.secondary">
                        {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      </Container>
    </>
  );
}
