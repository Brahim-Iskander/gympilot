import { Avatar, Box, Card, Chip, Stack, Typography, styled } from '@mui/material';

const StyledCard = styled(Card)(({ highlight }) => ({
  borderRadius: 4,
  border: '1px solid',
  borderColor: highlight ? 'rgba(198,255,62,0.3)' : 'divider',
  background: highlight
    ? 'linear-gradient(180deg, rgba(198,255,62,0.04), rgba(255,255,255,0.01))'
    : 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
  transition: 'transform .3s ease, border-color .3s ease, box-shadow .3s ease',
  '&:hover': {
    transform: 'translateY(-4px)',
    borderColor: 'rgba(198,255,62,0.35)',
    boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
  },
}));

export default function StatCard({
  icon,
  label,
  value,
  unit,
  trend,
  highlight = false,
  sx,
  onClick,
}) {
  return (
    <StyledCard
      highlight={highlight}
      sx={{
        p: 3,
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        ...sx,
      }}
      onClick={onClick}
    >
      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
        <Box>
          <Typography variant="overline" color="text.secondary">
            {label}
          </Typography>
          <Typography
            sx={{
              fontSize: { xs: 30, md: 34 },
              fontWeight: 800,
              lineHeight: 1.15,
              fontFamily: "'Sora','Inter',sans-serif",
            }}
          >
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
    </StyledCard>
  );
}