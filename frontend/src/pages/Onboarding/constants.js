export const TOTAL_STEPS = 7;

export const STEP_META = [
  { title: 'Basic profile', subtitle: 'A few details so we can personalize your plan.' },
  { title: 'Your goal', subtitle: 'What do you want to focus on right now?' },
  { title: 'Training experience', subtitle: 'How long have you been lifting?' },
  { title: 'Availability', subtitle: 'When and how long can you train?' },
  { title: 'Equipment', subtitle: 'What do you have access to?' },
  { title: 'Current training', subtitle: 'Optional — helps us build around what you already do.' },
  { title: 'Limitations', subtitle: 'Optional — we will avoid anything that hurts or you cannot do.' },
];

export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const GOAL_OPTIONS = [
  { value: 'build_muscle', label: 'Build muscle / Bulk', description: 'Add size and muscle mass' },
  { value: 'lose_fat', label: 'Lose fat / Cut', description: 'Drop body fat while keeping muscle' },
  { value: 'recomposition', label: 'Recomposition', description: 'Build muscle and lose fat together' },
  { value: 'strength', label: 'Strength', description: 'Get stronger on key lifts' },
  { value: 'maintain', label: 'Maintain', description: 'Hold your current shape and fitness' },
];

export const EXPERIENCE_OPTIONS = [
  { value: 'beginner', label: 'Beginner', description: 'New to structured training' },
  { value: 'intermediate', label: 'Intermediate', description: 'Consistent for a while' },
  { value: 'advanced', label: 'Advanced', description: 'Years of progressive training' },
];

export const DAY_OPTIONS = [
  { value: 'monday', label: 'Mon' },
  { value: 'tuesday', label: 'Tue' },
  { value: 'wednesday', label: 'Wed' },
  { value: 'thursday', label: 'Thu' },
  { value: 'friday', label: 'Fri' },
  { value: 'saturday', label: 'Sat' },
  { value: 'sunday', label: 'Sun' },
];

export const EQUIPMENT_OPTIONS = [
  { value: 'full_gym', label: 'Full gym', description: 'Barbells, machines, cables' },
  { value: 'dumbbells_only', label: 'Dumbbells only', description: 'Adjustable or fixed DBs' },
  { value: 'home_gym', label: 'Home gym', description: 'Rack, bar, some accessories' },
  { value: 'bodyweight_only', label: 'Bodyweight only', description: 'No equipment needed' },
];

export const EMPTY_FORM = {
  age: '',
  sex: '',
  heightCm: '',
  weightKg: '',
  goal: '',
  experienceLevel: '',
  trainingMonths: '',
  daysPerWeek: 3,
  preferredDays: [],
  minutesPerSession: 60,
  equipment: '',
  currentRoutine: '',
  strengthLevels: '',
  likedExercises: [],
  dislikedExercises: [],
  injuries: '',
  cannotDoExercises: [],
};

export function formFromOnboarding(data) {
  if (!data) return { ...EMPTY_FORM };
  return {
    age: data.age ?? '',
    sex: data.sex ?? '',
    heightCm: data.heightCm ?? '',
    weightKg: data.weightKg ?? '',
    goal: data.goal ?? '',
    experienceLevel: data.experienceLevel ?? '',
    trainingMonths: data.trainingMonths ?? '',
    daysPerWeek: data.daysPerWeek ?? 3,
    preferredDays: data.preferredDays ?? [],
    minutesPerSession: data.minutesPerSession ?? 60,
    equipment: data.equipment ?? '',
    currentRoutine: data.currentRoutine ?? '',
    strengthLevels: data.strengthLevels ?? '',
    likedExercises: data.likedExercises ?? [],
    dislikedExercises: data.dislikedExercises ?? [],
    injuries: data.injuries ?? '',
    cannotDoExercises: data.cannotDoExercises ?? [],
  };
}

/** Client-side validation mirroring backend step constraints. */
export function validateStep(step, values) {
  const errors = {};

  if (step === 1) {
    const age = Number(values.age);
    if (!values.age && values.age !== 0) errors.age = 'Age is required.';
    else if (!Number.isInteger(age) || age < 13 || age > 100) errors.age = 'Enter an age between 13 and 100.';

    if (!values.sex) errors.sex = 'Select an option.';

    const height = Number(values.heightCm);
    if (!values.heightCm && values.heightCm !== 0) errors.heightCm = 'Height is required.';
    else if (Number.isNaN(height) || height < 100 || height > 250) errors.heightCm = 'Height must be 100–250 cm.';

    const weight = Number(values.weightKg);
    if (!values.weightKg && values.weightKg !== 0) errors.weightKg = 'Weight is required.';
    else if (Number.isNaN(weight) || weight < 30 || weight > 300) errors.weightKg = 'Weight must be 30–300 kg.';
  }

  if (step === 2 && !values.goal) {
    errors.goal = 'Select a goal.';
  }

  if (step === 3) {
    if (!values.experienceLevel) errors.experienceLevel = 'Select your experience level.';
    const months = Number(values.trainingMonths);
    if (values.trainingMonths === '' || values.trainingMonths === null) {
      errors.trainingMonths = 'Training history is required.';
    } else if (!Number.isInteger(months) || months < 0) {
      errors.trainingMonths = 'Enter months of training (0 or more).';
    }
  }

  if (step === 4) {
    const days = Number(values.daysPerWeek);
    if (!Number.isInteger(days) || days < 2 || days > 6) {
      errors.daysPerWeek = 'Choose 2–6 days per week.';
    }
    if (!values.preferredDays?.length) {
      errors.preferredDays = 'Select at least one day.';
    } else if (values.preferredDays.length !== days) {
      errors.preferredDays = `Select exactly ${days} day${days === 1 ? '' : 's'}.`;
    }
    const minutes = Number(values.minutesPerSession);
    if (!Number.isInteger(minutes) || minutes < 20 || minutes > 180) {
      errors.minutesPerSession = 'Session length must be 20–180 minutes.';
    }
  }

  if (step === 5 && !values.equipment) {
    errors.equipment = 'Select your equipment setup.';
  }

  return errors;
}

export function payloadForStep(step, values) {
  switch (step) {
    case 1:
      return {
        age: Number(values.age),
        sex: values.sex,
        heightCm: Number(values.heightCm),
        weightKg: Number(values.weightKg),
      };
    case 2:
      return { goal: values.goal };
    case 3:
      return {
        experienceLevel: values.experienceLevel,
        trainingMonths: Number(values.trainingMonths),
      };
    case 4:
      return {
        daysPerWeek: Number(values.daysPerWeek),
        preferredDays: values.preferredDays,
        minutesPerSession: Number(values.minutesPerSession),
      };
    case 5:
      return { equipment: values.equipment };
    case 6:
      return {
        currentRoutine: values.currentRoutine?.trim() || null,
        strengthLevels: values.strengthLevels?.trim() || null,
        likedExercises: values.likedExercises?.length ? values.likedExercises : null,
        dislikedExercises: values.dislikedExercises?.length ? values.dislikedExercises : null,
      };
    case 7:
      return {
        injuries: values.injuries?.trim() || null,
        cannotDoExercises: values.cannotDoExercises?.length ? values.cannotDoExercises : null,
      };
    default:
      return {};
  }
}
