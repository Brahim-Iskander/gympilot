package com.gymtrack.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record UpdateSellerCommissionRequest(
        @Min(value = 0, message = "Commission rate cannot be negative")
        @Max(value = 100, message = "Commission rate cannot exceed 100%")
        double commissionRate
) {
}
