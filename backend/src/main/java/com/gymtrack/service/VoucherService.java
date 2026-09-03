package com.gymtrack.service;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtrack.dto.VoucherDtos.CreateVoucherRequest;
import com.gymtrack.dto.VoucherDtos.VoucherResponse;
import com.gymtrack.dto.VoucherDtos.VoucherValidationResponse;
import com.gymtrack.model.Voucher;
import com.gymtrack.repository.VoucherRepository;

@Service
public class VoucherService {

    private static final Logger log = LoggerFactory.getLogger(VoucherService.class);

    private final VoucherRepository voucherRepository;

    public VoucherService(VoucherRepository voucherRepository) {
        this.voucherRepository = voucherRepository;
    }

    public List<VoucherResponse> getAllVouchers() {
        return voucherRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(VoucherResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public VoucherResponse createVoucher(CreateVoucherRequest request, String adminEmail) {
        String cleanCode = request.code().trim().toUpperCase();

        if (voucherRepository.existsByCodeIgnoreCase(cleanCode)) {
            throw new IllegalArgumentException("Voucher code '" + cleanCode + "' already exists.");
        }

        Voucher voucher = new Voucher(
                cleanCode,
                request.discountType(),
                request.discountValue(),
                request.minOrderAmount(),
                request.maxDiscountAmount(),
                request.maxUses(),
                request.description(),
                request.expiresAt(),
                adminEmail
        );

        Voucher saved = voucherRepository.save(voucher);
        log.info("Admin {} created discount voucher: {} ({}{})",
                adminEmail, saved.getCode(), saved.getDiscountValue(),
                "PERCENTAGE".equalsIgnoreCase(saved.getDiscountType()) ? "%" : " TND");
        return VoucherResponse.from(saved);
    }

    @Transactional
    public VoucherResponse toggleVoucherActive(String id) {
        Voucher voucher = voucherRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Voucher not found with ID: " + id));

        voucher.setActive(!voucher.isActive());
        voucher.setUpdatedAt(Instant.now());
        Voucher saved = voucherRepository.save(voucher);
        log.info("Toggled voucher {} active state to: {}", saved.getCode(), saved.isActive());
        return VoucherResponse.from(saved);
    }

    @Transactional
    public void deleteVoucher(String id) {
        if (!voucherRepository.existsById(id)) {
            throw new IllegalArgumentException("Voucher not found with ID: " + id);
        }
        voucherRepository.deleteById(id);
        log.info("Deleted voucher with ID: {}", id);
    }

    /**
     * Validates a voucher code against an order amount.
     */
    public VoucherValidationResponse validateVoucher(String rawCode, double orderAmount) {
        if (rawCode == null || rawCode.isBlank()) {
            return VoucherValidationResponse.invalid("Please enter a voucher code.");
        }

        String code = rawCode.trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code).orElse(null);

        if (voucher == null) {
            return VoucherValidationResponse.invalid("Voucher code '" + code + "' does not exist.");
        }

        if (!voucher.isActive()) {
            return VoucherValidationResponse.invalid("This voucher is currently inactive or paused.");
        }

        if (voucher.getExpiresAt() != null && Instant.now().isAfter(voucher.getExpiresAt())) {
            return VoucherValidationResponse.invalid("This voucher has expired.");
        }

        if (voucher.getMaxUses() > 0 && voucher.getUsedCount() >= voucher.getMaxUses()) {
            return VoucherValidationResponse.invalid("This voucher has reached its maximum usage limit.");
        }

        if (voucher.getMinOrderAmount() > 0 && orderAmount < voucher.getMinOrderAmount()) {
            return VoucherValidationResponse.invalid(
                    String.format(java.util.Locale.US, "Order must be at least %.2f TND to use voucher '%s' (current: %.2f TND).",
                            voucher.getMinOrderAmount(), voucher.getCode(), orderAmount));
        }

        double discountAmount = calculateDiscount(voucher, orderAmount);
        double finalAmount = Math.max(0, orderAmount - discountAmount);

        String successMsg = "PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())
                ? String.format(java.util.Locale.US, "%.0f%% discount applied (-%.2f TND)", voucher.getDiscountValue(), discountAmount)
                : String.format(java.util.Locale.US, "%.2f TND discount applied", discountAmount);

        return VoucherValidationResponse.valid(
                voucher.getCode(),
                voucher.getDiscountType(),
                voucher.getDiscountValue(),
                discountAmount,
                finalAmount,
                successMsg
        );
    }

    /**
     * Consumes one use of the voucher during order checkout and calculates final discount.
     */
    @Transactional
    public double applyAndConsumeVoucher(String rawCode, double orderAmount) {
        if (rawCode == null || rawCode.isBlank()) {
            return 0.0;
        }

        String code = rawCode.trim().toUpperCase();
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(code)
                .orElseThrow(() -> new IllegalArgumentException("Voucher code '" + code + "' is invalid."));

        if (!voucher.isActive()) {
            throw new IllegalArgumentException("Voucher '" + code + "' is inactive.");
        }

        if (voucher.getExpiresAt() != null && Instant.now().isAfter(voucher.getExpiresAt())) {
            throw new IllegalArgumentException("Voucher '" + code + "' has expired.");
        }

        if (voucher.getMaxUses() > 0 && voucher.getUsedCount() >= voucher.getMaxUses()) {
            throw new IllegalArgumentException("Voucher '" + code + "' has reached its usage limit.");
        }

        if (voucher.getMinOrderAmount() > 0 && orderAmount < voucher.getMinOrderAmount()) {
            throw new IllegalArgumentException(String.format("Minimum order of %.2f TND required for voucher %s",
                    voucher.getMinOrderAmount(), code));
        }

        double discount = calculateDiscount(voucher, orderAmount);

        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucher.setUpdatedAt(Instant.now());
        voucherRepository.save(voucher);
        log.info("Applied and consumed voucher {} on order (discount: {} TND, new total uses: {})",
                voucher.getCode(), discount, voucher.getUsedCount());

        return discount;
    }

    private double calculateDiscount(Voucher voucher, double orderAmount) {
        double discount;
        if ("PERCENTAGE".equalsIgnoreCase(voucher.getDiscountType())) {
            discount = orderAmount * (voucher.getDiscountValue() / 100.0);
            if (voucher.getMaxDiscountAmount() > 0 && discount > voucher.getMaxDiscountAmount()) {
                discount = voucher.getMaxDiscountAmount();
            }
        } else {
            discount = voucher.getDiscountValue();
        }

        discount = Math.min(discount, orderAmount);
        return Math.round(discount * 100.0) / 100.0;
    }
}
