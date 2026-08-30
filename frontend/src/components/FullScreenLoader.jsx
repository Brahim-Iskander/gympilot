import { Box, CircularProgress, Stack } from '@mui/material';

import Logo from './Logo';

/** Centered brand loader used while authentication state is being restored. */
export default function FullScreenLoader() {
  return (
    <Box sx={{ minHeight: '100dvh', display: 'grid', placeItems: 'center' }}>
      <Stack alignItems="center" spacing={3}>
        <Logo />
        <CircularProgress size={28} thickness={4} />
      </Stack>
    </Box>
  );
}
