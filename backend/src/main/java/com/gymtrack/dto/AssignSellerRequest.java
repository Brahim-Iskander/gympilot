package com.gymtrack.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;

/**
 * Request payload when an admin assigns/promotes a user to SELLER role with a custom commission percentage.
 */
public record AssignSellerRequest(
        String userId,
        String email,
        String storeName,
        @DecimalMin(value = "0.0", message = "Commission rate cannot be negative")
        @DecimalMax(value = "100.0", message = "Commission rate cannot exceed 100%")
        Double commissionRate,
        String notes
) {
}
