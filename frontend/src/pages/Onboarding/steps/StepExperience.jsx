import { FormHelperText, Grid, Stack, TextField, Typography } from '@mui/material';

import OptionCard from '../components/OptionCard';
import { EXPERIENCE_OPTIONS } from '../constants';
import { useLanguage } from '../../../i18n';

export default function StepExperience({ values, errors, onChange }) {
  const { t } = useLanguage();

  return (
    <Stack spacing={2.5}>
      <Grid container spacing={1.5}>
        {EXPERIENCE_OPTIONS.map((option) => (
          <Grid item xs={12} key={option.value}>
            <OptionCard
              title={t(`onboarding.experience.${option.value}.label`) || option.label}
              description={t(`onboarding.experience.${option.value}.desc`) || option.description}
              selected={values.experienceLevel === option.value}
              onClick={() => onChange('experienceLevel', option.value)}
            />
          </Grid>
        ))}
      </Grid>
      {errors.experienceLevel && <FormHelperText error>{errors.experienceLevel}</FormHelperText>}

      <TextField
        label={t('onboarding.fields.trainingMonths')}
        type="number"
        required
        fullWidth
        inputProps={{ min: 0 }}
        value={values.trainingMonths}
        onChange={(e) => onChange('trainingMonths', e.target.value)}
        error={Boolean(errors.trainingMonths)}
        helperText={errors.trainingMonths}
      />

      {Number(values.trainingMonths) >= 12 && (
        <Typography variant="caption" color="text.secondary">
          ≈ {(Number(values.trainingMonths) / 12).toFixed(1)} {t('common.days') ? 'years' : 'years'}
        </Typography>
      )}
    </Stack>
  );
}
