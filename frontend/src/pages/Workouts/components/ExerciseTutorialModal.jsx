import { useState } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  Tooltip,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded';
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import SchoolRoundedIcon from '@mui/icons-material/SchoolRounded';
import PlayCircleFilledRoundedIcon from '@mui/icons-material/PlayCircleFilledRounded';
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded';
import TimerRoundedIcon from '@mui/icons-material/TimerRounded';
import AirRoundedIcon from '@mui/icons-material/AirRounded';
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded';

import { EXERCISE_TUTORIALS } from '../../../utils/exerciseTutorials';

export default function ExerciseTutorialModal({
  open,
  onClose,
  exercise,
  onAddExercise,
  isAdded,
}) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [tabIndex, setTabIndex] = useState(0);

  if (!exercise) return null;

  const tutorial = EXERCISE_TUTORIALS[exercise.id] || {
    name: exercise.name,
    muscle: exercise.muscle,
    secondaryMuscles: ['Core', 'Stabilizers'],
    equipment: exercise.equipment,
    difficulty: exercise.difficulty,
    mechanics: 'Compound',
    youtubeId: 'rT7DgCr-3pg',
    overview: `Effective exercise targeting the ${exercise.muscle} using ${exercise.equipment}.`,
    setup: [
      'Position yourself with feet shoulder-width apart and a solid foundation.',
      `Secure a safe, comfortable grip on the ${exercise.equipment}.`,
      'Brace your core and maintain a neutral spine before starting.',
    ],
    execution: [
      `Engage your ${exercise.muscle} to initiate the movement.`,
      'Move through a full, controlled range of motion without using momentum.',
      'Squeeze the target muscle at peak contraction.',
      'Lower the weight smoothly under 2–3 seconds of eccentric control.',
    ],
    formTips: [
      'Keep your core braced throughout the entire repetition.',
      'Do not jerk or swing the weight.',
    ],
    mistakesToAvoid: [
      'Using excessive weight that compromises form.',
      'Rushing the eccentric (lowering) phase.',
    ],
    breathing: 'Inhale on the lowering/eccentric phase; exhale on the lifting/concentric phase.',
    tempo: '2-1-1-0 (2s down, 1s pause, 1s up)',
    targets: {
      strength: '4 sets of 5 reps',
      hypertrophy: '3–4 sets of 8–12 reps',
      endurance: '3 sets of 15+ reps',
    },
  };

  const difficultyColors = {
    Beginner: '#C6FF3E',
    Intermediate: '#FFC107',
    Advanced: '#FF6B6B',
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          bgcolor: 'background.paper',
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: 'divider',
          maxHeight: '92vh',
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ p: { xs: 2, sm: 3 }, pb: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.75 }}>
              <Chip
                icon={<SchoolRoundedIcon sx={{ fontSize: '16px !important' }} />}
                label="EXERCISE TUTORIAL & VIDEO"
                size="small"
                sx={{
                  bgcolor: 'rgba(198,255,62,0.1)',
                  color: 'primary.main',
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  border: '1px solid rgba(198,255,62,0.25)',
                }}
              />
              <Chip
                size="small"
                label={tutorial.mechanics}
                sx={{
                  bgcolor: 'rgba(138,124,255,0.1)',
                  color: '#8A7CFF',
                  fontWeight: 700,
                  fontSize: '0.7rem',
                }}
              />
            </Stack>

            <Typography
              variant="h5"
              fontWeight={900}
              sx={{ fontFamily: "'Sora', sans-serif", letterSpacing: '-0.3px' }}
            >
              {tutorial.name}
            </Typography>

            <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
              <Chip
                size="small"
                label={tutorial.muscle}
                sx={{
                  fontWeight: 700,
                  bgcolor: 'rgba(198,255,62,0.12)',
                  color: 'primary.main',
                }}
              />
              <Chip
                size="small"
                label={tutorial.equipment}
                sx={{
                  fontWeight: 600,
                  bgcolor: 'rgba(255,255,255,0.06)',
                  color: 'text.secondary',
                }}
              />
              <Chip
                size="small"
                label={tutorial.difficulty}
                sx={{
                  fontWeight: 700,
                  color: difficultyColors[tutorial.difficulty] || '#C6FF3E',
                  bgcolor: `${difficultyColors[tutorial.difficulty] || '#C6FF3E'}18`,
                  border: `1px solid ${difficultyColors[tutorial.difficulty] || '#C6FF3E'}33`,
                }}
              />
            </Stack>
          </Box>

          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      {/* Tabs */}
      <Box sx={{ px: { xs: 2, sm: 3 }, borderBottom: '1px solid', borderColor: 'divider' }}>
        <Tabs
          value={tabIndex}
          onChange={(e, val) => setTabIndex(val)}
          variant={isMobile ? 'scrollable' : 'standard'}
          scrollButtons="auto"
          sx={{
            minHeight: 44,
            '& .MuiTabs-indicator': {
              bgcolor: 'primary.main',
              borderRadius: 2,
            },
          }}
        >
          <Tab
            icon={<PlayCircleFilledRoundedIcon sx={{ fontSize: '18px !important' }} />}
            iconPosition="start"
            label="Video & Instructions"
            sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 44 }}
          />
          <Tab
            label="Pro Tips & Mistakes"
            sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 44 }}
          />
          <Tab
            label="Muscle Anatomy"
            sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 44 }}
          />
          <Tab
            label="Rep Targets & Tempo"
            sx={{ fontWeight: 700, fontSize: '0.85rem', textTransform: 'none', minHeight: 44 }}
          />
        </Tabs>
      </Box>

      {/* Content */}
      <DialogContent sx={{ p: { xs: 2, sm: 3 }, overflowY: 'auto' }}>
        {/* TAB 0: VIDEO & STEP BY STEP */}
        {tabIndex === 0 && (
          <Stack spacing={3}>
            {/* Embedded YouTube Video Container */}
            {tutorial.youtubeId && (
              <Box>
                <Paper
                  elevation={0}
                  sx={{
                    position: 'relative',
                    width: '100%',
                    paddingTop: '56.25%', // 16:9 Aspect Ratio
                    borderRadius: 3,
                    overflow: 'hidden',
                    bgcolor: '#000',
                    border: '1px solid',
                    borderColor: 'rgba(255,255,255,0.12)',
                    boxShadow: '0 12px 32px rgba(0,0,0,0.6)',
                  }}
                >
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${tutorial.youtubeId}?rel=0&modestbranding=1&autoplay=0`}
                    title={`${tutorial.name} Video Tutorial`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      border: 'none',
                    }}
                  />
                </Paper>

                <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    size="small"
                    component="a"
                    href={`https://www.youtube.com/watch?v=${tutorial.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    endIcon={<OpenInNewRoundedIcon fontSize="small" />}
                    sx={{ color: 'text.secondary', fontSize: '0.75rem', fontWeight: 600 }}
                  >
                    Open in YouTube
                  </Button>
                </Box>
              </Box>
            )}

            {/* Overview Box */}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderColor: 'divider',
              }}
            >
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                {tutorial.overview}
              </Typography>
            </Paper>

            {/* Setup */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  color: 'primary.main',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <span>1. Setup & Starting Position</span>
              </Typography>
              <List disablePadding>
                {tutorial.setup?.map((step, idx) => (
                  <ListItem key={idx} disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: 'rgba(198,255,62,0.15)',
                          color: 'primary.main',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {idx + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={step}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.primary',
                        lineHeight: 1.5,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            <Divider />

            {/* Execution */}
            <Box>
              <Typography
                variant="subtitle1"
                fontWeight={800}
                sx={{
                  fontFamily: "'Sora', sans-serif",
                  color: 'primary.main',
                  mb: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                }}
              >
                <span>2. Proper Movement Execution</span>
              </Typography>
              <List disablePadding>
                {tutorial.execution?.map((step, idx) => (
                  <ListItem key={idx} disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                    <ListItemIcon sx={{ minWidth: 28, mt: 0.5 }}>
                      <Box
                        sx={{
                          width: 20,
                          height: 20,
                          borderRadius: '50%',
                          bgcolor: 'rgba(138,124,255,0.15)',
                          color: '#8A7CFF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.75rem',
                          fontWeight: 800,
                        }}
                      >
                        {idx + 1}
                      </Box>
                    </ListItemIcon>
                    <ListItemText
                      primary={step}
                      primaryTypographyProps={{
                        variant: 'body2',
                        color: 'text.primary',
                        lineHeight: 1.5,
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>

            {/* Breathing Quick Box */}
            {tutorial.breathing && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  borderRadius: 3,
                  bgcolor: 'rgba(138,124,255,0.06)',
                  borderColor: 'rgba(138,124,255,0.2)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 1.5,
                }}
              >
                <AirRoundedIcon sx={{ color: '#8A7CFF', mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" fontWeight={800} sx={{ color: '#8A7CFF', letterSpacing: 0.5 }}>
                    BREATHING PATTERN
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {tutorial.breathing}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Stack>
        )}

        {/* TAB 1: PRO TIPS & MISTAKES */}
        {tabIndex === 1 && (
          <Grid container spacing={3}>
            {/* Form Tips */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: 'rgba(0,230,118,0.03)',
                  borderColor: 'rgba(0,230,118,0.25)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CheckCircleRoundedIcon sx={{ color: '#00E676' }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#00E676' }}>
                    KEY FORM TIPS (DO'S)
                  </Typography>
                </Stack>
                <List disablePadding>
                  {tutorial.formTips?.map((tip, idx) => (
                    <ListItem key={idx} disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 26, mt: 0.25 }}>
                        <AutoAwesomeRoundedIcon sx={{ fontSize: 16, color: '#00E676' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={tip}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.primary', lineHeight: 1.5 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Mistakes */}
            <Grid item xs={12} md={6}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  height: '100%',
                  borderRadius: 3,
                  bgcolor: 'rgba(255,82,82,0.03)',
                  borderColor: 'rgba(255,82,82,0.25)',
                }}
              >
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                  <CancelRoundedIcon sx={{ color: '#FF5252' }} />
                  <Typography variant="subtitle2" fontWeight={800} sx={{ color: '#FF5252' }}>
                    COMMON MISTAKES (DON'TS)
                  </Typography>
                </Stack>
                <List disablePadding>
                  {tutorial.mistakesToAvoid?.map((mistake, idx) => (
                    <ListItem key={idx} disableGutters sx={{ py: 0.75, alignItems: 'flex-start' }}>
                      <ListItemIcon sx={{ minWidth: 26, mt: 0.25 }}>
                        <CloseRoundedIcon sx={{ fontSize: 16, color: '#FF5252' }} />
                      </ListItemIcon>
                      <ListItemText
                        primary={mistake}
                        primaryTypographyProps={{ variant: 'body2', color: 'text.primary', lineHeight: 1.5 }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Grid>
          </Grid>
        )}

        {/* TAB 2: MUSCLE ANATOMY */}
        {tabIndex === 2 && (
          <Stack spacing={3}>
            <Box>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1 }}>
                PRIMARY TARGET MUSCLE
              </Typography>
              <Box sx={{ mt: 1 }}>
                <Chip
                  label={tutorial.muscle}
                  sx={{
                    bgcolor: 'primary.main',
                    color: '#000',
                    fontWeight: 900,
                    fontSize: '0.9rem',
                    py: 2,
                    px: 1.5,
                  }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="caption" fontWeight={800} color="text.secondary" sx={{ letterSpacing: 1 }}>
                SECONDARY & STABILIZING MUSCLES
              </Typography>
              <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap" sx={{ mt: 1 }}>
                {tutorial.secondaryMuscles?.map((muscle, idx) => (
                  <Chip
                    key={idx}
                    label={muscle}
                    sx={{
                      bgcolor: 'rgba(138,124,255,0.12)',
                      color: '#8A7CFF',
                      fontWeight: 700,
                      border: '1px solid rgba(138,124,255,0.3)',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: 'rgba(255,255,255,0.02)',
                borderColor: 'divider',
              }}
            >
              <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1 }}>
                <TrendingUpRoundedIcon sx={{ color: 'primary.main' }} />
                <Typography variant="subtitle2" fontWeight={800}>
                  Kinetic Mechanics & Biomechanics
                </Typography>
              </Stack>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                This is a <strong>{tutorial.mechanics}</strong> movement utilizing <strong>{tutorial.equipment}</strong>.
                {tutorial.mechanics === 'Compound'
                  ? ' Compound exercises recruit multiple joints and large muscle groups simultaneously, triggering higher neural drive and maximum hormonal response for muscle growth and power.'
                  : ' Isolation movements focus tension directly across a single joint, enabling targeted muscle hypertrophy and refining muscular symmetry without excessive systemic fatigue.'}
              </Typography>
            </Paper>
          </Stack>
        )}

        {/* TAB 3: REP TARGETS & TEMPO */}
        {tabIndex === 3 && (
          <Stack spacing={3}>
            <Grid container spacing={2}>
              {tutorial.targets && (
                <>
                  {tutorial.targets.strength && (
                    <Grid item xs={12} sm={4}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          height: '100%',
                          bgcolor: 'background.default',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="error.main" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                          STRENGTH / POWER
                        </Typography>
                        <Typography variant="body1" fontWeight={800} sx={{ my: 0.5 }}>
                          {tutorial.targets.strength}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rest: 2.5–4 minutes between sets
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {tutorial.targets.hypertrophy && (
                    <Grid item xs={12} sm={4}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          height: '100%',
                          bgcolor: 'background.default',
                          borderColor: 'primary.main',
                        }}
                      >
                        <Typography variant="caption" color="primary.main" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                          HYPERTROPHY / MUSCLE
                        </Typography>
                        <Typography variant="body1" fontWeight={800} sx={{ my: 0.5 }}>
                          {tutorial.targets.hypertrophy}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rest: 60–90 seconds between sets
                        </Typography>
                      </Paper>
                    </Grid>
                  )}

                  {tutorial.targets.endurance && (
                    <Grid item xs={12} sm={4}>
                      <Paper
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          height: '100%',
                          bgcolor: 'background.default',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography variant="caption" color="secondary.main" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
                          ENDURANCE / BURN
                        </Typography>
                        <Typography variant="body1" fontWeight={800} sx={{ my: 0.5 }}>
                          {tutorial.targets.endurance}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Rest: 45–60 seconds between sets
                        </Typography>
                      </Paper>
                    </Grid>
                  )}
                </>
              )}
            </Grid>

            {/* Tempo */}
            {tutorial.tempo && (
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(198,255,62,0.05)',
                  borderColor: 'rgba(198,255,62,0.2)',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 2,
                }}
              >
                <TimerRoundedIcon sx={{ color: 'primary.main', mt: 0.25 }} />
                <Box>
                  <Typography variant="caption" fontWeight={800} color="primary.main" sx={{ letterSpacing: 0.5 }}>
                    RECOMMENDED LIFTING TEMPO
                  </Typography>
                  <Typography variant="body1" fontWeight={700} sx={{ my: 0.5 }}>
                    {tutorial.tempo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Eccentric (lowering) phase • Bottom pause • Concentric (lifting) phase • Top reset
                  </Typography>
                </Box>
              </Paper>
            )}
          </Stack>
        )}
      </DialogContent>

      {/* Footer */}
      <DialogActions sx={{ p: { xs: 2, sm: 3 }, pt: 1.5, borderTop: '1px solid', borderColor: 'divider' }}>
        <Button onClick={onClose} sx={{ borderRadius: 2, color: 'text.secondary', fontWeight: 600 }}>
          Close
        </Button>

        {onAddExercise && (
          <Button
            variant="contained"
            disabled={isAdded}
            onClick={() => {
              onAddExercise(exercise);
              onClose();
            }}
            startIcon={isAdded ? <CheckCircleRoundedIcon /> : <FitnessCenterRoundedIcon />}
            sx={{
              borderRadius: 2.5,
              px: 3,
              py: 1,
              bgcolor: 'primary.main',
              color: '#000',
              fontWeight: 800,
              boxShadow: '0 4px 14px rgba(198,255,62,0.3)',
              '&:hover': { bgcolor: '#b3f520' },
            }}
          >
            {isAdded ? 'Added to Workout' : 'Add to Workout'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
