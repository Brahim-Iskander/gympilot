package com.gymtrack.dto;

import java.time.Instant;

import com.gymtrack.model.PointTransaction;

public record PointTransactionResponse(
        String id,
        int points,
        String reason,
        String description,
        Instant createdAt
) {
    public static PointTransactionResponse from(PointTransaction tx) {
        return new PointTransactionResponse(
                tx.getId(),
                tx.getPoints(),
                tx.getReason(),
                tx.getDescription(),
                tx.getCreatedAt()
        );
    }
}
