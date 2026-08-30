import { Box, Button, Container, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';

export default function CtaSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 10 } }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            position: 'relative',
            overflow: 'hidden',
            textAlign: 'center',
            px: { xs: 3, md: 10 },
            py: { xs: 7, md: 10 },
            borderRadius: 5,
            border: '1px solid rgba(198,255,62,0.25)',
            background:
              'radial-gradient(120% 160% at 50% 0%, rgba(198,255,62,0.14) 0%, rgba(18,21,27,0.6) 45%, #10131A 100%)',
          }}
        >
          <FitnessCenterRoundedIcon
            aria-hidden
            sx={{
              position: 'absolute',
              right: -40,
              bottom: -46,
              fontSize: 240,
              color: 'rgba(198,255,62,0.06)',
              transform: 'rotate(-25deg)',
              pointerEvents: 'none',
            }}
          />

          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "'Sora','Inter',sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.02em',
              fontSize: { xs: '2rem', md: '2.8rem' },
            }}
          >
            Ready to become stronger?
          </Typography>

          <Typography color="text.secondary" sx={{ mt: 2, mx: 'auto', maxWidth: 560, lineHeight: 1.8 }}>
            Start tracking your progress today and turn every workout into measurable progress.
          </Typography>

          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            size="large"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ mt: 4 }}
          >
            Create Your Account
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
