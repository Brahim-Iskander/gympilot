package com.gymtrack.model;

import java.time.Instant;
import java.util.Set;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Audit log recording role changes on user accounts.
 */
@Document(collection = "role_audit_logs")
public class RoleAuditLog {

    @Id
    private String id;

    private String targetUserId;
    private String targetUserEmail;
    private String targetUserName;

    private String changedByAdminId;
    private String changedByAdminEmail;

    private Set<String> previousRoles;
    private Set<String> newRoles;

    private String action; // e.g. "GRANTED_SELLER", "REVOKED_SELLER", "PROMOTED_ADMIN", "UPDATED_ROLES"
    private String notes;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public RoleAuditLog() {
    }

    public RoleAuditLog(String targetUserId, String targetUserEmail, String targetUserName,
                        String changedByAdminId, String changedByAdminEmail,
                        Set<String> previousRoles, Set<String> newRoles, String action, String notes) {
        this.targetUserId = targetUserId;
        this.targetUserEmail = targetUserEmail;
        this.targetUserName = targetUserName;
        this.changedByAdminId = changedByAdminId;
        this.changedByAdminEmail = changedByAdminEmail;
        this.previousRoles = previousRoles;
        this.newRoles = newRoles;
        this.action = action;
        this.notes = notes;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTargetUserId() {
        return targetUserId;
    }

    public void setTargetUserId(String targetUserId) {
        this.targetUserId = targetUserId;
    }

    public String getTargetUserEmail() {
        return targetUserEmail;
    }

    public void setTargetUserEmail(String targetUserEmail) {
        this.targetUserEmail = targetUserEmail;
    }

    public String getTargetUserName() {
        return targetUserName;
    }

    public void setTargetUserName(String targetUserName) {
        this.targetUserName = targetUserName;
    }

    public String getChangedByAdminId() {
        return changedByAdminId;
    }

    public void setChangedByAdminId(String changedByAdminId) {
        this.changedByAdminId = changedByAdminId;
    }

    public String getChangedByAdminEmail() {
        return changedByAdminEmail;
    }

    public void setChangedByAdminEmail(String changedByAdminEmail) {
        this.changedByAdminEmail = changedByAdminEmail;
    }

    public Set<String> getPreviousRoles() {
        return previousRoles;
    }

    public void setPreviousRoles(Set<String> previousRoles) {
        this.previousRoles = previousRoles;
    }

    public Set<String> getNewRoles() {
        return newRoles;
    }

    public void setNewRoles(Set<String> newRoles) {
        this.newRoles = newRoles;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
