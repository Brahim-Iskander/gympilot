import { useMemo } from 'react';
import { Tabs, Tab, Box, Paper } from '@mui/material';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded';
import ShoppingCartRoundedIcon from '@mui/icons-material/ShoppingCartRounded';
import StorefrontRoundedIcon from '@mui/icons-material/StorefrontRounded';
import LocalOfferRoundedIcon from '@mui/icons-material/LocalOfferRounded';
import { useLanguage } from '../../../i18n';

export default function SellerNavTabs() {
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  const currentPath = location.pathname;

  const tabs = useMemo(() => [
    { label: t('seller.tabs.overview'), path: '/seller', icon: <DashboardRoundedIcon fontSize="small" /> },
    { label: t('seller.tabs.products'), path: '/seller/products', icon: <Inventory2RoundedIcon fontSize="small" /> },
    { label: t('seller.tabs.packs'), path: '/seller/packs', icon: <LocalOfferRoundedIcon fontSize="small" /> },
    { label: t('seller.tabs.orders'), path: '/seller/orders', icon: <ShoppingCartRoundedIcon fontSize="small" /> },
    { label: t('seller.tabs.settings'), path: '/seller/settings', icon: <StorefrontRoundedIcon fontSize="small" /> },
  ], [t]);

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
            sx={{
              minHeight: 40,
              py: 1,
              px: 2.5,
              borderRadius: 2,
              fontWeight: 700,
              fontSize: '0.875rem',
              color: 'text.secondary',
              zIndex: 1,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                color: '#8A7CFF',
              },
              '&:hover': {
                color: 'text.primary',
              },
            }}
          />
        ))}
      </Tabs>
    </Paper>
  );
}
