import { Box, Card, Chip, Container, Grid, LinearProgress, Stack, Typography, Button } from '@mui/material';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import MonitorWeightRoundedIcon from '@mui/icons-material/MonitorWeightRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';
import LocalFireDepartmentRoundedIcon from '@mui/icons-material/LocalFireDepartmentRounded';
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import { Link as RouterLink } from 'react-router-dom';

import SectionHeading from '../../../components/SectionHeading';
import StatCard from '../../../components/StatCard';
import { dashboardStats, latestLifts } from '../data/mockData';

const STAT_ICONS = {
  workout: <FitnessCenterRoundedIcon sx={{ color: '#C6FF3E' }} />,
  weight: <MonitorWeightRoundedIcon sx={{ color: '#38BDF8' }} />,
  record: <EmojiEventsRoundedIcon sx={{ color: '#FFD700' }} />,
  streak: <LocalFireDepartmentRoundedIcon sx={{ color: '#FF6B6B' }} />,
  points: <MonetizationOnRoundedIcon sx={{ color: '#FFD700' }} />,
};

export default function StatsPreviewSection({ stats = dashboardStats, lifts = latestLifts }) {
  return (
    <Box component="section" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      <Container maxWidth="lg">
        <SectionHeading
          overline="LIVE ATHLETE PREVIEW"
          title="Progress at a Glance"
          subtitle="This is what your training command center looks like once you start logging with GymPilot."
        />

        {/* Top 4 Stat metrics */}
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

        <Typography variant="h6" sx={{ mt: { xs: 6, md: 8 }, mb: 2.5, fontWeight: 800, color: 'text.primary' }}>
          Real-Time Progressive Overload Tracker
        </Typography>

        {/* 3 Lift Progression Cards */}
        <Grid container spacing={3}>
          {lifts.map((lift) => (
            <Grid item xs={12} sm={4} key={lift.id}>
              <Card
                elevation={0}
                sx={{
                  p: 3,
                  height: '100%',
                  bgcolor: 'background.paper',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 4,
                  transition: 'all .3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    borderColor: 'primary.main',
                    boxShadow: (theme) =>
                      theme.palette.mode === 'dark'
                        ? '0 16px 40px rgba(0,0,0,0.4)'
                        : '0 12px 30px rgba(0,0,0,0.06)',
                  },
                }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1} flexWrap="wrap" useFlexGap>
                  <Typography fontWeight={800} color="text.primary">
                    {lift.name}
                  </Typography>
                  <Chip
                    size="small"
                    label={lift.sets}
                    sx={{
                      bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198,255,62,0.12)' : 'rgba(58,125,26,0.1)'),
                      color: 'primary.main',
                      fontWeight: 700,
                    }}
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
                    backgroundColor: 'action.hover',
                    '& .MuiLinearProgress-bar': { borderRadius: 4, backgroundColor: 'primary.main' },
                  }}
                />

                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 1.5 }}>
                  <Typography variant="caption" color="text.secondary">
                    {lift.note}
                  </Typography>
                  <Chip
                    size="small"
                    label={`${lift.progress}% 1RM`}
                    sx={{ height: 18, fontSize: '0.62rem', fontWeight: 700, bgcolor: 'action.hover' }}
                  />
                </Stack>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Bottom invitation card */}
        <Box
          sx={{
            mt: 5,
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(18, 21, 27, 0.9)' : 'rgba(241, 245, 249, 0.95)'),
            border: '1px solid',
            borderColor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.25)' : 'rgba(58, 125, 26, 0.25)'),
            boxShadow: '0 12px 36px rgba(0, 0, 0, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2.5,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'rgba(198, 255, 62, 0.12)' : 'rgba(58, 125, 26, 0.12)'),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <CardGiftcardRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="text.primary">
                Your first 14 days are 100% on us.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create an account in 30 seconds to unlock the Basic Plan trial and track your lifts.
              </Typography>
            </Box>
          </Stack>

          <Button
            component={RouterLink}
            to="/register"
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{
              fontWeight: 800,
              px: 3,
              py: 1.25,
              borderRadius: 2.5,
            }}
          >
            Claim Free Trial
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
