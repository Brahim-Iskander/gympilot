import axios from 'axios';

const API_BASE = 'http://localhost:8081/api';

const usersToCreate = [
  {
    profile: {
      firstName: 'Alex',
      lastName: 'Bulk',
      email: 'alex.bulk@gymtrack.test',
      password: 'Password123!',
    },
    step1: { age: 24, heightCm: 182, weightKg: 74, sex: 'male' },
    step2: { goal: 'build_muscle' },
    step3: { experienceLevel: 'intermediate', trainingMonths: 24 },
    step4: { daysPerWeek: 4, preferredDays: ['monday', 'tuesday', 'thursday', 'friday'], minutesPerSession: 75 },
    step5: { equipment: 'full_gym' },
    step6: {
      currentRoutine: 'Upper / Lower hypertrophy split',
      strengthLevels: 'Bench: 85kg x 6, Squat: 110kg x 5, Deadlift: 140kg x 5',
      likedExercises: ['Incline Dumbbell Press', 'Barbell Squat', 'Lat Pulldown', 'Lateral Raise'],
      dislikedExercises: ['Burpees'],
    },
    step7: {
      injuries: '',
      cannotDoExercises: [],
    },
  },
  {
    profile: {
      firstName: 'Sarah',
      lastName: 'Cut',
      email: 'sarah.cut@gymtrack.test',
      password: 'Password123!',
    },
    step1: { age: 29, heightCm: 165, weightKg: 68, sex: 'female' },
    step2: { goal: 'lose_fat' },
    step3: { experienceLevel: 'beginner', trainingMonths: 4 },
    step4: { daysPerWeek: 3, preferredDays: ['monday', 'wednesday', 'friday'], minutesPerSession: 45 },
    step5: { equipment: 'dumbbells_only' },
    step6: {
      currentRoutine: 'Home dumbbell full body circuit',
      strengthLevels: 'Goblet Squat: 12kg x 10, Dumbbell Press: 8kg x 10',
      likedExercises: ['Romanian Deadlift', 'Dumbbell Row', 'Plank'],
      dislikedExercises: ['Barbell Snatch'],
    },
    step7: {
      injuries: 'Mild knee discomfort with deep heavy squats',
      cannotDoExercises: ['Pistol Squats'],
    },
  },
  {
    profile: {
      firstName: 'Karim',
      lastName: 'Strength',
      email: 'karim.strength@gymtrack.test',
      password: 'Password123!',
    },
    step1: { age: 32, heightCm: 178, weightKg: 92, sex: 'male' },
    step2: { goal: 'strength' },
    step3: { experienceLevel: 'advanced', trainingMonths: 60 },
    step4: { daysPerWeek: 5, preferredDays: ['monday', 'tuesday', 'wednesday', 'friday', 'saturday'], minutesPerSession: 90 },
    step5: { equipment: 'full_gym' },
    step6: {
      currentRoutine: '5/3/1 Powerlifting + accessory work',
      strengthLevels: 'Squat: 180kg x 3, Bench: 130kg x 3, Deadlift: 220kg x 2',
      likedExercises: ['Low Bar Squat', 'Competition Bench', 'Sumo Deadlift', 'Overhead Press'],
      dislikedExercises: ['Leg Extension Machine'],
    },
    step7: {
      injuries: '',
      cannotDoExercises: [],
    },
  },
];

async function run() {
  console.log('--- Creating 3 users and generating tailored AI plans ---');

  const results = [];

  for (const item of usersToCreate) {
    console.log(`\n========================================`);
    console.log(`Processing user: ${item.profile.email}`);
    
    let token = '';
    // 1. Try Register or Login
    try {
      const regRes = await axios.post(`${API_BASE}/auth/register`, item.profile);
      token = regRes.data.token;
      console.log(`✓ Registered ${item.profile.firstName} successfully`);
    } catch (e) {
      console.log(`Logging in ${item.profile.email}...`);
      const loginRes = await axios.post(`${API_BASE}/auth/login`, {
        email: item.profile.email,
        password: item.profile.password,
      });
      token = loginRes.data.token;
      console.log(`✓ Logged in ${item.profile.firstName}`);
    }

    const headers = { Authorization: `Bearer ${token}` };

    // 2. Submit all onboarding steps
    try {
      await axios.post(`${API_BASE}/onboarding/step1`, item.step1, { headers });
      await axios.post(`${API_BASE}/onboarding/step2`, item.step2, { headers });
      await axios.post(`${API_BASE}/onboarding/step3`, item.step3, { headers });
      await axios.post(`${API_BASE}/onboarding/step4`, item.step4, { headers });
      await axios.post(`${API_BASE}/onboarding/step5`, item.step5, { headers });
      await axios.post(`${API_BASE}/onboarding/step6`, item.step6, { headers });
      const step7Res = await axios.post(`${API_BASE}/onboarding/step7`, item.step7, { headers });
      
      console.log(`✓ Completed Steps 1-7 and generated AI plan for ${item.profile.firstName}!`);
      const planData = step7Res.data;
      
      let parsedPlan = null;
      try {
        parsedPlan = typeof planData.aiGeneratedPlan === 'string' ? JSON.parse(planData.aiGeneratedPlan) : planData.aiGeneratedPlan;
      } catch (err) {
        parsedPlan = planData.aiGeneratedPlan;
      }

      results.push({
        name: `${item.profile.firstName} ${item.profile.lastName}`,
        email: item.profile.email,
        password: item.profile.password,
        goal: item.step2.goal,
        equipment: item.step5.equipment,
        experience: item.step3.experienceLevel,
        plan: parsedPlan,
      });
    } catch (e) {
      console.error('Failed to complete onboarding steps:', e.response?.data || e.message);
    }
  }

  console.log('\n========================================');
  console.log('SUMMARY OF 3 TAILORED USER ACCOUNTS');
  console.log('========================================');
  for (const res of results) {
    console.log(`\n👤 User: ${res.name}`);
    console.log(`   Email: ${res.email}`);
    console.log(`   Password: ${res.password}`);
    console.log(`   Profile: ${res.goal} | ${res.experience} | ${res.equipment}`);
    if (res.plan && res.plan.workoutPlan) {
      console.log(`   🏋️ Workout Plan (${res.plan.workoutPlan.length} days):`);
      res.plan.workoutPlan.forEach((day, i) => {
        const exercisesStr = day.exercises?.map(e => `${e.name} (${e.sets}x${e.reps})`).join(', ');
        console.log(`     Day ${i+1} [${day.dayName}]: ${exercisesStr}`);
      });
    }
  }
}

run();
