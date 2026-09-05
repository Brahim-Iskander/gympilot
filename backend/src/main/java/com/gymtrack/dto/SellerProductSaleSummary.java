package com.gymtrack.dto;

public record SellerProductSaleSummary(
        String productId,
        String productName,
        String productImage,
        double price,
        int unitsSold,
        double totalRevenue
) {
}
