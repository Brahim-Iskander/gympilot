package com.gymtrack.dto;

import java.time.Instant;
import java.util.List;

import com.gymtrack.model.OrderItem;

public record SellerOrderTransactionResponse(
        String orderId,
        String orderNumber,
        Instant createdAt,
        String buyerName,
        String buyerEmail,
        String status,
        String paymentStatus,
        String paymentMethod,
        List<OrderItem> sellerItems,
        int itemsCount,
        double sellerRevenue,
        double commissionAmount,
        double sellerNet,
        boolean isCancelledOrRefunded
) {
}
