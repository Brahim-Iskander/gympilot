import { useState, useEffect } from 'react';
import { onboardingService } from '../services/onboardingService';

export function useAiPlan() {
  const [aiPlan, setAiPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;

    async function fetchPlan() {
      try {
        const data = await onboardingService.get();
        if (active && data?.aiGeneratedPlan) {
          try {
            const parsed = JSON.parse(data.aiGeneratedPlan);
            setAiPlan({ ...data, ...parsed });
          } catch (e) {
            console.error('Failed to parse AI plan JSON', e);
          }
        }
      } catch (err) {
        if (active) {
          console.error('Failed to fetch onboarding data for AI plan', err);
          setError(err.message || 'Error fetching plan');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    fetchPlan();

    return () => {
      active = false;
    };
  }, []);

  return { aiPlan, loading, error };
}
