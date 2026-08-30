import { Box, Typography } from '@mui/material';

export default function SectionHeading({ overline, title, subtitle }) {
  return (
    <Box sx={{ textAlign: 'center', maxWidth: 720, mx: 'auto', mb: { xs: 5, md: 7 } }}>
      {overline && (
        <Typography variant="overline" component="p" sx={{ color: 'primary.main', fontWeight: 700, letterSpacing: '0.22em' }}>
          {overline}
        </Typography>
      )}
      <Typography
        variant="h3"
        component="h2"
        sx={{
          mt: overline ? 0.5 : 0,
          fontFamily: "'Sora','Inter',sans-serif",
          fontWeight: 800,
          letterSpacing: '-0.02em',
          fontSize: { xs: '1.9rem', md: '2.6rem' },
        }}
      >
        {title}
      </Typography>
      {subtitle && (
        <Typography color="text.secondary" sx={{ mt: 1.5, lineHeight: 1.8 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
