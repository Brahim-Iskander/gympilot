package com.gymtrack.dto;

import java.time.Instant;

public record ReferredFriendResponse(
        String name,
        Instant joinedAt,
        int pointsEarned
) {
}
