import { useState, useMemo, useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Chip,
  Container,
  Grid,
  Stack,
  Typography,
  keyframes,
  styled,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import TouchAppRoundedIcon from '@mui/icons-material/TouchAppRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import LightbulbRoundedIcon from '@mui/icons-material/LightbulbRounded';
import SpeedRoundedIcon from '@mui/icons-material/SpeedRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import BarChartRoundedIcon from '@mui/icons-material/BarChartRounded';
import SyncRoundedIcon from '@mui/icons-material/SyncRounded';
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';

import SectionHeading from '../../../components/SectionHeading';
import BodyMapSVG from '../../Workouts/components/BodyMapSVG';

const pulseGlow = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(198, 255, 62, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(198, 255, 62, 0); }
  100% { box-shadow: 0 0 0 0 rgba(198, 255, 62, 0); }
`;

const floatCard = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-4px); }
`;

// ─── Complete Muscle Knowledge Base ─────────────────────────────────
const MUSCLE_PROFILES = {
  Chest: {
    id: 'Chest',
    label: 'Chest',
    latinName: 'Pectoralis Major & Minor',
    view: 'front',
    categoryTag: 'UPPER BODY PUSH',
    accent: '#C6FF3E',
    description: 'The primary pushing power center of the upper body. Responsible for horizontal adduction, clavicular flexion, and chest thickness.',
    mechanics: 'Horizontal Adduction · Scapular Protraction',
    hypertrophy: {
      reps: '6 - 12 reps',
      volume: '12 - 18 sets / wk',
      rest: '2 - 3 mins',
      frequency: '2x / week',
    },
    exercises: [
      { name: 'Barbell Bench Press', type: 'Compound', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Mid/Lower Pecs' },
      { name: 'Incline Dumbbell Press', type: 'Hypertrophy', equipment: 'Dumbbell', difficulty: 'Intermediate', target: 'Upper Clavicular Head' },
      { name: 'Cable Chest Fly', type: 'Isolation', equipment: 'Cable', difficulty: 'Beginner', target: 'Peak Contraction & Squeeze' },
    ],
    formCue: 'Depress and retract scapulae firmly into the bench pad. Control the eccentric descent for 2-3 seconds to stretch the chest fibers under load.',
  },
  Back: {
    id: 'Back',
    label: 'Back (Lats & Traps)',
    latinName: 'Latissimus Dorsi, Rhomboids & Mid-Traps',
    view: 'back',
    categoryTag: 'UPPER BODY PULL',
    accent: '#8A7CFF',
    description: 'Creates the classic aesthetic V-Taper while stabilizing the spine and enhancing posture and pulling strength.',
    mechanics: 'Humeral Extension · Scapular Retraction',
    hypertrophy: {
      reps: '8 - 15 reps',
      volume: '14 - 20 sets / wk',
      rest: '90s - 2.5 mins',
      frequency: '2x / week',
    },
    exercises: [
      { name: 'Pull-ups / Chin-ups', type: 'Compound', equipment: 'Bodyweight', difficulty: 'Advanced', target: 'Lat Width & Thickness' },
      { name: 'Barbell Bent-Over Row', type: 'Compound', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Mid-Back & Rhomboids' },
      { name: 'Lat Pulldown', type: 'Hypertrophy', equipment: 'Machine', difficulty: 'Beginner', target: 'Upper Lat Focus' },
    ],
    formCue: 'Drive your elbows down towards your back pockets rather than pulling with your biceps. Pause and squeeze hard at full contraction.',
  },
  Shoulders: {
    id: 'Shoulders',
    label: 'Shoulders (Deltoids)',
    latinName: 'Anterior, Lateral & Posterior Deltoids',
    view: 'front',
    categoryTag: 'DELTOID COMPLEX',
    accent: '#38BDF8',
    description: 'Provides capped, 3D shoulder width and protects the delicate rotator cuff complex across all pressing motions.',
    mechanics: 'Shoulder Abduction & Flexion',
    hypertrophy: {
      reps: '10 - 20 reps',
      volume: '14 - 18 sets / wk',
      rest: '60s - 2 mins',
      frequency: '2 - 3x / week',
    },
    exercises: [
      { name: 'Overhead Barbell Press', type: 'Compound', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Anterior & Lateral Head' },
      { name: 'Dumbbell Lateral Raise', type: 'Isolation', equipment: 'Dumbbell', difficulty: 'Beginner', target: 'Lateral Width / 3D Delts' },
      { name: 'Face Pulls', type: 'Prehab', equipment: 'Cable', difficulty: 'Beginner', target: 'Rear Delts & Rotator Cuff' },
    ],
    formCue: 'Lead with your elbows on lateral raises and avoid swinging the torso. Keep your traps depressed away from your ears for pure delt isolation.',
  },
  Biceps: {
    id: 'Biceps',
    label: 'Biceps',
    latinName: 'Biceps Brachii & Brachialis',
    view: 'front',
    categoryTag: 'ARM HYPERTROPHY',
    accent: '#FFB800',
    description: 'Responsible for elbow flexion and forearm supination, contributing to arm thickness and peak.',
    mechanics: 'Elbow Flexion · Forearm Supination',
    hypertrophy: {
      reps: '8 - 15 reps',
      volume: '10 - 14 sets / wk',
      rest: '60s - 90s',
      frequency: '2x / week',
    },
    exercises: [
      { name: 'Standing Dumbbell Curl', type: 'Hypertrophy', equipment: 'Dumbbell', difficulty: 'Beginner', target: 'Both Bicep Heads' },
      { name: 'Incline Dumbbell Curl', type: 'Stretch', equipment: 'Dumbbell', difficulty: 'Intermediate', target: 'Long Head Stretch' },
      { name: 'Hammer Curls', type: 'Thickness', equipment: 'Dumbbell', difficulty: 'Beginner', target: 'Brachialis & Forearms' },
    ],
    formCue: 'Lock elbows slightly in front of your ribcage and supinate your wrist (turn pinky up) at the top of the curl for a maximum peak contraction.',
  },
  Triceps: {
    id: 'Triceps',
    label: 'Triceps',
    latinName: 'Triceps Brachii (Long, Lateral & Medial)',
    view: 'back',
    categoryTag: 'ARM HYPERTROPHY',
    accent: '#FF754C',
    description: 'Makes up 60% of total upper arm mass. Critical for lockout strength on all bench and overhead press variations.',
    mechanics: 'Elbow Extension',
    hypertrophy: {
      reps: '8 - 15 reps',
      volume: '10 - 16 sets / wk',
      rest: '60s - 90s',
      frequency: '2x / week',
    },
    exercises: [
      { name: 'Cable Rope Pushdowns', type: 'Isolation', equipment: 'Cable', difficulty: 'Beginner', target: 'Lateral & Medial Heads' },
      { name: 'Overhead Tricep Extension', type: 'Stretch', equipment: 'Dumbbell', difficulty: 'Beginner', target: 'Long Head' },
      { name: 'Close-Grip Bench Press', type: 'Compound', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Overall Tricep Mass' },
    ],
    formCue: 'Keep your elbows stationary at your sides. Flare the rope outward at the bottom of pushdowns for a complete contraction.',
  },
  Legs: {
    id: 'Legs',
    label: 'Legs (Quads & Hamstrings)',
    latinName: 'Quadriceps Femoris & Hamstrings',
    view: 'front',
    categoryTag: 'LOWER BODY ENGINE',
    accent: '#00E676',
    description: 'The powerhouse of human athletic performance, supporting sprint speed, jump mechanics, and massive metabolic caloric expenditure.',
    mechanics: 'Knee Extension & Hip Flexion/Extension',
    hypertrophy: {
      reps: '6 - 15 reps',
      volume: '14 - 22 sets / wk',
      rest: '2 - 3.5 mins',
      frequency: '2x / week',
    },
    exercises: [
      { name: 'Barbell Back Squat', type: 'King Compound', equipment: 'Barbell', difficulty: 'Advanced', target: 'Quads, Adductors & Core' },
      { name: 'Romanian Deadlift (RDL)', type: 'Hinge', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Hamstring & Posterior Chain' },
      { name: 'Leg Press', type: 'Hypertrophy', equipment: 'Machine', difficulty: 'Beginner', target: 'Quad Overload' },
    ],
    formCue: 'Brace your core with a deep 360-degree diaphragmatic breath. Hit at least parallel depth while keeping your knees aligned with your mid-toes.',
  },
  Glutes: {
    id: 'Glutes',
    label: 'Glutes',
    latinName: 'Gluteus Maximus, Medius & Minimus',
    view: 'back',
    categoryTag: 'POSTERIOR POWER',
    accent: '#E040FB',
    description: 'The single largest and most powerful muscle in the human body. Drives hip extension, sprint propulsion, and pelvis stability.',
    mechanics: 'Hip Extension & External Rotation',
    hypertrophy: {
      reps: '8 - 15 reps',
      volume: '12 - 18 sets / wk',
      rest: '90s - 2.5 mins',
      frequency: '2 - 3x / week',
    },
    exercises: [
      { name: 'Barbell Hip Thrust', type: 'Glute Isolation', equipment: 'Barbell', difficulty: 'Intermediate', target: 'Gluteus Maximus' },
      { name: 'Bulgarian Split Squat', type: 'Unilateral', equipment: 'Dumbbell', difficulty: 'Advanced', target: 'Glutes & Quads' },
      { name: 'Cable Kickbacks', type: 'Shaping', equipment: 'Cable', difficulty: 'Beginner', target: 'Upper Glute Shelf' },
    ],
    formCue: 'Tuck your chin and maintain a neutral ribcage on hip thrusts. Drive through your heels and squeeze your glutes into a posterior pelvic tilt at the top.',
  },
  Abs: {
    id: 'Abs',
    label: 'Abs & Core',
    latinName: 'Rectus Abdominis, Obliques & Transverse',
    view: 'front',
    categoryTag: 'MIDSECTION BRACE',
    accent: '#26C6DA',
    description: 'Stabilizes the lumbar spine, transfers torque between upper and lower extremities, and gives the sculpted six-pack midsection.',
    mechanics: 'Spinal Flexion · Anti-Extension · Anti-Rotation',
    hypertrophy: {
      reps: '12 - 20 reps',
      volume: '8 - 14 sets / wk',
      rest: '45s - 75s',
      frequency: '3x / week',
    },
    exercises: [
      { name: 'Hanging Leg / Knee Raises', type: 'Lower Core', equipment: 'Bodyweight', difficulty: 'Advanced', target: 'Lower Rectus Abdominis' },
      { name: 'Kneeling Cable Crunches', type: 'Weighted Core', equipment: 'Cable', difficulty: 'Beginner', target: 'Upper Abdominal Squeeze' },
      { name: 'RKC Plank', type: 'Isometric', equipment: 'Bodyweight', difficulty: 'Beginner', target: 'Deep Transverse Abdominis' },
    ],
    formCue: 'Think of curling your ribcage down toward your pelvis rather than just hinging at the hips. Exhale completely at full crunch to contract the deep core.',
  },
  Traps: {
    id: 'Traps',
    label: 'Traps & Upper Back',
    latinName: 'Trapezius (Superior, Middle & Inferior)',
    view: 'back',
    categoryTag: 'UPPER BACK SHIELD',
    accent: '#FF5252',
    description: 'Provides the intimidating yoke thickness atop the neck and shoulders. Essential for barbell stability and spine protection.',
    mechanics: 'Scapular Elevation & Upward Rotation',
    hypertrophy: {
      reps: '10 - 15 reps',
      volume: '10 - 14 sets / wk',
      rest: '60s - 90s',
      frequency: '2x / week',
    },
    exercises: [
      { name: 'Dumbbell Shrugs', type: 'Isolation', equipment: 'Dumbbell', difficulty: 'Beginner', target: 'Upper Trap Elevation' },
      { name: 'Face Pulls', type: 'Compound Isolation', equipment: 'Cable', difficulty: 'Beginner', target: 'Mid/Lower Trapezius' },
      { name: 'Farmer Walks', type: 'Functional', equipment: 'Dumbbell', difficulty: 'Intermediate', target: 'Isometric Trap Endurance' },
    ],
    formCue: 'Pause at the top of shrugs for 2 seconds. Never roll your shoulders in circles—move strictly up and down with controlled posture.',
  },
  Calves: {
    id: 'Calves',
    label: 'Calves',
    latinName: 'Gastrocnemius & Soleus',
    view: 'back',
    categoryTag: 'LOWER LEG FOUNDATION',
    accent: '#69F0AE',
    description: 'The foundation of all ground reaction forces, jumping power, and lower extremity athletic durability.',
    mechanics: 'Plantarflexion',
    hypertrophy: {
      reps: '10 - 20 reps',
      volume: '12 - 16 sets / wk',
      rest: '60s - 90s',
      frequency: '2 - 3x / week',
    },
    exercises: [
      { name: 'Standing Calf Raise', type: 'Gastrocnemius', equipment: 'Machine', difficulty: 'Beginner', target: 'Outer & Inner Calf Heads' },
      { name: 'Seated Calf Raise', type: 'Soleus', equipment: 'Machine', difficulty: 'Beginner', target: 'Deep Soleus Muscle' },
      { name: 'Single-Leg Dumbbell Raise', type: 'Unilateral', equipment: 'Dumbbell', difficulty: 'Intermediate', target: 'Balance & Full Range' },
    ],
    formCue: 'Get a full 3-second stretch at the bottom of every rep and avoid bouncing. Pause for 1 second at the top peak.',
  },
};

const QUICK_MUSCLE_LIST = [
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Legs',
  'Glutes',
  'Abs',
  'Traps',
  'Calves',
];

export default function InteractiveBodySection() {
  const [selectedMuscle, setSelectedMuscle] = useState('Chest');
  const [hoveredMuscle, setHoveredMuscle] = useState(null);
  const [modelView, setModelView] = useState('front');

  // Currently inspected muscle profile
  const activeMuscleKey = hoveredMuscle && MUSCLE_PROFILES[hoveredMuscle] ? hoveredMuscle : selectedMuscle;
  const activeProfile = MUSCLE_PROFILES[activeMuscleKey] || MUSCLE_PROFILES.Chest;

  // Sync view when selecting a muscle with preferred orientation
  const handleSelectMuscle = useCallback((muscle) => {
    if (!muscle) return;
    const profile = MUSCLE_PROFILES[muscle];
    if (profile) {
      setSelectedMuscle(muscle);
      if (profile.view && profile.view !== modelView) {
        setModelView(profile.view);
      }
    } else {
      setSelectedMuscle(muscle);
    }
  }, [modelView]);

  const handleHoverMuscle = useCallback((muscle) => {
    if (muscle && MUSCLE_PROFILES[muscle]) {
      setHoveredMuscle(muscle);
    } else {
      setHoveredMuscle(null);
    }
  }, []);

  const toggleView = () => {
    setModelView((prev) => (prev === 'front' ? 'back' : 'front'));
  };

  return (
    <Box
      component="section"
      id="muscle-explorer"
      sx={{
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
        background: (theme) =>
          theme.palette.mode === 'dark'
            ? 'linear-gradient(180deg, #090B0E 0%, #0D1017 50%, #090B0E 100%)'
            : 'linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #F8FAFC 100%)',
      }}
    >
      {/* Ambient Lighting Behind Visual */}
      <Box
        sx={{
          position: 'absolute',
          top: '20%',
          left: '15%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198, 255, 62, 0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          bottom: '15%',
          right: '10%',
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138, 124, 255, 0.08) 0%, transparent 70%)',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', mb: { xs: 4, md: 6 } }}>
          <Stack direction="row" justifyContent="center" sx={{ mb: 1.5 }}>
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 1.2,
                px: 2,
                py: 0.75,
                borderRadius: 999,
                bgcolor: 'rgba(198, 255, 62, 0.08)',
                border: '1px solid rgba(198, 255, 62, 0.25)',
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: '#C6FF3E',
                  animation: `${pulseGlow} 2s infinite`,
                }}
              />
              <Typography
                variant="caption"
                sx={{
                  color: '#C6FF3E',
                  fontWeight: 800,
                  letterSpacing: 1,
                  fontSize: '0.75rem',
                  textTransform: 'uppercase',
                }}
              >
                Interactive Anatomy & Workout Explorer
              </Typography>
            </Box>
          </Stack>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontFamily: "'Sora','Inter',sans-serif",
              letterSpacing: '-0.03em',
              fontSize: { xs: '2rem', sm: '2.75rem', md: '3.25rem' },
              lineHeight: 1.15,
              mb: 2,
            }}
          >
            Target Any Muscle.{' '}
            <Box
              component="span"
              sx={{
                background: 'linear-gradient(90deg, #C6FF3E 0%, #70FF50 40%, #8A7CFF 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
              }}
            >
              Train With Precision.
            </Box>
          </Typography>

          <Typography
            color="text.secondary"
            sx={{
              maxWidth: 720,
              mx: 'auto',
              fontSize: { xs: '0.98rem', md: '1.1rem' },
              lineHeight: 1.7,
            }}
          >
            Click or hover any muscle on our interactive anatomical model to reveal targeted exercises,
            biomechanical movement cues, and proven hypertrophy guidelines.
          </Typography>

          {/* Quick Muscle Selector Filter Bar */}
          <Stack
            direction="row"
            spacing={1}
            flexWrap="wrap"
            justifyContent="center"
            useFlexGap
            sx={{ mt: 3, pt: 1 }}
          >
            {QUICK_MUSCLE_LIST.map((muscle) => {
              const active = selectedMuscle === muscle;
              const prof = MUSCLE_PROFILES[muscle];
              return (
                <Chip
                  key={muscle}
                  label={muscle}
                  onClick={() => handleSelectMuscle(muscle)}
                  clickable
                  variant={active ? 'filled' : 'outlined'}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.8rem',
                    borderRadius: 3,
                    py: 1.8,
                    px: 0.5,
                    transition: 'all 0.2s ease',
                    bgcolor: active ? 'rgba(198,255,62,0.18)' : 'rgba(255,255,255,0.02)',
                    borderColor: active ? '#C6FF3E' : 'rgba(255,255,255,0.12)',
                    color: active ? '#C6FF3E' : 'text.primary',
                    boxShadow: active ? '0 0 15px rgba(198,255,62,0.25)' : 'none',
                    '&:hover': {
                      bgcolor: 'rgba(198,255,62,0.12)',
                      borderColor: 'rgba(198,255,62,0.4)',
                      transform: 'translateY(-2px)',
                    },
                  }}
                />
              );
            })}
          </Stack>
        </Box>

        {/* ── Main Interactive Anatomy Grid ── */}
        <Grid container spacing={{ xs: 3, md: 4 }} alignItems="stretch">
          {/* Left Column: Anatomical 3D Interactive Rig */}
          <Grid item xs={12} md={5.5}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4.5,
                p: { xs: 2, sm: 3 },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-between',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(18, 21, 27, 0.85)' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(198, 255, 62, 0.2)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Card Top Utility Bar */}
              <Box
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 1.5,
                  pb: 1.5,
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <TouchAppRoundedIcon sx={{ color: '#C6FF3E', fontSize: 18 }} />
                  <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', letterSpacing: 0.5 }}>
                    ANATOMICAL RIG · {modelView.toUpperCase()} VIEW
                  </Typography>
                </Stack>

                <Button
                  size="small"
                  onClick={toggleView}
                  startIcon={<SyncRoundedIcon sx={{ fontSize: 16 }} />}
                  sx={{
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: '#C6FF3E',
                    bgcolor: 'rgba(198,255,62,0.08)',
                    border: '1px solid rgba(198,255,62,0.25)',
                    '&:hover': { bgcolor: 'rgba(198,255,62,0.18)' },
                  }}
                >
                  Flip to {modelView === 'front' ? 'Back' : 'Front'}
                </Button>
              </Box>

              {/* The Body Map Component */}
              <Box sx={{ width: '100%', my: 'auto', display: 'flex', justifyContent: 'center' }}>
                <BodyMapSVG
                  selectedMuscle={selectedMuscle}
                  onSelectMuscle={handleSelectMuscle}
                  onHoverMuscle={handleHoverMuscle}
                  view={modelView}
                  onViewChange={setModelView}
                  showLegend={false}
                  showToggle={true}
                  showClear={false}
                  sx={{
                    background: 'transparent',
                    border: 'none',
                    p: 0,
                  }}
                />
              </Box>

              {/* Interactive Help Hint */}
              <Box
                sx={{
                  width: '100%',
                  mt: 2,
                  pt: 1.5,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                  textAlign: 'center',
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.8 }}>
                  <LightbulbRoundedIcon sx={{ fontSize: 15, color: '#C6FF3E' }} />
                  Hover or tap any muscle group to inspect detailed hypertrophy cues
                </Typography>
              </Box>
            </Card>
          </Grid>

          {/* Right Column: Dynamic Muscle Inspector & Workout Hub */}
          <Grid item xs={12} md={6.5}>
            <Card
              elevation={0}
              sx={{
                height: '100%',
                borderRadius: 4.5,
                p: { xs: 3, sm: 4 },
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(18, 21, 27, 0.85)' : 'rgba(255,255,255,0.85)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 20px 50px rgba(0,0,0,0.4)',
                position: 'relative',
              }}
            >
              {/* Muscle Header & Categorization */}
              <Box>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap" gap={1.5}>
                  <Box>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Chip
                        size="small"
                        label={activeProfile.categoryTag}
                        sx={{
                          fontWeight: 800,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(198,255,62,0.12)',
                          color: '#C6FF3E',
                          border: '1px solid rgba(198,255,62,0.3)',
                        }}
                      />
                      <Chip
                        size="small"
                        label={activeProfile.mechanics}
                        sx={{
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          bgcolor: 'rgba(255,255,255,0.05)',
                          color: 'text.secondary',
                        }}
                      />
                    </Stack>

                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 900,
                        fontFamily: "'Sora','Inter',sans-serif",
                        fontSize: { xs: '1.75rem', sm: '2.25rem' },
                        color: 'text.primary',
                        lineHeight: 1.2,
                      }}
                    >
                      {activeProfile.label}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ fontStyle: 'italic', color: 'primary.main', fontWeight: 600, mt: 0.25 }}
                    >
                      {activeProfile.latinName}
                    </Typography>
                  </Box>

                  {/* Active Indicator Badge */}
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.6,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        bgcolor: '#C6FF3E',
                        boxShadow: '0 0 10px #C6FF3E',
                      }}
                    />
                    <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', fontSize: '0.7rem' }}>
                      ACTIVE SELECTION
                    </Typography>
                  </Box>
                </Stack>

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 2, lineHeight: 1.7, fontSize: '0.95rem' }}
                >
                  {activeProfile.description}
                </Typography>

                {/* 4-Metric Hypertrophy Blueprint Grid */}
                <Grid container spacing={1.5} sx={{ mt: 2.5 }}>
                  <Grid item xs={6} sm={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        textAlign: 'center',
                      }}
                    >
                      <SpeedRoundedIcon sx={{ color: '#C6FF3E', fontSize: 20, mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                        Target Reps
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.25 }}>
                        {activeProfile.hypertrophy.reps}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        textAlign: 'center',
                      }}
                    >
                      <BarChartRoundedIcon sx={{ color: '#8A7CFF', fontSize: 20, mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                        Weekly Volume
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.25 }}>
                        {activeProfile.hypertrophy.volume}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        textAlign: 'center',
                      }}
                    >
                      <TimerRoundedIcon sx={{ color: '#38BDF8', fontSize: 20, mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                        Rest Periods
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.25 }}>
                        {activeProfile.hypertrophy.rest}
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={6} sm={3}>
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: 3,
                        bgcolor: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        textAlign: 'center',
                      }}
                    >
                      <FitnessCenterRoundedIcon sx={{ color: '#FFB800', fontSize: 20, mb: 0.5 }} />
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontWeight: 700 }}>
                        Frequency
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 800, color: 'text.primary', mt: 0.25 }}>
                        {activeProfile.hypertrophy.frequency}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                {/* Flagship Exercise List */}
                <Box sx={{ mt: 3 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.secondary', mb: 1.5, letterSpacing: 0.5 }}>
                    TOP FLAGSHIP EXERCISES:
                  </Typography>

                  <Stack spacing={1.2}>
                    {activeProfile.exercises.map((ex, idx) => (
                      <Box
                        key={idx}
                        sx={{
                          p: 1.4,
                          px: 2,
                          borderRadius: 3,
                          bgcolor: 'rgba(255,255,255,0.025)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            bgcolor: 'rgba(198,255,62,0.05)',
                            borderColor: 'rgba(198,255,62,0.25)',
                            transform: 'translateX(4px)',
                          },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Box
                            sx={{
                              width: 32,
                              height: 32,
                              borderRadius: 2,
                              bgcolor: 'rgba(198,255,62,0.1)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: '#C6FF3E',
                            }}
                          >
                            <FitnessCenterRoundedIcon sx={{ fontSize: 18 }} />
                          </Box>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                              {ex.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {ex.target}
                            </Typography>
                          </Box>
                        </Stack>

                        <Stack direction="row" spacing={0.75} alignItems="center">
                          <Chip
                            size="small"
                            label={ex.equipment}
                            sx={{
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: 'rgba(138,124,255,0.1)',
                              color: '#8A7CFF',
                            }}
                          />
                          <Chip
                            size="small"
                            label={ex.difficulty}
                            sx={{
                              height: 22,
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              bgcolor: ex.difficulty === 'Beginner' ? 'rgba(198,255,62,0.12)' : ex.difficulty === 'Intermediate' ? 'rgba(255,193,7,0.12)' : 'rgba(255,107,107,0.12)',
                              color: ex.difficulty === 'Beginner' ? '#C6FF3E' : ex.difficulty === 'Intermediate' ? '#FFC107' : '#FF6B6B',
                            }}
                          />
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Pro Lifting Form Cue Callout */}
                <Box
                  sx={{
                    mt: 2.5,
                    p: 2,
                    borderRadius: 3,
                    bgcolor: 'rgba(198,255,62,0.04)',
                    border: '1px solid rgba(198,255,62,0.2)',
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                  }}
                >
                  <LightbulbRoundedIcon sx={{ color: '#C6FF3E', fontSize: 22, flexShrink: 0, mt: 0.2 }} />
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 800, color: '#C6FF3E', display: 'block' }}>
                      PRO FORM CUE
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.85rem', lineHeight: 1.6 }}>
                      {activeProfile.formCue}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {/* Action Call To Buttons */}
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ mt: 3.5, pt: 1 }}>
                <Button
                  component={RouterLink}
                  to={`/workouts?tab=library&category=${encodeURIComponent(activeProfile.id)}`}
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardRoundedIcon />}
                  sx={{
                    flex: 1.4,
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 800,
                    fontSize: '0.95rem',
                    boxShadow: '0 8px 24px rgba(198,255,62,0.28)',
                    '&:hover': { transform: 'translateY(-2px)' },
                    transition: 'all 0.25s ease',
                  }}
                >
                  Explore {activeProfile.label} Exercises
                </Button>

                <Button
                  component={RouterLink}
                  to="/workouts?tab=start"
                  variant="outlined"
                  size="large"
                  startIcon={<FitnessCenterRoundedIcon />}
                  sx={{
                    flex: 1,
                    py: 1.4,
                    borderRadius: 3,
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    borderColor: 'rgba(255,255,255,0.15)',
                    color: 'text.primary',
                    bgcolor: 'rgba(255,255,255,0.03)',
                    '&:hover': {
                      borderColor: '#C6FF3E',
                      color: '#C6FF3E',
                      bgcolor: 'rgba(198,255,62,0.06)',
                    },
                  }}
                >
                  Start Workout
                </Button>
              </Stack>
            </Card>
          </Grid>
        </Grid>

        {/* ── Bottom Value Props Checklist ── */}
        <Grid container spacing={2.5} sx={{ mt: 4 }}>
          {[
            {
              title: '30+ Science-Based Exercises',
              subtitle: 'Compound and isolation variations mapped with biomechanical precision.',
            },
            {
              title: '100% Free Interactive Access',
              subtitle: 'Full access to form tutorials, execution cues, and injury prevention tips.',
            },
            {
              title: 'Integrated Workout Logger',
              subtitle: 'Add any movement directly to your active training log with a single tap.',
            },
          ].map((item, idx) => (
            <Grid item xs={12} sm={4} key={idx}>
              <Box
                sx={{
                  p: 2.2,
                  borderRadius: 3.5,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(255,255,255,0.7)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <CheckCircleOutlineRoundedIcon sx={{ color: 'primary.main', fontSize: 22, mt: 0.2 }} />
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {item.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25, lineHeight: 1.5 }}>
                    {item.subtitle}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
