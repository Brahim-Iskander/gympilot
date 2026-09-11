package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Site-wide announcement banner managed by admins.
 * Active announcements are displayed at the top of every user-facing page.
 */
@Document(collection = "announcements")
public class Announcement {

    @Id
    private String id;

    /** The banner text shown to users. */
    private String message;

    /** SUCCESS, WARNING, or DANGER — controls the banner colour. */
    private String type = "SUCCESS";

    /** Optional URL the action button links to. */
    private String linkUrl;

    /** Optional label for the action button (e.g. "Shop Now"). */
    private String linkLabel;

    /** Only active announcements are shown to users. */
    private boolean active = true;

    /** Optional expiration date — announcement auto-hides after this instant. Null = never expires. */
    private Instant expiresAt;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public Announcement() {
    }

    // ── Getters & Setters ──────────────────────────────────────

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getLinkUrl() {
        return linkUrl;
    }

    public void setLinkUrl(String linkUrl) {
        this.linkUrl = linkUrl;
    }

    public String getLinkLabel() {
        return linkLabel;
    }

    public void setLinkLabel(String linkLabel) {
        this.linkLabel = linkLabel;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Instant getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(Instant expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
