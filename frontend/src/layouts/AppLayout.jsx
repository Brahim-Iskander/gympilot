import { useState, useRef } from 'react';

import { Outlet, useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';

import {
  AppBar,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Drawer,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
  TextField,
  InputAdornment,
  Popover,
  Paper,
  List as MuiList,
  ListItem as MuiListItem,
  ListItemText as MuiListItemText,
} from '@mui/material';

import {
  DashboardRounded,
  FitnessCenterRounded,
  ShowChartRounded,
  RestaurantRounded,
  FlagRounded,
  CalendarMonthRounded,
  EmojiEventsRounded,
  AnalyticsRounded,
  SettingsRounded,
  AdminPanelSettingsRounded,
  SupportAgentRounded,
  MenuRounded,
  LogoutRounded,
  NotificationsRounded,
  SearchRounded,
  DarkModeRounded,
  LightModeRounded,
  KeyboardArrowDownRounded,
  ConfirmationNumberRounded,
  CardMembershipRounded,
  AutoAwesomeRounded,
} from '@mui/icons-material';

import Logo from '../components/Logo';
import LanguageSelector from '../components/LanguageSelector';
import { useAuth } from '../context/AuthContext';
import { useThemeMode } from '../context/ThemeContext';
import { useLanguage } from '../i18n';

const SIDEBAR_WIDTH = 260;
const HEADER_HEIGHT = 64;

export default function AppLayout() {
  const theme = useTheme();
  const { t, isRtl } = useLanguage();

  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const location = useLocation();
  const navigate = useNavigate();

  const { user, isAdmin, isCoach, logout } = useAuth();
  const { mode, toggleTheme } = useThemeMode();

  const NAV_ITEMS = [
    {
      id: 'dashboard',
      label: t('nav.dashboard'),
      icon: <DashboardRounded />,
      path: '/dashboard',
    },
    {
      id: 'workouts',
      label: t('nav.workouts'),
      icon: <FitnessCenterRounded />,
      path: '/workouts',
    },
    {
      id: 'progress',
      label: t('nav.progress'),
      icon: <ShowChartRounded />,
      path: '/progress',
    },
    {
      id: 'nutrition',
      label: t('nav.nutrition'),
      icon: <RestaurantRounded />,
      path: '/nutrition',
    },
    {
      id: 'calories-calculator',
      label: 'AI Food Vision',
      icon: <AutoAwesomeRounded />,
      path: '/calories-calculator',
    },
    {
      id: 'goals',
      label: t('nav.goals'),
      icon: <FlagRounded />,
      path: '/goals',
    },
    {
      id: 'calendar',
      label: t('nav.calendar'),
      icon: <CalendarMonthRounded />,
      path: '/calendar',
    },
    {
      id: 'analytics',
      label: t('nav.analytics'),
      icon: <AnalyticsRounded />,
      path: '/analytics',
    },
  ];

  const ACCOUNT_ITEMS = [
    {
      id: 'membership',
      label: t('nav.membership', 'Membership'),
      icon: <CardMembershipRounded />,
      path: '/membership',
    },
    {
      id: 'support',
      label: 'Support Tickets',
      icon: <ConfirmationNumberRounded />,
      path: '/support',
    },
    {
      id: 'settings',
      label: t('nav.settings'),
      icon: <SettingsRounded />,
      path: '/settings',
    },
  ];

  const SEARCH_SUGGESTIONS = [
    {
      label: `${t('nav.workouts')}`,
      path: '/workouts',
      icon: <FitnessCenterRounded />,
    },
    {
      label: `${t('nav.progress')}`,
      path: '/progress',
      icon: <ShowChartRounded />,
    },
    {
      label: `${t('nav.nutrition')}`,
      path: '/nutrition',
      icon: <RestaurantRounded />,
    },
    {
      label: 'AI Calorie Calculator & Food Vision',
      path: '/calories-calculator',
      icon: <AutoAwesomeRounded />,
    },
    {
      label: `${t('nav.goals')}`,
      path: '/goals',
      icon: <FlagRounded />,
    },
    {
      label: `${t('nav.calendar')}`,
      path: '/calendar',
      icon: <CalendarMonthRounded />,
    },
    {
      label: `${t('nav.analytics')}`,
      path: '/analytics',
      icon: <AnalyticsRounded />,
    },
    {
      label: `${t('nav.membership', 'Membership')}`,
      path: '/membership',
      icon: <CardMembershipRounded />,
    },
    {
      label: `${t('nav.settings')}`,
      path: '/settings',
      icon: <SettingsRounded />,
    },
  ];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const searchInputRef = useRef(null);

  const currentPath = location.pathname;

  const handleNavClick = (path) => {
    navigate(path);

    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  const handleSettingsClick = () => {
    handleMenuClose();
    navigate('/settings');
  };

  const filteredSuggestions = searchQuery
    ? SEARCH_SUGGESTIONS.filter((item) =>
        item.label
          .toLowerCase()
          .includes(searchQuery.toLowerCase())
      ).slice(0, 6)
    : SEARCH_SUGGESTIONS.slice(0, 8);

  const handleSearchSelect = (path) => {
    navigate(path);
    setSearchQuery('');
    setSearchOpen(false);
    setSearchFocused(false);
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Escape') {
      setSearchOpen(false);
      setSearchFocused(false);
      searchInputRef.current?.blur();
    }

    if (e.key === 'Enter' && searchQuery.trim()) {
      const match = SEARCH_SUGGESTIONS.find(s => s.label.toLowerCase().includes(searchQuery.toLowerCase()));
      navigate(match ? match.path : '/workouts');

      setSearchQuery('');
      setSearchOpen(false);
      setSearchFocused(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setSearchOpen(true);
  };

  const handleSearchFocus = () => {
    setSearchFocused(true);
    setSearchOpen(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      setSearchFocused(false);
      setSearchOpen(false);
    }, 200);
  };

  const renderNavItems = (items) => (
    <List disablePadding sx={{ pt: 1 }}>
      {items.map((item) => {
        const isActive =
          currentPath === item.path ||
          currentPath.startsWith(`${item.path}/`);

        return (
          <ListItem
            key={item.id}
            disablePadding
            sx={{
              mb: 0.5,
              px: 1,
            }}
          >
            <ListItemButton
              onClick={() => handleNavClick(item.path)}
              selected={isActive}
              sx={{
                borderRadius: 2,
                minHeight: 48,
                px: 2,
                py: 1,

                color: isActive
                  ? 'primary.main'
                  : 'text.secondary',

                backgroundColor: isActive
                  ? 'rgba(198,255,62,0.1)'
                  : 'transparent',

                '&:hover': {
                  backgroundColor: isActive
                    ? 'rgba(198,255,62,0.15)'
                    : 'action.hover',

                  color: 'text.primary',
                },

                '& .MuiListItemIcon-root': {
                  minWidth: 40,

                  color: isActive
                    ? 'primary.main'
                    : 'text.secondary',
                },

                '& .MuiListItemText-primary': {
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                },

                transition: 'all 0.2s ease',
              }}
            >
              <ListItemIcon>
                {item.icon}
              </ListItemIcon>

              <ListItemText
                primary={item.label}
              />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );

  const renderGroupLabel = (label) => (
    <Typography
      variant="overline"
      color="text.secondary"
      sx={{
        px: 3,
        py: 1.5,
        textTransform: 'uppercase',
        letterSpacing: 1,
        fontWeight: 600,
        fontSize: '0.65rem',
      }}
    >
      {label}
    </Typography>
  );

  const sidebarStyle = {
    width: SIDEBAR_WIDTH,
    minWidth: SIDEBAR_WIDTH,
    maxWidth: SIDEBAR_WIDTH,

    bgcolor: 'background.paper',

    borderRight: isRtl ? 'none' : '1px solid',
    borderLeft: isRtl ? '1px solid' : 'none',
    borderColor: 'divider',

    backgroundImage: 'none',

    overflow: 'hidden',

    display: 'flex',
    flexDirection: 'column',
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        bgcolor: 'background.default',
      }}
    >
      {/* =========================
          SIDEBAR
      ========================== */}

      <Drawer
        anchor={isRtl ? 'right' : 'left'}
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? sidebarOpen : true}
        onClose={() => setSidebarOpen(false)}
        PaperProps={{
          sx: sidebarStyle,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            overflow: 'hidden',
          }}
        >
          {/* LOGO — height locked to HEADER_HEIGHT so its bottom
              border lines up exactly with the navbar's bottom border */}

          <Box
            sx={{
              px: {
                xs: 2,
                md: 3,
              },

              borderBottom: '1px solid',
              borderColor: 'divider',

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',

              height: HEADER_HEIGHT,
              minHeight: HEADER_HEIGHT,
              maxHeight: HEADER_HEIGHT,
              boxSizing: 'border-box',
            }}
          >
            <Logo size={32} />
          </Box>

          {/* NAVIGATION */}

          <Box
            sx={{
              flex: 1,
              overflow: 'auto',
            }}
          >
            {renderGroupLabel(t('common.appName'))}

            {renderNavItems(NAV_ITEMS)}

            <Divider
              sx={{
                mx: 1,
                my: 1,
              }}
            />

            {renderNavItems(
              isAdmin
                ? [
                    ...ACCOUNT_ITEMS,
                    {
                      id: 'admin',
                      label: t('nav.admin'),
                      icon: <AdminPanelSettingsRounded sx={{ color: 'error.main' }} />,
                      path: '/admin',
                    },
                  ]
                : isCoach
                ? [
                    ...ACCOUNT_ITEMS,
                    {
                      id: 'coach-desk',
                      label: 'Coach Live Desk',
                      icon: <SupportAgentRounded sx={{ color: '#8A7CFF' }} />,
                      path: '/admin/coach-chat',
                    },
                  ]
                : ACCOUNT_ITEMS,
            )}
          </Box>

          {/* USER */}

          <Divider />

          <Box
            sx={{
              p: 2,

              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Stack spacing={1.5}>
              <ListItemButton
                onClick={handleProfileClick}
                sx={{
                  borderRadius: 2,
                  px: 1.5,
                  py: 1,
                  minWidth: 0,
                  maxWidth: '100%',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    color: 'text.primary',
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 44 }}>
                  <Avatar
                    src={user?.avatar}
                    variant="rounded"
                    sx={{
                      width: 36,
                      height: 36,
                    }}
                  >
                    {user?.firstName
                      ?.charAt(0)
                      ?.toUpperCase()}
                  </Avatar>
                </ListItemIcon>

                <ListItemText
                  sx={{
                    minWidth: 0,
                    overflow: 'hidden',
                    my: 0,
                  }}
                  primary={
                    <Stack direction="row" alignItems="center" spacing={1} sx={{ minWidth: 0, overflow: 'hidden' }}>
                      <Typography
                        variant="body2"
                        noWrap
                        title={`${user?.firstName || ''} ${user?.lastName || ''}`.trim()}
                        sx={{
                          fontWeight: 700,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {user?.firstName}{' '}
                        {user?.lastName}
                      </Typography>
                      <Chip
                        label={`${user?.points ?? 0} pts`}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: '0.68rem',
                          fontWeight: 800,
                          bgcolor: 'rgba(198, 255, 62, 0.15)',
                          color: '#C6FF3E',
                          border: '1px solid rgba(198, 255, 62, 0.3)',
                          flexShrink: 0,
                        }}
                      />
                    </Stack>
                  }
                  secondary={
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      title={user?.email}
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {user?.email}
                    </Typography>
                  }
                />
              </ListItemButton>

              <Button
                fullWidth
                variant="outlined"
                startIcon={
                  <LogoutRounded fontSize="small" />
                }
                onClick={handleLogout}
                sx={{
                  fontSize: '0.8rem',
                  py: 0.75,
                }}
              >
                {t('nav.logout')}
              </Button>
            </Stack>
          </Box>
        </Box>
      </Drawer>

      {/* =========================
          MAIN AREA
      ========================== */}

      <Box
        sx={{
          flex: 1,
          minWidth: 0,

          width: {
            xs: '100%',
            md: `calc(100% - ${SIDEBAR_WIDTH}px)`,
          },

          ml: isRtl
            ? 0
            : {
                xs: 0,
                md: `${SIDEBAR_WIDTH}px`,
              },

          mr: isRtl
            ? {
                xs: 0,
                md: `${SIDEBAR_WIDTH}px`,
              }
            : 0,

          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* =========================
            TOP NAVBAR
        ========================== */}

        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            top: 0,

            left: isRtl
              ? 0
              : {
                  xs: 0,
                  md: `${SIDEBAR_WIDTH}px`,
                },

            right: isRtl
              ? {
                  xs: 0,
                  md: `${SIDEBAR_WIDTH}px`,
                }
              : 0,

            width: {
              xs: '100%',
              md: `calc(100% - ${SIDEBAR_WIDTH}px)`,
            },

            zIndex: (theme) =>
              theme.zIndex.drawer + 1,

            bgcolor: 'background.paper',

            color: 'text.primary',

            borderBottom: '1px solid',
            borderColor: 'divider',

            backdropFilter: 'blur(14px)',
          }}
        >
          <Container
            maxWidth="xl"
            sx={{
              px: {
                xs: 2,
                md: 3,
              },
            }}
          >
            <Toolbar
              disableGutters
              sx={{
                minHeight: `${HEADER_HEIGHT}px !important`,
                height: HEADER_HEIGHT,
              }}
            >
              {/* MOBILE MENU */}

              {isMobile && (
                <IconButton
                  onClick={() =>
                    setSidebarOpen(true)
                  }
                  sx={{
                    mr: isRtl ? 0 : 1,
                    ml: isRtl ? 1 : 0,
                    color: 'text.primary',
                  }}
                >
                  <MenuRounded />
                </IconButton>
              )}

              <Box
                sx={{
                  flex: 1,

                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'flex-end',

                  gap: 1.5,
                }}
              >
                {/* SEARCH */}

                <Box
                  sx={{
                    position: 'relative',

                    display: {
                      xs: 'none',
                      md: 'block',
                    },
                  }}
                >
                  <TextField
                    inputRef={searchInputRef}
                    type="search"
                    placeholder="Search exercises, workouts, meals..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onKeyDown={handleSearchKeyDown}
                    size="small"
                    variant="outlined"
                    sx={{
                      width: searchFocused
                        ? 360
                        : 280,

                      transition:
                        'width 0.25s ease',

                      '& .MuiOutlinedInput-root': {
                        bgcolor:
                          'background.elevated',

                        borderRadius: 3,

                        '& fieldset': {
                          borderColor:
                            searchFocused
                              ? 'primary.main'
                              : 'divider',
                        },

                        '&:hover fieldset': {
                          borderColor:
                            searchFocused
                              ? 'primary.main'
                              : 'text.secondary',
                        },

                        '&.Mui-focused fieldset': {
                          borderColor:
                            'primary.main',
                          borderWidth: 2,
                        },

                        '& input': {
                          px: 1,

                          py: 1,

                          color: 'text.primary',

                          '&::placeholder': {
                            color:
                              'text.secondary',
                            opacity: 0.6,
                          },
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchRounded
                            sx={{
                              color:
                                searchFocused
                                  ? 'primary.main'
                                  : 'text.secondary',

                              ml: 1,
                            }}
                          />
                        </InputAdornment>
                      ),

                      endAdornment:
                        searchQuery ? (
                          <InputAdornment position="end">
                            <IconButton
                              size="small"
                              onClick={() =>
                                setSearchQuery('')
                              }
                            >
                              <KeyboardArrowDownRounded
                                sx={{
                                  transform:
                                    'rotate(180deg)',
                                }}
                              />
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                    }}
                  />

                  {/* SEARCH RESULTS */}

                  {searchOpen && searchFocused && (
                    <Paper
                      elevation={8}
                      onMouseDown={(e) => e.preventDefault()}
                      sx={{
                        position: 'absolute',
                        top: 'calc(100% + 8px)',
                        left: 0,
                        right: 0,
                        minWidth: 320,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 2,
                        boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                        zIndex: 1400,
                      }}
                    >
                      <Box sx={{ p: 1 }}>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                              px: 1,
                              pb: 1,
                              display: 'block',

                              textTransform:
                                'uppercase',

                              letterSpacing: 1,

                              fontWeight: 600,
                            }}
                          >
                            Quick Links
                          </Typography>

                          <MuiList
                            disablePadding
                            dense
                          >
                            {filteredSuggestions.map(
                              (item) => (
                                <MuiListItem
                                  key={item.label}
                                  button
                                  onClick={() =>
                                    handleSearchSelect(
                                      item.path
                                    )
                                  }
                                  sx={{
                                    borderRadius: 1,
                                    px: 1.5,
                                    py: 0.75,

                                    '&:hover': {
                                      bgcolor:
                                        'action.hover',
                                    },
                                  }}
                                >
                                  <ListItemIcon
                                    sx={{
                                      minWidth: 36,
                                      color:
                                        'text.secondary',
                                    }}
                                  >
                                    {item.icon}
                                  </ListItemIcon>

                                  <MuiListItemText
                                    primary={
                                      item.label
                                    }
                                    primaryTypographyProps={{
                                      variant:
                                        'body2',
                                      fontWeight: 500,
                                    }}
                                  />
                                </MuiListItem>
                              )
                            )}
                          </MuiList>

                          {searchQuery &&
                            filteredSuggestions.length ===
                              0 && (
                              <Box
                                sx={{
                                  px: 1.5,
                                  py: 2,
                                  textAlign:
                                    'center',
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  No results for "
                                  {searchQuery}"
                                </Typography>

                                <Button
                                  size="small"
                                  onClick={() =>
                                    navigate(
                                      `/search?q=${encodeURIComponent(
                                        searchQuery
                                      )}`
                                    )
                                  }
                                  sx={{
                                    mt: 1,
                                  }}
                                >
                                  Search all
                                </Button>
                              </Box>
                            )}
                        </Box>
                      </Paper>
                    )}
                </Box>

                {/* LANGUAGE SELECTOR */}
                <LanguageSelector />

                {/* THEME */}

                <Tooltip
                  title={
                    mode === 'dark'
                      ? t('nav.lightMode')
                      : t('nav.darkMode')
                  }
                >
                  <IconButton
                    onClick={toggleTheme}
                    sx={{
                      color: 'text.secondary',

                      '&:hover': {
                        color: 'text.primary',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {mode === 'dark' ? (
                      <LightModeRounded />
                    ) : (
                      <DarkModeRounded />
                    )}
                  </IconButton>
                </Tooltip>

                {/* USER REWARD POINTS */}
                <Tooltip title="Reward Points & Referrals">
                  <Button
                    component={RouterLink}
                    to="/dashboard/profile?tab=referrals"
                    size="small"
                    startIcon={<EmojiEventsRounded sx={{ color: '#FFD700', fontSize: 18 }} />}
                    sx={{
                      bgcolor: 'rgba(198, 255, 62, 0.1)',
                      color: 'text.primary',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      borderRadius: 2,
                      border: '1px solid rgba(198, 255, 62, 0.25)',
                      px: 1.5,
                      py: 0.5,
                      mr: 1.5,
                      display: { xs: 'none', sm: 'inline-flex' },
                      '&:hover': {
                        bgcolor: 'rgba(198, 255, 62, 0.18)',
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    {user?.points ?? 0} pts
                  </Button>
                </Tooltip>

                {/* USER */}

                <Tooltip title={t('nav.profile')}>
                  <IconButton
                    onClick={handleProfileClick}
                    sx={{
                      color: 'text.secondary',

                      '&:hover': {
                        color: 'text.primary',
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    <Avatar
                      src={user?.avatar}
                      variant="rounded"
                      sx={{
                        width: 32,
                        height: 32,
                      }}
                    >
                      {user?.firstName
                        ?.charAt(0)
                        ?.toUpperCase()}
                    </Avatar>
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </Container>
        </AppBar>

        {/* =========================
            PAGE CONTENT
        ========================== */}

        <Box
          component="main"
          sx={{
            flex: 1,

            width: '100%',

            minWidth: 0,

            minHeight: '100vh',

            bgcolor: 'background.default',

            color: 'text.primary',
          }}
        >
          {/* IMPORTANT:
              This Toolbar creates real space
              underneath the fixed AppBar.
          */}

          <Toolbar
            sx={{
              minHeight: `${HEADER_HEIGHT}px !important`,
            }}
          />

          <Container
            maxWidth="xl"
            sx={{
              width: '100%',

              px: {
                xs: 2,
                sm: 3,
                md: 4,
              },

              py: {
                xs: 3,
                md: 4,
              },
            }}
          >
            <Outlet />
          </Container>
        </Box>
      </Box>

      {/* =========================
          PROFILE MENU
      ========================== */}

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{
          horizontal: 'right',
          vertical: 'top',
        }}
        anchorOrigin={{
          horizontal: 'right',
          vertical: 'bottom',
        }}
        PaperProps={{
          sx: {
            borderRadius: 3,

            border: '1px solid',
            borderColor: 'divider',

            bgcolor: 'background.paper',

            minWidth: 200,

            boxShadow:
              '0 20px 50px rgba(0,0,0,0.4)',
          },
        }}
      >
        <MenuItem
          onClick={handleSettingsClick}
          sx={{ py: 1.25 }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <SettingsRounded
              fontSize="small"
              color="action"
            />

            <Typography variant="body2">
              {t('nav.settings')}
            </Typography>
          </Stack>
        </MenuItem>

        <Divider />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1.25,
            color: 'error.main',
          }}
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
          >
            <LogoutRounded
              fontSize="small"
              color="error"
            />

            <Typography
              variant="body2"
              color="error.main"
            >
              {t('nav.logout')}
            </Typography>
          </Stack>
        </MenuItem>
      </Menu>
    </Box>
  );
}