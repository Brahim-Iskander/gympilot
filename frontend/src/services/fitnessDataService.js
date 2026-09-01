/**
 * Centralized Fitness Data Synchronization Engine
 * Harmonizes real-time state between:
 * - Dashboard
 * - Workouts
 * - Nutrition
 * - Progress
 * - Goals
 * - AI Calorie Calculator
 */

const NUTRITION_STORAGE_KEY = 'gymtrack_daily_nutrition';
const WORKOUTS_STORAGE_KEY = 'gymtrack_workout_history';
const GOALS_STORAGE_KEY = 'gymtrack_user_goals';
const PR_STORAGE_KEY = 'gymtrack_strength_prs';

const EVENT_NAME = 'gymtrack_fitness_sync_event';

// Default initial meals for a new day if none saved
function getDefaultDailyNutrition() {
  const today = new Date().toISOString().split('T')[0];
  return {
    date: today,
    waterLiters: 2.5,
    waterTargetLiters: 3.5,
    meals: [
      {
        id: 'meal_def_1',
        title: 'Breakfast Power Oats & Eggs',
        type: 'Breakfast',
        time: '08:30',
        calories: 480,
        protein: 34,
        carbs: 52,
        fat: 14,
        items: '4 Whole eggs scrambled, 60g rolled oats with almond milk and blueberries',
        aiScanned: false,
      },
      {
        id: 'meal_def_2',
        title: 'Post-Workout Anabolic Shake',
        type: 'Snack',
        time: '11:45',
        calories: 320,
        protein: 32,
        carbs: 38,
        fat: 4,
        items: '1 Scoop Whey Protein Isolate, 1 Large Banana, 250ml Oat milk',
        aiScanned: true,
      },
    ],
  };
}

// Default standard PRs baseline
function getDefaultPRs() {
  return [
    { name: 'Bench Press', currentPR: 85, previousPR: 77.5, unit: 'kg', lastUpdated: new Date().toISOString() },
    { name: 'Squat', currentPR: 125, previousPR: 110, unit: 'kg', lastUpdated: new Date().toISOString() },
    { name: 'Deadlift', currentPR: 155, previousPR: 140, unit: 'kg', lastUpdated: new Date().toISOString() },
    { name: 'Overhead Press', currentPR: 60, previousPR: 52.5, unit: 'kg', lastUpdated: new Date().toISOString() },
  ];
}

class FitnessDataService {
  constructor() {
    this.listeners = new Set();
  }

