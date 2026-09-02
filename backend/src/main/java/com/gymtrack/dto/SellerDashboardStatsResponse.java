package com.gymtrack.dto;

import java.util.List;

public record SellerDashboardStatsResponse(
        long totalProducts,
        long activeProducts,
        long outOfStockProducts,
        long totalOrders,
        double totalRevenue,
        double thisMonthRevenue,
        String bestSellingProduct,
        List<OrderResponse> recentOrders
) {
}
