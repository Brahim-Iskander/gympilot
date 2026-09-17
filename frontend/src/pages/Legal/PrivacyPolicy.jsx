import { Box, Container, Typography, Stack, Breadcrumbs, Link as MuiLink, Paper, Divider } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SecurityRoundedIcon from '@mui/icons-material/SecurityRounded';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import SEO from '../../components/SEO';

export default function PrivacyPolicy() {
  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <SEO
        title="Privacy Policy — GymPilot"
        description="Learn how GymPilot protects your privacy, secures personal and fitness data, and complies with GDPR standards."
        path="/privacy"
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
              Privacy Policy
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
                <SecurityRoundedIcon fontSize="medium" />
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
                Data Protection &amp; GDPR
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
              Privacy Policy
            </Typography>

            <Typography variant="body2" color="text.secondary">
              Last updated: September 17, 2026 • We respect your privacy and never sell your personal or fitness data.
            </Typography>
          </Box>

          {/* Content Card */}
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
            <h2>1. Introduction</h2>
            <p>
              At GymPilot (operated at <strong>https://gympilot.tn</strong>), we are committed to safeguarding the privacy 
              of our community members, subscribers, and platform visitors. This Privacy Policy outlines how we collect, process, 
              store, and protect your personal and biometric fitness information in accordance with international data protection 
              regulations, including the European Union General Data Protection Regulation (GDPR).
            </p>

            <h2>2. Information We Collect</h2>
            <p>We collect information to provide, personalize, and improve your training and nutrition experience:</p>
            <ul>
              <li>
                <strong>Account Information:</strong> Name, email address, country of residence, and securely salted &amp; hashed password.
              </li>
              <li>
                <strong>Fitness &amp; Physical Profiles:</strong> Age, biological sex, height, body weight, target fitness goals, workout history, and personal records (1RM).
              </li>
              <li>
                <strong>AI Progress Scans:</strong> Images and progress photos voluntarily submitted for our AI body scan and posture analysis engine. These are encrypted and processed strictly to generate your personal muscular symmetry and body composition metrics.
              </li>
              <li>
                <strong>Technical &amp; Usage Data:</strong> IP address, browser type, device information, operating system, and session interactions to safeguard account security and optimize application performance.
              </li>
            </ul>

            <h2>3. How We Use Your Data</h2>
            <p>We process your data solely for the following legitimate purposes:</p>
            <ul>
              <li>Delivering workout programs, nutritional calorie/macro targets, and progression analytics.</li>
              <li>Managing your account, active subscriptions, and AI credit balances.</li>
              <li>Executing transactions and delivering digital subscription features.</li>
              <li>Communicating critical service updates, password resets, and customer support responses.</li>
              <li>Detecting and preventing fraudulent activity or security vulnerabilities.</li>
            </ul>

            <h2>4. Third-Party Service Providers &amp; Merchant of Record</h2>
            <p>
              We partner with trusted third-party services that adhere to stringent security and privacy regulations:
            </p>
            <ul>
              <li>
                <strong>Payment Processing (Paddle):</strong> Our order process and international customer payments are conducted by our Merchant of Record, <strong>Paddle</strong> (Paddle.com Market Ltd). When purchasing via card, PayPal, or digital wallet, your payment credentials are submitted directly to Paddle's PCI-DSS Level 1 compliant infrastructure. <strong>GymPilot does not store or have access to full credit card numbers or sensitive CVV codes.</strong>
              </li>
              <li>
                <strong>Cloud &amp; Media Storage (Cloudinary):</strong> Encrypted progress images are hosted using enterprise-grade media storage with strict access tokens.
              </li>
              <li>
                <strong>AI Processing:</strong> Body scan and workout algorithm queries are processed securely without using your private identification for public training sets.
              </li>
              <li>
                <strong>Email Delivery:</strong> Transactional emails and authentication notices are dispatched via Resend / secure SMTP protocols.
              </li>
            </ul>

            <h2>5. GDPR Rights for European &amp; International Users</h2>
            <p>Under the GDPR and global privacy frameworks, you have extensive rights over your personal data:</p>
            <ul>
              <li><strong>Right of Access:</strong> You can request a full copy of the personal data we hold about you.</li>
              <li><strong>Right to Rectification:</strong> You can modify or correct your profile data directly from your Account Settings at any time.</li>
              <li><strong>Right to Erasure ("Right to Be Forgotten"):</strong> You may request permanent deletion of your account, workout history, and uploaded photographs.</li>
              <li><strong>Right to Data Portability:</strong> You can request your fitness and workout records in a structured, standard digital format.</li>
              <li><strong>Right to Object or Restrict Processing:</strong> You may restrict the processing of specific optional features at your discretion.</li>
            </ul>
            <p>
              To exercise any of these rights, simply email our data protection officer at <strong>support@gympilot.tn</strong>. 
              All legitimate requests will be acknowledged and fulfilled within 30 days without charge.
            </p>

            <h2>6. Data Retention and Security</h2>
            <p>
              We implement industry-standard cryptographic practices (SSL/TLS encryption in transit, bcrypt/Argon2 password hashing, 
              and restricted database access controls). We retain your data as long as your account remains active or as required by law 
              (e.g., maintaining financial invoice records for statutory tax purposes).
            </p>

            <h2>7. Cookies and Tracking Technologies</h2>
            <p>
              GymPilot uses essential session cookies and local browser storage strictly required for authentication, language preferences, 
              and cart preservation. We do not use third-party behavioral advertising trackers or sell browsing data to data brokers.
            </p>

            <h2>8. Contact Our Privacy Team</h2>
            <p>
              For questions, concerns, or requests regarding this Privacy Policy or your personal data, please contact:
              <br />
              <strong>Data Controller:</strong> GymPilot
              <br />
              <strong>Email:</strong> support@gympilot.tn
              <br />
              <strong>Web:</strong> https://gympilot.tn
            </p>
          </Paper>

          {/* Bottom Link */}
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
