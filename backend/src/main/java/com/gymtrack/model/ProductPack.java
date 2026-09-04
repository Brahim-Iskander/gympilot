package com.gymtrack.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Promotional product bundle or special offer pack configured by Admin.
 */
@Document(collection = "product_packs")
public class ProductPack {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String tagline;

    private String badge; // e.g. "-25% OFF", "Limited Pack", "Bestseller Duo"

    private String description;

    private double originalPrice;

    private double price;

    private List<String> images = new ArrayList<>();

    private List<PackItem> items = new ArrayList<>();

    private boolean active = true;

    private boolean featured = true;

    private int stockQuantity = 50;

    private int unitsSold = 0;

    private double rating = 5.0;

    private int reviewCount = 8;

    private Instant validUntil;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public ProductPack() {
    }

    public ProductPack(String name, String slug, String tagline, String badge, String description,
                       double originalPrice, double price, List<String> images, List<PackItem> items,
                       boolean active, boolean featured, int stockQuantity) {
        this.name = name;
        this.slug = slug;
        this.tagline = tagline;
        this.badge = badge;
        this.description = description;
        this.originalPrice = originalPrice;
        this.price = price;
        this.images = images != null ? images : new ArrayList<>();
        this.items = items != null ? items : new ArrayList<>();
        this.active = active;
        this.featured = featured;
        this.stockQuantity = stockQuantity;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public static class PackItem {
        private String name;
        private int quantity = 1;
        private String description;
        private String dosage;

        public PackItem() {}

        public PackItem(String name, int quantity, String description, String dosage) {
            this.name = name;
            this.quantity = quantity;
            this.description = description;
            this.dosage = dosage;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public int getQuantity() {
            return quantity;
        }

        public void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        public String getDescription() {
            return description;
        }

        public void setDescription(String description) {
            this.description = description;
        }

        public String getDosage() {
            return dosage;
        }

        public void setDosage(String dosage) {
            this.dosage = dosage;
        }
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

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTagline() {
        return tagline;
    }

    public void setTagline(String tagline) {
        this.tagline = tagline;
    }

    public String getBadge() {
        return badge;
    }

    public void setBadge(String badge) {
        this.badge = badge;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public List<PackItem> getItems() {
        return items;
    }

    public void setItems(List<PackItem> items) {
        this.items = items;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public int getUnitsSold() {
        return unitsSold;
    }

    public void setUnitsSold(int unitsSold) {
        this.unitsSold = unitsSold;
    }

    public double getRating() {
        return rating;
    }

    public void setRating(double rating) {
        this.rating = rating;
    }

    public int getReviewCount() {
        return reviewCount;
    }

    public void setReviewCount(int reviewCount) {
        this.reviewCount = reviewCount;
    }

    public Instant getValidUntil() {
        return validUntil;
    }

    public void setValidUntil(Instant validUntil) {
        this.validUntil = validUntil;
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
