package com.gymtrack.dto;

import java.util.List;

/**
 * AI-generated progress and performance analytics response.
 */
public record AiAnalyticsResponse(
        String summary,
        int strengthScore,
        int consistencyScore,
        String overloadRate,
        String primaryFocus,
        List<String> aiRecommendations,
        List<String> predictedMilestones
) {
}
