import { Box, Button, Stack, Typography, styled } from '@mui/material';

const StyledIcon = styled(Box)(({ color = 'primary.main' }) => ({
  color,
  opacity: 0.3,
  mb: 2,
}));

export default function EmptyState({
  icon,
  title,
  description,
  action,
  actionLabel,
  sx,
  illustration = false,
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        py: { xs: 6, md: 8 },
        px: 3,
        ...sx,
      }}
    >
      {icon && <StyledIcon>{icon}</StyledIcon>}
      <Typography
        variant="h6"
        sx={{
          fontFamily: "'Sora','Inter',sans-serif",
          fontWeight: 700,
          mb: 1,
        }}
      >
        {title}
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, lineHeight: 1.7, mb: 3 }}>
        {description}
      </Typography>
      {action && actionLabel && (
        <Button variant="contained" startIcon={action.icon} onClick={action.onClick} size="large">
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}