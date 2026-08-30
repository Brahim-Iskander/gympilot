import { Card as MuiCard, styled } from '@mui/material';

const StyledCard = styled(MuiCard)(({ variant = 'default' }) => {
  const variants = {
    default: {
      border: '1px solid',
      borderColor: 'divider',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
    },
    elevated: {
      border: 'none',
      boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
      background: 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
    },
    outlined: {
      border: '1px solid',
      borderColor: 'rgba(255,255,255,0.12)',
      background: 'rgba(255,255,255,0.02)',
    },
    accent: {
      border: '1px solid',
      borderColor: 'rgba(198,255,62,0.3)',
      background: 'linear-gradient(180deg, rgba(198,255,62,0.04), rgba(255,255,255,0.01))',
    },
  };

  return {
    borderRadius: 4,
    transition: 'transform .3s ease, border-color .3s ease, box-shadow .3s ease',
    ...variants[variant],
    '&:hover': {
      transform: 'translateY(-4px)',
      borderColor: 'rgba(198,255,62,0.35)',
      boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
    },
  };
});

export default function Card({ variant = 'default', children, sx, ...props }) {
  return (
    <StyledCard variant={variant} sx={{ p: 3, height: '100%', ...sx }} {...props}>
      {children}
    </StyledCard>
  );
}