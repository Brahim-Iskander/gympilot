import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';

const usersProgressData = [
  {
    email: 'alex.bulk@gymtrack.test',
    password: 'Password123!',
    entries: [
      {
        date: '2026-08-01',
        weight: 74.0,
        weightUnit: 'kg',
        measurements: { chest: 98.0, arms: 35.5, waist: 79.0, thighs: 56.0 },
        measurementUnit: 'cm',
        note: 'Starting bulk phase. Feeling energized and motivated.',
        strengthLogs: [
          { exerciseName: 'Barbell Bench Press', weight: 80.0, reps: 8, sets: 4, isPR: false, notes: 'Solid warm up and sets.' },
          { exerciseName: 'Barbell Squat', weight: 105.0, reps: 6, sets: 4, isPR: false, notes: 'Good depth.' }
        ]
      },
      {
        date: '2026-08-15',
        weight: 75.1,
        weightUnit: 'kg',
        measurements: { chest: 99.5, arms: 36.2, waist: 79.5, thighs: 57.0 },
        measurementUnit: 'cm',
        note: 'Mid-month check-in: Weight is moving in the right direction.',
        strengthLogs: [
          { exerciseName: 'Barbell Bench Press', weight: 85.0, reps: 6, sets: 4, isPR: true, notes: 'New Bench PR!' },
          { exerciseName: 'Bent-Over Row', weight: 75.0, reps: 8, sets: 4, isPR: true, notes: 'Clean contractions.' }
        ]
      },
      {
        date: '2026-08-28',
        weight: 76.0,
        weightUnit: 'kg',
        measurements: { chest: 101.0, arms: 37.0, waist: 80.0, thighs: 58.0 },
        measurementUnit: 'cm',
        note: 'End of month progress: Great upper body fullness and strength gain.',
        strengthLogs: [
          { exerciseName: 'Barbell Bench Press', weight: 87.5, reps: 6, sets: 4, isPR: true, notes: 'Felt very smooth!' },
          { exerciseName: 'Barbell Squat', weight: 115.0, reps: 5, sets: 4, isPR: true, notes: 'Crushed the last set.' }
        ]
      }
    ]
  },
  {
    email: 'sarah.cut@gymtrack.test',
    password: 'Password123!',
    entries: [
      {
        date: '2026-08-05',
        weight: 68.0,
        weightUnit: 'kg',
        measurements: { waist: 76.0, hips: 102.0, thighs: 59.0 },
        measurementUnit: 'cm',
        note: 'Starting fat-loss cut. Meal prep ready for week 1.',
        strengthLogs: [
          { exerciseName: 'Goblet Squat', weight: 10.0, reps: 10, sets: 3, isPR: false, notes: 'Taking it easy on knees.' },
          { exerciseName: 'Dumbbell Bench Press', weight: 8.0, reps: 10, sets: 3, isPR: false, notes: 'Good tempo.' }
        ]
      },
      {
        date: '2026-08-18',
        weight: 66.8,
        weightUnit: 'kg',
        measurements: { waist: 74.0, hips: 100.5, thighs: 58.0 },
        measurementUnit: 'cm',
        note: 'Down 1.2kg! Feeling much lighter and stamina is improving.',
        strengthLogs: [
          { exerciseName: 'Goblet Squat', weight: 14.0, reps: 10, sets: 3, isPR: true, notes: 'Heavier dumbbell without knee pain.' },
          { exerciseName: 'Romanian Deadlift', weight: 16.0, reps: 10, sets: 3, isPR: true, notes: 'Great hamstring stretch.' }
        ]
      },
      {
        date: '2026-08-28',
        weight: 65.5,
        weightUnit: 'kg',
        measurements: { waist: 72.5, hips: 99.0, thighs: 57.0 },
        measurementUnit: 'cm',
        note: 'Total 2.5kg down this month. Visible waist definition!',
        strengthLogs: [
          { exerciseName: 'Dumbbell Shoulder Press', weight: 10.0, reps: 10, sets: 3, isPR: true, notes: 'Shoulders getting toned!' },
          { exerciseName: 'Dumbbell Row', weight: 14.0, reps: 12, sets: 3, isPR: true, notes: 'Strong back engagement.' }
        ]
      }
    ]
  },
  {
    email: 'karim.strength@gymtrack.test',
    password: 'Password123!',
    entries: [
      {
        date: '2026-08-03',
        weight: 92.0,
        weightUnit: 'kg',
        measurements: { chest: 114.0, arms: 42.0, waist: 88.0, thighs: 65.0 },
        measurementUnit: 'cm',
        note: 'Pre-meet heavy block week 1.',
        strengthLogs: [
          { exerciseName: 'Barbell Squat', weight: 175.0, reps: 3, sets: 4, isPR: false, notes: 'Felt solid on descent.' },
          { exerciseName: 'Barbell Bench Press', weight: 127.5, reps: 3, sets: 4, isPR: false, notes: 'Paused reps on chest.' },
          { exerciseName: 'Deadlift', weight: 215.0, reps: 2, sets: 3, isPR: false, notes: 'Hook grip feeling locked.' }
        ]
      },
      {
        date: '2026-08-16',
        weight: 92.3,
        weightUnit: 'kg',
        measurements: { chest: 114.5, arms: 42.5, waist: 88.0, thighs: 65.5 },
        measurementUnit: 'cm',
        note: 'Mid-block peaking. Strength numbers are at all-time high.',
        strengthLogs: [
          { exerciseName: 'Barbell Squat', weight: 182.5, reps: 3, sets: 3, isPR: true, notes: 'NEW SQUAT PR! Felt explosive.' },
          { exerciseName: 'Barbell Bench Press', weight: 132.5, reps: 3, sets: 3, isPR: true, notes: 'NEW BENCH PR!' }
        ]
      },
      {
        date: '2026-08-29',
        weight: 92.5,
        weightUnit: 'kg',
        measurements: { chest: 115.0, arms: 43.0, waist: 88.5, thighs: 66.0 },
        measurementUnit: 'cm',
        note: 'Max out testing session: All main lifts hit PR thresholds.',
        strengthLogs: [
          { exerciseName: 'Deadlift', weight: 227.5, reps: 2, sets: 2, isPR: true, notes: 'HUGE DEADLIFT PR! 227.5kg x 2.' },
          { exerciseName: 'Overhead Barbell Press', weight: 87.5, reps: 5, sets: 4, isPR: true, notes: 'Shoulders feeling super strong.' }
        ]
      }
    ]
  }
];

async function run() {
  console.log('--- Creating Rich Progress Log Entries for All 3 Accounts ---');

  for (const user of usersProgressData) {
    console.log(`\nLogging in ${user.email}...`);
    try {
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: user.email,
        password: user.password
      });
      const token = loginRes.data.token;
      const headers = { Authorization: `Bearer ${token}` };

      console.log(`Creating ${user.entries.length} progress entries...`);
      for (const entry of user.entries) {
        const res = await axios.post(`${API_BASE}/progress`, entry, { headers });
        console.log(`  ✓ Added entry for date: ${res.data.date} (Weight: ${res.data.weight}${res.data.weightUnit || 'kg'}, PRs: ${res.data.strengthLogs?.filter(s => s.isPR).length || 0})`);
      }
    } catch (err) {
      console.error(`Failed for ${user.email}:`, err.response?.data || err.message);
    }
  }

  console.log('\n✓ Successfully populated progress logs for all 3 users!');
}

run();
