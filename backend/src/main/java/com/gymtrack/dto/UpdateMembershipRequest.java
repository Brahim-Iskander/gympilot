package com.gymtrack.dto;

/**
 * Request body for updating user membership tier and status.
 */
public record UpdateMembershipRequest(
        String membershipTier,
        String membershipStatus
) {
}
