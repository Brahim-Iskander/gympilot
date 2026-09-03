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
  MonetizationOnRounded,
  StarRounded,
} from '@mui/icons-material';

import { ticketService } from '../../services/ticketService';
import { membershipService } from '../../services/membershipService';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';

export default function MembershipPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const BASIC_POINTS_COST = 250;
  const PREMIUM_POINTS_COST = 500;

  const [loading, setLoading] = useState(false);
  const [redeemingTier, setRedeemingTier] = useState(null);
  const [successTicket, setSuccessTicket] = useState(null);
  const [successRedeem, setSuccessRedeem] = useState(null);
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

  const handleRedeemWithPoints = async (tier) => {
    try {
      setRedeemingTier(tier);
      setErrorMessage('');

      const updatedUser = await membershipService.redeemPlanWithPoints(tier);
      updateUser(updatedUser);
      setSuccessRedeem(tier);
    } catch (err) {
      console.error('Failed to redeem membership with points:', err);
      setErrorMessage(
        err.response?.data?.message ||
          `Failed to redeem ${tier} plan. Please try again.`
      );
    } finally {
      setRedeemingTier(null);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <SEO
        title="Membership Plans & Pricing"
        description="Upgrade your GymPilot tier. Unlock 1-on-1 certified live coach access, advanced AI analytics, and unlimited workout program generation."
        path="/membership"
        noIndex
      />
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

      {/* Points Balance Banner */}
      {user && (
        <Box
          sx={{
            mb: 4,
            p: 2.5,
            borderRadius: 3,
            bgcolor: 'rgba(255,215,0,0.06)',
            border: '1px solid rgba(255,215,0,0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={1.5} alignItems="center">
            <MonetizationOnRounded sx={{ color: '#FFD700', fontSize: 28 }} />
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                Your Reward Points Balance
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Use your points to unlock membership plans instantly
              </Typography>
            </Box>
          </Stack>
          <Chip
            label={`${user?.points ?? 0} pts`}
            sx={{
              bgcolor: 'rgba(255,215,0,0.15)',
              color: '#FFD700',
              fontWeight: 900,
              fontSize: '1rem',
              px: 1.5,
              height: 36,
            }}
          />
        </Box>
      )}

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

      {successRedeem && (
        <Alert
          severity="success"
          onClose={() => setSuccessRedeem(null)}
          sx={{ mb: 4, borderRadius: 3 }}
        >
          You have successfully activated the <strong>{successRedeem}</strong> plan for 30 days using your reward points!
          {user?.membershipExpiresAt && (
            <> Your plan is active until <strong>{new Date(user.membershipExpiresAt).toLocaleDateString()}</strong>.</>
          )}
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
            {/* Available / Active Badge */}
            <Chip
              label={
                user?.isTrialActive
                  ? 'ACTIVE 2-WEEK FREE TRIAL'
                  : user?.membershipTier === 'BASIC' && user?.membershipStatus === 'ACTIVE'
                  ? 'CURRENT ACTIVE PLAN'
                  : 'AVAILABLE NOW'
              }
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
                  Billed monthly • Includes 14-day free trial on signup
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
                {user?.isTrialActive ? (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      disabled
                      startIcon={<CheckCircleRounded sx={{ color: '#C6FF3E' }} />}
                      sx={{
                        py: 1.5,
                        color: 'text.primary',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        borderRadius: 3,
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(198,255,62,0.08)',
                      }}
                    >
                      Free Trial Active
                    </Button>
                    <Typography variant="caption" color="primary.main" align="center" display="block" sx={{ mt: 1, fontWeight: 700 }}>
                      {user?.trialEndsAt
                        ? `Enjoy full Basic access until ${new Date(user.trialEndsAt).toLocaleDateString()}`
                        : '14-day free trial active'}
                    </Typography>
                  </>
                ) : user?.membershipTier === 'BASIC' && user?.membershipStatus === 'ACTIVE' ? (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      disabled
                      startIcon={<CheckCircleRounded sx={{ color: '#C6FF3E' }} />}
                      sx={{
                        py: 1.5,
                        color: 'text.primary',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        borderRadius: 3,
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(198,255,62,0.08)',
                      }}
                    >
                      Current Plan Active
                    </Button>
                  </>
                ) : (
                  <Stack spacing={1.5}>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => handleRedeemWithPoints('BASIC')}
                      disabled={redeemingTier === 'BASIC' || (user?.points ?? 0) < BASIC_POINTS_COST}
                      startIcon={redeemingTier === 'BASIC' ? <CircularProgress size={20} color="inherit" /> : <MonetizationOnRounded />}
                      sx={{
                        py: 1.5,
                        bgcolor: 'primary.main',
                        color: '#000',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(198,255,62,0.3)',
                        '&:hover': {
                          bgcolor: '#b3f520',
                        },
                      }}
                    >
                      {redeemingTier === 'BASIC' ? 'Activating...' : `Redeem for ${BASIC_POINTS_COST} Points`}
                    </Button>
                    {(user?.points ?? 0) < BASIC_POINTS_COST && (
                      <Typography variant="caption" color="error.main" align="center" display="block" sx={{ fontWeight: 600 }}>
                        You need {BASIC_POINTS_COST - (user?.points ?? 0)} more points to redeem this plan.
                      </Typography>
                    )}
                    <Divider sx={{ my: 0.5 }}><Chip label="OR" size="small" sx={{ fontSize: '0.65rem', fontWeight: 700 }} /></Divider>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      onClick={handleSubscribeBasic}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <BoltRounded />}
                      sx={{
                        py: 1.25,
                        fontWeight: 700,
                        fontSize: '0.9rem',
                        borderRadius: 3,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      }}
                    >
                      {loading ? 'Submitting...' : 'Request via Support'}
                    </Button>
                    <Typography variant="caption" color="text.secondary" align="center" display="block">
                      Our team will manually activate your plan.
                    </Typography>
                  </Stack>
                )}
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
              '&:hover': {
                borderColor: '#8A7CFF',
                boxShadow: '0 12px 32px rgba(138,124,255,0.12)',
              },
            }}
          >
            {/* Badge */}
            <Chip
              label={
                user?.membershipTier === 'PREMIUM' && user?.membershipStatus === 'ACTIVE'
                  ? 'CURRENT ACTIVE PLAN'
                  : 'REDEEM WITH POINTS'
              }
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
                {user?.membershipTier === 'PREMIUM' && user?.membershipStatus === 'ACTIVE' ? (
                  <>
                    <Button
                      fullWidth
                      variant="outlined"
                      size="large"
                      disabled
                      startIcon={<CheckCircleRounded sx={{ color: '#8A7CFF' }} />}
                      sx={{
                        py: 1.5,
                        color: 'text.primary',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        borderRadius: 3,
                        borderColor: '#8A7CFF',
                        bgcolor: 'rgba(138,124,255,0.08)',
                      }}
                    >
                      Current Plan Active
                    </Button>
                    {user?.membershipExpiresAt && (
                      <Typography variant="caption" sx={{ color: '#8A7CFF', fontWeight: 700, display: 'block', textAlign: 'center', mt: 1 }}>
                        Active until {new Date(user.membershipExpiresAt).toLocaleDateString()}
                      </Typography>
                    )}
                  </>
                ) : (
                  <>
                    <Button
                      fullWidth
                      variant="contained"
                      size="large"
                      onClick={() => handleRedeemWithPoints('PREMIUM')}
                      disabled={redeemingTier === 'PREMIUM' || (user?.points ?? 0) < PREMIUM_POINTS_COST}
                      startIcon={redeemingTier === 'PREMIUM' ? <CircularProgress size={20} color="inherit" /> : <StarRounded />}
                      sx={{
                        py: 1.5,
                        background: 'linear-gradient(135deg, #8A7CFF 0%, #6B5CEF 100%)',
                        color: '#FFFFFF',
                        fontWeight: 800,
                        fontSize: '0.95rem',
                        borderRadius: 3,
                        boxShadow: '0 8px 24px rgba(138,124,255,0.3)',
                        '&:hover': {
                          background: 'linear-gradient(135deg, #9B8FFF 0%, #7C6EFF 100%)',
                        },
                        '&.Mui-disabled': {
                          background: 'rgba(138,124,255,0.3)',
                          color: 'rgba(255,255,255,0.5)',
                        },
                      }}
                    >
                      {redeemingTier === 'PREMIUM' ? 'Activating...' : `Redeem for ${PREMIUM_POINTS_COST} Points`}
                    </Button>
                    {(user?.points ?? 0) < PREMIUM_POINTS_COST && (
                      <Typography variant="caption" color="error.main" align="center" display="block" sx={{ mt: 1, fontWeight: 600 }}>
                        You need {PREMIUM_POINTS_COST - (user?.points ?? 0)} more points to redeem this plan.
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" align="center" display="block" sx={{ mt: 1 }}>
                      Unlocks all premium features for 30 days.
                    </Typography>
                  </>
                )}
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
              How do I redeem with points?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              If you have enough reward points, click "Redeem for X Points" on the plan you want. Your points are deducted instantly and the plan is activated for 30 days. You earn points by shopping in the marketplace (1 point per 2 TND spent) and by referring friends.
            </Typography>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5 }}>
              How many points do I need?
            </Typography>
            <Typography variant="body2" color="text.secondary">
              The Basic Plan costs 250 points and the Premium Plan costs 500 points. Each redemption activates the plan for 30 days. If you already have an active plan of the same tier, the 30 days are added to your remaining time.
            </Typography>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}
