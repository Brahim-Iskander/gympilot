package com.gymtrack.dto.payment;

import java.time.Instant;

import com.gymtrack.model.PaymentMethodConfig;

public record AdminPaymentMethodResponse(
        String id,
        String code,
        String name,
        String network,
        String receivingAddress,
        String recipientName,
        String instructions,
        String warningNotice,
        boolean isActiveGlobal,
        boolean isActiveTunisia,
        boolean isActiveInternational,
        String explorerBaseUrl,
        int displayOrder,
        String updatedByAdminEmail,
        Instant updatedAt
) {
    public static AdminPaymentMethodResponse from(PaymentMethodConfig config) {
        return new AdminPaymentMethodResponse(
                config.getId(),
                config.getCode(),
                config.getName(),
                config.getNetwork(),
                config.getReceivingAddress(),
                config.getRecipientName(),
                config.getInstructions(),
                config.getWarningNotice(),
                config.isActiveGlobal(),
                config.isActiveTunisia(),
                config.isActiveInternational(),
                config.getExplorerBaseUrl(),
                config.getDisplayOrder(),
                config.getUpdatedByAdminEmail(),
                config.getUpdatedAt()
        );
    }
}
