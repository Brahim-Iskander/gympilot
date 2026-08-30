package com.gymtrack.dto;

/**
 * Authentication payload returned by register/login endpoints.
 */
public record AuthResponse(String token, UserResponse user) {
}
