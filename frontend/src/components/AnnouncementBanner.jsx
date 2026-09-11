import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Stack,
  Collapse,
} from '@mui/material';
import {
  CloseRounded,
  CheckCircleRounded,
  WarningAmberRounded,
  ErrorRounded,
  ArrowForwardRounded,
} from '@mui/icons-material';
import { announcementService } from '../services/announcementService';

const DISMISSED_KEY = 'gympilot_dismissed_announcements';

const TYPE_CONFIG = {
  SUCCESS: {
    icon: <CheckCircleRounded sx={{ fontSize: 20 }} />,
    bg: 'linear-gradient(135deg, rgba(46,204,113,0.15) 0%, rgba(39,174,96,0.10) 100%)',
    border: 'rgba(46,204,113,0.35)',
    color: '#2ecc71',
    textColor: '#27ae60',
    btnBg: 'rgba(46,204,113,0.18)',
    btnHover: 'rgba(46,204,113,0.30)',
  },
  WARNING: {
    icon: <WarningAmberRounded sx={{ fontSize: 20 }} />,
    bg: 'linear-gradient(135deg, rgba(241,196,15,0.15) 0%, rgba(243,156,18,0.10) 100%)',
    border: 'rgba(241,196,15,0.35)',
    color: '#f1c40f',
    textColor: '#f39c12',
    btnBg: 'rgba(241,196,15,0.18)',
    btnHover: 'rgba(241,196,15,0.30)',
  },
  DANGER: {
    icon: <ErrorRounded sx={{ fontSize: 20 }} />,
    bg: 'linear-gradient(135deg, rgba(231,76,60,0.15) 0%, rgba(192,57,43,0.10) 100%)',
    border: 'rgba(231,76,60,0.35)',
    color: '#e74c3c',
    textColor: '#c0392b',
    btnBg: 'rgba(231,76,60,0.18)',
    btnHover: 'rgba(231,76,60,0.30)',
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
  localStorage.setItem(DISMISSED_KEY, JSON.stringify(ids));
}

export default function AnnouncementBanner() {
  const [announcements, setAnnouncements] = useState([]);
  const [dismissed, setDismissedState] = useState(getDismissed);

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

  const visible = announcements.filter(
    (a) => !dismissed.includes(a.id) && (!a.expiresAt || new Date(a.expiresAt) > new Date())
  );

  if (visible.length === 0) return null;

  return (
    <Box sx={{ width: '100%' }}>
      {visible.map((ann) => {
        const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.SUCCESS;

        return (
          <Collapse in key={ann.id}>
            <Box
              sx={{
                width: '100%',
                background: cfg.bg,
                borderBottom: '1px solid',
                borderColor: cfg.border,
                py: { xs: 1, sm: 1.25 },
                px: { xs: 2, sm: 3 },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="center"
                spacing={{ xs: 1, sm: 1.5 }}
                sx={{ position: 'relative', maxWidth: 1200, mx: 'auto' }}
              >
                {/* Icon */}
                <Box
                  sx={{
                    color: cfg.color,
                    display: 'flex',
                    alignItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  {cfg.icon}
                </Box>

                {/* Message */}
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: { xs: '0.78rem', sm: '0.85rem' },
                    color: 'text.primary',
                    flex: 1,
                    textAlign: 'center',
                    lineHeight: 1.4,
                  }}
                >
                  {ann.message}
                </Typography>

                {/* Link button */}
                {ann.linkUrl && (
                  <Button
                    size="small"
                    endIcon={<ArrowForwardRounded sx={{ fontSize: '16px !important' }} />}
                    href={ann.linkUrl}
                    target={ann.linkUrl.startsWith('http') ? '_blank' : '_self'}
                    rel="noopener noreferrer"
                    sx={{
                      flexShrink: 0,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: '0.75rem',
                      color: cfg.color,
                      bgcolor: cfg.btnBg,
                      border: '1px solid',
                      borderColor: cfg.border,
                      borderRadius: 2,
                      px: 1.5,
                      py: 0.35,
                      whiteSpace: 'nowrap',
                      '&:hover': {
                        bgcolor: cfg.btnHover,
                      },
                    }}
                  >
                    {ann.linkLabel || 'View'}
                  </Button>
                )}

                {/* Close */}
                <IconButton
                  size="small"
                  onClick={() => handleDismiss(ann.id)}
                  sx={{
                    flexShrink: 0,
                    color: 'text.secondary',
                    opacity: 0.7,
                    '&:hover': { opacity: 1, bgcolor: 'rgba(255,255,255,0.08)' },
                  }}
                >
                  <CloseRounded sx={{ fontSize: 18 }} />
                </IconButton>
              </Stack>
            </Box>
          </Collapse>
        );
      })}
    </Box>
  );
}
