package com.gymtrack.dto;

import java.time.Instant;
import java.util.Set;

import com.gymtrack.model.User;

/**
 * Extended user info for admin user management with multi-capability support.
 */
public record AdminUserResponse(
        String id,
        String firstName,
        String lastName,
        String email,
        String role,
        Set<String> roles,
        boolean isSeller,
        boolean isCoach,
        boolean isAdmin,
        boolean banned,
        Instant bannedAt,
        Instant lastLoginAt,
        String membershipTier,
        String membershipStatus,
        boolean hasActiveMembership,
        Instant createdAt,
        String avatar,
        Instant trialEndsAt,
        boolean isTrialActive,
        Instant membershipExpiresAt
) {

    public static AdminUserResponse from(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole() : "USER",
                user.getRoles(),
                user.isSeller(),
                user.isCoach(),
                user.isAdmin(),
                user.isBanned(),
                user.getBannedAt(),
                user.getLastLoginAt(),
                user.getMembershipTier(),
                user.getMembershipStatus(),
                user.hasActiveMembership(),
                user.getCreatedAt(),
                user.getAvatar(),
                user.getTrialEndsAt(),
                user.isTrialActive(),
                user.getMembershipExpiresAt());
    }
}
