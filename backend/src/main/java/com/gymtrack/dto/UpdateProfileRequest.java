package com.gymtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Account update — name and optional avatar.
 */
public record UpdateProfileRequest(

        @NotBlank(message = "First name is required")
        @Size(max = 50, message = "First name must not exceed 50 characters")
        String firstName,

        @NotBlank(message = "Last name is required")
        @Size(max = 50, message = "Last name must not exceed 50 characters")
        String lastName,

        String avatar
) {
    public UpdateProfileRequest(String firstName, String lastName) {
        this(firstName, lastName, null);
    }
}
