/**
 * Centralized Fitness Data Synchronization Engine
 * User-scoped and harmonized between:
 * - Dashboard
 * - Workouts
 * - Nutrition
 * - Progress
 * - Goals
 * - AI Calorie Calculator
 */

import { TOKEN_STORAGE_KEY } from '../constants';

const BASE_NUTRITION_KEY = 'gymtrack_daily_nutrition';
const BASE_NUTRITION_TARGETS_KEY = 'gymtrack_custom_nutrition_targets';
const BASE_WORKOUTS_KEY = 'gymtrack_workout_history';
const BASE_GOALS_KEY = 'gymtrack_user_goals';
const BASE_PR_KEY = 'gymtrack_strength_prs';

const EVENT_NAME = 'gymtrack_fitness_sync_event';

function getUserScope() {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem(TOKEN_STORAGE_KEY) : null;
    if (token) {
      const parts = token.split('.');
      if (parts.length >= 2) {
        const payload = JSON.parse(atob(parts[1]));
        const userIdentifier = payload.sub || payload.id || payload.email;
        if (userIdentifier) {
          return '_' + String(userIdentifier).replace(/[^a-zA-Z0-9]/g, '_');
        }
      }
    }
  } catch (e) {
    // Fallback if parsing fails
  }
  return '_guest';
}

function getScopedKey(baseKey) {
  return `${baseKey}${getUserScope()}`;
}

