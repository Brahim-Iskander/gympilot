import { useState, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Collapse,
  Chip,
  Tooltip,
  keyframes,
} from '@mui/material';
import {
  CloseRounded,
  LocalFireDepartmentRounded,
  CampaignRounded,
  ContentCopyRounded,
  CheckRounded,
  ArrowForwardRounded,
  AccessTimeRounded,
  LocalOfferRounded,
} from '@mui/icons-material';
import { announcementService } from '../services/announcementService';

/* ── Keyframe Animations ─────────────────────────────────────── */

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const beaconPulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 255, 62, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(198, 255, 62, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 255, 62, 0); }
`;

const DISMISSED_KEY = 'gympilot_dismissed_announcements';

const TYPE_CONFIG = {
  SUCCESS: {
    primary: '#C6FF3E',
    border: 'rgba(198, 255, 62, 0.35)',
    borderHover: '#C6FF3E',
    bg: 'linear-gradient(135deg, rgba(198, 255, 62, 0.12) 0%, rgba(0, 230, 118, 0.05) 50%, rgba(13, 17, 23, 0.95) 100%)',
    btnBg: '#C6FF3E',
    btnColor: '#0A0C0F',
    btnHover: '#d7ff6e',
    badgeLabel: 'OFFRE DU MOMENT',
    glowColor: 'rgba(198, 255, 62, 0.25)',
    icon: <LocalFireDepartmentRounded sx={{ fontSize: 17, color: '#C6FF3E' }} />,
  },
  WARNING: {
    primary: '#FFB800',
    border: 'rgba(255, 184, 0, 0.35)',
    borderHover: '#FFB800',
    bg: 'linear-gradient(135deg, rgba(255, 184, 0, 0.12) 0%, rgba(255, 145, 0, 0.05) 50%, rgba(13, 17, 23, 0.95) 100%)',
    btnBg: '#FFB800',
    btnColor: '#0A0C0F',
    btnHover: '#ffc933',
    badgeLabel: 'OFFRE LIMITÉE',
    glowColor: 'rgba(255, 184, 0, 0.25)',
    icon: <LocalOfferRounded sx={{ fontSize: 17, color: '#FFB800' }} />,
  },
  DANGER: {
    primary: '#FF3366',
    border: 'rgba(255, 51, 102, 0.35)',
    borderHover: '#FF3366',
    bg: 'linear-gradient(135deg, rgba(255, 51, 102, 0.12) 0%, rgba(255, 82, 82, 0.05) 50%, rgba(13, 17, 23, 0.95) 100%)',
    btnBg: '#FF3366',
    btnColor: '#FFFFFF',
    btnHover: '#ff5c85',
    badgeLabel: 'DERNIÈRE CHANCE',
    glowColor: 'rgba(255, 51, 102, 0.25)',
    icon: <CampaignRounded sx={{ fontSize: 17, color: '#FF3366' }} />,
  },
};

function getDismissed() {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_KEY) || '[]');
  } catch {
    return [];
  }
}

function setDismissed(ids) {
  try {
    localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
  } catch {}
}

function extractCoupon(text) {
  if (!text) return null;
  const match = text.match(/\b(?:code|promo|voucher)\s+([A-Z0-9_-]{3,20})\b/i);
  return match ? match[1].toUpperCase() : null;
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissedState] = useState(getDismissed);
  const [copiedCode, setCopiedCode] = useState('');

  useEffect(() => {
    announcementService
      .getActive()
      .then((data) => setAnnouncements(data || []))
      .catch(() => {});
  }, []);

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    setDismissedState(next);
    setDismissed(next);
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  const visible = announcements.filter(
    (a) => !dismissed.includes(a.id) && (!a.expiresAt || new Date(a.expiresAt) > new Date())
  );

  if (visible.length === 0) return null;

  return (
    <Box sx={{ width: '100%', position: 'relative', zIndex: 1100 }}>
      {visible.map((ann) => {
        const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.SUCCESS;
        const coupon = extractCoupon(ann.message);

        return (
          <Collapse in key={ann.id}>
            <Box
              sx={{
                width: '100%',
                position: 'relative',
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? cfg.bg
                    : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.95) 100%)',
                borderBottom: '1px solid',
                borderColor: cfg.border,
                backdropFilter: 'blur(16px)',
                py: { xs: 1.25, sm: 1.5 },
                px: { xs: 2, sm: 3 },
                boxShadow: `0 4px 20px ${cfg.glowColor}`,
                overflow: 'hidden',
              }}
            >
              {/* Top animated light beam */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  background: `linear-gradient(90deg, transparent 0%, ${cfg.primary} 50%, transparent 100%)`,
                  backgroundSize: '200% 100%',
                  animation: `${shimmer} 3s linear infinite`,
                }}
              />

              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
                spacing={{ xs: 1.5, sm: 2 }}
                sx={{ maxWidth: 1400, mx: 'auto' }}
              >
                {/* Left: Badge + Message */}
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Chip
                    icon={cfg.icon}
                    label={
                      <Stack direction="row" alignItems="center" spacing={0.6}>
                        <Box
                          sx={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            bgcolor: cfg.primary,
                            animation: `${beaconPulse} 2s infinite`,
                          }}
                        />
                        <span>{cfg.badgeLabel}</span>
                      </Stack>
                    }
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.06)',
                      border: '1px solid',
                      borderColor: cfg.border,
                      color: cfg.primary,
                      fontWeight: 800,
                      fontSize: '0.72rem',
                      letterSpacing: '0.4px',
                      flexShrink: 0,
                    }}
                  />

                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      fontSize: { xs: '0.85rem', sm: '0.92rem' },
                      color: 'text.primary',
                      lineHeight: 1.4,
                    }}
                  >
                    {ann.message}
                  </Typography>
                </Stack>

                {/* Right: Coupon + Link + Close */}
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1.25}
                  sx={{ flexShrink: 0, width: { xs: '100%', sm: 'auto' }, justifyContent: { xs: 'space-between', sm: 'flex-end' } }}
                >
                  {coupon && (
                    <Tooltip
                      title={copiedCode === coupon ? 'Copié ! 🎉' : 'Copier le code'}
                      arrow
                    >
                      <Button
                        onClick={() => handleCopy(coupon)}
                        size="small"
                        startIcon={
                          copiedCode === coupon ? (
                            <CheckRounded sx={{ fontSize: 16, color: '#00E676' }} />
                          ) : (
                            <ContentCopyRounded sx={{ fontSize: 15 }} />
                          )
                        }
                        sx={{
                          textTransform: 'none',
                          fontWeight: 800,
                          fontSize: '0.8rem',
                          fontFamily: 'monospace',
                          bgcolor: copiedCode === coupon ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.08)',
                          border: '1.5px dashed',
                          borderColor: copiedCode === coupon ? '#00E676' : cfg.primary,
                          color: copiedCode === coupon ? '#00E676' : cfg.primary,
                          borderRadius: 2,
                          px: 1.5,
                          py: 0.4,
                        }}
                      >
                        {coupon}
                      </Button>
                    </Tooltip>
                  )}

                  {ann.linkUrl && (
                    <Button
                      component={ann.linkUrl.startsWith('http') ? 'a' : RouterLink}
                      to={!ann.linkUrl.startsWith('http') ? ann.linkUrl : undefined}
                      href={ann.linkUrl.startsWith('http') ? ann.linkUrl : undefined}
                      target={ann.linkUrl.startsWith('http') ? '_blank' : undefined}
                      rel={ann.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                      size="small"
                      endIcon={<ArrowForwardRounded sx={{ fontSize: 16 }} />}
                      sx={{
                        flexShrink: 0,
                        textTransform: 'none',
                        fontWeight: 800,
                        fontSize: '0.8rem',
                        color: cfg.btnColor,
                        bgcolor: cfg.btnBg,
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        whiteSpace: 'nowrap',
                        boxShadow: `0 4px 14px ${cfg.glowColor}`,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                          bgcolor: cfg.btnHover,
                          transform: 'scale(1.02)',
                        },
                      }}
                    >
                      {ann.linkLabel || 'Découvrir'}
                    </Button>
                  )}

                  <Tooltip title="Fermer" arrow>
                    <IconButton
                      size="small"
                      onClick={() => handleDismiss(ann.id)}
                      sx={{
                        color: 'text.secondary',
                        opacity: 0.7,
                        p: 0.5,
                        '&:hover': { opacity: 1, color: cfg.primary, bgcolor: 'rgba(255,255,255,0.08)' },
                      }}
                    >
                      <CloseRounded sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Stack>
            </Box>
          </Collapse>
        );
      })}
    </Box>
  );
}
