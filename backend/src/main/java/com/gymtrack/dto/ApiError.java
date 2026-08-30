package com.gymtrack.dto;

import java.time.Instant;
import java.util.Map;

import org.springframework.http.HttpStatus;

import com.fasterxml.jackson.annotation.JsonInclude;

/**
 * Consistent error payload returned by every failed request.
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ApiError(int status, String error, String message, Map<String, String> fieldErrors, Instant timestamp) {

    public static ApiError of(HttpStatus status, String message) {
        return new ApiError(status.value(), status.getReasonPhrase(), message, null, Instant.now());
    }

    public static ApiError of(HttpStatus status, String message, Map<String, String> fieldErrors) {
        return new ApiError(status.value(), status.getReasonPhrase(), message, fieldErrors, Instant.now());
    }
}
