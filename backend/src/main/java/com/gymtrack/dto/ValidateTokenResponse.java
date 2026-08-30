package com.gymtrack.dto;

public record ValidateTokenResponse(
    boolean valid,
    String email,
    String message
) {}
