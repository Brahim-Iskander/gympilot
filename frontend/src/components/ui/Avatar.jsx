import { Avatar as MuiAvatar, Box, styled, Typography } from '@mui/material';
import PersonRoundedIcon from '@mui/icons-material/PersonRounded';

const StyledAvatar = styled(MuiAvatar)(({ variant = 'default', size = 'md' }) => {
  const sizes = {
    xs: 24,
    sm: 32,
    md: 40,
    lg: 56,
    xl: 72,
    xxl: 96,
  };

  const variants = {
    default: {
      bgcolor: 'rgba(198,255,62,0.12)',
      color: 'primary.main',
    },
    image: {},
    placeholder: {
      bgcolor: 'rgba(255,255,255,0.06)',
      color: 'text.secondary',
    },
  };

  return {
    width: sizes[size],
    height: sizes[size],
    fontWeight: 700,
    fontSize: sizes[size] * 0.35,
    borderRadius: size === 'xs' || size === 'sm' ? 1.5 : 2,
    fontFamily: "'Sora','Inter',sans-serif",
    ...variants[variant],
  };
});

export default function Avatar({
  src,
  alt,
  name,
  variant = 'default',
  size = 'md',
  sx,
  ...props
}) {
  const getInitials = (fullName) => {
    if (!fullName) return '?';
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);

  if (src) {
    return (
      <StyledAvatar variant="image" size={size} src={src} alt={alt || name} sx={sx} {...props} />
    );
  }

  if (variant === 'placeholder') {
    return (
      <StyledAvatar variant="placeholder" size={size} sx={sx} {...props}>
        <PersonRoundedIcon />
      </StyledAvatar>
    );
  }

  return (
    <StyledAvatar variant="default" size={size} sx={sx} {...props}>
      {initials}
    </StyledAvatar>
  );
}