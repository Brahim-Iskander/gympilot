import { Box, Card, Stack, styled, Typography } from '@mui/material';

const StyledCard = styled(Card)(({ fullHeight }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: 'divider',
  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  display: 'flex',
  flexDirection: 'column',
  height: fullHeight ? '100%' : 'auto',
}));

export default function ChartCard({
  title,
  subtitle,
  action,
  children,
  height = 300,
  fullHeight = false,
  sx,
  ...props
}) {
  return (
    <StyledCard fullHeight={fullHeight} sx={{ p: 0, ...sx }} {...props}>
      <Box sx={{ p: 3, pb: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={2}>
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontFamily: "'Sora','Inter',sans-serif",
                fontWeight: 800,
                mb: 0.25,
              }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
          {action}
        </Stack>
      </Box>
      <Box sx={{ p: 3, height: fullHeight ? '100%' : height, width: '100%', minHeight: height, boxSizing: 'border-box', position: 'relative' }}>
        {children}
      </Box>
    </StyledCard>
  );
}