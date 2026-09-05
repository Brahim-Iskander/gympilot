package com.gymtrack.dto;

import java.util.List;

import com.gymtrack.model.SellerPayout;

public record SellerEarningsDetailResponse(
        SellerEarningsSummaryResponse summary,
        List<SellerProductSaleSummary> products,
        List<SellerOrderTransactionResponse> transactions,
        List<SellerPayout> payouts
) {
}
