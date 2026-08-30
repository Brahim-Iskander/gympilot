import {
  Box,
  FormHelperText,
  Slider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { DAY_OPTIONS } from '../constants';
import { useLanguage } from '../../../i18n';

export default function StepAvailability({ values, errors, onChange }) {
  const { t } = useLanguage();
  const daysPerWeek = Number(values.daysPerWeek) || 3;

  const handleDaysPerWeek = (_, next) => {
    if (next == null) return;
    const preferred = values.preferredDays.slice(0, next);
    onChange({ daysPerWeek: next, preferredDays: preferred });
  };

  const handlePreferredDays = (_, next) => {
    let selected = next;
    if (selected.length > daysPerWeek) {
      selected = selected.slice(selected.length - daysPerWeek);
    }
    onChange('preferredDays', selected);
  };

  const dayMap = {
    monday: 'mon',
    tuesday: 'tue',
    wednesday: 'wed',
    thursday: 'thu',
    friday: 'fri',
    saturday: 'sat',
    sunday: 'sun',
  };

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('onboarding.fields.daysPerWeek')}: {daysPerWeek}
        </Typography>
        <Slider
          value={daysPerWeek}
          min={2}
          max={6}
          step={1}
          marks
          valueLabelDisplay="auto"
          onChange={handleDaysPerWeek}
        />
        {errors.daysPerWeek && <FormHelperText error>{errors.daysPerWeek}</FormHelperText>}
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('onboarding.fields.preferredDays')} ({values.preferredDays.length}/{daysPerWeek})
        </Typography>
        <ToggleButtonGroup
          value={values.preferredDays}
          onChange={handlePreferredDays}
          aria-label="Preferred training days"
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 1,
            '& .MuiToggleButtonGroup-grouped': {
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '10px !important',
              m: 0,
              px: 1.5,
              py: 1,
              textTransform: 'none',
              '&.Mui-selected': {
                bgcolor: 'action.selected',
                borderColor: 'primary.main',
                color: 'text.primary',
                '&:hover': { bgcolor: 'action.selected' },
              },
            },
          }}
        >
          {DAY_OPTIONS.map((day) => {
            const shortKey = dayMap[day.value] || 'mon';
            return (
              <ToggleButton key={day.value} value={day.value} aria-label={day.value}>
                {t(`onboarding.days.${shortKey}`) || day.label}
              </ToggleButton>
            );
          })}
        </ToggleButtonGroup>
        {errors.preferredDays && <FormHelperText error sx={{ mt: 1 }}>{errors.preferredDays}</FormHelperText>}
      </Box>

      <Box>
        <Typography variant="subtitle2" gutterBottom>
          {t('onboarding.fields.minutesPerSession')}: {values.minutesPerSession}
        </Typography>
        <Slider
          value={Number(values.minutesPerSession) || 60}
          min={20}
          max={180}
          step={5}
          marks={[
            { value: 20, label: '20' },
            { value: 60, label: '60' },
            { value: 90, label: '90' },
            { value: 180, label: '180' },
          ]}
          valueLabelDisplay="auto"
          onChange={(_, next) => onChange('minutesPerSession', next)}
        />
        {errors.minutesPerSession && <FormHelperText error>{errors.minutesPerSession}</FormHelperText>}
      </Box>
    </Stack>
  );
}
