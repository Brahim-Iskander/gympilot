package com.gymtrack.dto;

import jakarta.validation.constraints.NotBlank;

public record RedeemMembershipRequest(
        @NotBlank(message = "Membership tier is required (BASIC or PREMIUM)")
        String tier
) {
}
