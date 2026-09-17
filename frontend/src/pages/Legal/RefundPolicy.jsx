import { Box, Container, Typography, Stack, Breadcrumbs, Link as MuiLink, Paper, Divider, Alert } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import CurrencyExchangeRoundedIcon from '@mui/icons-material/CurrencyExchangeRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function RefundPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <SEO
        title="Refund & Cancellation Policy — GymPilot"
        description="Review GymPilot's 14-day refund guarantee, subscription cancellation rules, and marketplace returns policy."
        path="/refund-policy"
      />
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 12, md: 14 }, pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          {/* Breadcrumbs */}
          <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
            <MuiLink component={RouterLink} to="/" color="inherit" sx={{ '&:hover': { color: 'primary.main' } }}>
              Home
            </MuiLink>
            <Typography color="primary.main" fontWeight={600}>
              Refund Policy
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box sx={{ mb: 5 }}>
            <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: 2.5,
                  bgcolor: 'rgba(198, 255, 62, 0.12)',
                  border: '1px solid rgba(198, 255, 62, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'primary.main',
                }}
              >
                <CurrencyExchangeRoundedIcon fontSize="medium" />
              </Box>
              <Typography
                variant="caption"
                sx={{
                  color: 'primary.main',
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: 'uppercase',
                }}
              >
                Customer Guarantee
              </Typography>
            </Stack>

            <Typography
              variant="h3"
              component="h1"
              fontWeight={900}
              sx={{
                fontFamily: "'Sora', sans-serif",
                fontSize: { xs: '2rem', md: '2.5rem' },
                letterSpacing: '-0.5px',
                mb: 1.5,
              }}
            >
              Refund &amp; Cancellation Policy
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Last updated: September 17, 2026 • 100% transparent refund process powered by our Merchant of Record, Paddle.
            </Typography>
          </Box>

          {/* Guarantee Highlight Banner */}
          <Alert
            icon={<CheckCircleOutlineRoundedIcon sx={{ color: 'primary.main' }} />}
            sx={{
              mb: 4,
              borderRadius: 3,
              bgcolor: 'rgba(198, 255, 62, 0.08)',
              border: '1px solid rgba(198, 255, 62, 0.3)',
              color: 'text.primary',
              '& .MuiAlert-message': { fontWeight: 500, fontSize: '0.95rem' },
            }}
          >
            <strong>14-Day Money-Back Guarantee:</strong> Try GymPilot risk-free. If you are not satisfied with your GymPilot digital subscription within the first 14 days of initial signup, you are entitled to a full, unconditional refund.
          </Alert>

          {/* Legal Content Card */}
          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              bgcolor: 'background.paper',
              border: '1px solid',
              borderColor: 'divider',
              lineHeight: 1.8,
              '& h2': {
                fontFamily: "'Sora', sans-serif",
                fontWeight: 800,
                fontSize: { xs: '1.25rem', md: '1.4rem' },
                mt: 4,
                mb: 1.5,
                color: 'text.primary',
              },
              '& p': {
                color: 'text.secondary',
                fontSize: '0.95rem',
                mb: 2,
              },
              '& ul': {
                color: 'text.secondary',
                fontSize: '0.95rem',
                mb: 2,
                pl: 3,
              },
              '& li': {
                mb: 0.75,
              },
            }}
          >
            <h2>1. Overview</h2>
            <p>
              At GymPilot (https://gympilot.tn), customer satisfaction is our highest priority. 
              Our international orders and digital transactions are processed by our Merchant of Record, <strong>Paddle</strong> 
              (Paddle.com Market Ltd). We adhere strictly to consumer protection laws, including the European Union 
              Consumer Rights Directive.
            </p>

            <h2>2. Digital Subscriptions (Basic &amp; Premium Plans)</h2>
            <ul>
              <li>
                <strong>14-Day Initial Guarantee:</strong> If you purchase a recurring digital subscription (Basic or Premium plan) and decide within 14 calendar days of your initial purchase that GymPilot does not fit your training needs, contact our support team at <strong>support@gympilot.tn</strong> to receive a 100% refund of your first subscription fee.
              </li>
              <li>
                <strong>Easy Cancellation Anytime:</strong> You can cancel recurring renewals at any time from your account settings or by submitting a ticket. There are no cancellation penalties or hidden fees. Upon cancellation, you retain full access to all plan features until the end of your prepaid billing period, after which no further charges will occur.
              </li>
              <li>
                <strong>Subscription Renewals:</strong> Subsequent monthly renewals are non-refundable once billed, unless requested within 48 hours of accidental renewal without service utilization.
              </li>
            </ul>

            <h2>3. AI Credit Packages</h2>
            <p>
              GymPilot offers prepaid AI scan credit bundles (3-pack, 5-pack, 10-pack). 
              If you have purchased an AI credit pack and have not utilized the credits, you are eligible for a full refund within 14 days of purchase. Once credits have been redeemed for completed AI scans or progress analysis reports, the consumed portion cannot be refunded.
            </p>

            <h2>4. Physical Products (GymPilot Marketplace)</h2>
            <p>For certified dietary supplements, gym apparel, and training equipment purchased on the GymPilot Shop:</p>
            <ul>
              <li>
                <strong>14-Day Return Window:</strong> You may return eligible products within 14 days of physical delivery.
              </li>
              <li>
                <strong>Product Condition:</strong> Supplements, vitamins, and hygiene-sensitive goods must be sealed, unopened, in original packaging with safety seals intact.
              </li>
              <li>
                <strong>Damaged or Defective Items:</strong> If an item arrives damaged, defective, or incorrect, notify us within 48 hours with photographic evidence, and we will dispatch a free replacement or issue a complete refund including shipping costs.
              </li>
            </ul>

            <h2>5. How to Request a Refund</h2>
            <p>Initiating a refund is straightforward:</p>
            <ul>
              <li>Send an email to <strong>support@gympilot.tn</strong> from the email associated with your GymPilot account.</li>
              <li>Include your Order ID or Paddle Transaction reference (found in your email receipt).</li>
              <li>Briefly mention the reason for your refund request (optional, but helps us improve the app).</li>
            </ul>
            <p>
              Our support team will review and approve eligible requests within <strong>24 to 48 business hours</strong>.
            </p>

            <h2>6. Refund Processing Timeframe</h2>
            <p>
              Once approved, refunds are transmitted immediately to Paddle and returned directly to your original payment method 
              (Credit/Debit Card, PayPal, Apple Pay, or iDEAL). The refund typically appears on your bank or credit card statement 
              within <strong>5 to 10 business days</strong>, depending on your financial institution’s processing times.
            </p>

            <h2>7. Contact Us</h2>
            <p>
              Have questions regarding our policies or a specific transaction? We are always here to assist:
              <br />
              <strong>Email:</strong> support@gympilot.tn
              <br />
              <strong>Merchant of Record:</strong> Paddle.com Market Ltd
              <br />
              <strong>Platform URL:</strong> https://gympilot.tn
            </p>
          </Paper>

          {/* Bottom Back Button */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <MuiLink
              component={RouterLink}
              to="/"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1,
                color: 'text.secondary',
                fontWeight: 600,
                textDecoration: 'none',
                '&:hover': { color: 'primary.main' },
              }}
            >
              <ArrowBackRoundedIcon fontSize="small" /> Back to GymPilot Home
            </MuiLink>
          </Box>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
