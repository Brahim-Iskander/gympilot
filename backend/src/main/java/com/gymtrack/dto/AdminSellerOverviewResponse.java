package com.gymtrack.dto;

import java.util.List;

public record AdminSellerOverviewResponse(
        double totalPlatformGrossRevenue,
        double totalPlatformCommissionEarned,
        double totalNetSellerPayouts,
        double totalPaidOut,
        double totalPendingPayouts,
        long totalActiveSellers,
        long totalProductsSold,
        List<SellerEarningsSummaryResponse> sellers
) {
}
