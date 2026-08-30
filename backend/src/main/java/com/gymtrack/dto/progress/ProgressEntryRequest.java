package com.gymtrack.dto.progress;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.gymtrack.model.ProgressEntry.ProgressPhoto;
import com.gymtrack.model.ProgressEntry.StrengthLog;

import jakarta.validation.constraints.NotNull;

public record ProgressEntryRequest(
        @NotNull(message = "Date is required")
        LocalDate date,

        Double weight,
        String weightUnit,

        Map<String, Double> measurements,
        String measurementUnit,

        List<StrengthLog> strengthLogs,
        List<ProgressPhoto> photos,

        String note
) {
}
