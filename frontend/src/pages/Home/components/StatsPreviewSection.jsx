import { Box, Card, Chip, Container, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';

import SectionHeading from '../../../components/SectionHeading';
import StatCard from '../../../components/StatCard';
import { dashboardStats, latestLifts } from '../data/mockData';

const STAT_ICONS = {
  workout: <FitnessCenterRoundedIcon />,
  weight: <MonitorWeightRoundedIcon />,
  record: <EmojiEventsRoundedIcon />,
  streak: <LocalFireDepartmentRoundedIcon />,
};

/**
 * Dashboard-style preview fed by mock data.
 * `stats` / `lifts` are props with mock defaults so real API data can be passed in later.
 */
export default function StatsPreviewSection({ stats = dashboardStats, lifts = latestLifts }) {
  return (
    <Box component="section" sx={{ py: { xs: 6, md: 9 } }}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="Your dashboard"
          title="Progress at a glance"
          subtitle="This is what your training data will look like once you start tracking with GymPilot."
        />

        <Grid container spacing={3}>
          {stats.map((stat) => (
            <Grid item xs={12} sm={6} md={3} key={stat.id}>
              <StatCard
                icon={STAT_ICONS[stat.iconKey]}
                label={stat.label}
                value={stat.value}
                unit={stat.unit}
                trend={stat.trend}
              />
            </Grid>
          ))}
        </Grid>

        <Typography variant="h6" sx={{ mt: { xs: 6, md: 8 }, mb: 2.5 }}>
          Latest lifts
        </Typography>

        <Grid container spacing={3}>
          {lifts.map((lift) => (
            <Grid item xs={12} sm={4} key={lift.id}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  transition: 'transform .3s ease',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography fontWeight={700}>{lift.name}</Typography>
                  <Chip
                    size="small"
                    label={lift.sets}
                    sx={{ bgcolor: 'rgba(255,255,255,0.06)', color: 'text.primary', fontWeight: 600 }}
                  />
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={lift.progress}
                  aria-label={`${lift.name} intensity`}
                  sx={{
                    mt: 2.5,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: 'rgba(255,255,255,0.07)',
                    '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: 'primary.main' },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: 'block' }}>
                  {lift.note}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 3.5, textAlign: 'center' }}>
          Demonstration values — create your account to track your own numbers.
        </Typography>
      </Container>
    </Box>
  );
}