// Initial clean nutrition for a user on a given day
function getCleanDailyNutrition() {
  const today = new Date().toISOString().split('T')[0];
  return {
    date: today,
    waterLiters: 0,
    waterTargetLiters: 3.0,
    meals: [],
  };
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

  clearUserCache() {
    this.notify();
  }

  // --- NUTRITION TARGETS (User Customizable) ---
  getCustomNutritionTargets(aiPlan) {
    try {
      const key = getScopedKey(BASE_NUTRITION_TARGETS_KEY);
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed reading custom nutrition targets:', e);
    }
    return {
      calories: aiPlan?.nutritionPlan?.dailyCalories || 2200,
      protein: aiPlan?.nutritionPlan?.protein || 150,
      carbs: aiPlan?.nutritionPlan?.carbs || 230,
      fat: aiPlan?.nutritionPlan?.fat || 70,
      waterTargetLiters: 3.0,
      isCustom: false,
    };
  }

  setCustomNutritionTargets(targets) {
    try {
      const key = getScopedKey(BASE_NUTRITION_TARGETS_KEY);
      const updated = {
        calories: Number(targets.calories) || 2200,
        protein: Number(targets.protein) || 150,
        carbs: Number(targets.carbs) || 230,
        fat: Number(targets.fat) || 70,
        waterTargetLiters: Number(targets.waterTargetLiters) || 3.0,
        isCustom: true,
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify(updated));
      this.notify();
      return updated;
    } catch (e) {
      console.error('Failed saving custom nutrition targets:', e);
    }
  }

  // --- NUTRITION ---
  getDailyNutrition() {
    try {
      const today = new Date().toISOString().split('T')[0];
      const key = getScopedKey(BASE_NUTRITION_KEY);
      const saved = localStorage.getItem(key);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.date === today) {
          return parsed;
        }
      }
      const initial = getCleanDailyNutrition();
      localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    } catch (e) {
      console.error('Failed reading nutrition store:', e);
      return getCleanDailyNutrition();
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
    const key = getScopedKey(BASE_NUTRITION_KEY);
    localStorage.setItem(key, JSON.stringify(nutrition));
    this.notify();
    return newMeal;
  }

  deleteMeal(id) {
    const nutrition = this.getDailyNutrition();
    nutrition.meals = (nutrition.meals || []).filter((m) => m.id !== id);
    const key = getScopedKey(BASE_NUTRITION_KEY);
    localStorage.setItem(key, JSON.stringify(nutrition));
    this.notify();
  }

  updateWater(liters) {
    const nutrition = this.getDailyNutrition();
    nutrition.waterLiters = Math.max(0, Math.round(liters * 10) / 10);
    const key = getScopedKey(BASE_NUTRITION_KEY);
    localStorage.setItem(key, JSON.stringify(nutrition));
    this.notify();
  }

  // --- WORKOUTS & STREAK ---
  getWorkoutHistory() {
    try {
      const key = getScopedKey(BASE_WORKOUTS_KEY);
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
      return [];
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
    const key = getScopedKey(BASE_WORKOUTS_KEY);
    localStorage.setItem(key, JSON.stringify(updated));

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
      const key = getScopedKey(BASE_PR_KEY);
      const saved = localStorage.getItem(key);
      if (saved) return JSON.parse(saved);
      return [];
    } catch (e) {
      return [];
    }
  }

  updatePR(liftName, newWeight) {
    if (!liftName || !newWeight) return;
    const prs = this.getPRs();
    const existing = prs.find((p) => p.name.toLowerCase() === liftName.toLowerCase());
    const key = getScopedKey(BASE_PR_KEY);
    if (existing) {
      if (newWeight > existing.currentPR) {
        existing.previousPR = existing.currentPR;
        existing.currentPR = newWeight;
        existing.lastUpdated = new Date().toISOString();
        localStorage.setItem(key, JSON.stringify(prs));
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
      localStorage.setItem(key, JSON.stringify(prs));
      this.notify();
    }
  }

  // --- GOALS WITH REAL DATA BINDING ---
  getGoals(aiPlan, latestWeight) {
    try {
      const key = getScopedKey(BASE_GOALS_KEY);
      const saved = localStorage.getItem(key);
      let goals = [];
      if (saved) {
        goals = JSON.parse(saved);
      } else {
        goals = this.generateInitialGoals(aiPlan, latestWeight);
        if (goals.length > 0) {
          localStorage.setItem(key, JSON.stringify(goals));
        }
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
    const key = getScopedKey(BASE_GOALS_KEY);
    localStorage.setItem(key, JSON.stringify(goals));
    this.notify();
  }

  generateInitialGoals(aiPlan, latestWeight) {
    if (!aiPlan) return [];
    if (Array.isArray(aiPlan?.suggestedGoals) && aiPlan.suggestedGoals.length > 0) {
      return aiPlan.suggestedGoals.map((g, idx) => ({
        id: g.id || idx + 1,
        title: g.title,
        type: g.type || 'custom',
        target: Number(g.target) || 1,
        current: Number(g.current) || 0,
        unit: g.unit || '',
        deadline: g.deadline || new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: g.status || 'active',
        isAi: true,
      }));
    }
    const curWeight = latestWeight || aiPlan?.weightKg;
    const goalStr = (aiPlan?.goal || 'general fitness').toLowerCase();
    const isGain = goalStr.includes('gain') || goalStr.includes('muscle') || goalStr.includes('bulk');
    const isLoss = goalStr.includes('loss') || goalStr.includes('fat') || goalStr.includes('cut');

    const weightTarget = curWeight ? (isGain ? Math.round(curWeight + 4) : isLoss ? Math.round(curWeight - 5) : curWeight) : null;
    const proteinTarget = aiPlan?.nutritionPlan?.protein || (curWeight ? Math.round(curWeight * 2) : 140);
    const daysPerWeek = aiPlan?.daysPerWeek || 4;

    const initial = [];
    if (curWeight && weightTarget) {
      initial.push({
        id: 1,
        title: `Target Body Weight (${weightTarget} kg)`,
        type: 'weight',
        target: weightTarget,
        current: curWeight,
        unit: 'kg',
        deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        isAi: true,
      });
    }
    initial.push(
      {
        id: 2,
        title: `Train ${daysPerWeek} sessions per week`,
        type: 'frequency',
        target: daysPerWeek,
        current: 0,
        unit: 'days/week',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        isAi: true,
      },
      {
        id: 3,
        title: `Daily Protein Goal (${proteinTarget}g)`,
        type: 'nutrition',
        target: proteinTarget,
        current: 0,
        unit: 'g',
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        isAi: true,
      }
    );

    return initial;
  }
}

export const fitnessDataService = new FitnessDataService();
