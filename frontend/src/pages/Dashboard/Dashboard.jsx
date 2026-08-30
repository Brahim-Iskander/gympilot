import { useAuth } from '../../context/AuthContext';
import { useAiPlan } from '../../hooks/useAiPlan';
import { Container } from '@mui/material';
import DashboardStats from './components/DashboardStats';
import TodayWorkout from './components/TodayWorkout';
import WeeklyProgress from './components/WeeklyProgress';
import StrengthOverview from './components/StrengthOverview';
import GoalsOverview from './components/GoalsOverview';

export default function Dashboard() {
  const { user } = useAuth();
  const { aiPlan, loading } = useAiPlan();
  const firstName = user?.firstName || 'Athlete';

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <DashboardStats userName={firstName} aiPlan={aiPlan} />
      <TodayWorkout aiPlan={aiPlan} loading={loading} />
      <WeeklyProgress aiPlan={aiPlan} />
      <StrengthOverview />
      <GoalsOverview />
    </Container>
  );
}