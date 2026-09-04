import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
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
import {
  AdminPanelSettingsRounded,
  DashboardRounded,
  PeopleRounded,
  HandshakeRounded,
  MenuRounded,
  LogoutRounded,
  ArrowBackRounded,
  SupportAgentRounded,
  ConfirmationNumberRounded,
  LocalOfferRounded,
} from '@mui/icons-material';

import Logo from '../components/Logo';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { coachChatService } from '../services/coachChatService';
import { adminService } from '../services/adminService';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';

const SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 64;

const ADMIN_NAV = [
  {
    id: 'admin-dashboard',
    label: 'Dashboard',
    icon: <DashboardRounded />,
    path: '/admin',
  },
  {
    id: 'admin-tickets',
    label: 'Support Tickets',
    icon: <ConfirmationNumberRounded />,
    path: '/admin/tickets',
    isTicket: true,
  },
  {
    id: 'admin-coach-chat',
    label: 'Coach Live Desk',
    icon: <SupportAgentRounded />,
    path: '/admin/coach-chat',
    isCoach: true,
  },
  {
    id: 'admin-users',
    label: 'User Management',
    icon: <PeopleRounded />,
    path: '/admin/users',
  },
  {
    id: 'admin-partners',
    label: 'Partner Management',
    icon: <HandshakeRounded />,
    path: '/admin/partners',
  },
  {
    id: 'admin-packs',
    label: 'Offers & Product Packs',
    icon: <LocalOfferRounded sx={{ color: '#C6FF3E' }} />,
    path: '/admin/packs',
  },
  {
    id: 'admin-vouchers',
    label: 'Store Vouchers',
    icon: <LocalOfferRounded />,
    path: '/admin/vouchers',
  },
];

export default function AdminLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin, isCoach, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [coachUnread, setCoachUnread] = useState(0);
  const [ticketUnread, setTicketUnread] = useState(0);
  const currentPath = location.pathname;

  // Poll for coach unread inquiries and support tickets unread
  useEffect(() => {
    coachChatService.getAdminUnreadCount().then(setCoachUnread).catch(() => { });
    if (isAdmin) {
      adminService.getTicketUnreadCount().then((res) => setTicketUnread(res.unreadCount || 0)).catch(() => { });
    }

    const interval = setInterval(() => {
      coachChatService.getAdminUnreadCount().then(setCoachUnread).catch(() => { });
      if (isAdmin) {
        adminService.getTicketUnreadCount().then((res) => setTicketUnread(res.unreadCount || 0)).catch(() => { });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isAdmin]);

  const handleNav = (path) => {
    navigate(path);
    if (isMobile) setMobileOpen(false);
  };

  // Only show coach chat for Coach role, all items for Admin role
  const visibleNav = isCoach && !isAdmin
    ? ADMIN_NAV.filter((item) => item.isCoach)
    : ADMIN_NAV;

  const sidebarContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
      {/* Header — height locked to HEADER_HEIGHT so its bottom
          border lines up exactly with the navbar's bottom border */}
      <Box
        sx={{
          px: 3,
          borderBottom: '1px solid',
          borderColor: 'divider',
          height: HEADER_HEIGHT,
          minHeight: HEADER_HEIGHT,
          maxHeight: HEADER_HEIGHT,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Logo size={28} />
          {isCoach && !isAdmin ? (
            <Chip
              label="COACH"
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
          ) : (
            <Chip label="ADMIN" size="small" color="error" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
          )}
        </Stack>
      </Box>

      {/* Navigation */}
      <Box sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
        <Typography variant="overline" color="text.secondary" sx={{ px: 1, py: 1, textTransform: 'uppercase', letterSpacing: 1, fontWeight: 700, fontSize: '0.65rem', display: 'block' }}>
          {isCoach && !isAdmin ? 'Coach Portal' : 'Control Center'}
        </Typography>

        <List disablePadding>
          {visibleNav.map((item) => {
            const isActive = currentPath === item.path;
            const unreadCount = item.isCoach ? coachUnread : item.isTicket ? ticketUnread : 0;

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
                  {unreadCount > 0 && (
                    <Chip
                      label={unreadCount}
                      size="small"
                      color="error"
                      sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800 }}
                    />
                  )}
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
          startIcon={<ArrowBackRounded fontSize="small" />}
          onClick={() => navigate('/dashboard')}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, color: 'text.secondary', borderColor: 'divider' }}
        >
          Exit Admin Mode
        </Button>
      </Box>

      {/* User Footer */}
      <Divider />
      <Box sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ px: 1 }}>
            <Avatar src={user?.avatar} sx={{ width: 36, height: 36, bgcolor: 'error.main', color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>
              {user?.firstName?.charAt(0)?.toUpperCase()}
            </Avatar>
            <Box sx={{ overflow: 'hidden' }}>
              <Typography variant="body2" fontWeight={700} noWrap>
                {user?.firstName} {user?.lastName}
              </Typography>
              <Typography variant="caption" color="error.main" fontWeight={600} display="block">
                Super Admin
              </Typography>
            </Box>
          </Stack>
          <Button fullWidth variant="outlined" color="error" size="small" startIcon={<LogoutRounded fontSize="small" />} onClick={logout}>
            Logout
          </Button>
        </Stack>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Sidebar */}
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

      {/* Main Content */}
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
                <MenuRounded />
              </IconButton>
            )}

            <Stack direction="row" spacing={1} alignItems="center">
              <AdminPanelSettingsRounded sx={{ color: 'error.main', fontSize: 28 }} />
              <Typography variant="h6" fontWeight={800} color="text.primary">
                Admin Panel
              </Typography>
            </Stack>

            <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconButton onClick={toggleTheme} size="small" sx={{ border: '1px solid', borderColor: 'divider', color: 'text.primary' }}>
                {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>

        {/* Page View */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2, sm: 3, md: 4 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}