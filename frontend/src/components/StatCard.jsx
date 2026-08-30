import { Avatar, Box, Card, Chip, Stack, Typography } from '@mui/material';

/**
 * Dashboard-style stat card. Purely props-driven so it can later receive
 * real API data without any structural change.
 */
export default function StatCard({ icon, label, value, unit, trend }) {
  return (
    <Card
      elevation={0}
      sx={{
        p: 3,
        height: '100%',
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        transition: 'transform .3s ease, border-color .3s ease',
        '&:hover': { transform: 'translateY(-4px)', borderColor: 'rgba(198,255,62,0.35)' },
      }}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Typography sx={{ fontSize: { xs: 30, md: 34 }, fontWeight: 800, lineHeight: 1.15, fontFamily: "'Sora','Inter',sans-serif" }}>
            {value}
            {unit && (
              <Typography component="span" variant="h6" color="text.secondary" sx={{ ml: 0.5, fontWeight: 600 }}>
                {unit}
              </Typography>
            )}
          </Typography>
        </Box>
        <Avatar variant="rounded" sx={{ bgcolor: 'rgba(198,255,62,0.12)', color: 'primary.main', borderRadius: 2.5 }}>
          {icon}
        </Avatar>
      </Stack>

      {trend && (
        <Chip
          size="small"
          label={trend}
          sx={{ mt: 1.5, bgcolor: 'rgba(198,255,62,0.10)', color: 'primary.main', fontWeight: 600 }}
        />
      )}
    </Card>
  );
}
