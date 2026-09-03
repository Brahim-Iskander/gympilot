package com.gymtrack.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.gymtrack.model.Order;
import com.gymtrack.model.OrderItem;

public record OrderResponse(
        String id,
        String orderNumber,
        String buyerId,
        String buyerName,
        String buyerEmail,
        List<OrderItem> items,
        double totalAmount,
        double discountAmount,
        String voucherCode,
        double shippingFee,
        int pointsUsed,
        int pointsEarned,
        String status,
        Map<String, String> shippingAddress,
        String paymentMethod,
        String paymentStatus,
        String notes,
        Instant createdAt,
        Instant updatedAt
) {
    public static OrderResponse from(Order o) {
        return new OrderResponse(
                o.getId(),
                o.getOrderNumber(),
                o.getBuyerId(),
                o.getBuyerName(),
                o.getBuyerEmail(),
                o.getItems(),
                o.getTotalAmount(),
                o.getDiscountAmount(),
                o.getVoucherCode(),
                o.getShippingFee(),
                o.getPointsUsed(),
                o.getPointsEarned(),
                o.getStatus(),
                o.getShippingAddress(),
                o.getPaymentMethod(),
                o.getPaymentStatus(),
                o.getNotes(),
                o.getCreatedAt(),
                o.getUpdatedAt()
        );
    }
}
