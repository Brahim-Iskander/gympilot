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
        String notes,
        Double commissionRate,
        String storeName
) {
    public UpdateUserRolesRequest(Set<String> roles, Boolean isSeller, Boolean isCoach, Boolean isAdmin, String notes) {
        this(roles, isSeller, isCoach, isAdmin, notes, null, null);
    }
}

