import { Box, Tab, Tabs, styled } from '@mui/material';

const StyledTabs = styled(Tabs)(() => ({
  minHeight: 48,
  '&.variant-line .MuiTabs-indicator': {
    height: 3,
    borderRadius: 2,
    backgroundColor: 'primary.main',
  },
  '&.variant-pill .MuiTabs-indicator': {
    height: 0,
  },
  '& .MuiTab-root': {
    fontFamily: "'Sora','Inter',sans-serif",
    fontWeight: 600,
    fontSize: '0.875rem',
    textTransform: 'none',
    minHeight: 48,
    color: 'text.secondary',
    opacity: 0.7,
    transition: 'all 0.2s ease',
    '&:hover': {
      opacity: 1,
      color: 'text.primary',
      backgroundColor: 'transparent',
    },
    '&.Mui-selected': {
      opacity: 1,
      color: 'primary.main',
    },
  },
}));

const StyledTab = styled(Tab)(() => ({
  '&.variant-pill': {
    borderRadius: 10,
    '&.Mui-selected': {
      backgroundColor: 'rgba(198,255,62,0.12)',
      color: 'primary.main',
    },
  },
}));

export default function TabNavigation({
  tabs,
  value,
  onChange,
  variant = 'line',
  sx,
  ...props
}) {
  return (
    <Box sx={{ borderBottom: variant === 'line' ? '1px solid' : 'none', borderColor: 'divider', ...sx }}>
      <StyledTabs className={variant === 'pill' ? 'variant-pill' : 'variant-line'} value={value} onChange={onChange} {...props}>
        {tabs.map((tab) => (
          <StyledTab
            key={tab.id}
            value={tab.id}
            label={tab.label}
            icon={tab.icon}
            disabled={tab.disabled}
            className={variant === 'pill' ? 'variant-pill' : 'variant-line'}
            sx={{ minWidth: variant === 'pill' ? 120 : 80 }}
          />
        ))}
      </StyledTabs>
    </Box>
  );
}