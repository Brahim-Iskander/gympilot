import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Box,
  Card,
  Chip,
  Container,
  Dialog,
  Grid,
  IconButton,
  Stack,
  Typography,
  keyframes,
} from '@mui/material';
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';
import OndemandVideoRoundedIcon from '@mui/icons-material/OndemandVideoRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';

/* ════════════════════════════════════════════════════════════════════════════
 *  PLACEHOLDER VIDEOS — Replace thumbnail images and YouTube IDs below.
 *
 *  Each entry supports:
 *   • `type: 'youtube'`  → Embeds a YouTube iframe (uses `youtubeId`)
 *   • `type: 'local'`    → Plays a local MP4/WebM file (uses `videoSrc`)
 *
 *  To swap in your own videos, change `thumbnail`, `youtubeId`, or `videoSrc`.
 * ═══════════════════════════════════════════════════════════════════════════ */
import thumbSquat from '../../../assets/media/video-thumb-squat.jpg';
import thumbBench from '../../../assets/media/video-thumb-bench.jpg';

const WORKOUT_VIDEOS = [
  {
    id: 'vid-squat',
    type: 'youtube',
    youtubeId: 'bEv6CCg2BC8', // ← REPLACE with your actual YouTube video ID
    thumbnail: thumbSquat,
    title: 'Barbell Back Squat',
    subtitle: 'Perfect depth & form cues',
    duration: '4:32',
    category: 'Legs',
    accent: '#C6FF3E',
  },
  {
    id: 'vid-bench',
    type: 'youtube',
    youtubeId: 'SCVCLChPQFY', // ← REPLACE with your actual YouTube video ID
    thumbnail: thumbBench,
    title: 'Bench Press Form Guide',
    subtitle: 'Arch, grip width & leg drive',
    duration: '6:15',
    category: 'Chest',
    accent: '#8A7CFF',
  },
  {
    id: 'vid-deadlift',
    type: 'youtube',
    youtubeId: 'XxWcirHIwVo', // ← REPLACE with your actual YouTube video ID
    thumbnail: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    title: 'Conventional Deadlift',
    subtitle: 'Hip hinge mechanics & lockout',
    duration: '5:48',
    category: 'Back',
    accent: '#FF6B6B',
  },
  {
    id: 'vid-ohp',
    type: 'youtube',
    youtubeId: '_RlRDWO2jfg', // ← REPLACE with your actual YouTube video ID
    thumbnail: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?auto=format&fit=crop&w=800&q=80',
    title: 'Overhead Press',
    subtitle: 'Strict press progression',
    duration: '3:55',
    category: 'Shoulders',
    accent: '#C6FF3E',
  },
];

/* ─── Animations ──────────────────────────────────────────────────────────── */
const shimmer = keyframes`
  0%   { background-position: -400px 0; }
  100% { background-position: 400px 0;  }
`;

/* ─── Lazy-load hook (Intersection Observer) ──────────────────────────────── */
function useLazyLoad(options = {}) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(el);
        }
      },
      { rootMargin: '200px', threshold: 0.1, ...options }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return [ref, isVisible];
}

/* ═══════════════════════════════════════════════════════════════════════════ */
function VideoCard({ video, onPlay }) {
  const [cardRef, isVisible] = useLazyLoad();
  const [imgLoaded, setImgLoaded] = useState(false);

  return (
    <Card
      ref={cardRef}
      elevation={0}
      onClick={() => onPlay(video)}
      sx={{
        position: 'relative',
        borderRadius: 4,
        overflow: 'hidden',
        cursor: 'pointer',
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
        transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        '&:hover': {
          transform: 'translateY(-8px)',
          borderColor: `${video.accent}66`,
          boxShadow: `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${video.accent}18`,
          '& .video-overlay': { opacity: 0.5 },
          '& .play-btn': { transform: 'scale(1.15)', bgcolor: video.accent },
          '& .play-icon': { color: '#0A0C0F' },
          '& .video-thumb': { transform: 'scale(1.08)' },
        },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9', overflow: 'hidden', bgcolor: '#12151B' }}>
        {/* Shimmer placeholder while image loads */}
        {!imgLoaded && (
          <Box
            aria-hidden
            sx={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
              backgroundSize: '800px 100%',
              animation: `${shimmer} 1.8s infinite linear`,
            }}
          />
        )}

        {isVisible && (
          <Box
            component="img"
            className="video-thumb"
            src={video.thumbnail}
            alt={video.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            draggable={false}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transition: 'transform 0.5s ease',
              opacity: imgLoaded ? 1 : 0,
            }}
          />
        )}

        {/* Dark overlay */}
        <Box
          className="video-overlay"
          aria-hidden
          sx={{
            position: 'absolute',
            inset: 0,
            bgcolor: 'rgba(10,12,15,0.35)',
            transition: 'opacity 0.3s ease',
          }}
        />

        {/* Play button */}
        <Box
          className="play-btn"
          aria-hidden
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 56,
            height: 56,
            borderRadius: '50%',
            bgcolor: 'rgba(10,12,15,0.7)',
            backdropFilter: 'blur(8px)',
            border: `2px solid ${video.accent}66`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
            boxShadow: `0 8px 30px rgba(0,0,0,0.5)`,
          }}
        >
          <PlayArrowRoundedIcon className="play-icon" sx={{ fontSize: 28, color: video.accent, transition: 'color 0.3s ease' }} />
        </Box>

        {/* Duration badge */}
        <Chip
          icon={<AccessTimeRoundedIcon sx={{ fontSize: '0.85rem !important', color: 'rgba(255,255,255,0.8) !important' }} />}
          label={video.duration}
          size="small"
          sx={{
            position: 'absolute',
            bottom: 10,
            right: 10,
            bgcolor: 'rgba(10,12,15,0.75)',
            backdropFilter: 'blur(6px)',
            color: 'rgba(255,255,255,0.9)',
            fontWeight: 700,
            fontSize: '0.72rem',
            border: '1px solid rgba(255,255,255,0.1)',
          }}
        />

        {/* Category badge */}
        <Chip
          label={video.category}
          size="small"
          sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            bgcolor: `${video.accent}22`,
            color: video.accent,
            fontWeight: 800,
            fontSize: '0.65rem',
            letterSpacing: '0.05em',
            border: `1px solid ${video.accent}44`,
          }}
        />
      </Box>

      {/* Info */}
      <Box sx={{ p: 2.5 }}>
        <Typography
          variant="subtitle1"
          sx={{
            fontFamily: "'Sora','Inter',sans-serif",
            fontWeight: 800,
            fontSize: '1rem',
            lineHeight: 1.3,
          }}
        >
          {video.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.5 }}>
          {video.subtitle}
        </Typography>
      </Box>
    </Card>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════ */
