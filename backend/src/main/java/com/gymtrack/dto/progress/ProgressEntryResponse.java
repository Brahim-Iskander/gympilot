package com.gymtrack.dto.progress;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import com.gymtrack.model.ProgressEntry;
import com.gymtrack.model.ProgressEntry.ProgressPhoto;
import com.gymtrack.model.ProgressEntry.StrengthLog;

public record ProgressEntryResponse(
        String id,
        String userId,
        LocalDate date,
        Double weight,
        String weightUnit,
        Map<String, Double> measurements,
        String measurementUnit,
        List<StrengthLog> strengthLogs,
        List<ProgressPhoto> photos,
        String note,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProgressEntryResponse from(ProgressEntry entry) {
        return new ProgressEntryResponse(
                entry.getId(),
                entry.getUserId(),
                entry.getDate(),
                entry.getWeight(),
                entry.getWeightUnit(),
                entry.getMeasurements(),
                entry.getMeasurementUnit(),
                entry.getStrengthLogs(),
                entry.getPhotos(),
                entry.getNote(),
                entry.getCreatedAt(),
                entry.getUpdatedAt()
        );
    }
}
