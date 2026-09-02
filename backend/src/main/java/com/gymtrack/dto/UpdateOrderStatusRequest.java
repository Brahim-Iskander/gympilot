package com.gymtrack.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateOrderStatusRequest(
        @NotBlank(message = "Order status is required")
        String status,

        String notes
) {
}
