package com.gymtrack.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdatePaymentMethodRequest(
        @NotBlank(message = "Receiving address / phone number is required")
        String receivingAddress,

        String recipientName,

        String instructions,

        String warningNotice,

        @NotNull(message = "isActiveGlobal must be specified")
        Boolean isActiveGlobal,

        @NotNull(message = "isActiveTunisia must be specified")
        Boolean isActiveTunisia,

        @NotNull(message = "isActiveInternational must be specified")
        Boolean isActiveInternational,

        String explorerBaseUrl,

        Integer displayOrder
) {}
