import { useNavigate } from 'react-router-dom';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import { Box, Button, Container, Paper, Stack, Typography } from '@mui/material';

import Logo from './Logo';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../i18n';

/**
 * Shared page shell for the Login / Register screens:
 * centered card on a dark background with ambient accent glows.
 * Always offers an explicit way back to Home (never browser history).
 */
export default function AuthShell({ title, subtitle, children, footer }) {
  const navigate = useNavigate();
  const { t, isRtl } = useLanguage();

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      {/* Ambient glows */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -220,
          right: -180,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198,255,62,0.10), transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -260,
          left: -200,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,124,255,0.10), transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', py: { xs: 3, md: 5 } }}>
        {/* Top bar with back button and language selector */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Button
            onClick={() => navigate('/')}
            startIcon={<ArrowBackRoundedIcon />}
            sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main', backgroundColor: 'transparent' } }}
          >
            {t('common.back')}
          </Button>
          <LanguageSelector />
        </Stack>

        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 2 }}>
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'center' }}>
            <Logo />
          </Box>

          <Paper
            elevation={0}
            sx={{
              p: { xs: 3, sm: 5 },
              borderRadius: 4,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
            }}
          >
            <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
              {title}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 3.5 }}>
              {subtitle}
            </Typography>
            {children}
          </Paper>

          <Box sx={{ mt: 3, textAlign: 'center' }}>{footer}</Box>
        </Box>
      </Container>
    </Box>
  );
}
