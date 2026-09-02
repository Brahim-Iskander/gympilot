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

    /** USER, COACH, SELLER, ADMIN. Supports multiple simultaneous capabilities. */
    private java.util.Set<String> roles = new java.util.HashSet<>(java.util.Set.of("USER"));

    /** Legacy single role field for backward compatibility */
    private String role = "USER";

    /** Seller store details (if user is granted SELLER capability) */
    private String storeName;
    private String storeBio;
    private String storeLogo;

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

    /** Profile avatar image (Base64 data URL or external URL). */
    private String avatar;

    /** Reward points balance (default 0). */
    private int points = 0;

    /** Unique referral code for inviting friends. */
    @Indexed(unique = true, sparse = true)
    private String referralCode;

    /** Referral code of the user who invited this member (null if none). */
    private String referredBy;

    /** Whether email address has been verified via OTP. */
    private boolean isVerified = false;

    @CreatedDate
    private Instant createdAt;

    public User() {
    }

    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.roles = new java.util.HashSet<>(java.util.Set.of("USER"));
        this.role = "USER";
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

    public java.util.Set<String> getRoles() {
        if (roles == null || roles.isEmpty()) {
            roles = new java.util.HashSet<>();
            if (role != null && !role.isBlank()) {
                roles.add(role.toUpperCase());
            } else {
                roles.add("USER");
            }
        }
        return roles;
    }

    public void setRoles(java.util.Set<String> roles) {
        this.roles = roles != null ? new java.util.HashSet<>(roles) : new java.util.HashSet<>(java.util.Set.of("USER"));
        if (this.roles.isEmpty()) {
            this.roles.add("USER");
        }
        // Sync primary role
        if (this.roles.contains("ADMIN")) {
            this.role = "ADMIN";
        } else if (this.roles.contains("COACH")) {
            this.role = "COACH";
        } else if (this.roles.contains("SELLER")) {
            this.role = "SELLER";
        } else {
            this.role = "USER";
        }
    }

    public boolean hasRole(String roleToCheck) {
        if (roleToCheck == null) return false;
        return getRoles().stream().anyMatch(r -> r.equalsIgnoreCase(roleToCheck));
    }

    public boolean isSeller() {
        return hasRole("SELLER");
    }

    public boolean isCoach() {
        return hasRole("COACH");
    }

    public boolean isAdmin() {
        return hasRole("ADMIN");
    }

    public String getRole() {
        if (role == null || role.isBlank()) {
            if (isAdmin()) return "ADMIN";
            if (isCoach()) return "COACH";
            if (isSeller()) return "SELLER";
            return "USER";
        }
        return role;
    }

    public void setRole(String role) {
        this.role = role != null ? role.toUpperCase() : "USER";
        if (this.roles == null) {
            this.roles = new java.util.HashSet<>();
        }
        this.roles.add(this.role);
    }

    public String getStoreName() {
        return storeName;
    }

    public void setStoreName(String storeName) {
        this.storeName = storeName;
    }

    public String getStoreBio() {
        return storeBio;
    }

    public void setStoreBio(String storeBio) {
        this.storeBio = storeBio;
    }

    public String getStoreLogo() {
        return storeLogo;
    }

    public void setStoreLogo(String storeLogo) {
        this.storeLogo = storeLogo;
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

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public String getReferralCode() {
        return referralCode;
    }

    public void setReferralCode(String referralCode) {
        this.referralCode = referralCode;
    }

    public String getReferredBy() {
        return referredBy;
    }

    public void setReferredBy(String referredBy) {
        this.referredBy = referredBy;
    }

    public boolean isVerified() {
        return isVerified;
    }

    public void setVerified(boolean isVerified) {
        this.isVerified = isVerified;
    }

    @Override
    public String toString() {
        // Never include the password hash in logs.
        return "User{id='" + id + "', email='" + email + "', roles=" + getRoles() + "}";
    }
}
