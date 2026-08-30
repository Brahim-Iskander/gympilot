/**
 * AI-style heuristic defaults for exercises.
 * Suggests starting weight, sets, and reps based on user profile and exercise type.
 */

// Weight multipliers relative to body weight, by muscle group and experience
const WEIGHT_RATIOS = {
  // Compound barbell movements
  'Bench Press':        { beginner: 0.40, intermediate: 0.60, advanced: 0.85 },
  'Incline Dumbbell Press': { beginner: 0.12, intermediate: 0.18, advanced: 0.25 }, // per dumbbell
  'Overhead Press':     { beginner: 0.25, intermediate: 0.40, advanced: 0.55 },
  'Squat':              { beginner: 0.45, intermediate: 0.70, advanced: 1.00 },
  'Deadlift':           { beginner: 0.50, intermediate: 0.80, advanced: 1.10 },
  'Barbell Row':        { beginner: 0.35, intermediate: 0.50, advanced: 0.70 },
  'Romanian Deadlift':  { beginner: 0.35, intermediate: 0.55, advanced: 0.75 },
  'Hip Thrust':         { beginner: 0.40, intermediate: 0.65, advanced: 0.90 },
  'Close-Grip Bench Press': { beginner: 0.30, intermediate: 0.45, advanced: 0.65 },
  'Leg Press':          { beginner: 0.80, intermediate: 1.20, advanced: 1.60 },
  'Arnold Press':       { beginner: 0.08, intermediate: 0.12, advanced: 0.18 },
};

// Fallback by muscle group for exercises not in the table
const MUSCLE_FALLBACK = {
  Chest:     { beginner: 0.15, intermediate: 0.22, advanced: 0.30 },
  Back:      { beginner: 0.18, intermediate: 0.28, advanced: 0.38 },
  Shoulders: { beginner: 0.08, intermediate: 0.12, advanced: 0.18 },
  Biceps:    { beginner: 0.06, intermediate: 0.10, advanced: 0.14 },
  Triceps:   { beginner: 0.06, intermediate: 0.10, advanced: 0.14 },
  Legs:      { beginner: 0.30, intermediate: 0.50, advanced: 0.70 },
  Glutes:    { beginner: 0.20, intermediate: 0.35, advanced: 0.50 },
  Abs:       { beginner: 0, intermediate: 0, advanced: 0.05 },
  Cardio:    { beginner: 0, intermediate: 0, advanced: 0 },
};

// Default sets/reps by goal
const SETS_REPS = {
  build_muscle:  { sets: 4, reps: 10 },
  lose_fat:      { sets: 3, reps: 15 },
  strength:      { sets: 5, reps: 5 },
  recomposition: { sets: 3, reps: 12 },
  maintain:      { sets: 3, reps: 10 },
  default:       { sets: 3, reps: 10 },
};

function roundToNearest(value, step = 2.5) {
  return Math.round(value / step) * step;
}

/**
 * Suggest weight for an exercise based on user profile.
 * @param {string} exerciseName
 * @param {string} muscle - Muscle group (Chest, Back, etc.)
 * @param {string} equipmentType - Barbell, Dumbbell, Machine, Cable, Bodyweight, etc.
 * @param {object} userProfile - { weightKg, experienceLevel, goal }
 * @returns {number} suggested weight in kg
 */
export function suggestWeight(exerciseName, muscle, equipmentType, userProfile) {
  const bw = userProfile?.weightKg || 70;
  const exp = (userProfile?.experienceLevel || 'beginner').toLowerCase();
  const level = ['beginner', 'intermediate', 'advanced'].includes(exp) ? exp : 'beginner';

  // Bodyweight exercises have no weight
  if (equipmentType === 'Bodyweight') return 0;

  // Direct lookup
  const direct = WEIGHT_RATIOS[exerciseName];
  if (direct) {
    return roundToNearest(bw * (direct[level] || direct.beginner));
  }

  // Fallback by muscle group
  const fallback = MUSCLE_FALLBACK[muscle] || MUSCLE_FALLBACK.Chest;
  let ratio = fallback[level] || fallback.beginner;

  // Cable and machine exercises tend to be lighter than barbell
  if (equipmentType === 'Cable' || equipmentType === 'Machine') {
    ratio *= 0.7;
  }

  return roundToNearest(bw * ratio);
}

/**
 * Suggest sets and reps based on the user's goal.
 * @param {string} goal - e.g., 'build_muscle', 'strength', 'lose_fat'
 * @returns {{ sets: number, reps: number }}
 */
export function suggestSetsReps(goal) {
  return SETS_REPS[goal] || SETS_REPS.default;
}

/**
 * Build a full exercise config for the workout tracker.
 * @param {object} exercise - { name, muscle, equipment, difficulty }
 * @param {object} userProfile - { weightKg, experienceLevel, goal }
 * @returns {{ id, name, sets: Array<{ weight, reps, completed }> }}
 */
export function buildExerciseForWorkout(exercise, userProfile) {
  const { sets, reps } = suggestSetsReps(userProfile?.goal);
  const weight = suggestWeight(exercise.name, exercise.muscle, exercise.equipment, userProfile);

  return {
    id: exercise.id || `ex-${Date.now()}`,
    name: exercise.name,
    sets: Array.from({ length: sets }, () => ({
      weight,
      reps,
      completed: false,
    })),
  };
}
