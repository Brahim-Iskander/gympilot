/**
 * Demonstration data for the landing page preview.
 * Components receive this via props with these values as defaults,
 * so real API data can replace it later without UI changes.
 */

export const dashboardStats = [
  { id: 'workouts', label: 'Workouts Logged', value: '28', iconKey: 'workout', trend: '+4 this week' },
  { id: 'records', label: 'Personal Records', value: '14', iconKey: 'record', trend: '+3 this month' },
  { id: 'streak', label: 'Training Streak', value: '18', unit: 'days', iconKey: 'streak', trend: '18 Days Active' },
  { id: 'points', label: 'Reward Points', value: '520', unit: 'pts', iconKey: 'points', trend: 'Free Sub Eligible' },
];

export const latestLifts = [
  {
    id: 'bench-press',
    name: 'Bench Press',
    sets: '80 kg × 8 reps',
    progress: 62,
    note: 'Estimated 1RM · 105 kg',
  },
  {
    id: 'squat',
    name: 'Squat',
    sets: '120 kg × 6 reps',
    progress: 74,
    note: 'Estimated 1RM · 140 kg',
  },
  {
    id: 'deadlift',
    name: 'Deadlift',
    sets: '150 kg × 5 reps',
    progress: 81,
    note: 'Estimated 1RM · 176 kg',
  },
];
