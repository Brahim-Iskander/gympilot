import { Box, Typography } from '@mui/material';

/** Selectable tile used for goals, experience, equipment, sex, etc. */
export default function OptionCard({ selected, title, description, onClick, disabled }) {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      disabled={disabled}
      sx={{
        all: 'unset',
        boxSizing: 'border-box',
        cursor: disabled ? 'default' : 'pointer',
        display: 'block',
        width: '100%',
        p: 2,
        borderRadius: 2.5,
        border: '1px solid',
        borderColor: selected ? 'primary.main' : 'divider',
        backgroundColor: selected ? 'action.selected' : 'transparent',
        transition: 'border-color 0.15s ease, background-color 0.15s ease, transform 0.15s ease',
        '&:hover': disabled
          ? undefined
          : {
              borderColor: selected ? 'primary.main' : 'text.secondary',
              transform: 'translateY(-1px)',
            },
        '&:focus-visible': {
          outline: '2px solid',
          outlineColor: 'primary.main',
          outlineOffset: 2,
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ fontWeight: 700, fontFamily: "'Sora','Inter',sans-serif" }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {description}
        </Typography>
      )}
    </Box>
  );
}
