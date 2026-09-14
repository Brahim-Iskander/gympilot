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
  Fade,
  keyframes,
} from '@mui/material';
import {
  LocalFireDepartmentRounded,
  CampaignRounded,
  ContentCopyRounded,
  CheckRounded,
  ArrowForwardRounded,
  CloseRounded,
  AccessTimeRounded,
  AutoAwesomeRounded,
  LocalOfferRounded,
  NavigateNextRounded,
  NavigateBeforeRounded,
} from '@mui/icons-material';
import { announcementService } from '../../../services/announcementService';

/* ── Keyframe Animations ─────────────────────────────────────── */

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulseGlow = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.35; }
  50% { transform: scale(1.1); opacity: 0.7; }
`;

const beaconPulse = keyframes`
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 255, 62, 0.7); }
  70% { transform: scale(1); box-shadow: 0 0 0 10px rgba(198, 255, 62, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(198, 255, 62, 0); }
`;

const floatSparkle = keyframes`
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  50% { transform: translateY(-4px) rotate(8deg); }
`;

/* ── Modern Neon Color Configurations ────────────────────────── */

const TYPE_THEME = {
  SUCCESS: {
    primary: '#C6FF3E',
    secondary: '#00E676',
    border: 'rgba(198, 255, 62, 0.38)',
    borderHover: '#C6FF3E',
    bgGradient: 'linear-gradient(135deg, rgba(198, 255, 62, 0.12) 0%, rgba(0, 230, 118, 0.06) 45%, rgba(13, 17, 23, 0.95) 100%)',
    badgeBg: 'rgba(198, 255, 62, 0.16)',
    badgeBorder: 'rgba(198, 255, 62, 0.4)',
    badgeColor: '#C6FF3E',
    glowColor: 'rgba(198, 255, 62, 0.22)',
    btnBg: '#C6FF3E',
    btnColor: '#0A0C0F',
    btnHoverBg: '#d7ff6e',
    badgeLabel: 'OFFRE PROMO DU MOMENT',
    icon: <LocalFireDepartmentRounded sx={{ fontSize: 18, color: '#C6FF3E' }} />,
  },
  WARNING: {
    primary: '#FFB800',
    secondary: '#FF9100',
    border: 'rgba(255, 184, 0, 0.38)',
    borderHover: '#FFB800',
    bgGradient: 'linear-gradient(135deg, rgba(255, 184, 0, 0.14) 0%, rgba(255, 145, 0, 0.06) 45%, rgba(13, 17, 23, 0.95) 100%)',
    badgeBg: 'rgba(255, 184, 0, 0.16)',
    badgeBorder: 'rgba(255, 184, 0, 0.4)',
    badgeColor: '#FFB800',
    glowColor: 'rgba(255, 184, 0, 0.22)',
    btnBg: '#FFB800',
    btnColor: '#0A0C0F',
    btnHoverBg: '#ffc933',
    badgeLabel: '⚡ OFFRE FLASH & LIMITÉE',
    icon: <LocalOfferRounded sx={{ fontSize: 18, color: '#FFB800' }} />,
  },
  DANGER: {
    primary: '#FF3366',
    secondary: '#FF5252',
    border: 'rgba(255, 51, 102, 0.38)',
    borderHover: '#FF3366',
    bgGradient: 'linear-gradient(135deg, rgba(255, 51, 102, 0.14) 0%, rgba(255, 82, 82, 0.06) 45%, rgba(13, 17, 23, 0.95) 100%)',
    badgeBg: 'rgba(255, 51, 102, 0.16)',
    badgeBorder: 'rgba(255, 51, 102, 0.4)',
    badgeColor: '#FF3366',
    glowColor: 'rgba(255, 51, 102, 0.22)',
    btnBg: '#FF3366',
    btnColor: '#FFFFFF',
    btnHoverBg: '#ff5c85',
    badgeLabel: '🚨 DERNIÈRE CHANCE',
    icon: <CampaignRounded sx={{ fontSize: 18, color: '#FF3366' }} />,
  },
};

const DISMISSED_STORAGE_KEY = 'gympilot_dismissed_shop_announcements';

function getDismissedIds() {
  try {
    return JSON.parse(localStorage.getItem(DISMISSED_STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveDismissedIds(ids) {
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

/** Extracts coupon code if pattern like "code GYMPILOT10" exists */
function extractCouponCode(text) {
  if (!text) return null;
  const match = text.match(/\b(?:code|promo|voucher)\s+([A-Z0-9_-]{3,20})\b/i);
  return match ? match[1].toUpperCase() : null;
}

export default function ShopAnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState(getDismissedIds);
  const [copiedCode, setCopiedCode] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    announcementService
      .getActive()
      .then((data) => {
        setAnnouncements(data || []);
      })
      .catch(() => {
        setAnnouncements([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleDismiss = (id) => {
    const next = [...dismissed, id];
    setDismissed(next);
    saveDismissedIds(next);
    if (currentIndex > 0) {
      setCurrentIndex((prev) => Math.max(0, prev - 1));
    }
  };

  const handleCopyCode = (code) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 3000);
  };

  // Filter active and non-expired announcements
  const visibleList = announcements.filter((ann) => {
    if (dismissed.includes(ann.id)) return false;
    if (ann.expiresAt && new Date(ann.expiresAt) <= new Date()) return false;
    return true;
  });

  if (loading || visibleList.length === 0) {
    return null;
  }

  const activeAnn = visibleList[currentIndex % visibleList.length];
  const theme = TYPE_THEME[activeAnn.type] || TYPE_THEME.SUCCESS;
  const detectedCode = extractCouponCode(activeAnn.message);

  // Time remaining calculation if expiresAt exists
  let expirationText = null;
  if (activeAnn.expiresAt) {
    const diffMs = new Date(activeAnn.expiresAt) - new Date();
    if (diffMs > 0) {
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const days = Math.floor(hours / 24);
      if (days > 0) {
        expirationText = `${days}j restants`;
      } else {
        expirationText = `${hours}h restantes`;
      }
    }
  }

  return (
    <Collapse in={true}>
      <Box
        sx={{
          position: 'relative',
          mb: 3.5,
          borderRadius: { xs: 3, sm: 4 },
          overflow: 'hidden',
          background: (themeObj) =>
            themeObj.palette.mode === 'dark'
              ? theme.bgGradient
              : 'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.95) 100%)',
          border: '1px solid',
          borderColor: theme.border,
          boxShadow: `0 12px 36px ${theme.glowColor}, 0 2px 8px rgba(0,0,0,0.35)`,
          backdropFilter: 'blur(20px)',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          '&:hover': {
            borderColor: theme.borderHover,
            boxShadow: `0 16px 44px ${theme.glowColor}, 0 4px 12px rgba(0,0,0,0.45)`,
          },
        }}
      >
        {/* Top luminous animated accent beam */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3px',
            background: `linear-gradient(90deg, transparent 0%, ${theme.primary} 50%, transparent 100%)`,
            backgroundSize: '200% 100%',
            animation: `${shimmer} 3.5s linear infinite`,
          }}
        />

        {/* Dynamic ambient radial backlight */}
        <Box
          sx={{
            position: 'absolute',
            top: -40,
            left: '10%',
            width: 220,
            height: 120,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${theme.glowColor} 0%, transparent 70%)`,
            filter: 'blur(30px)',
            animation: `${pulseGlow} 4s ease-in-out infinite`,
            pointerEvents: 'none',
          }}
        />

        {/* Content Container */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            p: { xs: 2, sm: 2.5, md: 3 },
          }}
        >
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            alignItems={{ xs: 'flex-start', md: 'center' }}
            justifyContent="space-between"
            spacing={{ xs: 2, md: 2.5 }}
          >
            {/* Left: Badge + Icon + Message */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              alignItems={{ xs: 'flex-start', sm: 'center' }}
              spacing={1.5}
              sx={{ flex: 1, minWidth: 0 }}
            >
              {/* Pulsing Pill Badge */}
              <Stack direction="row" alignItems="center" spacing={1} sx={{ flexShrink: 0 }}>
                <Chip
                  icon={theme.icon}
                  label={
                    <Stack direction="row" alignItems="center" spacing={0.75}>
                      <Box
                        sx={{
                          width: 7,
                          height: 7,
                          borderRadius: '50%',
                          bgcolor: theme.primary,
                          animation: `${beaconPulse} 2s infinite`,
                        }}
                      />
                      <span>{theme.badgeLabel}</span>
                    </Stack>
                  }
                  size="small"
                  sx={{
                    bgcolor: theme.badgeBg,
                    border: '1px solid',
                    borderColor: theme.badgeBorder,
                    color: theme.badgeColor,
                    fontWeight: 800,
                    fontSize: '0.74rem',
                    letterSpacing: '0.5px',
                    px: 0.5,
                    py: 0.2,
                    boxShadow: `0 0 14px ${theme.glowColor}`,
                  }}
                />

                {expirationText && (
                  <Chip
                    icon={<AccessTimeRounded sx={{ fontSize: '13px !important', color: `${theme.primary} !important` }} />}
                    label={expirationText}
                    size="small"
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(255,255,255,0.12)',
                      color: 'text.secondary',
                      fontWeight: 700,
                      fontSize: '0.72rem',
                    }}
                  />
                )}
              </Stack>

              {/* Message text with highlight */}
              <Typography
                variant="body1"
                sx={{
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: { xs: '0.9rem', sm: '0.96rem', md: '1.02rem' },
                  lineHeight: 1.45,
                  letterSpacing: '-0.2px',
                }}
              >
                {activeAnn.message}
              </Typography>
            </Stack>

            {/* Right: Copy Coupon + CTA Button + Multiple Navigation + Dismiss */}
            <Stack
              direction="row"
              alignItems="center"
              spacing={1.25}
              flexWrap="wrap"
              gap={1}
              sx={{ flexShrink: 0, width: { xs: '100%', md: 'auto' }, justifyContent: { xs: 'space-between', md: 'flex-end' } }}
            >
              {/* Interactive 1-Click Promo Code Pill (if detected) */}
              {detectedCode && (
                <Tooltip
                  title={copiedCode === detectedCode ? 'Copié dans le presse-papier ! 🎉' : 'Cliquez pour copier le code promo'}
                  arrow
                  placement="top"
                >
                  <Button
                    onClick={() => handleCopyCode(detectedCode)}
                    startIcon={
                      copiedCode === detectedCode ? (
                        <CheckRounded sx={{ fontSize: 17, color: '#00E676' }} />
                      ) : (
                        <ContentCopyRounded sx={{ fontSize: 16 }} />
                      )
                    }
                    size="small"
                    sx={{
                      textTransform: 'none',
                      bgcolor: copiedCode === detectedCode ? 'rgba(0, 230, 118, 0.15)' : 'rgba(255,255,255,0.08)',
                      border: '1.5px dashed',
                      borderColor: copiedCode === detectedCode ? '#00E676' : theme.primary,
                      color: copiedCode === detectedCode ? '#00E676' : theme.primary,
                      fontWeight: 800,
                      fontSize: '0.82rem',
                      fontFamily: 'monospace',
                      borderRadius: 2,
                      px: 1.75,
                      py: 0.6,
                      letterSpacing: '0.6px',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: 'rgba(255,255,255,0.15)',
                        transform: 'scale(1.03)',
                      },
                    }}
                  >
                    {detectedCode}
                  </Button>
                </Tooltip>
              )}

              {/* Action Button (if link exists) */}
              {activeAnn.linkUrl && (
                <Button
                  component={activeAnn.linkUrl.startsWith('http') ? 'a' : RouterLink}
                  to={!activeAnn.linkUrl.startsWith('http') ? activeAnn.linkUrl : undefined}
                  href={activeAnn.linkUrl.startsWith('http') ? activeAnn.linkUrl : undefined}
                  target={activeAnn.linkUrl.startsWith('http') ? '_blank' : undefined}
                  rel={activeAnn.linkUrl.startsWith('http') ? 'noopener noreferrer' : undefined}
                  size="small"
                  variant="contained"
                  endIcon={<ArrowForwardRounded sx={{ fontSize: 17 }} />}
                  sx={{
                    bgcolor: theme.btnBg,
                    color: theme.btnColor,
                    fontWeight: 800,
                    fontSize: '0.84rem',
                    textTransform: 'none',
                    borderRadius: 2.5,
                    px: 2.4,
                    py: 0.8,
                    boxShadow: `0 4px 18px ${theme.glowColor}`,
                    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                    '&:hover': {
                      bgcolor: theme.btnHoverBg,
                      transform: 'translateY(-2px) scale(1.02)',
                      boxShadow: `0 8px 24px ${theme.glowColor}`,
                    },
                  }}
                >
                  {activeAnn.linkLabel || 'En profiter'}
                </Button>
              )}

              {/* Navigation Arrows (if multiple announcements) */}
              {visibleList.length > 1 && (
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton
                    size="small"
                    onClick={() => setCurrentIndex((prev) => (prev - 1 + visibleList.length) % visibleList.length)}
                    sx={{
                      color: 'text.secondary',
                      bgcolor: 'rgba(255,255,255,0.06)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: 'text.primary' },
                    }}
                  >
                    <NavigateBeforeRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, px: 0.5 }}>
                    {currentIndex + 1}/{visibleList.length}
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setCurrentIndex((prev) => (prev + 1) % visibleList.length)}
                    sx={{
                      color: 'text.secondary',
                      bgcolor: 'rgba(255,255,255,0.06)',
                      '&:hover': { bgcolor: 'rgba(255,255,255,0.15)', color: 'text.primary' },
                    }}
                  >
                    <NavigateNextRounded sx={{ fontSize: 18 }} />
                  </IconButton>
                </Stack>
              )}

              {/* Dismiss Button */}
              <Tooltip title="Masquer l'annonce" arrow>
                <IconButton
                  size="small"
                  onClick={() => handleDismiss(activeAnn.id)}
                  sx={{
                    color: 'text.secondary',
                    opacity: 0.7,
                    borderRadius: 1.5,
                    p: 0.6,
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      opacity: 1,
                      color: theme.primary,
                      bgcolor: 'rgba(255,255,255,0.08)',
                    },
                  }}
                >
                  <CloseRounded sx={{ fontSize: 18 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        </Box>
      </Box>
    </Collapse>
  );
}
