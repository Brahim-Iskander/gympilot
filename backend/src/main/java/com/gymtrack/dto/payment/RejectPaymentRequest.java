package com.gymtrack.dto.payment;

import jakarta.validation.constraints.NotBlank;

public record RejectPaymentRequest(
        @NotBlank(message = "Rejection reason is required")
        String reason,

        String adminNotes
) {}
