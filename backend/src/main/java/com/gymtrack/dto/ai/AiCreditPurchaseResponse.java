package com.gymtrack.dto.ai;

public record AiCreditPurchaseResponse(
        boolean success,
        int creditsAdded,
        int newCreditBalance,
        int remainingPoints,
        String message
) {}
