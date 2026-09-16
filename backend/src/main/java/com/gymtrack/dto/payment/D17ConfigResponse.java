package com.gymtrack.dto.payment;

public record D17ConfigResponse(
        String phoneNumber,
        String recipientName,
        String instructions,
        int slaHours,
        String currency
) {}
