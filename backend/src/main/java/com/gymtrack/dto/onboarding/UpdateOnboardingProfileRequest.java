package com.gymtrack.dto.onboarding;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Full training-profile update used by Settings after onboarding is complete.
 */
public record UpdateOnboardingProfileRequest(

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
        Double weightKg,

        @NotBlank(message = "Goal is required")
        @Pattern(regexp = "^(build_muscle|lose_fat|recomposition|strength|maintain)$", message = "Invalid goal")
        String goal,

        @NotBlank(message = "Experience level is required")
        @Pattern(regexp = "^(beginner|intermediate|advanced)$", message = "Experience must be beginner, intermediate, or advanced")
        String experienceLevel,

        @NotNull(message = "Training months is required")
        @Min(value = 0, message = "Training months cannot be negative")
        Integer trainingMonths,

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
        Integer minutesPerSession,

        @NotBlank(message = "Equipment is required")
        @Pattern(regexp = "^(full_gym|dumbbells_only|home_gym|bodyweight_only)$", message = "Invalid equipment type")
        String equipment,

        @Size(max = 2000, message = "Current routine must not exceed 2000 characters")
        String currentRoutine,

        @Size(max = 2000, message = "Strength levels must not exceed 2000 characters")
        String strengthLevels,

        @Size(max = 50, message = "Maximum 50 liked exercises")
        List<String> likedExercises,

        @Size(max = 50, message = "Maximum 50 disliked exercises")
        List<String> dislikedExercises,

        @Size(max = 2000, message = "Injuries must not exceed 2000 characters")
        String injuries,

        @Size(max = 50, message = "Maximum 50 exercises that cannot be done")
        List<String> cannotDoExercises
) {
}
