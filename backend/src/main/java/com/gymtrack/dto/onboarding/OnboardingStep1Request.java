package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record OnboardingStep1Request(
        @NotNull(message = "Age is required")
        @Min(value = 13, message = "Must be at least 13 years old")
        @Max(value = 100, message = "Age must not exceed 100")
        Integer age,

        @NotBlank(message = "Sex is required")
        @Pattern(regexp = "^(male|female|other)$", message = "Sex must be male, female, or other")
        String sex,

        @NotNull(message = "Height is required")
        @Min(value = 100, message = "Height must be at least 100 cm")
        @Max(value = 250, message = "Height must not exceed 250 cm")
        Double heightCm,

        @NotNull(message = "Weight is required")
        @Min(value = 30, message = "Weight must be at least 30 kg")
        @Max(value = 300, message = "Weight must not exceed 300 kg")
        Double weightKg
) {}