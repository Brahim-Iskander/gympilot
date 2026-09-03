import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box,
  Drawer,
  IconButton,
  Stack,
  Typography,
  Divider,
  Button,
  Avatar,
  Badge,
  Chip,
  Tooltip,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LocalShippingRoundedIcon from '@mui/icons-material/LocalShippingRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import LockRoundedIcon from '@mui/icons-material/LockRounded';
import { useCart } from '../context/CartContext';

export default function CartDrawer() {
  const {
    items,
    totals,
    cartDrawerOpen,
    closeCartDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    closeCartDrawer();
    navigate('/shop/checkout');
  };

  const handleViewCart = () => {
    closeCartDrawer();
    navigate('/shop/cart');
  };

  return (
    <Drawer
      anchor="right"
      open={cartDrawerOpen}
      onClose={closeCartDrawer}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 420 },
          p: 0,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Badge badgeContent={totals.itemCount} color="primary">
            <ShoppingBagRoundedIcon sx={{ color: 'primary.main', fontSize: 26 }} />
          </Badge>
          <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
            Shopping Cart
          </Typography>
        </Stack>
        <IconButton onClick={closeCartDrawer} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary' } }}>
          <CloseRoundedIcon />
        </IconButton>
      </Box>

      {/* Free Shipping Progress Indicator */}
      <Box sx={{ px: 2.5, py: 1.5, bgcolor: 'rgba(198,255,62,0.05)', borderBottom: '1px solid', borderColor: 'rgba(198,255,62,0.15)' }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <LocalShippingRoundedIcon sx={{ color: 'primary.main', fontSize: 20 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.primary' }}>
            {totals.subtotal >= 150
              ? <><CelebrationRoundedIcon sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5, color: '#C6FF3E' }} /> Free Delivery Unlocked (&ge; 150 TND)!</>
              : `Add ${(150 - totals.subtotal).toFixed(2)} TND more for Free Delivery! (Standard: 7 TND)`}
          </Typography>
        </Stack>
      </Box>

      {/* Items List */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 2.5 }}>
        {items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: 4,
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mx: 'auto',
                mb: 2,
                color: 'text.secondary',
              }}
            >
              <ShoppingBagRoundedIcon sx={{ fontSize: 36 }} />
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
              Your cart is empty
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Browse our premium supplements and gym equipment!
            </Typography>
            <Button
              component={RouterLink}
              to="/shop"
              variant="contained"
              onClick={closeCartDrawer}
              sx={{ fontWeight: 700, borderRadius: 2 }}
            >
              Explore Shop
            </Button>
          </Box>
        ) : (
          <Stack spacing={2}>
            {items.map((item) => (
              <Box
                key={item.productId}
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'rgba(255,255,255,0.02)',
                  display: 'flex',
                  gap: 2,
                  alignItems: 'center',
                }}
              >
                <Avatar
                  src={item.image}
                  variant="rounded"
                  sx={{ width: 64, height: 64, bgcolor: 'background.elevated', flexShrink: 0 }}
                />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2, mb: 0.5 }} noWrap title={item.name}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                    {Number(item.price).toFixed(2)} TND each
                  </Typography>

                  {/* Quantity controls */}
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1.5,
                        bgcolor: 'background.paper',
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        sx={{ p: 0.5 }}
                      >
                        <RemoveRoundedIcon sx={{ fontSize: 14 }} />
                      </IconButton>
                      <Typography variant="caption" sx={{ px: 1, fontWeight: 700 }}>
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
                    <Typography variant="body2" sx={{ fontWeight: 800, color: 'primary.main', ml: 'auto' }}>
                      {(Number(item.price) * item.quantity).toFixed(2)} TND
                    </Typography>
                  </Stack>
                </Box>
                <IconButton
                  size="small"
                  onClick={() => removeFromCart(item.productId)}
                  sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                >
                  <DeleteOutlineRoundedIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Stack>
        )}
      </Box>

      {/* Footer */}
      {items.length > 0 && (
        <Box sx={{ p: 2.5, borderTop: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
          <Stack spacing={1.5} sx={{ mb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Subtotal</Typography>
              <Typography variant="body1" sx={{ fontWeight: 700 }}>{totals.subtotal.toFixed(2)} TND</Typography>
            </Stack>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Estimated Shipping</Typography>
              <Typography variant="body2" sx={{ fontWeight: 600, color: totals.shipping === 0 ? 'success.main' : 'text.primary' }}>
                {totals.shipping === 0 ? 'FREE' : `${totals.shipping.toFixed(2)} TND`}
              </Typography>
            </Stack>
            <Divider />
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>Estimated Total</Typography>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'primary.main', fontFamily: "'Sora', sans-serif" }}>
                {totals.total.toFixed(2)} TND
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            <Tooltip title="Proceed to enter delivery details and place order" arrow placement="top">
              <Button
                variant="contained"
                fullWidth
                size="large"
                startIcon={<LockRoundedIcon />}
                endIcon={<ArrowForwardRoundedIcon />}
                onClick={handleCheckout}
                sx={{
                  fontWeight: 800,
                  py: 1.2,
                  borderRadius: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 0.25,
                }}
              >
                <Typography component="span" sx={{ fontWeight: 800, fontSize: '0.95rem', lineHeight: 1.2 }}>
                  Checkout Now ({totals.total.toFixed(2)} TND)
                </Typography>
                <Typography component="span" sx={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: 600, textTransform: 'none' }}>
                  Cash on Delivery · Standard 7 TND / Free &ge; 150 TND
                </Typography>
              </Button>
            </Tooltip>
            <Tooltip title="Review items, update quantities, or redeem reward points" arrow placement="bottom">
              <Button
                variant="outlined"
                fullWidth
                startIcon={<ShoppingBagRoundedIcon fontSize="small" />}
                onClick={handleViewCart}
                sx={{ fontWeight: 700, borderRadius: 2, py: 1 }}
              >
                View Full Cart &amp; Redeem Points
              </Button>
            </Tooltip>
          </Stack>
        </Box>
      )}
    </Drawer>
  );
}
