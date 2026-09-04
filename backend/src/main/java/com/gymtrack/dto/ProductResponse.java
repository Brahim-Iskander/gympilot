package com.gymtrack.dto;

import java.time.Instant;
import java.util.List;
import java.util.Map;

import com.gymtrack.model.Product;

public record ProductResponse(
        String id,
        String name,
        String slug,
        String description,
        String categoryId,
        String categoryName,
        double price,
        Double originalPrice,
        int stockQuantity,
        List<String> images,
        Map<String, String> specs,
        String sellerId,
        String sellerName,
        String sellerStoreName,
        String sellerStoreLogo,
        boolean active,
        double rating,
        int reviewCount,
        int unitsSold,
        int views,
        boolean featured,
        Instant createdAt,
        Instant updatedAt
) {
    public static ProductResponse from(Product p) {
        return new ProductResponse(
                p.getId(),
                p.getName(),
                p.getSlug(),
                p.getDescription(),
                p.getCategoryId(),
                p.getCategoryName(),
                p.getPrice(),
                p.getOriginalPrice(),
                p.getStockQuantity(),
                p.getImages(),
                p.getSpecs(),
                p.getSellerId(),
                p.getSellerName(),
                p.getSellerStoreName(),
                p.getSellerStoreLogo(),
                p.isActive(),
                p.getRating(),
                p.getReviewCount(),
                p.getUnitsSold(),
                p.getViews(),
                p.isFeatured(),
                p.getCreatedAt(),
                p.getUpdatedAt()
        );
    }
}
