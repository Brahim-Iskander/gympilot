package com.gymtrack.dto;

import java.util.Set;

/**
 * Request payload for admin modifying a user's multi-capability roles.
 */
public record UpdateUserRolesRequest(
        Set<String> roles,
        Boolean isSeller,
        Boolean isCoach,
        Boolean isAdmin,
        String notes
) {
}
