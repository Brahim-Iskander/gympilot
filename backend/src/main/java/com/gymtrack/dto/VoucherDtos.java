package com.gymtrack.dto;

import java.time.Instant;

import com.gymtrack.model.Voucher;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public class VoucherDtos {

    public record CreateVoucherRequest(
            @NotBlank(message = "Voucher code is required")
            String code,

            @NotBlank(message = "Discount type is required (PERCENTAGE or FIXED)")
            String discountType,

            @Positive(message = "Discount value must be greater than 0")
            double discountValue,

            double minOrderAmount,

            double maxDiscountAmount,

            int maxUses,

            String description,

            Instant expiresAt
    ) {}

    public record ValidateVoucherRequest(
            @NotBlank(message = "Voucher code is required")
            String code,

            double orderAmount
    ) {}

    public record VoucherValidationResponse(
            boolean valid,
            String message,
            String code,
            String discountType,
            double discountValue,
            double discountAmount,
            double finalAmount
    ) {
        public static VoucherValidationResponse invalid(String message) {
            return new VoucherValidationResponse(false, message, null, null, 0, 0, 0);
        }

        public static VoucherValidationResponse valid(String code, String discountType, double discountValue, double discountAmount, double finalAmount, String message) {
            return new VoucherValidationResponse(true, message, code, discountType, discountValue, discountAmount, finalAmount);
        }
    }

    public record VoucherResponse(
            String id,
            String code,
            String discountType,
            double discountValue,
            double minOrderAmount,
            double maxDiscountAmount,
            int maxUses,
            int usedCount,
            boolean active,
            String description,
            Instant expiresAt,
            String createdBy,
            Instant createdAt
    ) {
        public static VoucherResponse from(Voucher v) {
            return new VoucherResponse(
                    v.getId(),
                    v.getCode(),
                    v.getDiscountType(),
                    v.getDiscountValue(),
                    v.getMinOrderAmount(),
                    v.getMaxDiscountAmount(),
                    v.getMaxUses(),
                    v.getUsedCount(),
                    v.isActive(),
                    v.getDescription(),
                    v.getExpiresAt(),
                    v.getCreatedBy(),
                    v.getCreatedAt()
            );
        }
    }

    public record VoucherUsageOrderDto(
            String id,
            String orderNumber,
            String buyerName,
            String buyerEmail,
            double totalAmount,
            double discountAmount,
            String status,
            Instant createdAt
    ) {}
}

