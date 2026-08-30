package com.gymtrack.dto;

import java.util.List;

/**
 * Generic paginated response wrapper.
 */
public record PagedResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
