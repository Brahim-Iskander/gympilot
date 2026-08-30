import { Stack, TextField } from '@mui/material';

import TagInput from '../components/TagInput';
import { useLanguage } from '../../../i18n';

export default function StepTrainingData({ values, onChange }) {
  const { t } = useLanguage();

  return (
    <Stack spacing={2.5}>
      <TextField
        label={t('onboarding.fields.currentRoutine')}
        fullWidth
        multiline
        minRows={3}
        value={values.currentRoutine}
        onChange={(e) => onChange('currentRoutine', e.target.value)}
        placeholder="e.g. Push / Pull / Legs, 4 days a week…"
        helperText={t('common.optional')}
      />

      <TextField
        label={t('onboarding.fields.strengthLevels')}
        fullWidth
        multiline
        minRows={2}
        value={values.strengthLevels}
        onChange={(e) => onChange('strengthLevels', e.target.value)}
        placeholder="e.g. Squat 100 kg × 5, Bench 70 kg × 5…"
        helperText={t('common.optional')}
      />

      <TagInput
        label={t('onboarding.fields.likedExercises')}
        placeholder="Type an exercise and press Enter"
        helperText={t('common.optional')}
        value={values.likedExercises}
        onChange={(next) => onChange('likedExercises', next)}
      />

      <TagInput
        label={t('onboarding.fields.dislikedExercises')}
        placeholder="Type an exercise and press Enter"
        helperText={t('common.optional')}
        value={values.dislikedExercises}
        onChange={(next) => onChange('dislikedExercises', next)}
      />
    </Stack>
  );
}
