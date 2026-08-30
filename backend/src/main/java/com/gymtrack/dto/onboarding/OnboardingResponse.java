package com.gymtrack.dto.onboarding;

import java.time.Instant;
import java.util.List;

public record OnboardingResponse(
        String id,
        String userId,
        Integer age,
        String sex,
        Double heightCm,
        Double weightKg,
        String goal,
        String experienceLevel,
        Integer trainingMonths,
        Integer daysPerWeek,
        List<String> preferredDays,
        Integer minutesPerSession,
        String equipment,
        String currentRoutine,
        String strengthLevels,
        List<String> likedExercises,
        List<String> dislikedExercises,
        String injuries,
        List<String> cannotDoExercises,
        String aiGeneratedPlan,
        Boolean completed,
        Integer currentStep,
        Instant createdAt,
        Instant updatedAt
) {
    public static OnboardingResponse from(com.gymtrack.model.UserOnboarding o) {
        return new OnboardingResponse(
                o.getId(),
                o.getUserId(),
                o.getAge(),
                o.getSex(),
                o.getHeightCm(),
                o.getWeightKg(),
                o.getGoal(),
                o.getExperienceLevel(),
                o.getTrainingMonths(),
                o.getDaysPerWeek(),
                o.getPreferredDays(),
                o.getMinutesPerSession(),
                o.getEquipment(),
                o.getCurrentRoutine(),
                o.getStrengthLevels(),
                o.getLikedExercises(),
                o.getDislikedExercises(),
                o.getInjuries(),
                o.getCannotDoExercises(),
                o.getAiGeneratedPlan(),
                o.getCompleted(),
                o.getCurrentStep(),
                o.getCreatedAt(),
                o.getUpdatedAt()
        );
    }
}