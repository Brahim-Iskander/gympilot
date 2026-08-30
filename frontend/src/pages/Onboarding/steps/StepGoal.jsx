import { FormHelperText, Grid, Stack } from '@mui/material';

import OptionCard from '../components/OptionCard';
import { GOAL_OPTIONS } from '../constants';
import { useLanguage } from '../../../i18n';

export default function StepGoal({ values, errors, onChange }) {
  const { t } = useLanguage();

  return (
    <Stack spacing={1.5}>
      <Grid container spacing={1.5}>
        {GOAL_OPTIONS.map((option) => (
          <Grid item xs={12} key={option.value}>
            <OptionCard
              title={t(`onboarding.goals.${option.value}.label`) || option.label}
              description={t(`onboarding.goals.${option.value}.desc`) || option.description}
              selected={values.goal === option.value}
              onClick={() => onChange('goal', option.value)}
            />
          </Grid>
        ))}
      </Grid>
      {errors.goal && <FormHelperText error>{errors.goal}</FormHelperText>}
    </Stack>
  );
}
