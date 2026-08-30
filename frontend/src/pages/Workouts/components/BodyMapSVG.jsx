import { useState, useCallback, useRef, useEffect } from 'react';
import { Box, Stack, Button, Typography } from '@mui/material';

// ─── Muscle-zone → Exercise-category mapping ─────────────────────────
const MUSCLE_TO_CATEGORY = {
  Chest: 'Chest',
  Abs: 'Abs',
  Shoulders: 'Shoulders',
  Biceps: 'Biceps',
  Triceps: 'Triceps',
  Back: 'Back',
  Glutes: 'Glutes',
  Quads: 'Legs',
  Hamstrings: 'Legs',
  Calves: 'Legs',
  Forearms: 'Biceps', // proxy — no separate category
  Traps: 'Back',
  'Lower Back': 'Back',
  Obliques: 'Abs',
};

// ─── Palette ──────────────────────────────────────────────────────────
const BODY_STROKE = 'rgba(255,255,255,0.12)';
const ACCENT = '#C6FF3E';
const ACCENT_DIM = 'rgba(198,255,62,0.35)';

// ─── SVG Muscle Paths (Front View) ───────────────────────────────────
const FRONT_MUSCLES = [
  { id: 'head-front', label: null, category: null, d: 'M148,28 C148,12 162,2 180,2 C198,2 212,12 212,28 L212,52 C212,68 198,78 180,78 C162,78 148,68 148,52 Z' },
  { id: 'neck-front', label: null, category: null, d: 'M168,78 L168,92 L192,92 L192,78 Z' },
  { id: 'traps-front-left', label: 'Traps', category: 'Traps', d: 'M168,92 L140,100 L128,110 L148,108 L168,100 Z' },
  { id: 'traps-front-right', label: 'Traps', category: 'Traps', d: 'M192,92 L220,100 L232,110 L212,108 L192,100 Z' },
  { id: 'shoulder-front-left', label: 'Shoulders', category: 'Shoulders', d: 'M128,110 L108,118 L100,140 L112,150 L128,140 L140,120 Z' },
  { id: 'shoulder-front-right', label: 'Shoulders', category: 'Shoulders', d: 'M232,110 L252,118 L260,140 L248,150 L232,140 L220,120 Z' },
  { id: 'chest-left', label: 'Chest', category: 'Chest', d: 'M140,108 L128,140 L130,170 L145,178 L180,175 L180,108 L168,100 Z' },
  { id: 'chest-right', label: 'Chest', category: 'Chest', d: 'M220,108 L232,140 L230,170 L215,178 L180,175 L180,108 L192,100 Z' },
  { id: 'bicep-left', label: 'Biceps', category: 'Biceps', d: 'M100,140 L94,170 L88,210 L96,218 L112,218 L118,200 L112,150 Z' },
  { id: 'bicep-right', label: 'Biceps', category: 'Biceps', d: 'M260,140 L266,170 L272,210 L264,218 L248,218 L242,200 L248,150 Z' },
  { id: 'forearm-front-left', label: 'Forearms', category: 'Forearms', d: 'M88,218 L82,260 L78,300 L90,304 L102,300 L106,260 L112,218 Z' },
  { id: 'forearm-front-right', label: 'Forearms', category: 'Forearms', d: 'M272,218 L278,260 L282,300 L270,304 L258,300 L254,260 L248,218 Z' },
  { id: 'abs-center', label: 'Abs', category: 'Abs', d: 'M155,178 L152,220 L153,268 L160,280 L180,285 L200,280 L207,268 L208,220 L205,178 L180,175 Z' },
  { id: 'oblique-left', label: 'Obliques', category: 'Obliques', d: 'M130,170 L135,210 L140,268 L153,268 L152,220 L155,178 L145,178 Z' },
  { id: 'oblique-right', label: 'Obliques', category: 'Obliques', d: 'M230,170 L225,210 L220,268 L207,268 L208,220 L205,178 L215,178 Z' },
  { id: 'quad-left', label: 'Quads', category: 'Quads', d: 'M140,280 L135,320 L132,370 L138,400 L155,405 L168,395 L168,340 L160,280 Z' },
  { id: 'quad-right', label: 'Quads', category: 'Quads', d: 'M220,280 L225,320 L228,370 L222,400 L205,405 L192,395 L192,340 L200,280 Z' },
  { id: 'knee-front-left', label: null, category: null, d: 'M138,400 L136,420 L140,432 L158,432 L162,420 L155,405 Z' },
  { id: 'knee-front-right', label: null, category: null, d: 'M222,400 L224,420 L220,432 L202,432 L198,420 L205,405 Z' },
  { id: 'calf-front-left', label: 'Calves', category: 'Calves', d: 'M136,432 L133,470 L134,510 L142,530 L156,530 L160,510 L162,470 L162,432 Z' },
  { id: 'calf-front-right', label: 'Calves', category: 'Calves', d: 'M224,432 L227,470 L226,510 L218,530 L204,530 L200,510 L198,470 L198,432 Z' },
  { id: 'hand-front-left', label: null, category: null, d: 'M78,300 L72,320 L68,340 L76,344 L84,340 L90,328 L90,304 Z' },
  { id: 'hand-front-right', label: null, category: null, d: 'M282,300 L288,320 L292,340 L284,344 L276,340 L270,328 L270,304 Z' },
  { id: 'foot-front-left', label: null, category: null, d: 'M134,530 L130,546 L132,556 L156,556 L160,546 L156,530 Z' },
  { id: 'foot-front-right', label: null, category: null, d: 'M226,530 L230,546 L228,556 L204,556 L200,546 L204,530 Z' },
  { id: 'hip-front', label: null, category: null, d: 'M140,268 L140,280 L160,280 L180,285 L200,280 L220,280 L220,268 L207,268 L200,280 L180,285 L160,280 L153,268 Z' },
];

