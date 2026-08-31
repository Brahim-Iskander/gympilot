import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SEO from '../../components/SEO';

export default function NotFound() {
  return (
    <>
      <SEO title="Page Not Found (404)" description="The requested page could not be found on GymPilot." noIndex />
      <Container maxWidth="sm" sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        <Typography sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, fontSize: { xs: 72, md: 96 }, color: 'primary.main' }}>
          404
        </Typography>
        <Typography variant="h5" component="h1" fontWeight={700} sx={{ mt: 1 }}>
          This page doesn't exist
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 1 }}>
          The page you are looking for has been moved or never existed.
        </Typography>
        <Button component={RouterLink} to="/" variant="contained" size="large" sx={{ mt: 4, alignSelf: 'center' }}>
          Back to Home
        </Button>
      </Container>
    </>
  );
}
