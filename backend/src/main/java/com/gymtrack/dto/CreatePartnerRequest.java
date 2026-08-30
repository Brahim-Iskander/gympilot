package com.gymtrack.dto;

import jakarta.validation.constraints.NotBlank;

public record CreatePartnerRequest(
        @NotBlank(message = "Partner name is required") String name,
        @NotBlank(message = "Partner image URL is required") String imageUrl,
        @NotBlank(message = "Partner description is required") String description,
        @NotBlank(message = "Partner website URL is required") String websiteUrl
) {
}
