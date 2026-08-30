import { Link as RouterLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

export default function Logo({ size = 52 }) {
  return (
    <Box
      component={RouterLink}
      to="/"
      aria-label="GymPilot - back to home"
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        color: 'text.primary',
      }}
    >
      <Box
        component="img"
        src="/favicon1.png"
        alt="GymPilot logo"
        sx={{
          width: size,
          height: size,
          objectFit: 'contain',
        }}
      />
      <Typography sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em' }}>
        Gym
        <Box component="span" sx={{ color: 'primary.main' }}>
          Pilot
        </Box>
      </Typography>
    </Box>
  );
}
