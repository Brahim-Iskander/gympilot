import { FormHelperText, Grid, Stack, TextField, Typography } from '@mui/material';

import OptionCard from '../components/OptionCard';
import { SEX_OPTIONS } from '../constants';
import { useLanguage } from '../../../i18n';

export default function StepBasicProfile({ values, errors, onChange }) {
  const { t } = useLanguage();

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t('onboarding.fields.age')}
            type="number"
            required
            fullWidth
            inputProps={{ min: 13, max: 100 }}
            value={values.age}
            onChange={(e) => onChange('age', e.target.value)}
            error={Boolean(errors.age)}
            helperText={errors.age}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t('onboarding.fields.height')}
            type="number"
            required
            fullWidth
            inputProps={{ min: 100, max: 250, step: 0.1 }}
            value={values.heightCm}
            onChange={(e) => onChange('heightCm', e.target.value)}
            error={Boolean(errors.heightCm)}
            helperText={errors.heightCm}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label={t('onboarding.fields.weight')}
            type="number"
            required
            fullWidth
            inputProps={{ min: 30, max: 300, step: 0.1 }}
            value={values.weightKg}
            onChange={(e) => onChange('weightKg', e.target.value)}
            error={Boolean(errors.weightKg)}
            helperText={errors.weightKg}
          />
        </Grid>
      </Grid>

      <Typography variant="subtitle2" color="text.secondary">
        {t('onboarding.fields.sex')}
      </Typography>
      <Grid container spacing={1.5}>
        {SEX_OPTIONS.map((option) => (
          <Grid item xs={12} sm={6} key={option.value}>
            <OptionCard
              title={option.value === 'male' ? t('onboarding.fields.male') : t('onboarding.fields.female')}
              selected={values.sex === option.value}
              onClick={() => onChange('sex', option.value)}
            />
          </Grid>
        ))}
      </Grid>
      {errors.sex && <FormHelperText error>{errors.sex}</FormHelperText>}
    </Stack>
  );
}
