package com.gymtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record RecordPayoutRequest(
        @Positive(message = "Payout amount must be strictly positive")
        double amount,

        @NotBlank(message = "Payment method is required")
        String paymentMethod,

        String referenceNumber,

        String notes
) {
}
