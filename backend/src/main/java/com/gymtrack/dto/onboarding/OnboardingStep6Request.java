package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.Size;

import java.util.List;

public record OnboardingStep6Request(
        @Size(max = 2000, message = "Current routine must not exceed 2000 characters")
        String currentRoutine,

        @Size(max = 2000, message = "Strength levels must not exceed 2000 characters")
        String strengthLevels,

        @Size(max = 50, message = "Maximum 50 liked exercises")
        List<String> likedExercises,

        @Size(max = 50, message = "Maximum 50 disliked exercises")
        List<String> dislikedExercises
) {}