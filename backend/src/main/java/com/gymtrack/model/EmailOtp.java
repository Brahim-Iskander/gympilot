package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Stores hashed one-time passwords (OTP) for registration email verification.
 */
@Document(collection = "email_otps")
public class EmailOtp {

    @Id
    private String id;

    @Indexed
    private String userId;

    @Indexed
    private String email;

    /** BCrypt hash of the 6-digit numeric OTP - never stored in plaintext. */
    private String codeHash;

    /** Expiration timestamp (typically 10 minutes from creation). */
    private Instant expiresAt;

    /** Failed verification attempts (max 5 before temporary lockout). */
    private int attempts = 0;

    /** Whether this OTP has already been successfully redeemed. */
    private boolean used = false;

    /** Timestamp of the last resend (to enforce 60-second cooldown). */
    private Instant lastResentAt;

    @CreatedDate
    private Instant createdAt;

    public EmailOtp() {
    }

    public EmailOtp(String userId, String email, String codeHash, Instant expiresAt) {
        this.userId = userId;
        this.email = email != null ? email.trim().toLowerCase() : null;
        this.codeHash = codeHash;
        this.expiresAt = expiresAt;
        this.attempts = 0;
        this.used = false;
        this.lastResentAt = Instant.now();
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email != null ? email.trim().toLowerCase() : null;
    }

    public String getCodeHash() {
        return codeHash;
    }

    public void setCodeHash(String codeHash) {
        this.codeHash = codeHash;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public int getAttempts() {
        return attempts;
    }

    public void setAttempts(int attempts) {
        this.attempts = attempts;
    }

    public void incrementAttempts() {
        this.attempts++;
    }

    public boolean isUsed() {
        return used;
    }

    public void setUsed(boolean used) {
        this.used = used;
    }

    public Instant getLastResentAt() {
        return lastResentAt;
    }

    public void setLastResentAt(Instant lastResentAt) {
        this.lastResentAt = lastResentAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isExpired() {
        return expiresAt != null && Instant.now().isAfter(expiresAt);
    }
}
