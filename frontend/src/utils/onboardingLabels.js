/**
 * Human-readable labels for onboarding enum values stored in MongoDB.
 */

const GOAL_LABELS = {
  build_muscle: 'Build muscle / Bulk',
  lose_fat: 'Lose fat / Cut',
  recomposition: 'Recomposition',
  strength: 'Strength',
  maintain: 'Maintain',
};

const EXPERIENCE_LABELS = {
  beginner: 'Beginner',
  intermediate: 'Intermediate',
  advanced: 'Advanced',
};

const EQUIPMENT_LABELS = {
  full_gym: 'Full gym',
  dumbbells_only: 'Dumbbells only',
  home_gym: 'Home gym',
  bodyweight_only: 'Bodyweight only',
};

const SEX_LABELS = {
  male: 'Male',
  female: 'Female',
  other: 'Other',
};

const DAY_LABELS = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export function labelGoal(value) {
  return GOAL_LABELS[value] ?? value ?? '—';
}

export function labelExperience(value) {
  return EXPERIENCE_LABELS[value] ?? value ?? '—';
}

export function labelEquipment(value) {
  return EQUIPMENT_LABELS[value] ?? value ?? '—';
}

export function labelSex(value) {
  return SEX_LABELS[value] ?? value ?? '—';
}

export function labelDay(value) {
  return DAY_LABELS[value] ?? value ?? '—';
}

export function formatTrainingDuration(months) {
  if (months == null || months === '') return '—';
  const m = Number(months);
  if (Number.isNaN(m)) return '—';
  if (m < 12) return `${m} month${m === 1 ? '' : 's'}`;
  const years = Math.floor(m / 12);
  const rem = m % 12;
  if (rem === 0) return `${years} year${years === 1 ? '' : 's'}`;
  return `${years}y ${rem}m`;
}

export function formatPreferredDays(days) {
  if (!days?.length) return '—';
  return days.map(labelDay).join(', ');
}

export function formatExerciseList(items) {
  if (!items?.length) return '—';
  return items.join(', ');
}
