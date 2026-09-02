package com.gymtrack.dto;

import java.util.List;
import java.util.Map;

public record UpdateProductRequest(
        String name,
        String description,
        String categoryId,
        Double price,
        Double originalPrice,
        Integer stockQuantity,
        List<String> images,
        Map<String, String> specs,
        Boolean active,
        Boolean featured
) {
}
