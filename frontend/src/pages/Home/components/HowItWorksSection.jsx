import { Box, Container, Grid, Paper, Stack, Typography, Chip } from '@mui/material';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';

import SectionHeading from '../../../components/SectionHeading';

const STEPS = [
  {
    number: '01',
    title: 'Sign Up & Get 14-Day Free Trial',
    description: 'Create your account in 30 seconds. Every new athlete gets instant access to the Basic Plan trial with zero credit card required.',
    icon: <CardGiftcardRoundedIcon sx={{ fontSize: 28 }} />,
    accent: '#C6FF3E',
    badge: 'NO CARD NEEDED',
  },
  {
    number: '02',
    title: 'Log Sets & Master Your Lifts',
    description: 'Record exercises, sets, reps, and weights with an interface designed for the gym floor. Track progressive overload and celebrate new PRs.',
    icon: <FitnessCenterRoundedIcon sx={{ fontSize: 28 }} />,
    accent: '#8A7CFF',
    badge: 'FAST LOGGING',
  },
  {
    number: '03',
    title: 'Earn Points & Unlock Free VIP Perks',
    description: 'Earn reward points with every purchase in our fitness store and for referring friends. Redeem your points for free Basic or Premium plans.',
    icon: <MonetizationOnRoundedIcon sx={{ fontSize: 28 }} />,
    accent: '#FFD700',
    badge: 'FREE SUBSCRIPTIONS',
  },
];

export default function HowItWorksSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="SIMPLE ONBOARDING"
          title="Three Steps to Your Strongest Self"
          subtitle="Everything you need to transform your training — structured, focused, and rewarded."
        />

        <Grid container spacing={3}>
          {STEPS.map((step) => (
            <Grid item xs={12} md={4} key={step.number}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3.5, md: 4 },
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  backdropFilter: 'blur(16px)',
                  transition: 'all .35s ease',
                  position: 'relative',
                  overflow: 'hidden',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: `${step.accent}55`,
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? `0 20px 50px rgba(0,0,0,0.4), 0 0 24px ${step.accent}18`
                        : `0 16px 36px rgba(0,0,0,0.06)`,
                  },
                }}
              >
                {/* Step header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: `${step.accent}14`,
                      color: step.accent,
                      fontWeight: 900,
                      fontSize: 16,
                      fontFamily: "'Sora','Inter',sans-serif",
                      border: `1px solid ${step.accent}33`,
                    }}
                  >
                    {step.number}
                  </Box>
                  <Chip
                    label={step.badge}
                    size="small"
                    sx={{
                      bgcolor: `${step.accent}12`,
                      color: step.accent,
                      fontWeight: 800,
                      fontSize: '0.66rem',
                      letterSpacing: 0.5,
                      border: `1px solid ${step.accent}26`,
                      height: 22,
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    width: 58,
                    height: 58,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: `${step.accent}10`,
                    color: step.accent,
                    mb: 2.5,
                    border: `1px solid ${step.accent}22`,
                  }}
                >
                  {step.icon}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1.2, color: 'text.primary' }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.75}>
                  {step.description}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}