import { Box, Stack, Typography, Chip, Button } from '@mui/material';

export default function SectionHeader({
  title,
  subtitle,
  action,
  badge,
  badgeColor = 'primary.main',
  children,
  sx,
}) {
  return (
    <Box component="header" sx={{ mb: 4, ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontFamily: "'Sora','Inter',sans-serif",
              fontWeight: 800,
              mb: 0.5,
            }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
          {badge && (
            <Chip
              size="small"
              label={badge}
              sx={{ mt: 1, bgcolor: `${badgeColor}1A`, color: badgeColor, fontWeight: 600 }}
            />
          )}
        </Box>
        {action && <Box sx={{ mt: { xs: 2, md: 0 } }}>{action}</Box>}
        {children}
      </Stack>
    </Box>
  );
}