import { Stack, TextField } from '@mui/material';

import TagInput from '../components/TagInput';
import { useLanguage } from '../../../i18n';

export default function StepLimitations({ values, onChange }) {
  const { t } = useLanguage();

  return (
    <Stack spacing={2.5}>
      <TextField
        label={t('onboarding.fields.injuries')}
        fullWidth
        multiline
        minRows={3}
        value={values.injuries}
        onChange={(e) => onChange('injuries', e.target.value)}
        placeholder="e.g. Left shoulder pain on overhead press…"
        helperText={t('common.optional')}
      />

      <TagInput
        label={t('onboarding.fields.cannotDoExercises')}
        placeholder="Type an exercise and press Enter"
        helperText={t('common.optional')}
        value={values.cannotDoExercises}
        onChange={(next) => onChange('cannotDoExercises', next)}
      />
    </Stack>
  );
}