// ─── SVG Muscle Paths (Back View) ────────────────────────────────────
const BACK_MUSCLES = [
  { id: 'head-back', label: null, category: null, d: 'M148,28 C148,12 162,2 180,2 C198,2 212,12 212,28 L212,52 C212,68 198,78 180,78 C162,78 148,68 148,52 Z' },
  { id: 'neck-back', label: null, category: null, d: 'M168,78 L168,92 L192,92 L192,78 Z' },
  { id: 'traps-back', label: 'Traps', category: 'Traps', d: 'M148,92 L128,110 L140,140 L160,150 L180,155 L200,150 L220,140 L232,110 L212,92 L192,100 L180,102 L168,100 Z' },
  { id: 'rear-delt-left', label: 'Shoulders', category: 'Shoulders', d: 'M128,110 L108,118 L100,140 L112,150 L128,148 L140,140 Z' },
  { id: 'rear-delt-right', label: 'Shoulders', category: 'Shoulders', d: 'M232,110 L252,118 L260,140 L248,150 L232,148 L220,140 Z' },
  { id: 'lat-left', label: 'Back', category: 'Back', d: 'M140,140 L128,148 L125,180 L130,220 L140,240 L155,250 L165,240 L165,175 L160,150 Z' },
  { id: 'lat-right', label: 'Back', category: 'Back', d: 'M220,140 L232,148 L235,180 L230,220 L220,240 L205,250 L195,240 L195,175 L200,150 Z' },
  { id: 'mid-back', label: 'Back', category: 'Back', d: 'M160,150 L165,175 L165,240 L180,250 L195,240 L195,175 L200,150 L180,155 Z' },
  { id: 'lower-back', label: 'Lower Back', category: 'Lower Back', d: 'M140,240 L155,250 L165,248 L180,250 L195,248 L205,250 L220,240 L218,270 L200,280 L180,285 L160,280 L142,270 Z' },
  { id: 'tricep-left', label: 'Triceps', category: 'Triceps', d: 'M100,140 L94,170 L88,210 L96,218 L112,218 L118,200 L112,150 Z' },
  { id: 'tricep-right', label: 'Triceps', category: 'Triceps', d: 'M260,140 L266,170 L272,210 L264,218 L248,218 L242,200 L248,150 Z' },
  { id: 'forearm-back-left', label: 'Forearms', category: 'Forearms', d: 'M88,218 L82,260 L78,300 L90,304 L102,300 L106,260 L112,218 Z' },
  { id: 'forearm-back-right', label: 'Forearms', category: 'Forearms', d: 'M272,218 L278,260 L282,300 L270,304 L258,300 L254,260 L248,218 Z' },
  { id: 'glute-left', label: 'Glutes', category: 'Glutes', d: 'M142,270 L135,295 L140,315 L160,320 L180,315 L180,285 L160,280 Z' },
  { id: 'glute-right', label: 'Glutes', category: 'Glutes', d: 'M218,270 L225,295 L220,315 L200,320 L180,315 L180,285 L200,280 Z' },
  { id: 'hamstring-left', label: 'Hamstrings', category: 'Hamstrings', d: 'M140,315 L135,350 L133,395 L140,410 L158,410 L165,395 L168,350 L160,320 Z' },
  { id: 'hamstring-right', label: 'Hamstrings', category: 'Hamstrings', d: 'M220,315 L225,350 L227,395 L220,410 L202,410 L195,395 L192,350 L200,320 Z' },
  { id: 'knee-back-left', label: null, category: null, d: 'M133,410 L132,425 L136,435 L158,435 L162,425 L158,410 Z' },
  { id: 'knee-back-right', label: null, category: null, d: 'M227,410 L228,425 L224,435 L202,435 L198,425 L202,410 Z' },
  { id: 'calf-back-left', label: 'Calves', category: 'Calves', d: 'M132,435 L128,465 L130,500 L138,530 L156,530 L162,500 L164,465 L162,435 Z' },
  { id: 'calf-back-right', label: 'Calves', category: 'Calves', d: 'M228,435 L232,465 L230,500 L222,530 L204,530 L198,500 L196,465 L198,435 Z' },
  { id: 'hand-back-left', label: null, category: null, d: 'M78,300 L72,320 L68,340 L76,344 L84,340 L90,328 L90,304 Z' },
  { id: 'hand-back-right', label: null, category: null, d: 'M282,300 L288,320 L292,340 L284,344 L276,340 L270,328 L270,304 Z' },
  { id: 'foot-back-left', label: null, category: null, d: 'M134,530 L130,546 L132,556 L156,556 L160,546 L156,530 Z' },
  { id: 'foot-back-right', label: null, category: null, d: 'M226,530 L230,546 L228,556 L204,556 L200,546 L204,530 Z' },
];

