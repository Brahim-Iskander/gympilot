import { Box, Container, Grid, Card, Typography, Stack, Chip, Avatar } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import ShoppingBagRoundedIcon from '@mui/icons-material/ShoppingBagRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import { Link as RouterLink } from 'react-router-dom';

import SectionHeading from '../../../components/SectionHeading';

const FEATURES = [
  {
    id: 'tracking',
    icon: <FitnessCenterRoundedIcon sx={{ fontSize: 26 }} />,
    category: 'WORKOUT LOGGER',
    accent: '#C6FF3E',
    title: 'Smart Gym Floor Logger',
    description: 'Log sets, reps, weight, RPE, and rest times in seconds with an interface optimized for real gym sessions.',
    pills: ['Rest Timer', 'RPE 1-10', 'Exercise History'],
    link: '/workouts',
  },
  {
    id: 'analytics',
    icon: <TrendingUpRoundedIcon sx={{ fontSize: 26 }} />,
    category: 'STRENGTH ANALYTICS',
    accent: '#8A7CFF',
    title: 'Progressive Overload & 1RM',
    description: 'Visualize strength curves, automated 1-Rep Max calculations, volume progression, and personal record trophies.',
    pills: ['1RM Projections', 'Volume Heatmaps', 'PR Alerts'],
    link: '/progress',
  },
  {
    id: 'shop',
    icon: <ShoppingBagRoundedIcon sx={{ fontSize: 26 }} />,
    category: 'FITNESS MARKETPLACE',
    accent: '#00E676',
    title: 'Supplements & Gym Gear',
    description: 'Order authentic protein, creatine, lifting straps, and gym gear with fast delivery across Tunisia and Cash on Delivery.',
    pills: ['Verified Quality', 'Fast Shipping', 'COD Available'],
    link: '/shop',
  },
  {
    id: 'rewards',
    icon: <MonetizationOnRoundedIcon sx={{ fontSize: 26 }} />,
    category: 'REWARD POINTS',
    accent: '#FFD700',
    title: 'Earn & Redeem Free Plans',
    description: 'Earn points with every purchase and referral. Redeem 250 or 500 points for free Basic or Premium memberships!',
    pills: ['1 pt / 2 TND', '250 pts = Basic', '500 pts = Premium'],
    link: '/membership',
  },
  {
    id: 'videos',
    icon: <OndemandVideoRoundedIcon sx={{ fontSize: 26 }} />,
    category: 'EXERCISE GUIDES',
    accent: '#FF6B6B',
    title: 'Exercise Form Tutorials',
    description: 'Master compound movements like Squat, Bench Press, and Deadlift with clear form cues and injury prevention tips.',
    pills: ['HD Form Cues', 'Setup Cues', 'Breathing Guides'],
    link: '/#workout-videos',
  },
  {
    id: 'body',
    icon: <MonitorWeightRoundedIcon sx={{ fontSize: 26 }} />,
    category: 'BODY & NUTRITION',
    accent: '#38BDF8',
    title: 'Body Metrics & Calories',
    description: 'Track body weight trends, circumferences, and daily macro targets to ensure your nutrition matches your heavy training.',
    pills: ['Weight Trends', 'Measurements', 'Macro Goals'],
    link: '/nutrition',
  },
];

export default function FeaturesSection() {
  return (
    <Box component="section" id="features" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: '90px', position: 'relative' }}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="ECOSYSTEM FEATURES"
          title="Everything You Need to Dominate Your Training"
          subtitle="A complete fitness suite: track progressive overload, shop authentic gear, and earn free memberships as you train."
        />

        <Grid container spacing={3}>
          {FEATURES.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.id}>
              <Card
                component={RouterLink}
                to={feature.link}
                elevation={0}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  p: 3.5,
                  height: '100%',
                  borderRadius: 4,
                  bgcolor: 'background.paper',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: `${feature.accent}66`,
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? `0 20px 50px rgba(0, 0, 0, 0.4), 0 0 24px ${feature.accent}22`
                        : `0 16px 36px rgba(0, 0, 0, 0.08)`,
                    '& .feature-icon': {
                      transform: 'scale(1.1) rotate(5deg)',
                    },
                    '& .feature-arrow': {
                      transform: 'translateX(4px)',
                      color: feature.accent,
                    },
                  },
                }}
              >
                {/* Accent glow on top edge */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 24,
                    right: 24,
                    height: '2px',
                    background: `linear-gradient(90deg, transparent, ${feature.accent}, transparent)`,
                    opacity: 0.8,
                  }}
                />

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2.5 }}>
                  <Avatar
                    className="feature-icon"
                    variant="rounded"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: 3,
                      bgcolor: `${feature.accent}16`,
                      color: feature.accent,
                      border: `1px solid ${feature.accent}33`,
                      transition: 'transform 0.3s ease',
                    }}
                  >
                    {feature.icon}
                  </Avatar>
                  <Chip
                    label={feature.category}
                    size="small"
                    sx={{
                      bgcolor: `${feature.accent}12`,
                      color: feature.accent,
                      fontWeight: 800,
                      fontSize: '0.66rem',
                      letterSpacing: 0.5,
                      border: `1px solid ${feature.accent}26`,
                      height: 22,
                    }}
                  />
                </Stack>

                <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', mb: 1.2 }}>
                  {feature.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3, flexGrow: 1 }}>
                  {feature.description}
                </Typography>

                {/* Sub-feature pills */}
                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                  {feature.pills.map((pill, idx) => (
                    <Chip
                      key={idx}
                      label={pill}
                      size="small"
                      sx={{
                        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(15, 23, 42, 0.04)'),
                        color: 'text.secondary',
                        fontSize: '0.68rem',
                        fontWeight: 600,
                        height: 20,
                      }}
                    />
                  ))}
                </Stack>

                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color: 'text.secondary', mt: 'auto' }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    Explore feature
                  </Typography>
                  <ArrowForwardRoundedIcon className="feature-arrow" sx={{ fontSize: 15, transition: 'transform 0.25s ease' }} />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
