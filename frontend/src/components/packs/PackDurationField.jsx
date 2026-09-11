import React, { useMemo } from 'react';
import {
  Box,
  Grid,
  Typography,
  Paper,
  TextField,
  MenuItem,
  Chip,
  Stack,
  Alert,
} from '@mui/material';
import AccessTimeFilledRoundedIcon from '@mui/icons-material/AccessTimeFilledRounded';
import AllInclusiveRoundedIcon from '@mui/icons-material/AllInclusiveRounded';
import EventBusyRoundedIcon from '@mui/icons-material/EventBusyRounded';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import BoltRoundedIcon from '@mui/icons-material/BoltRounded';
import DateRangeRoundedIcon from '@mui/icons-material/DateRangeRounded';
import CalendarMonthRoundedIcon from '@mui/icons-material/CalendarMonthRounded';
import { DURATION_UNITS, PRESET_OPTIONS, calculateExpirationDate } from '../../utils/durationHelper';

export default function PackDurationField({
  durationUnit = 'LIFETIME',
  durationValue = 1,
  validUntil = null,
  isEditing = false,
  onChange,
}) {
  const isLifetime = durationUnit === 'LIFETIME';

  const previewDate = useMemo(() => {
    if (isLifetime) return null;
    return calculateExpirationDate(durationUnit, durationValue);
  }, [durationUnit, durationValue, isLifetime]);

  const presets = PRESET_OPTIONS[durationUnit] || [];

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    let defVal = durationValue;
    if (newUnit === 'HOURS' && (!defVal || defVal > 72)) defVal = 24;
    if (newUnit === 'DAYS' && (!defVal || defVal > 30)) defVal = 7;
    if (newUnit === 'WEEKS' && (!defVal || defVal > 4)) defVal = 1;

    onChange({
      durationUnit: newUnit,
      durationValue: newUnit === 'LIFETIME' ? null : defVal || 1,
      validUntil: newUnit === 'LIFETIME' ? null : calculateExpirationDate(newUnit, defVal || 1),
    });
  };

  const handleValueChange = (e) => {
    const val = Math.max(1, parseInt(e.target.value || '1', 10));
    onChange({
      durationUnit,
      durationValue: val,
      validUntil: calculateExpirationDate(durationUnit, val),
    });
  };

  const handleSelectPreset = (pVal) => {
    onChange({
      durationUnit,
      durationValue: pVal,
      validUntil: calculateExpirationDate(durationUnit, pVal),
    });
  };

  const getUnitIcon = (val) => {
    switch (val) {
      case 'LIFETIME':
        return <AllInclusiveRoundedIcon sx={{ mr: 1, fontSize: 18, color: 'text.secondary' }} />;
      case 'HOURS':
        return <BoltRoundedIcon sx={{ mr: 1, fontSize: 18, color: 'warning.main' }} />;
      case 'DAYS':
        return <DateRangeRoundedIcon sx={{ mr: 1, fontSize: 18, color: 'info.main' }} />;
      case 'WEEKS':
        return <CalendarMonthRoundedIcon sx={{ mr: 1, fontSize: 18, color: 'primary.main' }} />;
      default:
        return null;
    }
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2.5,
        borderRadius: 3,
        border: '1px solid',
        borderColor: isLifetime ? 'divider' : 'primary.main',
        bgcolor: isLifetime ? 'rgba(255,255,255,0.02)' : 'rgba(198, 255, 62, 0.03)',
        transition: 'all .25s ease',
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 2,
            bgcolor: isLifetime ? 'rgba(255,255,255,0.06)' : 'rgba(198, 255, 62, 0.15)',
            color: isLifetime ? 'text.secondary' : 'primary.main',
            display: 'flex',
          }}
        >
          {isLifetime ? <AllInclusiveRoundedIcon fontSize="small" /> : <AccessTimeFilledRoundedIcon fontSize="small" />}
        </Box>
        <Box>
          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
            Pack Duration & Expiration (Durée du Pack)
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Set how long this offer will be active. Expired packs are automatically hidden from the shop.
          </Typography>
        </Box>
      </Stack>

      <Grid container spacing={2} alignItems="center">
        {/* Unit Selector */}
        <Grid item xs={12} sm={isLifetime ? 12 : 6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Duration Type"
            value={durationUnit}
            onChange={handleUnitChange}
            helperText={isLifetime ? 'This pack has no time limit and stays live permanently.' : 'Choose duration unit'}
          >
            {DURATION_UNITS.map((u) => (
              <MenuItem key={u.value} value={u.value} sx={{ display: 'flex', alignItems: 'center' }}>
                {getUnitIcon(u.value)}
                {u.label}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Value Input if not lifetime */}
        {!isLifetime && (
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label={`Number of ${durationUnit === 'HOURS' ? 'Hours' : durationUnit === 'DAYS' ? 'Days' : 'Weeks'}`}
              inputProps={{ min: 1, max: durationUnit === 'HOURS' ? 168 : durationUnit === 'DAYS' ? 90 : 12 }}
              value={durationValue || 1}
              onChange={handleValueChange}
              helperText={`Duration in ${durationUnit.toLowerCase()}`}
            />
          </Grid>
        )}

        {/* Preset chips for fast choice */}
        {!isLifetime && presets.length > 0 && (
          <Grid item xs={12}>
            <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap sx={{ mt: -0.5 }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 700, mr: 0.5 }}>
                Quick Presets:
              </Typography>
              {presets.map((presetVal) => {
                const isSelected = durationValue === presetVal;
                const unitSuffix = durationUnit === 'HOURS' ? 'h' : durationUnit === 'DAYS' ? 'd' : 'w';
                return (
                  <Chip
                    key={presetVal}
                    label={`${presetVal}${unitSuffix}`}
                    size="small"
                    onClick={() => handleSelectPreset(presetVal)}
                    color={isSelected ? 'primary' : 'default'}
                    variant={isSelected ? 'filled' : 'outlined'}
                    sx={{
                      fontWeight: 700,
                      cursor: 'pointer',
                      borderRadius: 1.5,
                      borderColor: isSelected ? 'primary.main' : 'divider',
                    }}
                  />
                );
              })}
            </Stack>
          </Grid>
        )}

        {/* Live Calculation Preview Banner */}
        <Grid item xs={12}>
          {isLifetime ? (
            <Alert
              severity="info"
              icon={<InfoOutlinedIcon fontSize="inherit" />}
              sx={{
                borderRadius: 2,
                fontSize: '0.8rem',
                bgcolor: 'rgba(255,255,255,0.03)',
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              <strong>Lifetime Offer:</strong> Pack will remain active in the shop indefinitely until manually disabled.
            </Alert>
          ) : (
            <Alert
              severity="warning"
              icon={<EventBusyRoundedIcon fontSize="inherit" />}
              sx={{
                borderRadius: 2,
                fontSize: '0.8rem',
                bgcolor: 'rgba(255, 179, 0, 0.08)',
                border: '1px solid rgba(255, 179, 0, 0.25)',
              }}
            >
              {isEditing && validUntil ? (
                <span>
                  <strong>Expiration deadline:</strong> {new Date(previewDate || validUntil).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
                  <br />
                  <em>Once expired, the pack will not be shown in the shop anymore.</em>
                </span>
              ) : (
                <span>
                  <strong>Auto-expiration deadline:</strong> {previewDate ? previewDate.toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' }) : 'Calculating...'}
                  <br />
                  <em>When this time passes, the pack is automatically hidden and no longer displayed in the shop.</em>
                </span>
              )}
            </Alert>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
}
