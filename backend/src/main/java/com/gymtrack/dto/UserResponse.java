package com.gymtrack.dto;

import java.time.Instant;
import java.util.Set;

import com.gymtrack.model.User;

/**
 * Public representation of a user. Never includes the password hash.
 */
public record UserResponse(String id, String firstName, String lastName, String email,
                           String role, Set<String> roles, boolean isSeller, boolean isCoach, boolean isAdmin,
                           boolean banned, String membershipTier,
                           String membershipStatus, boolean hasActiveMembership, Instant createdAt,
                           String avatar, int points, String referralCode, String storeName) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.getRoles(),
                user.isSeller(),
                user.isCoach(),
                user.isAdmin(),
                user.isBanned(),
                user.getMembershipTier(),
                user.getMembershipStatus(),
                user.hasActiveMembership(),
                user.getCreatedAt(),
                user.getAvatar(),
                user.getPoints(),
                user.getReferralCode(),
                user.getStoreName());
    }
}
