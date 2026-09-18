package com.gymtrack.dto.payment;

import com.gymtrack.model.PaymentMethodConfig;

public record PaymentMethodResponse(
        String code,
        String name,
        String network,
        String receivingAddress,
        String recipientName,
        String instructions,
        String warningNotice,
        String explorerBaseUrl,
        int displayOrder
) {
    public static PaymentMethodResponse from(PaymentMethodConfig config) {
        return new PaymentMethodResponse(
                config.getCode(),
                config.getName(),
                config.getNetwork(),
                config.getReceivingAddress(),
                config.getRecipientName(),
                config.getInstructions(),
                config.getWarningNotice(),
                config.getExplorerBaseUrl(),
                config.getDisplayOrder()
        );
    }
}
