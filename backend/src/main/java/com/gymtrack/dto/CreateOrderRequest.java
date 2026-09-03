package com.gymtrack.dto;

import java.util.List;
import java.util.Map;

import jakarta.validation.constraints.NotEmpty;

public record CreateOrderRequest(
        @NotEmpty(message = "Order must contain at least one item")
        List<OrderItemRequest> items,

        Map<String, String> shippingAddress,

        String paymentMethod, // CASH_ON_DELIVERY, CREDIT_CARD, PAYPAL

        int pointsToUse,

        String voucherCode,

        String notes
) {
}
