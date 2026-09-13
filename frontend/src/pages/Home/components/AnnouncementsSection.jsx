import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  IconButton,
  Stack,
  Chip,
  Fade,
  keyframes,
} from '@mui/material';
import {
  CampaignRounded,
  ArrowForwardRounded,
  CloseRounded,
  NewReleasesRounded,
} from '@mui/icons-material';
import { announcementService } from '../../../services/announcementService';

/* ── Animations ─────────────────────────────────────────────── */

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.8; }
`;

const slideInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

/* ── Type Configuration ─────────────────────────────────────── */

const TYPE_CONFIG = {
  SUCCESS: {
    gradient: 'linear-gradient(135deg, rgba(46,204,113,0.12) 0%, rgba(39,174,96,0.06) 100%)',
    borderColor: 'rgba(46,204,113,0.25)',
    accentColor: '#2ecc71',
    glowColor: 'rgba(46,204,113,0.15)',
    chipBg: 'rgba(46,204,113,0.12)',
    chipBorder: 'rgba(46,204,113,0.3)',
  },
  WARNING: {
    gradient: 'linear-gradient(135deg, rgba(241,196,15,0.12) 0%, rgba(243,156,18,0.06) 100%)',
    borderColor: 'rgba(241,196,15,0.25)',
    accentColor: '#f1c40f',
    glowColor: 'rgba(241,196,15,0.15)',
    chipBg: 'rgba(241,196,15,0.12)',
    chipBorder: 'rgba(241,196,15,0.3)',
  },
  DANGER: {
    gradient: 'linear-gradient(135deg, rgba(231,76,60,0.12) 0%, rgba(192,57,43,0.06) 100%)',
    borderColor: 'rgba(231,76,60,0.25)',
    accentColor: '#e74c3c',
    glowColor: 'rgba(231,76,60,0.15)',
    chipBg: 'rgba(231,76,60,0.12)',
    chipBorder: 'rgba(231,76,60,0.3)',
  },
};

/* ── LocalStorage helpers ───────────────────────────────────── */

const DISMISSED_KEY = 'gympilot_dismissed_home_announcements';

function getDismissed() {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDismissed(ids) {
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
}

/* ── Single Announcement Card ──────────────────────────────── */

function AnnouncementCard({ announcement, index, onDismiss }) {
  const cfg = TYPE_CONFIG[announcement.type] || TYPE_CONFIG.SUCCESS;

  return (
    <Box
      sx={{
        position: 'relative',
        animation: `${slideInUp} 0.5s ease-out both`,
        animationDelay: `${index * 100}ms`,
      }}
    >
      <Box
        sx={{
          position: 'relative',
          background: cfg.gradient,
          border: '1px solid',
          borderColor: cfg.borderColor,
          borderRadius: 3,
          p: { xs: 2, sm: 2.5 },
          overflow: 'hidden',
          transition: 'all 0.3s ease',
          '&:hover': {
            borderColor: cfg.accentColor,
            transform: 'translateY(-2px)',
            boxShadow: `0 8px 32px ${cfg.glowColor}`,
          },
        }}
      >
        {/* Top shimmer line */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: `linear-gradient(90deg, transparent, ${cfg.accentColor}, transparent)`,
            backgroundSize: '200% 100%',
            animation: `${shimmer} 3s linear infinite`,
          }}
        />

        {/* Glow orb */}
        <Box
          sx={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${cfg.glowColor} 0%, transparent 70%)`,
            animation: `${pulseGlow} 3s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          spacing={{ xs: 1.5, sm: 2 }}
          sx={{ position: 'relative', zIndex: 1 }}
        >
          {/* Left accent bar */}
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              bottom: 0,
              width: 3,
              borderRadius: '3px 0 0 3px',
              bgcolor: cfg.accentColor,
            }}
          />

          {/* Message */}
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              fontSize: { xs: '0.85rem', sm: '0.9rem' },
              color: 'text.primary',
              flex: 1,
              lineHeight: 1.5,
            }}
          >
            {announcement.message}
          </Typography>

          {/* Action + Close */}
          <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
            {announcement.linkUrl && (
              <Button
                size="small"
                endIcon={<ArrowForwardRounded sx={{ fontSize: '16px !important' }} />}
                href={announcement.linkUrl}
                target={announcement.linkUrl.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                sx={{
                  textTransform: 'none',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  color: cfg.accentColor,
                  bgcolor: cfg.chipBg,
                  border: '1px solid',
                  borderColor: cfg.chipBorder,
                  borderRadius: 2,
                  px: 2,
                  py: 0.5,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    bgcolor: cfg.accentColor,
                    color: '#0A0C0F',
                    borderColor: cfg.accentColor,
                    transform: 'scale(1.03)',
                  },
                }}
              >
                {announcement.linkLabel || 'Learn More'}
              </Button>
            )}
            <IconButton
              size="small"
              onClick={() => onDismiss(announcement.id)}
              sx={{
                color: 'text.secondary',
                opacity: 0.6,
                transition: 'all 0.2s ease',
                '&:hover': {
                  opacity: 1,
                  bgcolor: 'rgba(255,255,255,0.06)',
                },
              }}
            >
              <CloseRounded sx={{ fontSize: 18 }} />
            </IconButton>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

/* ── Main Section Component ────────────────────────────────── */

export default function AnnouncementsSection() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissedState] = useState(getDismissed);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    announcementService
      .getActive()
      .then((data) => {
        setAnnouncements(data || []);
        setLoaded(true);
      })
      .catch(() => setLoaded(true));
  }, []);

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    setDismissedState(next);
    saveDismissed(next);
  };

  const visible = announcements.filter(
    (a) => !dismissed.includes(a.id) && (!a.expiresAt || new Date(a.expiresAt) > new Date())
  );

  if (!loaded || visible.length === 0) return null;

  return (
    <Fade in timeout={600}>
      <Box
        component="section"
        aria-label="Announcements"
        sx={{
          position: 'relative',
          py: { xs: 3, md: 4 },
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(10, 12, 15, 0.95)'
              : 'rgba(248, 250, 252, 0.95)',
          borderTop: '1px solid',
          borderBottom: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        {/* Subtle background pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.03,
            backgroundImage:
              'radial-gradient(circle at 25% 25%, rgba(198,255,62,0.5) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(138,124,255,0.5) 0%, transparent 50%)',
            pointerEvents: 'none',
          }}
        />

        <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
          {/* Section header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={1.5}
            sx={{ mb: 2.5 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: 1.5,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(198,255,62,0.1)'
                    : 'rgba(58,125,26,0.1)',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(198,255,62,0.25)'
                    : 'rgba(58,125,26,0.2)',
              }}
            >
              <CampaignRounded
                sx={{
                  fontSize: 18,
                  color: 'primary.main',
                }}
              />
            </Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 800,
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'text.secondary',
              }}
            >
              Announcements
            </Typography>
            <Chip
              icon={<NewReleasesRounded sx={{ fontSize: '14px !important' }} />}
              label={`${visible.length} NEW`}
              size="small"
              sx={{
                height: 22,
                fontSize: '0.6rem',
                fontWeight: 800,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(198,255,62,0.1)'
                    : 'rgba(58,125,26,0.1)',
                color: 'primary.main',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(198,255,62,0.25)'
                    : 'rgba(58,125,26,0.2)',
                '& .MuiChip-icon': { color: 'primary.main' },
              }}
            />
          </Stack>

          {/* Announcement cards */}
          <Stack spacing={1.5}>
            {visible.map((ann, idx) => (
              <AnnouncementCard
                key={ann.id}
                announcement={ann}
                index={idx}
                onDismiss={handleDismiss}
              />
            ))}
          </Stack>
        </Container>
      </Box>
    </Fade>
  );
}
