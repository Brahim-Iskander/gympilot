import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { Box, Container, Divider, Grid, Link, Stack, Typography } from '@mui/material';

import Logo from './Logo';
import { useLanguage } from '../i18n';
import { navigateThenScroll } from '../utils/navigation';

export default function Footer() {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const links = [
    { label: t('nav.features'), action: () => navigateThenScroll(navigate, location.pathname, 'features') },
    { label: t('nav.login'), to: '/login' },
    { label: t('nav.register'), to: '/register' },
  ];

  return (
    <Box component="footer" sx={{ borderTop: '1px solid', borderColor: 'divider', mt: { xs: 10, md: 16 }, py: { xs: 6, md: 8 }, bgcolor: 'rgba(255,255,255,0.015)' }}>
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <Logo />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 2, lineHeight: 1.9 }}>
              {t('home.heroSubtitle')}
            </Typography>
          </Grid>

          <Grid item xs={12} md={5}>
            <Typography variant="overline" color="text.secondary">
              {t('common.appName')}
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              {links.map((link) =>
                link.to ? (
                  <Link key={link.label} component={RouterLink} to={link.to} color="text.secondary" sx={{ width: 'fit-content', '&:hover': { color: 'primary.main' } }}>
                    {link.label}
                  </Link>
                ) : (
                  <Link key={link.label} component="button" type="button" onClick={link.action} color="text.secondary" sx={{ width: 'fit-content', textAlign: 'left', cursor: 'pointer', '&:hover': { color: 'primary.main' } }}>
                    {link.label}
                  </Link>
                ),
              )}
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ my: 4 }} />

        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} GymPilot. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
}
