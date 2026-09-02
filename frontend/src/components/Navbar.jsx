import { useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import {
  AppBar,
  Box,
  Button,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuRoundedIcon from '@mui/icons-material/MenuRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import LogoutRoundedIcon from '@mui/icons-material/LogoutRounded';
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import CardGiftcardRoundedIcon from '@mui/icons-material/CardGiftcardRounded';
import EmojiEventsRoundedIcon from '@mui/icons-material/EmojiEventsRounded';

import Logo from './Logo';
import LanguageSelector from './LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useLanguage } from '../i18n';
import { navigateThenScroll } from '../utils/navigation';

const FEATURES_SECTION_ID = 'features';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();
  const { t, isRtl } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeDrawer = () => setDrawerOpen(false);
  const goFeatures = () => {
    closeDrawer();
    navigateThenScroll(navigate, location.pathname, FEATURES_SECTION_ID);
  };

  const navLinks = [
    { label: t('nav.features'), onClick: goFeatures },
  ];

  const authNavLinks = isAuthenticated
    ? [{ label: t('nav.dashboard'), to: '/dashboard', onClick: closeDrawer }]
    : [];

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? (mode === 'dark' ? 'rgba(10,12,15,0.82)' : 'rgba(248,250,252,0.82)') : 'transparent',
          backdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: '1px solid',
          borderColor: scrolled ? 'divider' : 'transparent',
          transition: 'background-color .3s ease, border-color .3s ease',
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 76 } }}>
            <Logo />

            {/* Desktop navigation */}
            <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: isRtl ? 0 : 'auto', mr: isRtl ? 'auto' : 0, display: { xs: 'none', md: 'flex' } }}>
              {[...navLinks, ...authNavLinks].map((link) => (
                <Button
                  key={link.label}
                  component={RouterLink}
                  to={link.to}
                  onClick={link.onClick}
                  sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary', backgroundColor: 'transparent' } }}
                >
                  {link.label}
                </Button>
              ))}

              {/* Language selector */}
              <LanguageSelector />

              {/* Theme toggle */}
              <Tooltip title={mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}>
                <IconButton onClick={toggleTheme} size="small" sx={{ border: '1px solid', borderColor: 'divider', color: 'text.primary' }} aria-label={mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}>
                  {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
                </IconButton>
              </Tooltip>

              {isAuthenticated ? (
                <>
                  <Tooltip title="Your Rewards & Referrals">
                    <Button
                      component={RouterLink}
                      to="/dashboard/profile?tab=referrals"
                      size="small"
                      startIcon={<EmojiEventsRoundedIcon sx={{ color: '#FFD700', fontSize: 18 }} />}
                      sx={{
                        bgcolor: 'rgba(198, 255, 62, 0.1)',
                        color: 'text.primary',
                        fontWeight: 800,
                        fontSize: '0.82rem',
                        borderRadius: 2,
                        border: '1px solid rgba(198, 255, 62, 0.25)',
                        px: 1.5,
                        py: 0.6,
                        '&:hover': {
                          bgcolor: 'rgba(198, 255, 62, 0.18)',
                          borderColor: 'primary.main',
                        },
                      }}
                    >
                      {user?.points ?? 0} pts
                    </Button>
                  </Tooltip>
                  <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
                    {t('nav.welcomeUser', { name: user?.firstName || 'Athlete' })}
                  </Typography>
                  <Tooltip title={t('nav.signOut')}>
                    <IconButton onClick={logout} size="small" sx={{ border: '1px solid', borderColor: 'divider' }} aria-label={t('nav.signOut')}>
                      <LogoutRoundedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" sx={{ color: 'text.secondary', '&:hover': { color: 'text.primary', backgroundColor: 'transparent' } }}>
                    {t('nav.login')}
                  </Button>
                  <Button component={RouterLink} to="/register" variant="contained">
                    {t('nav.register')}
                  </Button>
                </>
              )}
            </Stack>

            {/* Mobile menu trigger */}
            <IconButton
              onClick={() => setDrawerOpen(true)}
              sx={{ ml: isRtl ? 0 : 'auto', mr: isRtl ? 'auto' : 0, display: { xs: 'inline-flex', md: 'none' }, color: 'text.primary' }}
              aria-label="Open menu"
            >
              <MenuRoundedIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile / tablet drawer */}
      <Drawer
        anchor={isRtl ? 'left' : 'right'}
        open={drawerOpen}
        onClose={closeDrawer}
        PaperProps={{ sx: { bgcolor: 'background.default', width: 300, p: 2.5, backgroundImage: 'none' } }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
          <Logo />
          <IconButton onClick={closeDrawer} aria-label="Close menu">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>

        <List disablePadding>
          {[...navLinks, ...authNavLinks].map((link) => (
            <ListItem key={link.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={RouterLink}
                to={link.to}
                onClick={link.onClick}
                sx={{ borderRadius: 2 }}
              >
                <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 600 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>

        <Divider sx={{ my: 2.5 }} />

        {/* Language selector in drawer */}
        <Box sx={{ px: 1, mb: 1.5 }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1, fontWeight: 700 }}>
            {t('nav.language')}
          </Typography>
          <LanguageSelector variant="chips" />
        </Box>

        {/* Theme toggle in drawer */}
        <Box sx={{ px: 1, mb: 1 }}>
          <Tooltip title={mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}>
            <IconButton onClick={toggleTheme} size="small" sx={{ border: '1px solid', borderColor: 'divider', width: '100%', justifyContent: 'center', color: 'text.primary' }} aria-label={mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}>
              <Stack direction="row" spacing={1} alignItems="center">
                {mode === 'dark' ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {mode === 'dark' ? t('nav.lightMode') : t('nav.darkMode')}
                </Typography>
              </Stack>
            </IconButton>
          </Tooltip>
        </Box>

        <Divider sx={{ my: 1 }} />

        {isAuthenticated ? (
          <Stack spacing={2}>
            <Button
              component={RouterLink}
              to="/dashboard/profile?tab=referrals"
              onClick={closeDrawer}
              variant="outlined"
              startIcon={<EmojiEventsRoundedIcon sx={{ color: '#FFD700' }} />}
              sx={{
                fontWeight: 700,
                borderColor: 'rgba(198, 255, 62, 0.3)',
                color: 'text.primary',
                bgcolor: 'rgba(198, 255, 62, 0.05)',
                justifyContent: 'flex-start',
              }}
            >
              Reward Points: {user?.points ?? 0} pts
            </Button>
            <Typography variant="body2" color="text.secondary" sx={{ px: 1 }}>
              {t('nav.signedInAs', { name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() })}
            </Typography>
            <Button fullWidth variant="outlined" startIcon={<LogoutRoundedIcon />} onClick={() => { closeDrawer(); logout(); }}>
              {t('nav.logout')}
            </Button>
          </Stack>
        ) : (
          <Stack spacing={1.5}>
            <Button fullWidth component={RouterLink} to="/login" variant="outlined" onClick={closeDrawer}>
              {t('nav.login')}
            </Button>
            <Button fullWidth component={RouterLink} to="/register" variant="contained" onClick={closeDrawer}>
              {t('nav.register')}
            </Button>
          </Stack>
        )}
      </Drawer>
    </>
  );
}