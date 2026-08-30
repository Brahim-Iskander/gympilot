import { FormHelperText, Grid, Stack } from '@mui/material';

import OptionCard from '../components/OptionCard';
import { EQUIPMENT_OPTIONS } from '../constants';
import { useLanguage } from '../../../i18n';

export default function StepEquipment({ values, errors, onChange }) {
  const { t } = useLanguage();

  return (
    <Stack spacing={1.5}>
      <Grid container spacing={1.5}>
        {EQUIPMENT_OPTIONS.map((option) => (
          <Grid item xs={12} sm={6} key={option.value}>
            <OptionCard
              title={t(`onboarding.equipment.${option.value}.label`) || option.label}
              description={t(`onboarding.equipment.${option.value}.desc`) || option.description}
              selected={values.equipment === option.value}
              onClick={() => onChange('equipment', option.value)}
            />
          </Grid>
        ))}
      </Grid>
      {errors.equipment && <FormHelperText error>{errors.equipment}</FormHelperText>}
    </Stack>
  );
}
