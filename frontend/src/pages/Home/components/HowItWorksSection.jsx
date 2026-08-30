import { Box, Container, Grid, Paper, Stack, Typography } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import EditRoundedIcon from '@mui/icons-material/EditRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import SectionHeading from '../../../components/SectionHeading';

const STEPS = [
  {
    number: '01',
    title: 'Create Your Account',
    description: 'Sign up for free in seconds. No credit card required.',
    icon: <FitnessCenterRoundedIcon />,
  },
  {
    number: '02',
    title: 'Log Your Workouts',
    description: 'Record your exercises, sets, reps and weights with an intuitive interface built for the gym floor.',
    icon: <EditRoundedIcon />,
  },
  {
    number: '03',
    title: 'Track Your Progress',
    description: 'Watch your strength grow. Visualize trends, hit personal records, and stay consistent.',
    icon: <TrendingUpRoundedIcon />,
  },
];

export default function HowItWorksSection() {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 } }}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="How It Works"
          title="Three Steps to Your Strongest Self"
          subtitle="Simple. Focused. Effective. Everything you need — nothing you don't."
        />

        <Grid container spacing={3}>
          {STEPS.map((step) => (
            <Grid item xs={12} md={4} key={step.number}>
              <Paper
                elevation={0}
                sx={{
                  p: { xs: 3, md: 4 },
                  height: '100%',
                  borderRadius: 4,
                  border: '1px solid',
                  borderColor: 'divider',
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
                  transition: 'transform .3s ease, border-color .3s ease, box-shadow .3s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: 'rgba(198,255,62,0.4)',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
                  },
                }}
              >
                <Stack direction="row" alignItems="center" gap={1.5} sx={{ mb: 2.5 }}>
                  <Box
                    sx={{
                      flexShrink: 0,
                      width: 44,
                      height: 44,
                      borderRadius: 2.5,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'rgba(198,255,62,0.12)',
                      color: 'primary.main',
                      fontWeight: 800,
                      fontSize: 16,
                      fontFamily: "'Sora','Inter',sans-serif",
                    }}
                  >
                    {step.number}
                  </Box>
                  <Box
                    component="span"
                    aria-hidden
                    sx={{
                      flex: 1,
                      height: 2,
                      borderRadius: 1,
                      background: 'linear-gradient(90deg, rgba(198,255,62,0.4), transparent)',
                    }}
                  />
                </Stack>

                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    bgcolor: 'rgba(198,255,62,0.10)',
                    color: 'primary.main',
                    mb: 2.5,
                  }}
                >
                  {step.icon}
                </Box>

                <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
                  {step.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" lineHeight={1.7}>
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