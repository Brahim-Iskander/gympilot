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

        String screenshotBase64,

        String screenshotType,

        String paymentMethod, // D17, USDT_TRC20, BTC, ETH

        String txid, // Blockchain transaction hash

        String walletAddress, // Receiving wallet address used

        String cryptoAmount // Formatted crypto amount (e.g. 49.00 USDT)
) {
    /**
     * Backward-compatible 9-parameter constructor for existing D17 callers and unit tests.
     */
    public SubmitD17PaymentRequest(
            String type,
            String orderId,
            String subscriptionTier,
            Integer aiCredits,
            Double amount,
            String senderPhoneNumber,
            String userNotes,
            String screenshotBase64,
            String screenshotType) {
        this(type, orderId, subscriptionTier, aiCredits, amount, senderPhoneNumber, userNotes,
                screenshotBase64, screenshotType, "D17", null, null, null);
    }
}
