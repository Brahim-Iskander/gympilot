package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Immutable audit ledger of point credit/debit events for users.
 */
@Document(collection = "points_history")
@CompoundIndexes({
    @CompoundIndex(name = "user_reason_related_idx", def = "{'userId': 1, 'reason': 1, 'relatedUserId': 1}")
})
public class PointTransaction {

    @Id
    private String id;

    @Indexed
    private String userId;

    /** Number of points awarded (positive) or redeemed (negative). */
    private int points;

    /** Event reason identifier (e.g., referral_signup_bonus, referral_invite_bonus). */
    private String reason;

    /** Human-readable description for UI display. */
    private String description;

    /** Related user ID involved in the transaction (e.g., friend who signed up). */
    private String relatedUserId;

    /** Referral code used for this event. */
    private String referralCode;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public PointTransaction() {
    }

    public PointTransaction(String userId, int points, String reason, String description, String relatedUserId, String referralCode) {
        this.userId = userId;
        this.points = points;
        this.reason = reason;
        this.description = description;
        this.relatedUserId = relatedUserId;
        this.referralCode = referralCode;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getRelatedUserId() {
        return relatedUserId;
    }

    public void setRelatedUserId(String relatedUserId) {
        this.relatedUserId = relatedUserId;
    }

    public String getReferralCode() {
        return referralCode;
    }

    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
