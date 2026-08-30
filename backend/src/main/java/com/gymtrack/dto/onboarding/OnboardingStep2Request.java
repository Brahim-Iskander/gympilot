package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OnboardingStep2Request(
        @NotBlank(message = "Goal is required")
        @Pattern(regexp = "^(build_muscle|lose_fat|recomposition|strength|maintain)$", message = "Invalid goal")
        String goal
) {}