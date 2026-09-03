import { useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Divider,
  Grid,
  Link,
  Stack,
  Typography,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import InstagramIcon from '@mui/icons-material/Instagram';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import YouTubeIcon from '@mui/icons-material/YouTube';
import EmailRoundedIcon from '@mui/icons-material/EmailRounded';
import PhoneRoundedIcon from '@mui/icons-material/PhoneRounded';
import LocationOnRoundedIcon from '@mui/icons-material/LocationOnRounded';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import PaymentsRoundedIcon from '@mui/icons-material/PaymentsRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

import Logo from './Logo';
import { useLanguage } from '../i18n';
import { navigateThenScroll } from '../utils/navigation';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [policyDialog, setPolicyDialog] = useState(null); // 'delivery' | 'terms' | 'about' | null

  const socialLinks = [
    { name: 'Instagram', icon: <InstagramIcon fontSize="small" />, url: 'https://instagram.com/gympilot.tn' },
    { name: 'Facebook', icon: <FacebookIcon fontSize="small" />, url: 'https://facebook.com/gympilot.tn' },
    { name: 'Twitter / X', icon: <TwitterIcon fontSize="small" />, url: 'https://twitter.com/gympilot_tn' },
    { name: 'YouTube', icon: <YouTubeIcon fontSize="small" />, url: 'https://youtube.com/@gympilot' },
  ];

  return (
    <Box
      component="footer"
      sx={{
        borderTop: '1px solid',
        borderColor: 'divider',
        mt: { xs: 8, md: 14 },
        pt: { xs: 6, md: 9 },
        pb: { xs: 4, md: 6 },
        bgcolor: '#080A0D',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: '10%',
          right: '10%',
          height: '1px',
          background: 'linear-gradient(90deg, transparent, rgba(198,255,62,0.3), transparent)',
        },
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 4, md: 5 }}>
          {/* Column 1: Brand & Social */}
          <Grid item xs={12} sm={6} md={4}>
            <Box sx={{ mb: 2 }}>
              <Logo />
            </Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ lineHeight: 1.8, mb: 2.5, maxWidth: 340, fontSize: '0.875rem' }}
            >
              GymPilot is Tunisia's premier fitness &amp; bodybuilding marketplace. Certified supplements, professional gym equipment, and intelligent AI-powered workout tracking.
            </Typography>

            {/* Social Media Links */}
            <Stack direction="row" spacing={1} alignItems="center">
              {socialLinks.map((s) => (
                <Tooltip key={s.name} title={`Follow GymPilot on ${s.name}`} arrow>
                  <IconButton
                    component="a"
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.04)',
                      border: '1px solid',
                      borderColor: 'divider',
                      color: 'text.secondary',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(198,255,62,0.12)',
                        borderColor: 'primary.main',
                        color: 'primary.main',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    {s.icon}
                  </IconButton>
                </Tooltip>
              ))}
            </Stack>
          </Grid>

          {/* Column 2: Useful Links & Customer Care */}
          <Grid item xs={6} sm={6} md={2.5}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#F4F6F8',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                mb: 2,
              }}
            >
              Customer Care
            </Typography>
            <Stack spacing={1.5}>
              <Link
                component="button"
                type="button"
                onClick={() => setPolicyDialog('delivery')}
                color="text.secondary"
                sx={{ textAlign: 'left', width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Delivery Policy
              </Link>

              <Link
                component="button"
                type="button"
                onClick={() => setPolicyDialog('terms')}
                color="text.secondary"
                sx={{ textAlign: 'left', width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Terms &amp; Conditions
              </Link>

              <Link
                component="button"
                type="button"
                onClick={() => setPolicyDialog('about')}
                color="text.secondary"
                sx={{ textAlign: 'left', width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                About GymPilot
              </Link>

              <Link
                component={RouterLink}
                to="/support"
                color="text.secondary"
                sx={{ width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Contact &amp; Support
              </Link>

              <Link
                component={RouterLink}
                to="/seller"
                color="text.secondary"
                sx={{ width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Sell on GymPilot
              </Link>
            </Stack>
          </Grid>

          {/* Column 3: Store & Navigation */}
          <Grid item xs={6} sm={6} md={2.5}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#F4F6F8',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                mb: 2,
              }}
            >
              Shop &amp; App
            </Typography>
            <Stack spacing={1.5}>
              <Link
                component={RouterLink}
                to="/shop"
                color="text.secondary"
                sx={{ width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Marketplace Shop
              </Link>

              <Link
                component={RouterLink}
                to="/shop/orders"
                color="text.secondary"
                sx={{ width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Track Orders
              </Link>

              <Link
                component="button"
                type="button"
                onClick={() => navigateThenScroll(navigate, location.pathname, 'features')}
                color="text.secondary"
                sx={{ textAlign: 'left', width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Features &amp; Tech
              </Link>

              <Link
                component={RouterLink}
                to="/login"
                color="text.secondary"
                sx={{ width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Athlete Login
              </Link>

              <Link
                component={RouterLink}
                to="/register"
                color="text.secondary"
                sx={{ width: 'fit-content', fontSize: '0.875rem', '&:hover': { color: 'primary.main' } }}
              >
                Create Account
              </Link>
            </Stack>
          </Grid>

          {/* Column 4: Contact & Delivery Coordinates */}
          <Grid item xs={12} sm={6} md={3}>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                color: '#F4F6F8',
                letterSpacing: 0.8,
                textTransform: 'uppercase',
                fontSize: '0.8rem',
                mb: 2,
              }}
            >
              Contact &amp; Delivery
            </Typography>

            <Stack spacing={1.75}>
              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <EmailRoundedIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                    Email Support
                  </Typography>
                  <Link
                    href="mailto:support@gympilot.tn"
                    color="text.primary"
                    sx={{ fontSize: '0.85rem', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
                  >
                    support@gympilot.tn
                  </Link>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <PhoneRoundedIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                    Helpline &amp; WhatsApp
                  </Typography>
                  <Link
                    href="tel:+21621214512"
                    color="text.primary"
                    sx={{ fontSize: '0.85rem', fontWeight: 600, '&:hover': { color: 'primary.main' } }}
                  >
                    +216 21 214 512
                  </Link>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.25} alignItems="flex-start">
                <LocationOnRoundedIcon sx={{ fontSize: 18, color: 'primary.main', mt: 0.2 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.72rem' }}>
                    Headquarters
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.85rem', fontWeight: 600, color: 'text.secondary' }}>
                    Monastir, Tunisie
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: { xs: 4, md: 5 }, borderColor: 'rgba(255,255,255,0.06)' }} />

        {/* Bottom Bar */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="space-between"
          alignItems="center"
          sx={{ textAlign: { xs: 'center', sm: 'left' } }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            &copy; {new Date().getFullYear()} <strong>GymPilot</strong> (GymTrack SARL). All rights reserved.
          </Typography>

          <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" justifyContent="center">
            <Stack direction="row" spacing={0.5} alignItems="center">
              <SecurityRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                SSL 256-Bit Encrypted
              </Typography>
            </Stack>
            <Stack direction="row" spacing={0.5} alignItems="center">
              <PaymentsRoundedIcon sx={{ fontSize: 14, color: 'primary.main' }} />
              <Typography variant="caption" color="text.secondary">
                Cash on Delivery
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Container>

      {/* Policy & Info Modals */}
      <Dialog
        open={!!policyDialog}
        onClose={() => setPolicyDialog(null)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3.5,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            p: 1.5,
          },
        }}
      >
        {policyDialog === 'delivery' && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>🚚 Delivery (Livraison) Policy</span>
              <IconButton size="small" onClick={() => setPolicyDialog(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: 'primary.main', mb: 1 }}>
                Standard Delivery Rates &amp; Free Delivery Threshold
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                • <strong>Standard Delivery Fee:</strong> A fixed fee of <strong>7 TND</strong> is applied automatically to all orders under 150 TND across all 24 Tunisian governorates.
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                • <strong>Free Delivery Threshold:</strong> Whenever your cart subtotal reaches or exceeds <strong>150 TND</strong>, delivery becomes <strong>100% FREE (0 TND)</strong>.
              </Typography>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, mt: 2, mb: 1 }}>
                Fulfillment &amp; Timeframe
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                • <strong>Speed:</strong> Orders are processed within 24 hours and delivered within <strong>2 to 4 business days</strong> by our express delivery network.
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                • <strong>Payment on Delivery (COD):</strong> You only pay in cash upon receiving and verifying your parcel directly with the courier agent.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button variant="contained" onClick={() => setPolicyDialog(null)} sx={{ fontWeight: 700, borderRadius: 2 }}>
                Understood
              </Button>
            </DialogActions>
          </>
        )}

        {policyDialog === 'terms' && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📜 Terms &amp; Conditions</span>
              <IconButton size="small" onClick={() => setPolicyDialog(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph color="text.secondary">
                By purchasing from the GymPilot Marketplace, you agree to our standard consumer terms. All nutritional products, whey isolates, creatine, and training accessories are 100% genuine and verified.
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Returns are accepted within 7 calendar days of delivery if products remain sealed in their original manufacturer packaging.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button variant="contained" onClick={() => setPolicyDialog(null)} sx={{ fontWeight: 700, borderRadius: 2 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}

        {policyDialog === 'about' && (
          <>
            <DialogTitle sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif", display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>⚡ About GymPilot</span>
              <IconButton size="small" onClick={() => setPolicyDialog(null)}>
                <CloseRoundedIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="body2" paragraph color="text.secondary">
                GymPilot is a comprehensive fitness operating system born in Tunisia. We connect serious athletes with premium laboratory-tested supplements, professional workout programming, and intelligent nutritional guidance.
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Our mission is to elevate athletic performance through verified gear, rapid local distribution, and AI-driven coaching.
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button variant="contained" onClick={() => setPolicyDialog(null)} sx={{ fontWeight: 700, borderRadius: 2 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
