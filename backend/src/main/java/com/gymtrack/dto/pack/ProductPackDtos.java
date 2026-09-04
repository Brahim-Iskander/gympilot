package com.gymtrack.dto.pack;

import java.time.Instant;
import java.util.List;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public class ProductPackDtos {

    public record PackItemDto(
            @NotBlank(message = "Item name is required")
            String name,
            int quantity,
            String description,
            String dosage
    ) {}

    public record PackRequestDto(
            @NotBlank(message = "Pack name is required")
            String name,

            String tagline,

            String badge,

            String description,

            @Min(value = 0, message = "Original price cannot be negative")
            double originalPrice,

            @Min(value = 0, message = "Offer price cannot be negative")
            double price,

            List<String> images,

            List<PackItemDto> items,

            boolean active,

            boolean featured,

            int stockQuantity,

            Instant validUntil
    ) {}
}
