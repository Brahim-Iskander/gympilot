import { useState, useEffect, useCallback, useRef } from 'react';
import { Box, Container, IconButton, Stack, Typography, Chip, keyframes } from '@mui/material';
import ArrowBackIosNewRoundedIcon from '@mui/icons-material/ArrowBackIosNewRounded';
import ArrowForwardIosRoundedIcon from '@mui/icons-material/ArrowForwardIosRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';

/* ════════════════════════════════════════════════════════════════════════════
 *  PLACEHOLDER MEDIA — Replace these imports with your own images / videos.
 *  Supported types: 'image' | 'video'
 *  For video slides, provide an mp4/webm `src` and an `image` poster frame.
 * ═══════════════════════════════════════════════════════════════════════════ */
import sliderGymRack from '../../../assets/media/slider-gym-rack.jpg';
import sliderDeadlift from '../../../assets/media/slider-deadlift.jpg';
import sliderDumbbellRack from '../../../assets/media/slider-dumbbell-rack.jpg';
import sliderBenchPress from '../../../assets/media/slider-bench-press.jpg';

const SLIDES = [
  {
    id: 'slide-1',
    type: 'image',
    image: sliderGymRack,
    title: 'Built for the Iron',
    subtitle: 'Track every rep, every set, every PR — directly from the gym floor.',
    accent: '#C6FF3E',
  },
  {
    id: 'slide-2',
    type: 'image',
    image: sliderDeadlift,
    title: 'Crush Your Deadlift PR',
    subtitle: 'Progressive overload intelligence that tells you when to push harder.',
    accent: '#8A7CFF',
  },
  {
    id: 'slide-3',
    type: 'image',
    image: sliderDumbbellRack,
    title: 'Premium Equipment. Real Results.',
    subtitle: 'Partner with world-class gyms and gear to elevate your training.',
    accent: '#C6FF3E',
  },
  {
    id: 'slide-4',
    type: 'image',
    image: sliderBenchPress,
    title: 'Bench Press Mastery',
    subtitle: 'AI-powered form cues and volume tracking for your biggest lifts.',
    accent: '#FF6B6B',
  },
];

const AUTOPLAY_INTERVAL = 5500; // ms