// ─── Component ────────────────────────────────────────────────────────
export default function BodyMapSVG({ selectedMuscle, onSelectMuscle }) {
  const [view, setView] = useState('front');
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, label: '' });
  const containerRef = useRef(null);

  const muscles = view === 'front' ? FRONT_MUSCLES : BACK_MUSCLES;

  // Unique category chips for the current view, in the order they first appear
  const legendItems = [];
  const seen = new Set();
  for (const m of muscles) {
    if (m.category && !seen.has(m.category)) {
      seen.add(m.category);
      legendItems.push(m.category);
    }
  }

  const getMuscleCategory = (cat) => MUSCLE_TO_CATEGORY[cat] || cat;

  const handleMouseEnter = useCallback((label) => setHoveredMuscle(label), []);

  const handleMouseMove = useCallback((e, label) => {
    if (!containerRef.current || !label) return;
    const rect = containerRef.current.getBoundingClientRect();
    setTooltip({ show: true, x: e.clientX - rect.left + 14, y: e.clientY - rect.top - 30, label });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredMuscle(null);
    setTooltip((prev) => ({ ...prev, show: false }));
  }, []);

  const handleClick = useCallback(
    (category) => {
      if (!category) return;
      onSelectMuscle(getMuscleCategory(category));
    },
    [onSelectMuscle]
  );

  const handleKeyDown = useCallback(
    (e, category) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleClick(category);
      }
    },
    [handleClick]
  );

  const getState = (muscle) => {
    if (!muscle.category) return 'body';
    const mapped = getMuscleCategory(muscle.category);
    if (selectedMuscle && selectedMuscle === mapped) return 'selected';
    if (hoveredMuscle && hoveredMuscle === muscle.label) return 'hover';
    return 'default';
  };

  const FILLS = {
    body: 'url(#bodyGrad)',
    default: 'url(#muscleDefault)',
    hover: 'url(#muscleHover)',
    selected: 'url(#muscleSelected)',
  };
  const STROKES = {
    body: BODY_STROKE,
    default: 'rgba(198,255,62,0.16)',
    hover: 'rgba(198,255,62,0.55)',
    selected: ACCENT,
  };

  return (
    <Box
      ref={containerRef}
      sx={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2.5,
        p: 3,
        borderRadius: 4,
        background: 'radial-gradient(120% 90% at 50% 8%, rgba(198,255,62,0.05), rgba(10,12,15,0) 60%), #0E1116',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      <style>{`
        @keyframes selectPulse {
          0%   { transform: scale(1);    filter: url(#glow); }
          40%  { transform: scale(1.04); filter: url(#glowStrong); }
          100% { transform: scale(1);    filter: url(#glow); }
        }
        .muscle-path {
          transform-origin: center;
          transition: fill 0.25s ease, stroke 0.25s ease, opacity 0.2s ease;
        }
        .muscle-path.is-selected { animation: selectPulse 0.5s ease-out; }
        @media (prefers-reduced-motion: reduce) {
          .muscle-path.is-selected { animation: none; }
        }
        .muscle-path:focus-visible {
          outline: 2px solid ${ACCENT};
          outline-offset: 2px;
        }
        .toggle-thumb {
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* ── View Toggle (sliding pill) ── */}
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          width: 176,
          height: 36,
          bgcolor: 'rgba(255,255,255,0.04)',
          borderRadius: 999,
          border: '1px solid rgba(255,255,255,0.08)',
          p: '3px',
        }}
      >
        <Box
          className="toggle-thumb"
          sx={{
            position: 'absolute',
            top: 3,
            left: 3,
            width: 'calc(50% - 3px)',
            height: 30,
            borderRadius: 999,
            bgcolor: ACCENT,
            transform: view === 'back' ? 'translateX(calc(88px - 3px))' : 'translateX(0px)',
            boxShadow: '0 2px 10px rgba(198,255,62,0.35)',
          }}
        />
        {['front', 'back'].map((v) => (
          <Button
            key={v}
            disableRipple
            onClick={() => setView(v)}
            sx={{
              position: 'relative',
              zIndex: 1,
              flex: 1,
              minWidth: 0,
              borderRadius: 999,
              fontWeight: 700,
              fontSize: '0.78rem',
              color: view === v ? '#0A0C0F' : 'text.secondary',
              transition: 'color 0.2s ease',
              '&:hover': { bgcolor: 'transparent' },
            }}
          >
            {v === 'front' ? 'Front' : 'Back'}
          </Button>
        ))}
      </Box>

      {/* ── SVG Body ── */}
      <Box sx={{ width: '100%', maxWidth: 300, aspectRatio: '360 / 560', position: 'relative' }}>
        <svg viewBox="0 0 360 560" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
          <defs>
            <filter id="glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feFlood floodColor={ACCENT} floodOpacity="0.55" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="glowStrong" x="-60%" y="-60%" width="220%" height="220%">
              <feGaussianBlur stdDeviation="9" result="blur" />
              <feFlood floodColor={ACCENT} floodOpacity="0.8" result="color" />
              <feComposite in="color" in2="blur" operator="in" result="glow" />
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <linearGradient id="bodyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.07)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.02)" />
            </linearGradient>
            <radialGradient id="muscleDefault" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="rgba(198,255,62,0.10)" />
              <stop offset="100%" stopColor="rgba(198,255,62,0.03)" />
            </radialGradient>
            <radialGradient id="muscleHover" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="rgba(198,255,62,0.32)" />
              <stop offset="100%" stopColor="rgba(198,255,62,0.12)" />
            </radialGradient>
            <radialGradient id="muscleSelected" cx="35%" cy="30%" r="80%">
              <stop offset="0%" stopColor="rgba(198,255,62,0.65)" />
              <stop offset="100%" stopColor="rgba(198,255,62,0.28)" />
            </radialGradient>
            <radialGradient id="figureGlow" cx="50%" cy="42%" r="55%">
              <stop offset="0%" stopColor="rgba(198,255,62,0.16)" />
              <stop offset="70%" stopColor="rgba(198,255,62,0.03)" />
              <stop offset="100%" stopColor="rgba(198,255,62,0)" />
            </radialGradient>
          </defs>

          {/* Ambient spotlight behind the figure — brightens once something is selected */}
          <ellipse
            cx="180" cy="230" rx="150" ry="260"
            fill="url(#figureGlow)"
            opacity={selectedMuscle ? 1 : 0.55}
            style={{ transition: 'opacity 0.4s ease' }}
          />

          {muscles.map((muscle) => {
            const state = getState(muscle);
            const clickable = Boolean(muscle.category);
            return (
              <path
                key={`${muscle.id}-${state === 'selected' ? selectedMuscle : ''}`}
                className={`muscle-path${state === 'selected' ? ' is-selected' : ''}`}
                id={muscle.id}
                d={muscle.d}
                fill={FILLS[state]}
                stroke={STROKES[state]}
                strokeWidth={clickable ? 1.3 : 0.8}
                strokeLinejoin="round"
                strokeLinecap="round"
                filter={state === 'selected' ? 'url(#glow)' : 'none'}
                tabIndex={clickable ? 0 : -1}
                role={clickable ? 'button' : undefined}
                aria-label={clickable ? `${muscle.label} — filter exercises` : undefined}
                aria-pressed={state === 'selected'}
                style={{ cursor: clickable ? 'pointer' : 'default', outline: 'none' }}
                onMouseEnter={muscle.label ? () => handleMouseEnter(muscle.label) : undefined}
                onMouseMove={muscle.label ? (e) => handleMouseMove(e, muscle.label) : undefined}
                onMouseLeave={muscle.label ? handleMouseLeave : undefined}
                onClick={clickable ? () => handleClick(muscle.category) : undefined}
                onKeyDown={clickable ? (e) => handleKeyDown(e, muscle.category) : undefined}
              />
            );
          })}
        </svg>

        {/* ── Floating Tooltip ── */}
        {tooltip.show && (
          <Box
            sx={{
              position: 'absolute',
              left: tooltip.x,
              top: tooltip.y,
              pointerEvents: 'none',
              zIndex: 20,
              px: 1.4,
              py: 0.55,
              borderRadius: 1.5,
              bgcolor: 'rgba(10,12,15,0.94)',
              border: `1px solid ${ACCENT_DIM}`,
              backdropFilter: 'blur(10px)',
              boxShadow: `0 4px 16px rgba(0,0,0,0.5)`,
              opacity: tooltip.show ? 1 : 0,
              transform: tooltip.show ? 'translateY(0)' : 'translateY(4px)',
              transition: 'opacity 0.15s ease, transform 0.15s ease',
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 700, color: ACCENT, fontSize: '0.72rem', whiteSpace: 'nowrap' }}>
              {tooltip.label}
            </Typography>
          </Box>
        )}
      </Box>

      {/* ── Legend / tap targets — doubles as a mobile-friendly picker ── */}
      <Stack direction="row" flexWrap="wrap" justifyContent="center" gap={0.75} sx={{ maxWidth: 280 }}>
        {legendItems.map((cat) => {
          const mapped = getMuscleCategory(cat);
          const active = selectedMuscle === mapped;
          const hovered = hoveredMuscle === cat;
          return (
            <Box
              key={cat}
              component="button"
              onClick={() => handleClick(cat)}
              onMouseEnter={() => handleMouseEnter(cat)}
              onMouseLeave={handleMouseLeave}
              sx={{
                border: `1px solid ${active ? ACCENT : 'rgba(255,255,255,0.1)'}`,
                bgcolor: active ? 'rgba(198,255,62,0.14)' : hovered ? 'rgba(198,255,62,0.06)' : 'transparent',
                color: active ? ACCENT : 'text.secondary',
                borderRadius: 999,
                px: 1.3,
                py: 0.45,
                fontSize: '0.72rem',
                fontWeight: 600,
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'background 0.2s ease, border-color 0.2s ease, color 0.2s ease',
              }}
            >
              {cat}
            </Box>
          );
        })}
      </Stack>

      {/* ── Selected muscle indicator ── */}
      {selectedMuscle && (
        <Stack direction="row" alignItems="center" gap={1}>
          <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
          <Typography variant="body2" sx={{ fontWeight: 700, color: ACCENT, fontSize: '0.82rem' }}>
            Filtering: {selectedMuscle}
          </Typography>
          <Button
            size="small"
            onClick={() => onSelectMuscle(selectedMuscle)}
            sx={{
              minWidth: 0, px: 1.1, py: 0.15,
              fontSize: '0.68rem', fontWeight: 700,
              color: 'text.secondary',
              bgcolor: 'rgba(255,255,255,0.05)',
              borderRadius: 2,
              border: '1px solid rgba(255,255,255,0.1)',
              '&:hover': { bgcolor: 'rgba(255,255,255,0.1)', color: '#fff' },
            }}
          >
            Clear
          </Button>
        </Stack>
      )}
    </Box>
  );
}