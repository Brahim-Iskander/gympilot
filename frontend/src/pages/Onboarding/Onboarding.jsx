import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import {
  Alert,
  Box,
  Button,
  Container,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import ArrowBackRoundedIcon from '@mui/icons-material/ArrowBackRounded';
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded';
import CheckRoundedIcon from '@mui/icons-material/CheckRounded';

import Logo from '../../components/Logo';
import LanguageSelector from '../../components/LanguageSelector';
import FullScreenLoader from '../../components/FullScreenLoader';
import SEO from '../../components/SEO';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../i18n';
import { onboardingService } from '../../services/onboardingService';
import { getApiErrorMessage } from '../../utils/errors';
import {
  EMPTY_FORM,
  TOTAL_STEPS,
  formFromOnboarding,
  payloadForStep,
  validateStep,
} from './constants';
import StepBasicProfile from './steps/StepBasicProfile';
import StepGoal from './steps/StepGoal';
import StepExperience from './steps/StepExperience';
import StepAvailability from './steps/StepAvailability';
import StepEquipment from './steps/StepEquipment';
import StepTrainingData from './steps/StepTrainingData';
import StepLimitations from './steps/StepLimitations';

export default function Onboarding() {
  const { isAuthenticated, loading: authLoading, onboardingCompleted, setOnboardingCompleted } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [bootstrapping, setBootstrapping] = useState(true);
  const [step, setStep] = useState(1);
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let active = true;

    async function load() {
      try {
        const data = await onboardingService.get();
        if (!active) return;

        if (data.completed) {
          setOnboardingCompleted(true);
          return;
        }

        setValues(formFromOnboarding(data));
        setStep(Math.min(Math.max(data.currentStep ?? 1, 1), TOTAL_STEPS));
      } catch (error) {
        if (active) setFormError(getApiErrorMessage(error));
      } finally {
        if (active) setBootstrapping(false);
      }
    }

    load();
    return () => {
      active = false;
    };
  }, [authLoading, isAuthenticated, setOnboardingCompleted]);

  if (authLoading || (isAuthenticated && bootstrapping && !onboardingCompleted)) {
    return <FullScreenLoader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  const stepMetaKeys = [
    'onboarding.steps.basicProfile',
    'onboarding.steps.goal',
    'onboarding.steps.experience',
    'onboarding.steps.availability',
    'onboarding.steps.equipment',
    'onboarding.steps.training',
    'onboarding.steps.limitations',
  ];
  const currentKey = stepMetaKeys[step - 1] || stepMetaKeys[0];
  const meta = {
    title: t(`${currentKey}.title`),
    subtitle: t(`${currentKey}.subtitle`),
  };
  const progress = (step / TOTAL_STEPS) * 100;

  const handleFieldChange = (fieldOrPatch, maybeValue) => {
    setValues((current) => {
      if (typeof fieldOrPatch === 'object' && fieldOrPatch !== null) {
        return { ...current, ...fieldOrPatch };
      }
      return { ...current, [fieldOrPatch]: maybeValue };
    });
    setErrors((current) => {
      if (typeof fieldOrPatch === 'object' && fieldOrPatch !== null) {
        const cleared = { ...current };
        Object.keys(fieldOrPatch).forEach((key) => {
          cleared[key] = undefined;
        });
        return cleared;
      }
      return { ...current, [fieldOrPatch]: undefined };
    });
  };

  const handleBack = () => {
    setFormError('');
    setErrors({});
    setStep((current) => Math.max(1, current - 1));
  };

  const handleNext = async (event) => {
    event.preventDefault();
    const nextErrors = validateStep(step, values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    setFormError('');
    try {
      const updated = await onboardingService.saveStep(step, payloadForStep(step, values));

      if (step === TOTAL_STEPS || updated.completed) {
        setGenerating(true);
        try {
          await onboardingService.generateAiPlan();
        } catch (e) {
          console.error('AI plan generation failed', e);
        }
        setOnboardingCompleted(true);
        navigate('/dashboard', { replace: true });
        return;
      }

      setStep((current) => Math.min(TOTAL_STEPS, current + 1));
      setSubmitting(false);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
      setSubmitting(false); // Reset submitting if there's an error
    }
  };

  const stepProps = { values, errors, onChange: handleFieldChange };

  if (generating) {
    return (
      <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        <Container maxWidth="sm" sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', py: { xs: 3, md: 5 }, alignItems: 'center', justifyContent: 'center' }}>
          <Logo />
          <Typography variant="h5" sx={{ mt: 4, mb: 2, fontFamily: "'Sora','Inter',sans-serif" }}>
            Generating your personalized plan...
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Our AI coach is analyzing your profile to build the optimal workout and nutrition plan.
          </Typography>
          <LinearProgress sx={{ width: '100%', height: 8, borderRadius: 4 }} />
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
      <SEO
        title="Athlete Setup & Onboarding"
        description="Set up your physical profile, goal focus, experience, and training schedule on GymPilot."
        path="/onboarding"
        noIndex
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          top: -220,
          right: -180,
          width: 520,
          height: 520,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(198,255,62,0.10), transparent 65%)',
          pointerEvents: 'none',
        }}
      />
      <Box
        aria-hidden
        sx={{
          position: 'absolute',
          bottom: -260,
          left: -200,
          width: 560,
          height: 560,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(138,124,255,0.10), transparent 65%)',
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="sm" sx={{ position: 'relative', flex: 1, display: 'flex', flexDirection: 'column', py: { xs: 3, md: 5 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Logo />
          <LanguageSelector />
        </Box>

        <Paper
          elevation={0}
          component="form"
          onSubmit={handleNext}
          noValidate
          sx={{
            p: { xs: 3, sm: 4.5 },
            borderRadius: 4,
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: '0 30px 80px rgba(0,0,0,0.45)',
          }}
        >
          <Stack spacing={0.5} sx={{ mb: 2 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
              {t('onboarding.step', { current: step, total: TOTAL_STEPS })}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={progress}
              sx={{
                height: 6,
                borderRadius: 999,
                bgcolor: 'action.hover',
                '& .MuiLinearProgress-bar': { borderRadius: 999 },
              }}
            />
          </Stack>

          <Typography variant="h5" sx={{ fontFamily: "'Sora','Inter',sans-serif" }}>
            {meta?.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, mb: 3 }}>
            {meta?.subtitle}
          </Typography>

          {formError && (
            <Alert severity="error" variant="outlined" sx={{ mb: 2.5 }}>
              {formError}
            </Alert>
          )}

          {step === 1 && <StepBasicProfile {...stepProps} />}
          {step === 2 && <StepGoal {...stepProps} />}
          {step === 3 && <StepExperience {...stepProps} />}
          {step === 4 && <StepAvailability {...stepProps} />}
          {step === 5 && <StepEquipment {...stepProps} />}
          {step === 6 && <StepTrainingData {...stepProps} />}
          {step === 7 && <StepLimitations {...stepProps} />}

          <Stack direction="row" spacing={1.5} sx={{ mt: 4 }}>
            <Button
              type="button"
              variant="outlined"
              disabled={step === 1 || submitting}
              onClick={handleBack}
              startIcon={<ArrowBackRoundedIcon />}
              sx={{ minWidth: 120 }}
            >
              {t('common.back')}
            </Button>
            <Box sx={{ flex: 1 }} />
            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={submitting}
              endIcon={step === TOTAL_STEPS ? <CheckRoundedIcon /> : <ArrowForwardRoundedIcon />}
              sx={{ minWidth: 140 }}
            >
              {submitting ? t('common.saving') : step === TOTAL_STEPS ? t('onboarding.generatePlan') : t('common.next')}
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
