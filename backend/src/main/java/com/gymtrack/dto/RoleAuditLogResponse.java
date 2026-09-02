package com.gymtrack.dto;

import java.time.Instant;
import java.util.Set;

import com.gymtrack.model.RoleAuditLog;

public record RoleAuditLogResponse(
        String id,
        String targetUserId,
        String targetUserEmail,
        String targetUserName,
        String changedByAdminId,
        String changedByAdminEmail,
        Set<String> previousRoles,
        Set<String> newRoles,
        String action,
        String notes,
        Instant createdAt
) {
    public static RoleAuditLogResponse from(RoleAuditLog log) {
        return new RoleAuditLogResponse(
                log.getId(),
                log.getTargetUserId(),
                log.getTargetUserEmail(),
                log.getTargetUserName(),
                log.getChangedByAdminId(),
                log.getChangedByAdminEmail(),
                log.getPreviousRoles(),
                log.getNewRoles(),
                log.getAction(),
                log.getNotes(),
                log.getCreatedAt()
        );
    }
}
