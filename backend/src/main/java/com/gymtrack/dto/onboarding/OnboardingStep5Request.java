package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record OnboardingStep5Request(
        @NotBlank(message = "Equipment is required")
        @Pattern(regexp = "^(full_gym|dumbbells_only|home_gym|bodyweight_only)$", message = "Invalid equipment type")
        String equipment
) {}