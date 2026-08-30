package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.Size;

import java.util.List;

public record OnboardingStep7Request(
        @Size(max = 2000, message = "Injuries must not exceed 2000 characters")
        String injuries,

        @Size(max = 50, message = "Maximum 50 exercises that cannot be done")
        List<String> cannotDoExercises
) {}