package com.gymtrack.dto;

import java.time.Instant;

import com.gymtrack.model.User;

/**
 * Public representation of a user. Never includes the password hash.
 */
public record UserResponse(String id, String firstName, String lastName, String email,
                           String role, boolean banned, String membershipTier,
                           String membershipStatus, boolean hasActiveMembership, Instant createdAt) {

    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole(),
                user.isBanned(),
                user.getMembershipTier(),
                user.getMembershipStatus(),
                user.hasActiveMembership(),
                user.getCreatedAt());
    }
}
