package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

public record OnboardingStep4Request(
        @NotNull(message = "Days per week is required")
        @Min(value = 2, message = "Minimum 2 days per week")
        @Max(value = 6, message = "Maximum 6 days per week")
        Integer daysPerWeek,

        @NotNull(message = "Preferred days is required")
        @Size(min = 1, message = "Select at least one day")
        List<String> preferredDays,

        @NotNull(message = "Minutes per session is required")
        @Min(value = 20, message = "Minimum 20 minutes per session")
        @Max(value = 180, message = "Maximum 180 minutes per session")
        Integer minutesPerSession
) {}