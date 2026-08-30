package com.gymtrack.dto.progress;

import java.time.Instant;
import java.util.List;

public record ProgressAnalysisResponse(
        String summary,
        String weightTrend,
        String measurementTrend,
        String strengthTrend,
        List<String> suggestions,
        String dataQualityNotes,
        String fullAnalysisMarkdown,
        Instant generatedAt
) {
}
