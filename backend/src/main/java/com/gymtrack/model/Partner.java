package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Platform partner displayed on the main home page.
 */
@Document(collection = "partners")
public class Partner {

    @Id
    private String id;

    private String name;

    private String imageUrl;

    private String description;

    private String websiteUrl;

    @CreatedDate
    private Instant createdAt;

    public Partner() {
    }

    public Partner(String name, String imageUrl, String description, String websiteUrl) {
        this.name = name;
        this.imageUrl = imageUrl;
        this.description = description;
        this.websiteUrl = websiteUrl;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getWebsiteUrl() {
        return websiteUrl;
    }

    public void setWebsiteUrl(String websiteUrl) {
        this.websiteUrl = websiteUrl;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
