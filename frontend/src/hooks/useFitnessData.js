import { useState, useEffect, useCallback } from 'react';
import { fitnessDataService } from '../services/fitnessDataService';
import { useAiPlan } from './useAiPlan';

export function useFitnessData() {
  const { aiPlan, loading: aiPlanLoading } = useAiPlan();

  const [dailyNutrition, setDailyNutrition] = useState(() => fitnessDataService.getDailyNutrition());
  const [nutritionTotals, setNutritionTotals] = useState(() => fitnessDataService.getTodayTotals());
  const [workoutHistory, setWorkoutHistory] = useState(() => fitnessDataService.getWorkoutHistory());
  const [workoutStreak, setWorkoutStreak] = useState(() => fitnessDataService.getWorkoutStreak());
  const [thisWeekWorkouts, setThisWeekWorkouts] = useState(() => fitnessDataService.getThisWeekWorkoutsCount());
  const [prs, setPRs] = useState(() => fitnessDataService.getPRs());
  const [goals, setGoals] = useState(() => fitnessDataService.getGoals(aiPlan));

  const refresh = useCallback(() => {
    setDailyNutrition(fitnessDataService.getDailyNutrition());
    setNutritionTotals(fitnessDataService.getTodayTotals());
    setWorkoutHistory(fitnessDataService.getWorkoutHistory());
    setWorkoutStreak(fitnessDataService.getWorkoutStreak());
    setThisWeekWorkouts(fitnessDataService.getThisWeekWorkoutsCount());
    setPRs(fitnessDataService.getPRs());
    setGoals(fitnessDataService.getGoals(aiPlan));
  }, [aiPlan]);

  useEffect(() => {
    refresh();
    const unsubscribe = fitnessDataService.subscribe(() => {
      refresh();
    });

    const handleCustomEvent = () => {
      refresh();
    };
    window.addEventListener('gymtrack_fitness_sync_event', handleCustomEvent);

    return () => {
      unsubscribe();
      window.removeEventListener('gymtrack_fitness_sync_event', handleCustomEvent);
    };
  }, [refresh]);

  return {
    aiPlan,
    aiPlanLoading,
    dailyNutrition,
    nutritionTotals,
    workoutHistory,
    workoutStreak,
    thisWeekWorkouts,
    prs,
    goals,
    logMeal: (meal) => fitnessDataService.logMeal(meal),
    deleteMeal: (id) => fitnessDataService.deleteMeal(id),
    updateWater: (liters) => fitnessDataService.updateWater(liters),
    logWorkoutSession: (session) => fitnessDataService.logWorkoutSession(session),
    updatePR: (liftName, weight) => fitnessDataService.updatePR(liftName, weight),
    saveGoals: (newGoals) => fitnessDataService.saveGoals(newGoals),
    refresh,
  };
}
