import { Box, styled, Typography } from '@mui/material';

const StyledTrack = styled(Box)(({ color }) => ({
  width: '100%',
  height: 10,
  borderRadius: 5,
  backgroundColor: 'rgba(255,255,255,0.07)',
  overflow: 'hidden',
}));

const StyledBar = styled(Box)(({ color }) => ({
  height: '100%',
  borderRadius: 5,
  background: `linear-gradient(90deg, ${color}, ${color}dd)`,
  transition: 'width 0.8s ease-out',
}));

export default function ProgressBar({
  value,
  max = 100,
  color = '#C6FF3E',
  showLabel = false,
  label,
  size = 'md',
  sx,
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const sizes = {
    sm: { height: 6, borderRadius: 3 },
    md: { height: 10, borderRadius: 5 },
    lg: { height: 14, borderRadius: 7 },
  };
  const { height, borderRadius } = sizes[size];

  return (
    <Box sx={{ width: '100%', ...sx }}>
      {showLabel && (
        <Typography
          component="div"
          variant="caption"
          color="text.secondary"
          sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}
        >
          {label}
          <Box sx={{ fontWeight: 700, color: 'text.primary' }}>
            {Math.round(percentage)}%
          </Box>
        </Typography>
      )}
      <Box
        sx={{
          width: '100%',
          height,
          borderRadius,
          backgroundColor: 'rgba(255,255,255,0.07)',
          overflow: 'hidden',
        }}
      >
        <StyledBar color={color} sx={{ width: `${percentage}%`, height: '100%', borderRadius }} />
      </Box>
    </Box>
  );
}