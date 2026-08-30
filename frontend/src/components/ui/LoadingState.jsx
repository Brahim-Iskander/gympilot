import { Box, CircularProgress, Skeleton, Stack, styled } from '@mui/material';

const StyledSkeleton = styled(Skeleton)(({ variant = 'text' }) => ({
  borderRadius: variant === 'circular' ? '50%' : 2,
  background: 'linear-gradient(90deg, rgba(255,255,255,0.04) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.04) 75%)',
  backgroundSize: '200% 100%',
  animation: 'gt-shimmer 1.5s infinite',
}));

export function LoadingSpinner({ size = 40, thickness = 4, sx }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', ...sx }}>
      <CircularProgress size={size} thickness={thickness} />
    </Box>
  );
}

export function LoadingOverlay({ visible = true, sx }) {
  if (!visible) return null;
  return (
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(10,12,15,0.8)',
        backdropFilter: 'blur(4px)',
        zIndex: 10,
        borderRadius: 'inherit',
        ...sx,
      }}
    >
      <CircularProgress size={32} thickness={3} />
    </Box>
  );
}

export function CardSkeleton({ variant = 'default', sx }) {
  const variants = {
    default: (
      <Stack spacing={2} sx={{ p: 3 }}>
        <StyledSkeleton width="40%" height={24} />
        <StyledSkeleton width="60%" height={16} />
        <StyledSkeleton width="100%" height={12} />
        <StyledSkeleton width="100%" height={12} />
        <StyledSkeleton width="30%" height={12} />
      </Stack>
    ),
    stat: (
      <Stack spacing={1.5} sx={{ p: 3 }}>
        <StyledSkeleton width="30%" height={14} />
        <StyledSkeleton width="60%" height={36} />
        <StyledSkeleton width="40%" height={24} variant="circular" />
      </Stack>
    ),
    list: (
      <Stack spacing={0} sx={{ p: 2 }}>
        {[1, 2, 3].map((i) => (
          <StyledSkeleton key={i} width="100%" height={60} />
        ))}
      </Stack>
    ),
    chart: (
      <Box sx={{ p: 3, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <StyledSkeleton width="80%" height={200} />
      </Box>
    ),
  };

  return (
    <Box
      sx={{
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
        ...sx,
      }}
    >
      {variants[variant]}
    </Box>
  );
}

export function TableSkeleton({ rows = 5, columns = 4, sx }) {
  return (
    <Box sx={{ borderRadius: 4, border: '1px solid', borderColor: 'divider', overflow: 'hidden', ...sx }}>
      <Box sx={{ p: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Stack direction="row" spacing={2} useFlexGap>
          {Array.from({ length: columns }).map((_, i) => (
            <StyledSkeleton key={i} width={i === 0 ? '120px' : '80px'} height={16} />
          ))}
        </Stack>
      </Box>
      <Stack spacing={0}>
        {Array.from({ length: rows }).map((_, i) => (
          <Box key={i} sx={{ p: 2, borderBottom: i < rows - 1 ? '1px solid' : 'none', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} useFlexGap>
              {Array.from({ length: columns }).map((_, j) => (
                <StyledSkeleton key={j} width={j === 0 ? '120px' : '80px'} height={16} />
              ))}
            </Stack>
          </Box>
        ))}
      </Stack>
    </Box>
  );
}

export function PageSkeleton({ sx }) {
  return (
    <Stack spacing={4} sx={{ ...sx }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={2}>
        <Stack spacing={0.5}>
          <StyledSkeleton width="200px" height={28} />
          <StyledSkeleton width="300px" height={16} />
        </Stack>
        <StyledSkeleton width="120px" height={40} variant="circular" />
      </Stack>
      <Stack spacing={3} sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {[1, 2, 3, 4].map((i) => <CardSkeleton key={i} variant="stat" />)}
      </Stack>
      <CardSkeleton variant="chart" />
      <CardSkeleton variant="default" />
    </Stack>
  );
}