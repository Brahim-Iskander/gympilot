package com.gymtrack.dto;

public record AiUsageStatusResponse(
        String tier,
        boolean isAdmin,
        FeatureUsage progressAnalysis,
        FeatureUsage bodyScan
) {
    public record FeatureUsage(
            String feature,
            int limit,
            long used,
            long remaining,
            String period, // "LIFETIME" or "MONTHLY" or "UNLIMITED"
            boolean isExceeded
    ) {}
}
