import { useState } from 'react';
import { Box, Chip, Stack, TextField } from '@mui/material';

/**
 * Free-form list input: type a tag and press Enter or comma to add.
 */
export default function TagInput({ label, helperText, value = [], onChange, placeholder, disabled }) {
  const [draft, setDraft] = useState('');

  const addTag = (raw) => {
    const tag = raw.trim().replace(/,$/, '').trim();
    if (!tag) return;
    if (value.some((item) => item.toLowerCase() === tag.toLowerCase())) {
      setDraft('');
      return;
    }
    onChange([...value, tag]);
    setDraft('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(draft);
    } else if (event.key === 'Backspace' && !draft && value.length) {
      onChange(value.slice(0, -1));
    }
  };

  return (
    <Box>
      <TextField
        label={label}
        fullWidth
        value={draft}
        disabled={disabled}
        placeholder={placeholder}
        helperText={helperText}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => addTag(draft)}
      />
      {value.length > 0 && (
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1.5 }}>
          {value.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              onDelete={disabled ? undefined : () => onChange(value.filter((item) => item !== tag))}
              size="small"
            />
          ))}
        </Stack>
      )}
    </Box>
  );
}
