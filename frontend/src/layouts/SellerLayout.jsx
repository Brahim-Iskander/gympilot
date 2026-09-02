import { useState } from 'react';
import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import VerifiedRoundedIcon from '@mui/icons-material/VerifiedRounded';

import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';

const SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 64;

const SELLER_NAV = [
  { id: 'seller-dashboard', label: 'Overview', icon: <DashboardRoundedIcon />, path: '/seller' },
  { id: 'seller-products', label: 'My Products', icon: <Inventory2RoundedIcon />, path: '/seller/products' },
  { id: 'seller-orders', label: 'Orders Received', icon: <ShoppingCartRoundedIcon />, path: '/seller/orders' },
  { id: 'seller-settings', label: 'Store Profile', icon: <StorefrontRoundedIcon />, path: '/seller/settings' },
];

export default function SellerLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  const currentPath = location.pathname;

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Header */}
      <Box
        sx={{
          px: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: HEADER_HEIGHT,
          minHeight: HEADER_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Logo size={28} />
          <Chip
            label="SELLER"
            size="small"
            sx={{
              bgcolor: 'rgba(138,124,255,0.18)',
              color: '#8A7CFF',
              fontWeight: 800,
              fontSize: '0.65rem',
              height: 20,
              border: '1px solid rgba(138,124,255,0.4)',
            }}
          />
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
        <Typography
          variant="overline"
          color="text.secondary"
          sx={{ px: 1, py: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.65rem', display: 'block' }}
        >
          Marketplace Portal
        </Typography>

        <List disablePadding>
          {SELLER_NAV.map((item) => {
            const isActive = currentPath === item.path;
            return (
              <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNav(item.path)}
                  selected={isActive}
                  sx={{
                    borderRadius: 2,
                    minHeight: 46,
                    px: 2,
                    color: isActive ? 'primary.main' : 'text.secondary',
                    bgcolor: isActive ? 'rgba(198,255,62,0.12)' : 'transparent',
                    '&:hover': { bgcolor: isActive ? 'rgba(198,255,62,0.18)' : 'action.hover', color: 'text.primary' },
                    '& .MuiListItemIcon-root': { minWidth: 36, color: isActive ? 'primary.main' : 'text.secondary' },
                    '& .MuiListItemText-primary': { fontWeight: isActive ? 700 : 500, fontSize: '0.9rem' },
                  }}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ my: 2 }} />

        <Button
          fullWidth
          variant="outlined"
          size="small"
          startIcon={<ArrowBackRoundedIcon fontSize="small" />}
          onClick={() => navigate('/shop')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary', borderColor: 'divider', mb: 1 }}
        >
          View Storefront
        </Button>

        <Button
          fullWidth
          variant="text"
          size="small"
          startIcon={<ArrowBackRoundedIcon fontSize="small" />}
          onClick={() => navigate('/dashboard')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
        >
          Back to Athlete App
        </Button>
      </Box>

      {/* Footer */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
            <Avatar src={user?.avatar} sx={{ width: 36, height: 36, bgcolor: 'secondary.main', color: '#fff', fontWeight: 700 }}>
              {user?.firstName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {user?.storeName || `${user?.firstName || 'Seller'} Store`}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap display="block">
                {user?.email}
              </Typography>
            </Box>
          </Stack>
          <Button fullWidth variant="outlined" color="error" size="small" startIcon={<LogoutRoundedIcon fontSize="small" />} onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? mobileOpen : true}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: SIDEBAR_WIDTH,
            borderRight: '1px solid',
            borderColor: 'divider',
            backgroundImage: 'none',
          },
        }}
      >
        {sidebarContent}
      </Drawer>

      {/* Main Container */}
      <Box sx={{ flex: 1, minWidth: 0, ml: { xs: 0, md: `${SIDEBAR_WIDTH}px` }, display: 'flex', flexDirection: 'column' }}>
        {/* Top Navbar */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'background.paper',
            borderBottom: '1px solid',
            borderColor: 'divider',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Toolbar disableGutters sx={{ minHeight: `${HEADER_HEIGHT}px !important`, height: HEADER_HEIGHT, px: 3 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileOpen(true)} sx={{ mr: 1, color: 'text.primary' }}>
                <MenuRoundedIcon />
              </IconButton>
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              <StorefrontRoundedIcon sx={{ color: '#8A7CFF', fontSize: 26 }} />
              <Typography variant="h6" fontWeight={800} color="text.primary" sx={{ fontFamily: "'Sora', sans-serif" }}>
                Seller Dashboard
              </Typography>
            </Stack>

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleTheme} size="small" sx={{ border: '1px solid', borderColor: 'divider', color: 'text.primary' }}>
                {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Content View */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
