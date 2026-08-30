package com.gymtrack.dto;

import java.time.Instant;

import com.gymtrack.model.User;

/**
 * Extended user info for admin user management.
 */
public record AdminUserResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        String role,
        boolean banned,
        Instant bannedAt,
        Instant lastLoginAt,
        String membershipTier,
        String membershipStatus,
        boolean hasActiveMembership,
        Instant createdAt
) {

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole() : "USER",
                user.isBanned(),
                user.getBannedAt(),
                user.getLastLoginAt(),
                user.getMembershipTier(),
                user.getMembershipStatus(),
                user.hasActiveMembership(),
                user.getCreatedAt());
    }
}
