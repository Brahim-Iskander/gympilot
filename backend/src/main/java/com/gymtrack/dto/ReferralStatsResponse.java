package com.gymtrack.dto;

import java.util.List;

public record ReferralStatsResponse(
        String referralCode,
        String referralLink,
        int totalPoints,
        int friendsReferredCount,
        int pointsEarnedFromReferrals,
        List<ReferredFriendResponse> referredFriends,
        List<PointTransactionResponse> recentTransactions
) {
}
