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
import ErrorOutlineRoundedIcon from '@mui/icons-material/ErrorOutlineRounded';
import ReplayRoundedIcon from '@mui/icons-material/ReplayRounded';
import SupportAgentRoundedIcon from '@mui/icons-material/SupportAgentRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import CurrencyBitcoinRoundedIcon from '@mui/icons-material/CurrencyBitcoinRounded';

import SEO from '../../components/SEO';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useAuth } from '../../context/AuthContext';

export default function PaymentFailure() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchParams] = useSearchParams();

  const planName = searchParams.get('plan') || 'Membership';
  const reason = searchParams.get('reason'); // optional — 'cancelled', 'declined', etc.

  const isCancelled = reason === 'cancelled';

  return (
    <>
      <SEO
        title={`Payment ${isCancelled ? 'Cancelled' : 'Failed'} — GymPilot`}
        description="Your payment could not be completed. Please try again or use an alternative payment method."
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
        {/* Error icon with shake animation */}
        <Box sx={{ position: 'relative', mb: 3 }}>
          <Box
            sx={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              background: isCancelled
                ? 'radial-gradient(circle, rgba(255,183,77,0.15) 0%, transparent 70%)'
                : 'radial-gradient(circle, rgba(255,82,82,0.15) 0%, transparent 70%)',
            }}
          />
          <Avatar
            sx={{
              width: 96,
              height: 96,
              bgcolor: isCancelled ? 'rgba(255,183,77,0.1)' : 'rgba(255,82,82,0.1)',
              border: '3px solid',
              borderColor: isCancelled ? 'rgba(255,183,77,0.35)' : 'rgba(255,82,82,0.35)',
              animation: 'shakeIn 0.6s ease-out',
              '@keyframes shakeIn': {
                '0%': { transform: 'scale(0) rotate(0)' },
                '50%': { transform: 'scale(1.1) rotate(-3deg)' },
                '70%': { transform: 'scale(0.95) rotate(2deg)' },
                '100%': { transform: 'scale(1) rotate(0)' },
              },
            }}
          >
            {isCancelled ? (
              <WarningAmberRoundedIcon sx={{ fontSize: 52, color: '#FFB74D' }} />
            ) : (
              <ErrorOutlineRoundedIcon sx={{ fontSize: 52, color: '#FF5252' }} />
            )}
          </Avatar>
        </Box>

        <Chip
          label={isCancelled ? 'PAYMENT CANCELLED' : 'PAYMENT FAILED'}
          size="small"
          sx={{
            mb: 2,
            bgcolor: isCancelled ? 'rgba(255,183,77,0.1)' : 'rgba(255,82,82,0.1)',
            color: isCancelled ? '#FFB74D' : '#FF5252',
            fontWeight: 900,
            fontSize: '0.75rem',
            letterSpacing: 1,
            border: '1px solid',
            borderColor: isCancelled ? 'rgba(255,183,77,0.3)' : 'rgba(255,82,82,0.3)',
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
            color: 'text.primary',
          }}
        >
          {isCancelled ? 'Payment Cancelled' : 'Payment Unsuccessful'}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 440,
            mb: 4,
            fontSize: { xs: '0.95rem', md: '1.05rem' },
            lineHeight: 1.7,
          }}
        >
          {isCancelled
            ? `Your ${planName} checkout was cancelled. No charges were made. You can try again whenever you're ready.`
            : `We couldn't process your payment for the ${planName}. This could be due to insufficient funds, card restrictions, or a network issue.`}
        </Typography>

        {/* Troubleshooting tips card */}
        {!isCancelled && (
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 4,
              bgcolor: 'rgba(255,82,82,0.04)',
              border: '1px solid rgba(255,82,82,0.15)',
              width: '100%',
              maxWidth: 440,
              mb: 4,
              textAlign: 'left',
            }}
          >
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.5, color: 'text.primary' }}>
              Common reasons & fixes
            </Typography>
            <Stack spacing={1.25}>
              {[
                { label: 'Card declined', tip: 'Try a different card or check your bank app for authorization prompts.' },
                { label: 'International block', tip: 'Some cards block foreign currency transactions. Enable international payments in your banking app.' },
                { label: 'Insufficient funds', tip: 'Ensure your card has sufficient balance for the subscription.' },
                { label: '3D Secure timeout', tip: 'The authentication window may have timed out. Try again and complete verification quickly.' },
              ].map((item, idx) => (
                <Box key={idx}>
                  <Typography variant="caption" fontWeight={800} color="text.primary">
                    {item.label}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.5 }}>
                    {item.tip}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        )}

        {/* CTA Buttons */}
        <Stack spacing={1.5} sx={{ width: '100%', maxWidth: 440 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            onClick={() => navigate('/membership')}
            startIcon={<ReplayRoundedIcon />}
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
            Try Again
          </Button>

          {/* Alternative payment suggestion */}
          <Paper
            elevation={0}
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'rgba(198,255,62,0.04)',
              border: '1px solid rgba(198,255,62,0.15)',
              textAlign: 'center',
            }}
          >
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
              Card not working? Try an alternative method:
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Chip
                label="D17 Mobile"
                size="small"
                onClick={() => navigate('/membership')}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(198,255,62,0.1)',
                  color: 'primary.main',
                  '&:hover': { bgcolor: 'rgba(198,255,62,0.2)' },
                }}
              />
              <Chip
                icon={<CurrencyBitcoinRoundedIcon sx={{ fontSize: '14px !important' }} />}
                label="Crypto"
                size="small"
                onClick={() => navigate('/membership')}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  bgcolor: 'rgba(247,147,26,0.1)',
                  color: '#F7931A',
                  '&:hover': { bgcolor: 'rgba(247,147,26,0.2)' },
                }}
              />
            </Stack>
          </Paper>

          <Stack direction="row" spacing={1.5} sx={{ width: '100%' }}>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/')}
              startIcon={<ArrowBackRoundedIcon />}
              sx={{
                py: 1.25,
                fontWeight: 700,
                fontSize: '0.85rem',
                borderRadius: 3,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'text.primary',
                  color: 'text.primary',
                },
              }}
            >
              {isAuthenticated ? 'Dashboard' : 'Home'}
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
                fontSize: '0.85rem',
                borderRadius: 3,
                borderColor: 'divider',
                color: 'text.secondary',
                '&:hover': {
                  borderColor: 'primary.main',
                  color: 'primary.main',
                },
              }}
            >
              Get Help
            </Button>
          </Stack>
        </Stack>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 3, maxWidth: 380 }}>
          No charges were applied to your account. If you believe this is an error,
          please contact our support team for assistance.
        </Typography>
      </Container>

      {!isAuthenticated && <Footer />}
    </>
  );
}