  // --- Subscriptions ---
  subscribe(callback) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error in fitness data listener:', err);
      }
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME));
    }
  }

  // --- NUTRITION ---
  getDailyNutrition() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const saved = localStorage.getItem(NUTRITION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed;
        }
      }
      const initial = getDefaultDailyNutrition();
      localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error('Failed reading nutrition store:', e);
      return getDefaultDailyNutrition();
    }
  }

  getTodayTotals() {
    const nutrition = this.getDailyNutrition();
    const meals = nutrition.meals || [];
    return meals.reduce(
      (acc, m) => {
        acc.calories += Number(m.calories || 0);
        acc.protein += Number(m.protein || 0);
        acc.carbs += Number(m.carbs || 0);
        acc.fat += Number(m.fat || 0);
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0, mealCount: meals.length }
    );
  }

  logMeal(meal) {
    const nutrition = this.getDailyNutrition();
    const newMeal = {
      id: meal.id || `meal_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      title: meal.title || meal.foodName || 'Logged Meal',
      type: meal.type || 'Meal',
      time: meal.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      calories: Math.round(Number(meal.calories || 0)),
      protein: Math.round(Number(meal.protein || 0)),
      carbs: Math.round(Number(meal.carbs || 0)),
      fat: Math.round(Number(meal.fat || 0)),
      fiber: meal.fiber ? Math.round(Number(meal.fiber)) : undefined,
      items: meal.items || (meal.ingredients ? meal.ingredients.map((i) => `${i.amount || ''} ${i.name}`).join(', ') : ''),
      aiScanned: Boolean(meal.aiScanned),
      healthScore: meal.healthScore || undefined,
      servingSize: meal.servingSize || undefined,
    };

    nutrition.meals = [newMeal, ...(nutrition.meals || [])];
    localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(nutrition));
    this.notify();
    return newMeal;
  }

  deleteMeal(id) {
    const nutrition = this.getDailyNutrition();
    nutrition.meals = (nutrition.meals || []).filter((m) => m.id !== id);
    localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(nutrition));
    this.notify();
  }

  updateWater(liters) {
    const nutrition = this.getDailyNutrition();
    nutrition.waterLiters = Math.max(0, Math.round(liters * 10) / 10);
    localStorage.setItem(NUTRITION_STORAGE_KEY, JSON.stringify(nutrition));
    this.notify();
  }

  // --- WORKOUTS & STREAK ---
  getWorkoutHistory() {
    try {
      const saved = localStorage.getItem(WORKOUTS_STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
      const now = new Date();
      const past2Days = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const past4Days = new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const initial = [
        { id: 'w1', name: 'Upper Body Hypertrophy', date: past2Days, durationMinutes: 52, exercisesCompleted: 6, totalVolumeKg: 4200 },
        { id: 'w2', name: 'Legs & Core Power', date: past4Days, durationMinutes: 58, exercisesCompleted: 5, totalVolumeKg: 6800 },
      ];
      localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error('Failed reading workout history:', e);
      return [];
    }
  }

  logWorkoutSession(session) {
    const history = this.getWorkoutHistory();
    const newSession = {
      id: session.id || `workout_${Date.now()}`,
      name: session.name || 'Workout Session',
      date: session.date || new Date().toISOString().split('T')[0],
      durationMinutes: session.durationMinutes || 45,
      exercisesCompleted: session.exercisesCompleted || (session.exercises ? session.exercises.length : 4),
      totalVolumeKg: session.totalVolumeKg || 3500,
      exercises: session.exercises || [],
    };

    const updated = [newSession, ...history];
    localStorage.setItem(WORKOUTS_STORAGE_KEY, JSON.stringify(updated));

    if (session.exercises) {
      session.exercises.forEach((ex) => {
        if (ex.maxWeight) {
          this.updatePR(ex.name, ex.maxWeight);
        }
      });
    }

    this.notify();
    return newSession;
  }

  getWorkoutStreak() {
    const history = this.getWorkoutHistory();
    if (!history || history.length === 0) return 0;

    const uniqueDates = Array.from(new Set(history.map((h) => h.date).filter(Boolean))).sort().reverse();
    if (uniqueDates.length === 0) return 0;

    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterdayStr = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let checkDate = uniqueDates[0] === todayStr ? todayStr : (uniqueDates[0] === yesterdayStr ? yesterdayStr : null);
    if (!checkDate) return 0;

    let streak = 0;
    let cur = new Date(checkDate);
    for (const dStr of uniqueDates) {
      const expectedStr = cur.toISOString().split('T')[0];
      if (dStr === expectedStr) {
        streak += 1;
        cur.setDate(cur.getDate() - 1);
      } else if (dStr < expectedStr) {
        break;
      }
    }
    return Math.max(streak, 1);
  }

  getThisWeekWorkoutsCount() {
    const history = this.getWorkoutHistory();
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    return history.filter((w) => {
      if (!w.date) return false;
      const d = new Date(w.date);
      return d >= oneWeekAgo && d <= now;
    }).length;
  }

  // --- STRENGTH & PRS ---
  getPRs() {
    try {
      const saved = localStorage.getItem(PR_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
      const def = getDefaultPRs();
      localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(def));
      return def;
    } catch (e) {
      return getDefaultPRs();
    }
  }

  updatePR(liftName, newWeight) {
    if (!liftName || !newWeight) return;
    const prs = this.getPRs();
    const existing = prs.find((p) => p.name.toLowerCase() === liftName.toLowerCase());
    if (existing) {
      if (newWeight > existing.currentPR) {
        existing.previousPR = existing.currentPR;
        existing.currentPR = newWeight;
        existing.lastUpdated = new Date().toISOString();
        localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(prs));
        this.notify();
      }
    } else {
      prs.push({
        name: liftName,
        currentPR: newWeight,
        previousPR: Math.round(newWeight * 0.9),
        unit: 'kg',
        lastUpdated: new Date().toISOString(),
      });
      localStorage.setItem(PR_STORAGE_KEY, JSON.stringify(prs));
      this.notify();
    }
  }

  // --- GOALS WITH REAL DATA BINDING ---
  getGoals(aiPlan, latestWeight) {
    try {
      const saved = localStorage.getItem(GOALS_STORAGE_KEY);
      let goals = [];
      if (saved) {
        goals = JSON.parse(saved);
      } else {
        goals = this.generateInitialGoals(aiPlan, latestWeight);
        localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
      }

      const nutritionTotals = this.getTodayTotals();
      const thisWeekWorkouts = this.getThisWeekWorkoutsCount();
      const prs = this.getPRs();
      const bench = prs.find((p) => p.name.toLowerCase().includes('bench'))?.currentPR;
      const squat = prs.find((p) => p.name.toLowerCase().includes('squat'))?.currentPR;

      return goals.map((g) => {
        let liveCurrent = g.current;
        if (g.type === 'weight' && latestWeight) {
          liveCurrent = latestWeight;
        } else if (g.type === 'nutrition' && g.unit === 'g') {
          liveCurrent = nutritionTotals.protein || g.current;
        } else if (g.type === 'nutrition' && g.unit === 'kcal') {
          liveCurrent = nutritionTotals.calories || g.current;
        } else if (g.type === 'frequency') {
          liveCurrent = thisWeekWorkouts;
        } else if (g.type === 'strength' && g.title.toLowerCase().includes('bench') && bench) {
          liveCurrent = bench;
        } else if (g.type === 'strength' && g.title.toLowerCase().includes('squat') && squat) {
          liveCurrent = squat;
        }

        const isCompleted = Number(liveCurrent) >= Number(g.target);
        return {
          ...g,
          current: liveCurrent,
          status: isCompleted ? 'completed' : g.status || 'active',
        };
      });
    } catch (e) {
      console.error('Failed reading goals:', e);
      return [];
    }
  }

  saveGoals(goals) {
    localStorage.setItem(GOALS_STORAGE_KEY, JSON.stringify(goals));
    this.notify();
  }

  generateInitialGoals(aiPlan, latestWeight) {
    const curWeight = latestWeight || aiPlan?.weightKg || 75;
    const goalStr = (aiPlan?.goal || 'general fitness').toLowerCase();
    const isGain = goalStr.includes('gain') || goalStr.includes('muscle') || goalStr.includes('bulk');
    const isLoss = goalStr.includes('loss') || goalStr.includes('fat') || goalStr.includes('cut');

    const weightTarget = isGain ? Math.round(curWeight + 4) : isLoss ? Math.round(curWeight - 5) : curWeight;
    const proteinTarget = aiPlan?.nutritionPlan?.protein || Math.round(curWeight * 2);
    const daysPerWeek = aiPlan?.daysPerWeek || 4;

    return [
      { id: 1, title: `Target Body Weight (${weightTarget} kg)`, type: 'weight', target: weightTarget, current: curWeight, unit: 'kg', deadline: '2026-12-31', status: 'active', isAi: true },
      { id: 2, title: 'Bench Press Milestone (90 kg)', type: 'strength', target: 90, current: 85, unit: 'kg', deadline: '2026-12-31', status: 'active', isAi: true },
      { id: 3, title: 'Squat Mastery (130 kg)', type: 'strength', target: 130, current: 125, unit: 'kg', deadline: '2027-01-31', status: 'active', isAi: true },
      { id: 4, title: `Train ${daysPerWeek} sessions per week`, type: 'frequency', target: daysPerWeek, current: 2, unit: 'days/week', deadline: '2026-09-30', status: 'active', isAi: true },
      { id: 5, title: `Daily Protein Goal (${proteinTarget}g)`, type: 'nutrition', target: proteinTarget, current: 66, unit: 'g', deadline: '2026-09-30', status: 'active', isAi: true },
    ];
  }
}

export const fitnessDataService = new FitnessDataService();
