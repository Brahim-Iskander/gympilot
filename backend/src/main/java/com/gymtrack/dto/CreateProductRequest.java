package com.gymtrack.dto;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

public record CreateProductRequest(
        @NotBlank(message = "Product name is required")
        String name,

        String description,

        @NotBlank(message = "Category is required")
        String categoryId,

        @Min(value = 0, message = "Price must be greater than or equal to 0")
        double price,

        Double originalPrice,

        @Min(value = 0, message = "Stock quantity cannot be negative")
        int stockQuantity,

        List<String> images,

        Map<String, String> specs,

        Boolean active,
        Boolean featured
) {
}