/* ─── Animations ──────────────────────────────────────────────────────────── */
const pulseRing = keyframes`
  0%   { transform: scale(1);   opacity: 0.6; }
  50%  { transform: scale(1.4); opacity: 0;   }
  100% { transform: scale(1);   opacity: 0;   }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to   { opacity: 1; transform: translateY(0);    }
`;

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function MediaShowcaseSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const timeoutRef = useRef(null);

  const total = SLIDES.length;

  /* ── Navigation helpers ───────────────────────────────────────────────── */
  const goTo = useCallback((index) => {
    setCurrent((index + total) % total);
  }, [total]);

  const next = useCallback(() => goTo(current + 1), [current, goTo]);
  const prev = useCallback(() => goTo(current - 1), [current, goTo]);

  /* ── Autoplay ─────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (isPaused) return;
    timeoutRef.current = setTimeout(next, AUTOPLAY_INTERVAL);
    return () => clearTimeout(timeoutRef.current);
  }, [current, isPaused, next]);

  /* ── Keyboard navigation ──────────────────────────────────────────────── */
  const handleKey = useCallback((e) => {
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  }, [next, prev]);

  const slide = SLIDES[current];

  return (
    <Box
      component="section"
      id="media-showcase"
      role="region"
      aria-roledescription="carousel"
      aria-label="Fitness media showcase"
      tabIndex={0}
      onKeyDown={handleKey}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      sx={{
        position: 'relative',
        width: '100%',
        height: { xs: 420, sm: 500, md: 580, lg: 640 },
        overflow: 'hidden',
        outline: 'none',
        cursor: 'default',
      }}
    >
      {/* ── Slide layers (fade transition) ────────────────────────────── */}
      {SLIDES.map((s, i) => (
        <Box
          key={s.id}
          aria-hidden={i !== current}
          role="group"
          aria-roledescription="slide"
          aria-label={`Slide ${i + 1} of ${total}: ${s.title}`}
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: i === current ? 1 : 0,
            transition: 'opacity 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
            willChange: 'opacity',
            zIndex: i === current ? 1 : 0,
          }}
        >
          {/* Background image */}
          <Box
            component="img"
            src={s.image}
            alt=""
            loading={i === 0 ? 'eager' : 'lazy'}
            draggable={false}
            sx={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: i === current ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 6s ease-out',
            }}
          />

          {/* Dark gradient overlay */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(180deg, rgba(10,12,15,0.25) 0%, rgba(10,12,15,0.6) 55%, rgba(10,12,15,0.92) 100%)',
            }}
          />

          {/* Side vignette */}
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background:
                'linear-gradient(90deg, rgba(10,12,15,0.7) 0%, transparent 40%, transparent 60%, rgba(10,12,15,0.7) 100%)',
            }}
          />
        </Box>
      ))}

      {/* ── Caption overlay ────────────────────────────────────────────── */}
      <Container
        maxWidth="lg"
        sx={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          pb: { xs: 8, md: 10 },
        }}
      >
        <Box
          key={current}
          sx={{
            animation: `${fadeIn} 0.7s cubic-bezier(0.16, 1, 0.3, 1)`,
            maxWidth: 660,
          }}
        >
          <Chip
            icon={<FitnessCenterRoundedIcon sx={{ fontSize: '0.9rem !important', color: `${slide.accent} !important` }} />}
            label="MEDIA SHOWCASE"
            size="small"
            sx={{
              mb: 2,
              bgcolor: `${slide.accent}18`,
              color: slide.accent,
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontSize: '0.68rem',
              border: `1px solid ${slide.accent}44`,
            }}
          />

          <Typography
            variant="h2"
            component="h2"
            sx={{
              fontFamily: "'Sora','Inter',sans-serif",
              fontWeight: 800,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '3rem', lg: '3.4rem' },
              color: '#F4F6F8',
              textShadow: '0 4px 30px rgba(0,0,0,0.5)',
            }}
          >
            {slide.title}
          </Typography>

          <Typography
            sx={{
              mt: 1.5,
              color: 'rgba(244,246,248,0.72)',
              fontSize: { xs: '0.95rem', md: '1.1rem' },
              lineHeight: 1.7,
              maxWidth: 520,
            }}
          >
            {slide.subtitle}
          </Typography>
        </Box>
      </Container>

      {/* ── Arrow navigation ──────────────────────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          zIndex: 3,
          display: 'flex',
          justifyContent: 'space-between',
          px: { xs: 1, md: 3 },
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
      >
        {[
          { icon: <ArrowBackIosNewRoundedIcon fontSize="small" />, onClick: prev, label: 'Previous slide' },
          { icon: <ArrowForwardIosRoundedIcon fontSize="small" />, onClick: next, label: 'Next slide' },
        ].map((btn, i) => (
          <IconButton
            key={i}
            aria-label={btn.label}
            onClick={btn.onClick}
            sx={{
              pointerEvents: 'auto',
              width: { xs: 40, md: 50 },
              height: { xs: 40, md: 50 },
              bgcolor: 'rgba(10,12,15,0.55)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#F4F6F8',
              transition: 'all 0.25s ease',
              '&:hover': {
                bgcolor: 'rgba(198,255,62,0.15)',
                borderColor: 'rgba(198,255,62,0.5)',
                color: '#C6FF3E',
              },
            }}
          >
            {btn.icon}
          </IconButton>
        ))}
      </Box>

      {/* ── Dot indicators ────────────────────────────────────────────── */}
      <Stack
        direction="row"
        spacing={1}
        justifyContent="center"
        sx={{
          position: 'absolute',
          bottom: { xs: 16, md: 24 },
          left: 0,
          right: 0,
          zIndex: 3,
        }}
      >
        {SLIDES.map((s, i) => (
          <Box
            key={s.id}
            role="button"
            tabIndex={0}
            aria-label={`Go to slide ${i + 1}`}
            aria-current={i === current ? 'true' : undefined}
            onClick={() => goTo(i)}
            onKeyDown={(e) => e.key === 'Enter' && goTo(i)}
            sx={{
              position: 'relative',
              width: i === current ? 32 : 10,
              height: 10,
              borderRadius: 5,
              cursor: 'pointer',
              transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
              bgcolor: i === current ? '#C6FF3E' : 'rgba(255,255,255,0.25)',
              boxShadow: i === current ? '0 0 16px rgba(198,255,62,0.5)' : 'none',
              '&:hover': {
                bgcolor: i === current ? '#C6FF3E' : 'rgba(255,255,255,0.5)',
              },
              /* Autoplay progress ring */
              ...(i === current && !isPaused && {
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  inset: -3,
                  borderRadius: 8,
                  border: '2px solid rgba(198,255,62,0.4)',
                  animation: `${pulseRing} ${AUTOPLAY_INTERVAL}ms ease-out infinite`,
                },
              }),
            }}
          />
        ))}
      </Stack>
    </Box>
  );
}
