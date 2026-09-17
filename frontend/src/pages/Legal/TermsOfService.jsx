import { Box, Container, Typography, Stack, Breadcrumbs, Link as MuiLink, Paper, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import GavelRoundedIcon from '@mui/icons-material/GavelRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import VerifiedUserRoundedIcon from '@mui/icons-material/VerifiedUserRounded';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function TermsOfService() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <SEO
        title="Terms of Service — GymPilot"
        description="Review GymPilot's Terms of Service, user agreement, subscription policies, and legal guidelines."
        path="/terms"
      />
      <Navbar />

      <Box component="main" sx={{ flexGrow: 1, pt: { xs: 12, md: 14 }, pb: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          {/* Breadcrumb Navigation */}
          <Breadcrumbs sx={{ mb: 3, fontSize: '0.85rem' }}>
            <MuiLink component={RouterLink} to="/" color="inherit" sx={{ '&:hover': { color: 'primary.main' } }}>
              Home
            </MuiLink>
            <Typography color="primary.main" fontWeight={600}>
              Terms of Service
            </Typography>
          </Breadcrumbs>

          {/* Header Banner */}
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
                <GavelRoundedIcon fontSize="medium" />
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
                Legal Agreement
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
              Terms of Service
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Last updated: September 17, 2026 • Effective immediately upon account registration or purchase.
            </Typography>
          </Box>

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
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing, browsing, or creating an account on GymPilot (available at <strong>https://gympilot.tn</strong>), 
              or by purchasing any digital subscriptions, AI scanning credits, or physical marketplace items, you agree to be bound 
              by these Terms of Service, our Privacy Policy, and our Refund Policy. If you do not agree to these terms, you must not access or use our services.
            </p>

            <h2>2. Description of Service</h2>
            <p>
              GymPilot is an intelligent fitness tracking and bodybuilding optimization SaaS platform providing workout logging, 
              AI-driven body scans, physical progress analytics, nutrition tracking, certified coach consultation tools, and a curated 
              marketplace for certified fitness supplements and equipment.
            </p>

            <h2>3. Account Registration and Security</h2>
            <p>
              To access core features, you must register an account. You agree to provide accurate, complete, and current information. 
              You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account. 
              You must immediately notify GymPilot at <strong>support@gympilot.tn</strong> of any unauthorized access or breach of security.
            </p>

            <h2>4. Subscriptions, Payments &amp; Merchant of Record</h2>
            <p>
              GymPilot offers monthly and annual digital subscriptions (including the <strong>Basic Plan</strong> and <strong>Premium Plan</strong>) 
              as well as pay-as-you-go AI credit packages.
            </p>
            <ul>
              <li>
                <strong>Merchant of Record:</strong> Our order process and international online payments (including Credit/Debit cards, PayPal, Apple Pay, Google Pay, and European localized payment methods) are securely facilitated and processed by our Merchant of Record, <strong>Paddle</strong> (Paddle.com Market Ltd or its affiliates).
              </li>
              <li>
                <strong>Billing Cycle:</strong> Subscriptions renew automatically at the end of each billing cycle (monthly or annually) unless cancelled before the renewal date.
              </li>
              <li>
                <strong>Price Changes:</strong> GymPilot reserves the right to modify subscription pricing. Any price change will be communicated to active subscribers at least 14 days in advance and will only apply to subsequent billing periods.
              </li>
              <li>
                <strong>Taxes:</strong> All relevant sales taxes, VAT, or digital services taxes are calculated and collected transparently at checkout by Paddle in compliance with regional tax regulations.
              </li>
              <li>
                <strong>Local Payment Options:</strong> For users residing in Tunisia, GymPilot also offers manual mobile transfers via D17.
              </li>
            </ul>

            <h2>5. AI Scans &amp; Health Disclaimer</h2>
            <p>
              GymPilot incorporates artificial intelligence tools for body composition scanning and routine suggestions. 
              These features are designed strictly for informational, educational, and fitness progression tracking purposes. 
              <strong>GymPilot is not a medical provider</strong>, and our recommendations do not constitute professional medical advice, 
              diagnosis, or treatment. Always consult a qualified healthcare provider before undertaking intense exercise or dietary changes.
            </p>

            <h2>6. User Conduct &amp; Prohibited Uses</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the service for any unlawful purpose or in violation of local, national, or international regulations.</li>
              <li>Upload malicious code, viruses, or interfere with the integrity of the platform’s infrastructure.</li>
              <li>Attempt unauthorized reverse-engineering, crawling, scraping, or automated harvesting of platform data.</li>
              <li>Share, resell, or distribute your account credentials or proprietary AI workout routines commercially without written consent.</li>
            </ul>

            <h2>7. Intellectual Property Rights</h2>
            <p>
              All trademarks, logos, service marks, user interface designs, software algorithms, and content displayed on GymPilot 
              are the proprietary property of GymPilot or its licensors. Users retain ownership of their personal workout data and progress photographs.
            </p>

            <h2>8. Termination of Service</h2>
            <p>
              We reserve the right to suspend or terminate your account and access to the service at our sole discretion, 
              without prior notice, if you breach these Terms of Service or engage in fraudulent activities. You may terminate 
              your account at any time via your account settings or by contacting <strong>support@gympilot.tn</strong>.
            </p>

            <h2>9. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by applicable law, GymPilot, its directors, employees, partners, and affiliates shall not 
              be liable for any indirect, incidental, consequential, special, or punitive damages arising from your access to or inability 
              to use our services.
            </p>

            <h2>10. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws governing international digital service transactions, 
              without regard to conflict of law principles. For European consumers, mandatory local statutory consumer protections remain unaffected.
            </p>

            <h2>11. Contact Information</h2>
            <p>
              If you have any questions or inquiries regarding these Terms of Service, please reach out to our team at:
              <br />
              <strong>Email:</strong> support@gympilot.tn
              <br />
              <strong>Website:</strong> https://gympilot.tn
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
