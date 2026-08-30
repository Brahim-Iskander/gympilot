import { Chip, styled } from '@mui/material';

const StyledChip = styled(Chip)(({ variant = 'default' }) => {
  const variants = {
    default: {
      bgcolor: 'rgba(255,255,255,0.06)',
      color: 'text.secondary',
    },
    success: {
      bgcolor: 'rgba(198,255,62,0.15)',
      color: '#C6FF3E',
    },
    warning: {
      bgcolor: 'rgba(255,193,7,0.15)',
      color: '#FFC107',
    },
    error: {
      bgcolor: 'rgba(255,107,107,0.15)',
      color: '#FF6B6B',
    },
    info: {
      bgcolor: 'rgba(138,124,255,0.15)',
      color: '#8A7CFF',
    },
    accent: {
      bgcolor: 'rgba(198,255,62,0.15)',
      color: '#C6FF3E',
    },
  };

  return {
    fontWeight: 600,
    borderRadius: 8,
    ...variants[variant],
  };
});

export default function Badge({
  label,
  variant = 'default',
  size = 'medium',
  icon,
  sx,
  ...props
}) {
  return (
    <StyledChip
      variant="outlined"
      size={size}
      label={label}
      icon={icon}
      sx={{ border: 'none', ...sx }}
      {...props}
    />
  );
}