import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
  CircularProgress,
  Alert,
  Tooltip,
  Avatar,
  useTheme,
} from '@mui/material';
import {
  CheckCircleRounded,
  CardMembershipRounded,
  WorkspacePremiumRounded,
  FitnessCenterRounded,
  SpeedRounded,
  SupportAgentRounded,
  AutoAwesomeRounded,
  LockRounded,
  ArrowForwardRounded,
  HelpOutlineRounded,
  VerifiedUserRounded,
  BoltRounded,
  ConfirmationNumberRounded,
} from '@mui/icons-material';

import { ticketService } from '../../services/ticketService';
import { useAuth } from '../../context/AuthContext';

export default function MembershipPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  const basicFeatures = [
    'Complete access to workout logger & exercise history',
    'Custom exercise builder with target muscle groups',
    'Body measurement & weight progression charts',
    'Daily calorie & macronutrient goals tracker',
    'Standard support via ticketing system',
  ];

  const premiumFeatures = [
    'Everything included in the Basic Plan',
    'AI-powered workout & nutrition generator',
    '1-on-1 Dedicated Coach Live Desk consultations',
    'Advanced analytics & 1RM strength predictions',
    'Volume load & muscle recovery heatmaps',
    'Priority 24/7 VIP support response',
  ];

  const handleSubscribeBasic = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const ticket = await ticketService.createTicket({
        subject: 'Basic subscription request',
        topic: 'MEMBERSHIP',
        message: 'User requested to subscribe to the Basic plan.',
      });

      setSuccessTicket(ticket);
      setConfirmationOpen(true);
    } catch (err) {
      console.error('Failed to submit subscription request:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to submit subscription request. Please try again or open a support ticket directly.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      {/* Header Section */}
      <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="center"
          sx={{ mb: 1.5 }}
        >
          <Chip
            icon={<WorkspacePremiumRounded sx={{ fontSize: '18px !important' }} />}
            label="MEMBERSHIP PLANS"
            size="small"
            sx={{
              bgcolor: 'rgba(198,255,62,0.12)',
              color: 'primary.main',
              fontWeight: 800,
              letterSpacing: 1,
              px: 1,
              py: 0.5,
              border: '1px solid rgba(198,255,62,0.3)',
            }}
          />
        </Stack>

        <Typography
          variant="h3"
          component="h1"
          fontWeight={900}
          sx={{
            fontFamily: "'Sora', sans-serif",
            fontSize: { xs: '2rem', md: '2.75rem' },
            mb: 2,
            letterSpacing: '-0.5px',
          }}
        >
          Level Up Your Training
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{
            maxWidth: 650,
            mx: 'auto',
            fontSize: { xs: '0.95rem', md: '1.1rem' },
            lineHeight: 1.6,
          }}
        >
          Choose the plan that best matches your fitness ambitions. Enjoy seamless workout logging,
          advanced progress tracking, and dedicated coaching support.
        </Typography>
      </Box>

      {/* Global Alerts */}
      {errorMessage && (
        <Alert
          severity="error"
          onClose={() => setErrorMessage('')}
          sx={{ mb: 4, borderRadius: 3 }}
        >
          {errorMessage}
        </Alert>
      )}

      {successTicket && !confirmationOpen && (
        <Alert
          severity="success"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/support')}
              sx={{ fontWeight: 700 }}
            >
              View Ticket
            </Button>
          }
          sx={{ mb: 4, borderRadius: 3 }}
        >
          Your request has been received, our team will contact you shortly. (Ticket #{successTicket.id?.substring(0, 8)})
        </Alert>
      )}

      {/* Pricing Cards Grid */}
      <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch" justifyContent="center">
        {/* ===================== BASIC PLAN ===================== */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '2px solid',
              borderColor: 'primary.main',
              position: 'relative',
              overflow: 'visible',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(198,255,62,0.08)',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 16px 40px rgba(198,255,62,0.15)',
              },
            }}
          >
            {/* Available Badge */}
            <Chip
              label="AVAILABLE NOW"
              size="small"
              sx={{
                position: 'absolute',
                top: -14,
                left: 28,
                bgcolor: 'primary.main',
                color: '#000',
                fontWeight: 900,
                fontSize: '0.75rem',
                letterSpacing: 0.5,
                boxShadow: '0 4px 12px rgba(198,255,62,0.4)',
                px: 1,
              }}
            />

            <CardContent sx={{ p: { xs: 3, sm: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, mt: 0.5 }}>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>
                    Basic Plan
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Essential tools for consistent training
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(198,255,62,0.15)',
                    color: 'primary.main',
                    width: 48,
                    height: 48,
                  }}
                >
                  <CardMembershipRounded />
                </Avatar>
              </Stack>

              <Box sx={{ my: 2.5 }}>
                <Stack direction="row" alignItems="baseline" spacing={0.5}>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    sx={{ fontFamily: "'Sora', sans-serif", color: 'text.primary' }}
                  >
                    $9.99
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                    / month
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Billed monthly • No long-term commitment
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>
                INCLUDED FEATURES
              </Typography>

              <List disablePadding sx={{ my: 1.5, flex: 1 }}>
                {basicFeatures.map((feature, idx) => (
                  <ListItem key={idx} disableGutters sx={{ py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleRounded sx={{ color: 'primary.main', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ pt: 2, mt: 'auto' }}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  onClick={handleSubscribeBasic}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <BoltRounded />}
                  sx={{
                    py: 1.5,
                    bgcolor: 'primary.main',
                    color: '#000',
                    fontWeight: 800,
                    fontSize: '1rem',
                    borderRadius: 3,
                    boxShadow: '0 8px 24px rgba(198,255,62,0.3)',
                    '&:hover': {
                      bgcolor: '#b3f520',
                    },
                  }}
                >
                  {loading ? 'Submitting Request...' : 'Subscribe'}
                </Button>
                <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                  Clicking will notify our team to activate your plan.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* ===================== PREMIUM PLAN ===================== */}
        <Grid item xs={12} md={6}>
          <Card
            elevation={0}
            sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              position: 'relative',
              overflow: 'visible',
              transition: 'all 0.3s ease',
              opacity: 0.92,
              '&:hover': {
                borderColor: '#8A7CFF',
                boxShadow: '0 12px 32px rgba(138,124,255,0.12)',
              },
            }}
          >
            {/* Coming Soon Badge */}
            <Chip
              label="COMING SOON"
              size="small"
              sx={{
                position: 'absolute',
                top: -14,
                left: 28,
                background: 'linear-gradient(135deg, #8A7CFF 0%, #6B5CEF 100%)',
                color: '#FFFFFF',
                fontWeight: 900,
                fontSize: '0.75rem',
                letterSpacing: 0.5,
                boxShadow: '0 4px 12px rgba(138,124,255,0.4)',
                px: 1,
              }}
            />

            <CardContent sx={{ p: { xs: 3, sm: 4 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, mt: 0.5 }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="h5" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>
                      Premium Plan
                    </Typography>
                    <Chip
                      icon={<AutoAwesomeRounded sx={{ fontSize: '14px !important', color: '#8A7CFF' }} />}
                      label="Pro AI & Coach"
                      size="small"
                      sx={{
                        bgcolor: 'rgba(138,124,255,0.12)',
                        color: '#8A7CFF',
                        fontWeight: 700,
                        fontSize: '0.7rem',
                      }}
                    />
                  </Stack>
                  <Typography variant="body2" color="text.secondary">
                    Advanced AI generation and personal coaching desk
                  </Typography>
                </Box>
                <Avatar
                  sx={{
                    bgcolor: 'rgba(138,124,255,0.15)',
                    color: '#8A7CFF',
                    width: 48,
                    height: 48,
                  }}
                >
                  <WorkspacePremiumRounded />
                </Avatar>
              </Stack>

              <Box sx={{ my: 2.5 }}>
                <Stack direction="row" alignItems="baseline" spacing={0.5}>
                  <Typography
                    variant="h3"
                    fontWeight={900}
                    sx={{ fontFamily: "'Sora', sans-serif", color: 'text.primary' }}
                  >
                    $24.99
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                    / month
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  Launching soon with high-performance coaching
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="overline" color="text.secondary" fontWeight={800} letterSpacing={1}>
                EVERYTHING IN BASIC, PLUS:
              </Typography>

              <List disablePadding sx={{ my: 1.5, flex: 1 }}>
                {premiumFeatures.map((feature, idx) => (
                  <ListItem key={idx} disableGutters sx={{ py: 0.75 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <CheckCircleRounded sx={{ color: '#8A7CFF', fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={feature}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500,
                        color: 'text.primary',
                      }}
                    />
                  </ListItem>
                ))}
              </List>

              <Box sx={{ pt: 2, mt: 'auto' }}>
                <Tooltip title="The Premium subscription plan is currently in development and will be available soon.">
                  <span>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      disabled={true}
                      startIcon={<LockRounded />}
                      sx={{
                        py: 1.5,
                        fontWeight: 800,
                        fontSize: '1rem',
                        borderRadius: 3,
                        borderColor: 'divider',
                        color: 'text.disabled',
                        bgcolor: 'action.disabledBackground',
                      }}
                    >
                      Coming Soon
                    </Button>
                  </span>
                </Tooltip>
                <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                  Premium tier registration will open soon.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Confirmation Modal */}
      <Dialog
        open={confirmationOpen}
        onClose={() => setConfirmationOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
            p: 1,
            bgcolor: 'background.paper',
            backgroundImage: 'none',
            border: '1px solid',
            borderColor: 'divider',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              bgcolor: 'rgba(0,230,118,0.15)',
              color: '#00E676',
              mx: 'auto',
              mb: 1.5,
            }}
          >
            <VerifiedUserRounded sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography variant="h5" fontWeight={900} sx={{ fontFamily: "'Sora', sans-serif" }}>
            Request Received!
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ textAlign: 'center', px: 3, pb: 2 }}>
          <Typography variant="body1" sx={{ mb: 2, fontWeight: 500, color: 'text.primary' }}>
            Your request has been received, our team will contact you shortly.
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 3,
              bgcolor: 'background.default',
              textAlign: 'left',
              mb: 1,
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <ConfirmationNumberRounded sx={{ color: 'primary.main' }} />
              <Box>
                <Typography variant="caption" color="text.secondary" display="block">
                  Support Ticket Created
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  Subject: Basic subscription request
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 3, flexDirection: 'column', gap: 1 }}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setConfirmationOpen(false);
              navigate('/support');
            }}
            endIcon={<ArrowForwardRounded />}
            sx={{
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 800,
              borderRadius: 2.5,
              py: 1.25,
            }}
          >
            View Ticket in Support Center
          </Button>

          <Button
            fullWidth
            variant="text"
            onClick={() => setConfirmationOpen(false)}
            sx={{ color: 'text.secondary', fontWeight: 600 }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* FAQ / Info Section */}
      <Box sx={{ mt: 8, p: { xs: 3, md: 5 }, borderRadius: 4, bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
          <HelpOutlineRounded sx={{ color: 'primary.main' }} />
          <Typography variant="h6" fontWeight={800} sx={{ fontFamily: "'Sora', sans-serif" }}>
            Frequently Asked Questions
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              How does the subscription request work?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              When you click "Subscribe", an automated ticket is submitted to our team. Our administration staff verifies your account and contacts you with the final onboarding details.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              When will the Premium Plan be available?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Our Premium tier featuring AI-powered workout plans and real-time Coach desk is currently in testing and will be released in the upcoming update.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
