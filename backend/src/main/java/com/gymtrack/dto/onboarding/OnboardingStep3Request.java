package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record OnboardingStep3Request(
        @NotBlank(message = "Experience level is required")
        @Pattern(regexp = "^(beginner|intermediate|advanced)$", message = "Experience must be beginner, intermediate, or advanced")
        String experienceLevel,

        @NotNull(message = "Training months is required")
        @Min(value = 0, message = "Training months cannot be negative")
        Integer trainingMonths
) {}