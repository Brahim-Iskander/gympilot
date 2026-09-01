import { useAuth } from '../../context/AuthContext';
import { useFitnessData } from '../../hooks/useFitnessData';
import { Container } from '@mui/material';
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
      </Container>
    </>
  );
}