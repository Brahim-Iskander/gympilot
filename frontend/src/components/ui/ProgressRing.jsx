import { Box, styled, Typography } from '@mui/material';

const StyledCircle = styled('circle')(({ color }) => ({
  transition: 'stroke-dashoffset 0.8s ease-out',
  stroke: color,
  strokeLinecap: 'round',
}));

export default function ProgressRing({
  value,
  max = 100,
  color = '#C6FF3E',
  size = 120,
  strokeWidth = 8,
  showValue = true,
  children,
  sx,
}) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <Box
      sx={{
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        ...sx,
      }}
    >
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={strokeWidth}
        />
        <StyledCircle
          color={color}
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      {showValue && (
        <Box sx={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography
            variant="h4"
            sx={{ fontFamily: "'Sora','Inter',sans-serif", fontWeight: 800, lineHeight: 1 }}
          >
            {Math.round(percentage)}%
          </Typography>
          {children}
        </Box>
      )}
    </Box>
  );
}