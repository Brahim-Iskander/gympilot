package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * GymTrack user account.
 *
 * Kept intentionally small for v1. Future features (workouts, personal records,
 * body measurements...) must live in their own collections referencing userId,
 * not embedded here - see README "Data model roadmap".
 */
@Document(collection = "users")
public class User {

    @Id
    private String id;

    private String firstName;

    private String lastName;

    /** Stored lowercase + trimmed. A unique index is created at startup. */
    @Indexed(unique = true)
    private String email;

    /** BCrypt hash - never exposed outside of authentication logic. */
    private String password;

    /** USER or ADMIN. Defaults to USER for all new registrations. */
    private String role = "USER";

    /** Whether this account has been banned by an admin. */
    private boolean banned = false;

    /** When the account was banned (null if never banned). */
    private Instant bannedAt;

    /** Last successful login timestamp. */
    private Instant lastLoginAt;

    /** FREE, BASIC, or PREMIUM. Defaults to FREE for all registrations. */
    private String membershipTier = "FREE";

    /** ACTIVE or INACTIVE. Defaults to INACTIVE. */
    private String membershipStatus = "INACTIVE";

    @CreatedDate
    private Instant createdAt;

    public User() {
    }

    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public boolean isBanned() {
        return banned;
    }

    public void setBanned(boolean banned) {
        this.banned = banned;
    }

    public Instant getBannedAt() {
        return bannedAt;
    }

    public void setBannedAt(Instant bannedAt) {
        this.bannedAt = bannedAt;
    }

    public Instant getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(Instant lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getMembershipTier() {
        return membershipTier != null ? membershipTier : "FREE";
    }

    public void setMembershipTier(String membershipTier) {
        this.membershipTier = membershipTier;
    }

    public String getMembershipStatus() {
        return membershipStatus != null ? membershipStatus : "INACTIVE";
    }

    public void setMembershipStatus(String membershipStatus) {
        this.membershipStatus = membershipStatus;
    }

    public boolean hasActiveMembership() {
        return "ACTIVE".equalsIgnoreCase(membershipStatus) && membershipTier != null && !"FREE".equalsIgnoreCase(membershipTier);
    }

    @Override
    public String toString() {
        // Never include the password hash in logs.
        return "User{id='" + id + "', email='" + email + "', role='" + role + "'}";
    }
}
