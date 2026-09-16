package com.gymtrack.dto.ai;

import jakarta.validation.constraints.NotBlank;

public record PurchaseAiCreditRequest(
        @NotBlank(message = "packId is required")
        String packId,
        String paymentMethod
) {}
