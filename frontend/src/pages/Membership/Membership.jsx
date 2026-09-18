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
  ArrowBackRounded,
  HelpOutlineRounded,
  VerifiedUserRounded,
  BoltRounded,
  ConfirmationNumberRounded,
  MonetizationOnRounded,
  StarRounded,
  PhoneAndroidRounded,
} from '@mui/icons-material';

import { ticketService } from '../../services/ticketService';
import { membershipService } from '../../services/membershipService';
import { useAuth } from '../../context/AuthContext';
import SEO from '../../components/SEO';
import { useLanguage } from '../../i18n';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { useGeoCurrency } from '../../utils/geoCurrency';
import D17PaymentModal from '../../components/D17PaymentModal';
import { paymentService } from '../../services/paymentService';

export default function MembershipPage() {
  const { t } = useLanguage();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, updateUser, isAuthenticated } = useAuth();
  const geo = useGeoCurrency();

  const BASIC_POINTS_COST = 250;
  const PREMIUM_POINTS_COST = 500;

  const [loading, setLoading] = useState(false);
  const [redeemingTier, setRedeemingTier] = useState(null);
  const [successTicket, setSuccessTicket] = useState(null);
  const [successRedeem, setSuccessRedeem] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [confirmationOpen, setConfirmationOpen] = useState(false);

  // Active payment methods for user region
  const [activePaymentMethods, setActivePaymentMethods] = useState([]);

  useEffect(() => {
    const country = geo?.countryCode || localStorage.getItem('gympilot_geo_country') || 'TN';
    paymentService.getActiveMethods(country)
      .then((methods) => {
        if (methods) setActivePaymentMethods(methods);
      })
      .catch((err) => console.error('Failed to load active methods for membership:', err));
  }, [geo?.countryCode]);

  const hasD17 = activePaymentMethods.some((m) => m.code === 'D17');
  const hasCrypto = activePaymentMethods.some((m) => m.code !== 'D17');

  // Manual payment modal state
  const [d17Modal, setD17Modal] = useState({
    open: false,
    tier: 'BASIC',
    planName: 'Basic Plan',
    amount: 49,
    selectedMethod: 'D17',
  });

  const handleOpenD17 = (tier, planName, defaultAmount, selectedMethod = 'D17') => {
    if (!user) {
      navigate('/login?redirect=/membership');
      return;
    }
    const amount = tier === 'BASIC'
      ? (geo.config?.basicAmount || defaultAmount || 49)
      : (geo.config?.premiumAmount || defaultAmount || 99);

    setD17Modal({
      open: true,
      tier,
      planName,
      amount,
      selectedMethod: selectedMethod || (hasD17 ? 'D17' : 'USDT_TRC20'),
    });
  };

  const handleD17Success = (ticket) => {
    if (user) {
      updateUser({ ...user, membershipStatus: 'PENDING_VERIFICATION' });
    }
  };

  const basicFeatures = [
    'Complete access to workout logger & exercise history',
    '5 AI Body Scans & 5 AI Progress Analyses per month',
    'Custom exercise builder with target muscle groups',
    'Body measurement & weight progression charts',
    'Daily calorie & macronutrient goals tracker',
    'Standard support via ticketing system',
  ];

  const premiumFeatures = [
    'Everything included in the Basic Plan',
    '15 AI Body Scans & 15 AI Progress Analyses per month',
    'AI-powered workout & nutrition generator',
    '1-on-1 Dedicated Coach Live Desk consultations',
    'Advanced analytics & 1RM strength predictions',
    'Volume load & muscle recovery heatmaps',
    'Priority 24/7 VIP support response',
  ];

  const handleSubscribeBasic = async () => {
    if (!user) {
      navigate('/login?redirect=/membership');
      return;
    }
    try {
      setLoading(true);
      setErrorMessage('');
      
      const ticket = await ticketService.createTicket({
        subject: `Basic subscription request (${geo.config.basicPrice})`,
        topic: 'MEMBERSHIP',
        message: `User requested to subscribe to the Basic plan for ${geo.config.basicPrice} / month (${geo.config.billingNote}).`,
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
    if (!user) {
      navigate('/login?redirect=/membership');
      return;
    }
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

  const pageContent = (
    <Container
      maxWidth="lg"
      sx={{
        py: { xs: 3, md: 5 },
        pt: !isAuthenticated ? { xs: 11, md: 13 } : { xs: 3, md: 5 },
      }}
    >
      <SEO
        title={`${t('membership.title')} — GymPilot`}
        description={t('membership.subtitle')}
        path="/membership"
      />

      {/* Back to Dashboard / Home Navigation */}
      <Box sx={{ mb: { xs: 2.5, md: 3 }, display: 'flex', alignItems: 'center' }}>
        <Button
          onClick={() => {
            if (window.history?.length > 1) {
              navigate(-1);
            } else {
              navigate(isAuthenticated ? '/dashboard' : '/');
            }
          }}
          startIcon={<ArrowBackRounded />}
          variant="outlined"
          size="small"
          sx={{
            borderRadius: 2.5,
            px: { xs: 1.75, sm: 2.25 },
            py: { xs: 0.6, sm: 0.8 },
            fontWeight: 700,
            fontSize: { xs: '0.8rem', sm: '0.85rem' },
            textTransform: 'none',
            color: 'text.primary',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.14)' : 'rgba(0, 0, 0, 0.12)',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.02)',
            backdropFilter: 'blur(8px)',
            transition: 'all 0.2s ease',
            '&:hover': {
              borderColor: 'primary.main',
              color: 'primary.main',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.08)' : 'rgba(198, 255, 62, 0.12)',
              transform: 'translateX(-3px)',
            },
          }}
        >
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </Button>
      </Box>

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
            label={t('membership.title').toUpperCase()}
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
          {t('membership.title')}
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
          {t('membership.subtitle')}
        </Typography>
      </Box>

      {/* Guest Welcome Banner */}
      {!user && (
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2.5, sm: 3 },
            mb: 4,
            borderRadius: 3,
            bgcolor: 'rgba(198,255,62,0.06)',
            border: '1px solid rgba(198,255,62,0.25)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary">
              New to GymPilot? Claim your 14-Day Free Trial!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Sign up today to explore full workout tracking, 3 free lifetime AI Body Scans & Progress Analyses, and reward points.
            </Typography>
          </Box>
          <Stack direction="row" spacing={1.5}>
            <Button
              variant="contained"
              onClick={() => navigate('/register?redirect=/membership')}
              sx={{ fontWeight: 800, borderRadius: 2.5 }}
            >
              Start Free Trial
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/login?redirect=/membership')}
              sx={{ fontWeight: 700, borderRadius: 2.5 }}
            >
              Sign In
            </Button>
          </Stack>
        </Paper>
      )}

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

      {user?.membershipStatus === 'PENDING_VERIFICATION' && (
        <Alert
          severity="info"
          icon={<VerifiedUserRounded sx={{ color: '#00E676' }} />}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate('/support')}
              sx={{ fontWeight: 700 }}
            >
              View Support Ticket
            </Button>
          }
          sx={{
            mb: 4,
            borderRadius: 3,
            bgcolor: 'rgba(0,230,118,0.08)',
            border: '1px solid rgba(0,230,118,0.25)',
            color: 'text.primary',
          }}
        >
          Your D17 mobile payment proof is currently <strong>Pending Verification</strong> by our finance team (SLA: 24–48h). You will receive an instant notification and email once your membership plan is activated!
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
                user?.membershipStatus === 'PENDING_VERIFICATION' && (user?.membershipTier === 'BASIC' || !user?.membershipTier)
                  ? 'PENDING D17 VERIFICATION'
                  : user?.isTrialActive
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
                bgcolor: user?.membershipStatus === 'PENDING_VERIFICATION' ? '#00E676' : 'primary.main',
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
                    {geo.config.basicPrice}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                    {geo.config.period}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {geo.config.billingNote} • Includes 14-day free trial on signup
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
                    {hasD17 && (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => handleOpenD17('BASIC', 'Basic Plan', 49, 'D17')}
                        startIcon={
                          <Box
                            component="img"
                            src="/d17-logo.webp"
                            alt="D17"
                            sx={{ width: 22, height: 22, borderRadius: 0.75, objectFit: 'contain' }}
                          />
                        }
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
                        Pay with D17 Mobile ({geo.config.basicPrice})
                      </Button>
                    )}

                    {hasCrypto && (
                      <Button
                        fullWidth
                        variant={hasD17 ? 'outlined' : 'contained'}
                        size="large"
                        onClick={() => handleOpenD17('BASIC', 'Basic Plan', 49, 'USDT_TRC20')}
                        startIcon={
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              bgcolor: '#26A17B',
                              color: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.75rem',
                            }}
                          >
                            ₮
                          </Box>
                        }
                        sx={{
                          py: 1.5,
                          bgcolor: hasD17 ? 'transparent' : 'primary.main',
                          color: hasD17 ? 'text.primary' : '#000',
                          borderColor: hasD17 ? 'divider' : 'transparent',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          borderRadius: 3,
                          '&:hover': {
                            borderColor: 'primary.main',
                            bgcolor: hasD17 ? 'rgba(198,255,62,0.06)' : '#b3f520',
                          },
                        }}
                      >
                        Pay with Crypto (USDT, BTC, ETH)
                      </Button>
                    )}

                    <Divider sx={{ my: 0.5 }}>
                      <Chip label="OR USE REWARD POINTS" size="small" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                    </Divider>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      onClick={() => handleRedeemWithPoints('BASIC')}
                      disabled={redeemingTier === 'BASIC' || (user?.points ?? 0) < BASIC_POINTS_COST}
                      startIcon={redeemingTier === 'BASIC' ? <CircularProgress size={18} color="inherit" /> : <MonetizationOnRounded />}
                      sx={{
                        py: 1.25,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        borderRadius: 3,
                        borderColor: 'primary.main',
                        color: 'primary.main',
                      }}
                    >
                      {redeemingTier === 'BASIC' ? 'Activating...' : `Redeem for ${BASIC_POINTS_COST} Points`}
                    </Button>
                    {(user?.points ?? 0) < BASIC_POINTS_COST ? (
                      <Typography variant="caption" color="text.secondary" align="center" display="block">
                        Your balance: {user?.points ?? 0} pts (Need {BASIC_POINTS_COST - (user?.points ?? 0)} more)
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="success.main" align="center" display="block" sx={{ fontWeight: 700 }}>
                        ✓ You have enough points to unlock this plan free!
                      </Typography>
                    )}
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
                user?.membershipStatus === 'PENDING_VERIFICATION' && user?.membershipTier === 'PREMIUM'
                  ? 'PENDING D17 VERIFICATION'
                  : user?.membershipTier === 'PREMIUM' && user?.membershipStatus === 'ACTIVE'
                  ? 'CURRENT ACTIVE PLAN'
                  : 'AVAILABLE NOW'
              }
              size="small"
              sx={{
                position: 'absolute',
                top: -14,
                left: 28,
                background: user?.membershipStatus === 'PENDING_VERIFICATION' && user?.membershipTier === 'PREMIUM'
                  ? '#00E676'
                  : 'linear-gradient(135deg, #8A7CFF 0%, #6B5CEF 100%)',
                color: user?.membershipStatus === 'PENDING_VERIFICATION' && user?.membershipTier === 'PREMIUM' ? '#000' : '#FFFFFF',
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
                    {geo.config.premiumPrice}
                  </Typography>
                  <Typography variant="subtitle1" color="text.secondary" fontWeight={600}>
                    {geo.config.period}
                  </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary">
                  {geo.config.billingNote} • Launching soon with high-performance coaching
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
                  <Stack spacing={1.5}>
                    {hasD17 && (
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        onClick={() => handleOpenD17('PREMIUM', 'Premium Plan', 99, 'D17')}
                        startIcon={
                          <Box
                            component="img"
                            src="/d17-logo.webp"
                            alt="D17"
                            sx={{ width: 22, height: 22, borderRadius: 0.75, objectFit: 'contain' }}
                          />
                        }
                        sx={{
                          py: 1.5,
                          background: 'linear-gradient(135deg, #8A7CFF 0%, #6B5CEF 100%)',
                          color: '#FFFFFF',
                          fontWeight: 900,
                          fontSize: '0.95rem',
                          borderRadius: 3,
                          boxShadow: '0 8px 24px rgba(138,124,255,0.35)',
                          '&:hover': {
                            background: 'linear-gradient(135deg, #9B8FFF 0%, #7C6EFF 100%)',
                          },
                        }}
                      >
                        Pay with D17 Mobile ({geo.config.premiumPrice})
                      </Button>
                    )}

                    {hasCrypto && (
                      <Button
                        fullWidth
                        variant={hasD17 ? 'outlined' : 'contained'}
                        size="large"
                        onClick={() => handleOpenD17('PREMIUM', 'Premium Plan', 99, 'USDT_TRC20')}
                        startIcon={
                          <Box
                            sx={{
                              width: 22,
                              height: 22,
                              borderRadius: '50%',
                              bgcolor: '#26A17B',
                              color: '#FFF',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontWeight: 900,
                              fontSize: '0.75rem',
                            }}
                          >
                            ₮
                          </Box>
                        }
                        sx={{
                          py: 1.5,
                          bgcolor: hasD17 ? 'transparent' : 'linear-gradient(135deg, #8A7CFF 0%, #6B5CEF 100%)',
                          color: '#FFFFFF',
                          borderColor: hasD17 ? 'rgba(138,124,255,0.4)' : 'transparent',
                          fontWeight: 800,
                          fontSize: '0.9rem',
                          borderRadius: 3,
                          '&:hover': {
                            borderColor: '#8A7CFF',
                            bgcolor: hasD17 ? 'rgba(138,124,255,0.1)' : '#7C6EFF',
                          },
                        }}
                      >
                        Pay with Crypto (USDT, BTC, ETH)
                      </Button>
                    )}

                    <Divider sx={{ my: 0.5 }}>
                      <Chip label="OR USE REWARD POINTS" size="small" sx={{ fontSize: '0.65rem', fontWeight: 700 }} />
                    </Divider>

                    <Button
                      fullWidth
                      variant="outlined"
                      size="medium"
                      onClick={() => handleRedeemWithPoints('PREMIUM')}
                      disabled={redeemingTier === 'PREMIUM' || (user?.points ?? 0) < PREMIUM_POINTS_COST}
                      startIcon={redeemingTier === 'PREMIUM' ? <CircularProgress size={18} color="inherit" /> : <StarRounded />}
                      sx={{
                        py: 1.25,
                        fontWeight: 700,
                        fontSize: '0.85rem',
                        borderRadius: 3,
                        borderColor: '#8A7CFF',
                        color: '#8A7CFF',
                      }}
                    >
                      {redeemingTier === 'PREMIUM' ? 'Activating...' : `Redeem for ${PREMIUM_POINTS_COST} Points`}
                    </Button>
                    {(user?.points ?? 0) < PREMIUM_POINTS_COST ? (
                      <Typography variant="caption" color="text.secondary" align="center" display="block">
                        Your balance: {user?.points ?? 0} pts (Need {PREMIUM_POINTS_COST - (user?.points ?? 0)} more)
                      </Typography>
                    ) : (
                      <Typography variant="caption" color="success.main" align="center" display="block" sx={{ fontWeight: 700 }}>
                        ✓ You have enough points to unlock this plan free!
                      </Typography>
                    )}
                  </Stack>
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

      {/* Bottom Back Button */}
      <Box sx={{ mt: 5, textAlign: 'center' }}>
        <Button
          onClick={() => {
            if (window.history?.length > 1) {
              navigate(-1);
            } else {
              navigate(isAuthenticated ? '/dashboard' : '/');
            }
          }}
          startIcon={<ArrowBackRounded />}
          variant="text"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '0.85rem', sm: '0.9rem' },
            color: 'text.secondary',
            textTransform: 'none',
            transition: 'all 0.2s ease',
            '&:hover': {
              color: 'primary.main',
              bgcolor: 'transparent',
              transform: 'translateX(-2px)',
            },
          }}
        >
          {isAuthenticated ? 'Back to Dashboard' : 'Back to Home'}
        </Button>
      </Box>

      {/* Manual Payment Modal (D17 & Crypto) */}
      <D17PaymentModal
        open={d17Modal.open}
        onClose={() => setD17Modal((prev) => ({ ...prev, open: false }))}
        type="SUBSCRIPTION"
        amount={d17Modal.amount}
        currency={geo.currency}
        targetDetails={{ tier: d17Modal.tier, planName: d17Modal.planName }}
        selectedMethod={d17Modal.selectedMethod}
        onSuccess={handleD17Success}
      />
    </Container>
  );

  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <Navbar />
        <Box component="main" sx={{ flexGrow: 1 }}>
          {pageContent}
        </Box>
        <Footer />
      </Box>
    );
  }

  return pageContent;
}
