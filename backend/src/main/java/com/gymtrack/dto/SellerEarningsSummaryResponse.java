package com.gymtrack.dto;

import java.time.Instant;

public record SellerEarningsSummaryResponse(
        String sellerId,
        String sellerName,
        String sellerEmail,
        String phone,
        String storeName,
        String storeBio,
        String storeLogo,
        String avatar,
        boolean isVerified,
        boolean banned,
        Instant joinedAt,
        Instant lastSaleAt,
        long totalOrdersCount,
        long totalUnitsSold,
        double grossRevenue,
        double commissionRate,
        double platformCommission,
        double netEarnings,
        double totalPaidOut,
        double pendingPayout,
        long cancelledOrdersCount,
        double refundedAmount
) {
}
