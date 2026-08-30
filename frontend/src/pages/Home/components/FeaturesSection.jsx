import { Box, Container, Grid } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';

import SectionHeading from '../../../components/SectionHeading';
import FeatureCard from '../../../components/FeatureCard';

const FEATURES = [
  {
    id: 'tracking',
    icon: <FitnessCenterRoundedIcon />,
    title: 'Workout Tracking',
    description: 'Track your exercises, sets, reps and weights.',
  },
  {
    id: 'strength',
    icon: <TrendingUpRoundedIcon />,
    title: 'Strength Progress',
    description: 'Monitor how your strength improves over time.',
  },
  {
    id: 'records',
    icon: <EmojiEventsRoundedIcon />,
    title: 'Personal Records',
    description: 'Keep track of your biggest lifts and achievements.',
  },
  {
    id: 'body',
    icon: <MonitorWeightRoundedIcon />,
    title: 'Body Progress',
    description: 'Monitor your weight and body measurements.',
  },
];

export default function FeaturesSection() {
  return (
    <Box component="section" id="features" sx={{ py: { xs: 8, md: 12 }, scrollMarginTop: '90px' }}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="Features"
          title="Everything You Need to Track Your Progress"
          subtitle="One focused toolkit for lifters who take training seriously."
        />

        <Grid container spacing={3}>
          {FEATURES.map((feature) => (
            <Grid item xs={12} sm={6} md={3} key={feature.id}>
              <FeatureCard icon={feature.icon} title={feature.title} description={feature.description} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
