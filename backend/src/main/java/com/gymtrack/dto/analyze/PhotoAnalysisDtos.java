package com.gymtrack.dto.analyze;

import java.util.List;

import com.gymtrack.model.Product;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class PhotoAnalysisDtos {

    public record PhotoAnalysisRequest(
            String imageBase64,

            List<String> imagesBase64,

            @NotBlank(message = "Please describe your goal")
            @Size(max = 200, message = "Goal description must be at most 200 characters")
            String goal
    ) {}


    public record RecommendedProductDto(
            String id,
            String name,
            String slug,
            double price,
            Double originalPrice,
            String categoryName,
            List<String> images,
            int stockQuantity,
            double rating
    ) {
        public static RecommendedProductDto from(Product p) {
            return new RecommendedProductDto(
                    p.getId(),
                    p.getName(),
                    p.getSlug(),
                    p.getPrice(),
                    p.getOriginalPrice(),
                    p.getCategoryName(),
                    p.getImages() != null ? p.getImages() : List.of(),
                    p.getStockQuantity(),
                    p.getRating()
            );
        }
    }

    public record PhotoAnalysisResponse(
            String summary,
            List<String> nutritionTips,
            List<String> adviceSteps,
            List<RecommendedProductDto> recommendedProducts,
            String disclaimer
    ) {}
}