export default function WorkoutVideosSection() {
  const [activeVideo, setActiveVideo] = useState(null);

  const handleClose = useCallback(() => setActiveVideo(null), []);

  return (
    <Box component="section" id="workout-videos" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      {/* Ambient glow */}
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 800,
          height: 600,
          background: 'radial-gradient(circle, rgba(138,124,255,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section header */}
        <Stack spacing={1.5} alignItems="center" sx={{ textAlign: 'center', mb: 6 }}>
          <Chip
            icon={<OndemandVideoRoundedIcon sx={{ fontSize: '1rem !important', color: '#C6FF3E !important' }} />}
            label="TRAINING LIBRARY"
            size="small"
            sx={{
              bgcolor: 'rgba(198,255,62,0.1)',
              color: '#C6FF3E',
              fontWeight: 800,
              letterSpacing: '0.08em',
              fontSize: '0.72rem',
              border: '1px solid rgba(198,255,62,0.25)',
              px: 1,
            }}
          />

          <Typography
            variant="h3"
            component="h2"
            sx={{
              fontFamily: "'Sora','Inter',sans-serif",
              fontWeight: 800,
              fontSize: { xs: '1.75rem', sm: '2.25rem', md: '2.75rem' },
              letterSpacing: '-0.02em',
            }}
          >
            Learn the{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #C6FF3E, #8A7CFF)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Compound Lifts
            </Box>
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 580, fontSize: '1.05rem', lineHeight: 1.7 }}>
            Master the foundational barbell movements with step-by-step video breakdowns from certified coaches.
          </Typography>
        </Stack>

        {/* Video cards grid */}
        <Grid container spacing={3}>
          {WORKOUT_VIDEOS.map((video) => (
            <Grid item xs={12} sm={6} md={3} key={video.id}>
              <VideoCard video={video} onPlay={setActiveVideo} />
            </Grid>
          ))}
        </Grid>

        {/* Helper note */}
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="center" sx={{ mt: 4 }}>
          <FitnessCenterRoundedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="caption" color="text.secondary">
            Click any card to watch the full tutorial · More exercises coming soon
          </Typography>
        </Stack>
      </Container>

      {/* ── Video player modal ─────────────────────────────────────────── */}
      <Dialog
        open={Boolean(activeVideo)}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            bgcolor: '#0A0C0F',
            borderRadius: 4,
            border: '1px solid rgba(255,255,255,0.1)',
            overflow: 'hidden',
            boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
          },
        }}
      >
        {activeVideo && (
          <Box sx={{ position: 'relative' }}>
            {/* Close button */}
            <IconButton
              onClick={handleClose}
              aria-label="Close video"
              sx={{
                position: 'absolute',
                top: 12,
                right: 12,
                zIndex: 10,
                bgcolor: 'rgba(10,12,15,0.7)',
                backdropFilter: 'blur(8px)',
                color: '#F4F6F8',
                border: '1px solid rgba(255,255,255,0.15)',
                '&:hover': {
                  bgcolor: 'rgba(198,255,62,0.15)',
                  borderColor: 'rgba(198,255,62,0.5)',
                },
              }}
            >
              <CloseRoundedIcon />
            </IconButton>

            {/* YouTube embed */}
            {activeVideo.type === 'youtube' && (
              <Box sx={{ position: 'relative', width: '100%', aspectRatio: '16/9' }}>
                <Box
                  component="iframe"
                  src={`https://www.youtube.com/embed/${activeVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
                  title={activeVideo.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  sx={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none',
                  }}
                />
              </Box>
            )}

            {/* Local video */}
            {activeVideo.type === 'local' && (
              <Box
                component="video"
                src={activeVideo.videoSrc}
                controls
                autoPlay
                sx={{ width: '100%', display: 'block' }}
              />
            )}

            {/* Video info bar */}
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ px: 3, py: 2, borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={800}>
                  {activeVideo.title}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {activeVideo.subtitle} · {activeVideo.duration}
                </Typography>
              </Box>
              <Chip
                label={activeVideo.category}
                size="small"
                sx={{
                  bgcolor: `${activeVideo.accent}22`,
                  color: activeVideo.accent,
                  fontWeight: 800,
                  border: `1px solid ${activeVideo.accent}44`,
                }}
              />
            </Stack>
          </Box>
        )}
      </Dialog>
    </Box>
  );
}
