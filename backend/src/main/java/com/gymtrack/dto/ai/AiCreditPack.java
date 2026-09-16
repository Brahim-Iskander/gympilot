package com.gymtrack.dto.ai;

public record AiCreditPack(
        String id,
        String title,
        String badge,
        int credits,
        double priceTnd,
        int pointsPrice,
        double pricePerScan,
        int savingsPercent,
        String description
) {}
