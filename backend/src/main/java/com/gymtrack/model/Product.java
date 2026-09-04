package com.gymtrack.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Product item in the GymPilot Shop / Marketplace.
 */
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;

    @Indexed
    private String slug;

    private String description;

    @Indexed
    private String categoryId;

    private String categoryName;

    private double price;
    private Double originalPrice;

    private int stockQuantity = 0;

    private List<String> images = new ArrayList<>();

    /**
     * Dynamic technical specifications or nutrition facts.
     * e.g. {"Serving Size": "30g", "Protein per Serving": "24g", "Flavor": "Double Chocolate", "Weight": "2.27 kg"}
     * or {"Material": "Heavy Duty Steel", "Max Weight Capacity": "200 kg"}
     */
    private Map<String, String> specs = new HashMap<>();

    @Indexed
    private String sellerId;
    private String sellerName;
    private String sellerStoreName;
    private String sellerStoreLogo;

    private boolean active = true;

    private double rating = 5.0;
    private int reviewCount = 0;
    private int unitsSold = 0;
    private int views = 0;

    private boolean featured = false;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public Product() {
    }

    public Product(String name, String slug, String description, String categoryId, String categoryName,
                   double price, Double originalPrice, int stockQuantity, List<String> images,
                   Map<String, String> specs, String sellerId, String sellerName, String sellerStoreName) {
        this(name, slug, description, categoryId, categoryName, price, originalPrice, stockQuantity, images, specs, sellerId, sellerName, sellerStoreName, null);
    }

    public Product(String name, String slug, String description, String categoryId, String categoryName,
                   double price, Double originalPrice, int stockQuantity, List<String> images,
                   Map<String, String> specs, String sellerId, String sellerName, String sellerStoreName, String sellerStoreLogo) {
        this.name = name;
        this.slug = slug;
        this.description = description;
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.price = price;
        this.originalPrice = originalPrice;
        this.stockQuantity = stockQuantity;
        this.images = images != null ? images : new ArrayList<>();
        this.specs = specs != null ? specs : new HashMap<>();
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.sellerStoreName = sellerStoreName;
        this.sellerStoreLogo = sellerStoreLogo;
        this.active = true;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(String categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public Double getOriginalPrice() {
        return originalPrice;
    }

    public void setOriginalPrice(Double originalPrice) {
        this.originalPrice = originalPrice;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public List<String> getImages() {
        return images;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }

    public Map<String, String> getSpecs() {
        return specs;
    }

    public void setSpecs(Map<String, String> specs) {
        this.specs = specs;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getSellerStoreName() {
        return sellerStoreName;
    }

    public void setSellerStoreName(String sellerStoreName) {
        this.sellerStoreName = sellerStoreName;
    }

    public String getSellerStoreLogo() {
        return sellerStoreLogo;
    }

    public void setSellerStoreLogo(String sellerStoreLogo) {
        this.sellerStoreLogo = sellerStoreLogo;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
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

    public int getUnitsSold() {
        return unitsSold;
    }

    public void setUnitsSold(int unitsSold) {
        this.unitsSold = unitsSold;
    }

    public int getViews() {
        return views;
    }

    public void setViews(int views) {
        this.views = views;
    }

    public boolean isFeatured() {
        return featured;
    }

    public void setFeatured(boolean featured) {
        this.featured = featured;
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
