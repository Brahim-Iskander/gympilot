import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useFitnessData } from '../../hooks/useFitnessData';
import { Container, Card, Button, Stack, Box, Typography } from '@mui/material';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import DashboardStats from './components/DashboardStats';
import TodayWorkout from './components/TodayWorkout';
import WeeklyProgress from './components/WeeklyProgress';
import StrengthOverview from './components/StrengthOverview';
import GoalsOverview from './components/GoalsOverview';
import SEO from '../../components/SEO';

export default function Dashboard() {
  const { user } = useAuth();
  const {
    aiPlan,
    aiPlanLoading,
    dailyNutrition,
    nutritionTotals,
    workoutHistory,
    workoutStreak,
    thisWeekWorkouts,
    prs,
    goals,
  } = useFitnessData();

  const firstName = user?.firstName || 'Athlete';

  return (
    <>
      <SEO
        title="Athlete Dashboard"
        description="Monitor your training stats, daily workout split, personal records, and strength progression on GymPilot."
        path="/dashboard"
        noIndex
      />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <DashboardStats
          userName={firstName}
          aiPlan={aiPlan}
          workoutStreak={workoutStreak}
          thisWeekWorkouts={thisWeekWorkouts}
          workoutHistory={workoutHistory}
          nutritionTotals={nutritionTotals}
          prs={prs}
        />
        <TodayWorkout aiPlan={aiPlan} loading={aiPlanLoading} />
        <WeeklyProgress aiPlan={aiPlan} workoutHistory={workoutHistory} />
        <StrengthOverview prs={prs} />
        <GoalsOverview goals={goals} />

        {/* Refer & Earn Quick Banner */}
        <Card
          sx={{
            mt: 4,
            p: 3,
            borderRadius: 3.5,
            background: 'linear-gradient(135deg, rgba(198, 255, 62, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
            border: '1px solid rgba(198, 255, 62, 0.25)',
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            gap: 2,
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 2.5,
                bgcolor: 'rgba(198, 255, 62, 0.15)',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CardGiftcardRoundedIcon sx={{ fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800, fontFamily: "'Sora', sans-serif" }}>
                Invite Gym Buddies & Earn Reward Points 🎁
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Earn 5 points per friend, and your friend gets 10 bonus points upon signup.
              </Typography>
            </Box>
          </Stack>
          <Button
            component={RouterLink}
            to="/dashboard/profile?tab=referrals"
            variant="contained"
            endIcon={<ArrowForwardRoundedIcon />}
            sx={{ fontWeight: 700, borderRadius: 2, px: 3, py: 1.2, whiteSpace: 'nowrap' }}
          >
            Get Referral Link
          </Button>
        </Card>
      </Container>
    </>
  );
}