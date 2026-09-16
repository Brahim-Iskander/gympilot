package com.gymtrack.dto.payment;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SubmitD17PaymentRequest(
        @NotBlank(message = "Payment type is required (SUBSCRIPTION, ORDER, or AI_CREDIT)")
        String type,

        String orderId,

        String subscriptionTier,

        Integer aiCredits,

        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
        Double amount,

        String senderPhoneNumber,

        String userNotes,

        @NotBlank(message = "Screenshot proof is required")
        String screenshotBase64,

        String screenshotType
) {}
