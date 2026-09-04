import { Tabs, Tab, Box, Paper } from '@mui/material';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';

export default function SellerNavTabs() {
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const tabs = [
    { label: 'Overview', path: '/seller', icon: <DashboardRoundedIcon fontSize="small" /> },
    { label: 'Products & Inventory', path: '/seller/products', icon: <Inventory2RoundedIcon fontSize="small" /> },
    { label: 'Special Offer Packs', path: '/seller/packs', icon: <LocalOfferRoundedIcon fontSize="small" /> },
    { label: 'Customer Orders', path: '/seller/orders', icon: <ShoppingCartRoundedIcon fontSize="small" /> },
    { label: 'Store Settings', path: '/seller/settings', icon: <StorefrontRoundedIcon fontSize="small" /> },
  ];

  const currentTab = tabs.find(t => t.path === currentPath)?.path || '/seller';

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3.5,
        p: 0.5,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        display: 'inline-flex',
        width: { xs: '100%', sm: 'auto' },
      }}
    >
      <Tabs
        value={currentTab}
        onChange={(e, val) => navigate(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          minHeight: 40,
          '& .MuiTabs-indicator': {
            height: '100%',
            borderRadius: 2,
            bgcolor: 'rgba(138, 124, 255, 0.15)',
            border: '1px solid rgba(138, 124, 255, 0.4)',
            zIndex: 0,
          },
        }}
      >
        {tabs.map((tab) => (
          <Tab
            key={tab.path}
            value={tab.path}
            label={tab.label}
            icon={tab.icon}
            iconPosition="start"
            component={RouterLink}
            to={tab.path}
            sx={{
              minHeight: 38,
              py: 0.75,
              px: 2,
              fontWeight: 700,
              fontSize: '0.84rem',
              borderRadius: 2,
              textTransform: 'none',
              zIndex: 1,
              color: 'text.secondary',
              '&.Mui-selected': {
                color: '#8A7CFF',
              },
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
}
