package com.gymtrack.dto.payment;

import jakarta.validation.constraints.NotBlank;

public record UpdateD17ConfigRequest(
        @NotBlank(message = "Phone number is required")
        String phoneNumber,

        String recipientName,

        String instructions
) {}
