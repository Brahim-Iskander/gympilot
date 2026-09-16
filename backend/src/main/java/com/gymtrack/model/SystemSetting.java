package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Key-value system configuration stored in MongoDB for runtime updates.
 */
@Document(collection = "system_settings")
public class SystemSetting {

    @Id
    private String id;

    @Indexed(unique = true)
    private String key;

    private String value;
    private String label;
    private String description;
    private String updatedByAdminEmail;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public SystemSetting() {
    }

    public SystemSetting(String key, String value, String label, String description) {
        this.key = key;
        this.value = value;
        this.label = label;
        this.description = description;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getUpdatedByAdminEmail() {
        return updatedByAdminEmail;
    }

    public void setUpdatedByAdminEmail(String updatedByAdminEmail) {
        this.updatedByAdminEmail = updatedByAdminEmail;
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
