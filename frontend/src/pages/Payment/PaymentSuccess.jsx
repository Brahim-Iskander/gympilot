import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Stack,
  Paper,
  Avatar,
  Chip,
  Divider,
} from '@mui/material';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded';
import WorkspacePremiumRoundedIcon from '@mui/icons-material/WorkspacePremiumRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import CelebrationRoundedIcon from '@mui/icons-material/CelebrationRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';

import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();
  const [showConfetti, setShowConfetti] = useState(true);

  // Optional query params from Polar redirect
  const planName = searchParams.get('plan') || 'Membership';

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <SEO
        title="Payment Successful — GymPilot"
        description="Your payment has been processed successfully. Welcome to GymPilot!"
        noIndex
      />

      {!isAuthenticated && <Navbar />}

      <Container
        maxWidth="sm"
        sx={{
          minHeight: '100dvh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          py: { xs: 6, md: 10 },
          pt: !isAuthenticated ? { xs: 12, md: 14 } : undefined,
        }}
      >
        {/* Animated success ring */}
        <Box
          sx={{
            position: 'relative',
            mb: 3,
          }}
        >
          {/* Pulsing glow ring */}
          <Box
            sx={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(198,255,62,0.2) 0%, transparent 70%)',
              animation: showConfetti ? 'pulseGlow 1.5s ease-in-out infinite' : 'none',
              '@keyframes pulseGlow': {
                '0%, 100%': { transform: 'scale(1)', opacity: 0.6 },
                '50%': { transform: 'scale(1.25)', opacity: 1 },
              },
            }}
          />
          <Avatar
            sx={{
              width: 96,
              height: 96,
              bgcolor: 'rgba(198,255,62,0.12)',
              border: '3px solid rgba(198,255,62,0.4)',
              animation: 'popIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
              '@keyframes popIn': {
                '0%': { transform: 'scale(0)', opacity: 0 },
                '100%': { transform: 'scale(1)', opacity: 1 },
              },
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 52, color: '#C6FF3E' }} />
          </Avatar>
        </Box>

        {/* Confetti emoji burst */}
        {showConfetti && (
          <Box
            sx={{
              position: 'absolute',
              top: '18%',
              fontSize: '2.5rem',
              animation: 'fadeUp 2s ease-out forwards',
              '@keyframes fadeUp': {
                '0%': { opacity: 1, transform: 'translateY(0) scale(1)' },
                '100%': { opacity: 0, transform: 'translateY(-60px) scale(1.3)' },
              },
            }}
          >
            🎉
          </Box>
        )}

        <Chip
          icon={<CelebrationRoundedIcon sx={{ fontSize: '16px !important', color: '#C6FF3E' }} />}
          label="PAYMENT CONFIRMED"
          size="small"
          sx={{
            mb: 2,
            bgcolor: 'rgba(198,255,62,0.1)',
            color: '#C6FF3E',
            fontWeight: 900,
            fontSize: '0.75rem',
            letterSpacing: 1,
            border: '1px solid rgba(198,255,62,0.3)',
            px: 1,
          }}
        />

        <Typography
          variant="h3"
          component="h1"
          fontWeight={900}
          sx={{
            fontFamily: "'Sora', sans-serif",
            fontSize: { xs: '1.75rem', md: '2.25rem' },
            mb: 1.5,
            background: 'linear-gradient(135deg, #C6FF3E 0%, #FFFFFF 60%)',
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to GymPilot!
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 420,
            mb: 4,
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.7,
          }}
        >
          Your <strong style={{ color: '#C6FF3E' }}>{planName}</strong> payment has been processed
          successfully. Your membership is now active and ready to use.
        </Typography>

        {/* Details card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            bgcolor: 'rgba(255,255,255,0.03)',
            border: '1px solid',
            borderColor: 'divider',
            width: '100%',
            maxWidth: 420,
            mb: 4,
          }}
        >
          <Stack spacing={2}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Status
              </Typography>
              <Chip
                label="ACTIVE"
                size="small"
                sx={{
                  bgcolor: 'rgba(0,230,118,0.12)',
                  color: '#00E676',
                  fontWeight: 900,
                  fontSize: '0.7rem',
                  height: 24,
                }}
              />
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Plan
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <WorkspacePremiumRoundedIcon sx={{ fontSize: 16, color: 'primary.main' }} />
                <Typography variant="body2" fontWeight={800}>
                  {planName}
                </Typography>
              </Stack>
            </Stack>

            <Divider />

            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                Payment Method
              </Typography>
              <Typography variant="body2" fontWeight={700}>
                💳 Card / Apple Pay
              </Typography>
            </Stack>

            {user?.email && (
              <>
                <Divider />
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    Account
                  </Typography>
                  <Typography variant="body2" fontWeight={700} sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user.email}
                  </Typography>
                </Stack>
              </>
            )}
          </Stack>
        </Paper>

        {/* CTA Buttons */}
        <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 420 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login?redirect=/dashboard')}
            startIcon={<DashboardRoundedIcon />}
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              py: 1.5,
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 900,
              fontSize: '0.95rem',
              borderRadius: 3,
              boxShadow: '0 8px 24px rgba(198,255,62,0.35)',
              '&:hover': {
                bgcolor: '#b3f520',
              },
            }}
          >
            Go to Dashboard
          </Button>

          <Button
            fullWidth
            variant="outlined"
            size="large"
            onClick={() => navigate('/support')}
            startIcon={<SupportAgentRoundedIcon />}
            sx={{
              py: 1.25,
              fontWeight: 700,
              fontSize: '0.9rem',
              borderRadius: 3,
              borderColor: 'divider',
              color: 'text.secondary',
              '&:hover': {
                borderColor: 'primary.main',
                color: 'primary.main',
              },
            }}
          >
            Contact Support
          </Button>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, maxWidth: 380 }}>
          A confirmation email has been sent to your inbox. If you have any questions,
          our support team is available 24/7.
        </Typography>
      </Container>

      {!isAuthenticated && <Footer />}
    </>
  );
}
