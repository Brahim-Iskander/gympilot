package com.gymtrack.dto;

import java.util.List;

/**
 * Chart data for registration analytics.
 */
public record AnalyticsChartResponse(List<DataPoint> data) {

    public record DataPoint(String date, long count) {
    }
}
