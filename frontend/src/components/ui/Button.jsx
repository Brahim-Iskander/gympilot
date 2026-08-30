import { Button as MuiButton, styled } from '@mui/material';

const StyledButton = styled(MuiButton)({
  borderRadius: 10,
  fontWeight: 600,
  textTransform: 'none',
  paddingInline: 20,
  paddingBlock: 9,
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-1px)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
});

export default function Button({
  variant = 'contained',
  size = 'medium',
  children,
  startIcon,
  endIcon,
  fullWidth = false,
  disabled = false,
  loading = false,
  sx,
  ...props
}) {
  return (
    <StyledButton
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      disabled={disabled || loading}
      startIcon={loading ? null : startIcon}
      endIcon={endIcon}
      sx={{
        ...sx,
        opacity: disabled || loading ? 0.7 : 1,
      }}
      {...props}
    >
      {loading && 'Loading...'}
      {children}
    </StyledButton>
  );
}