package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Discount Voucher / Promo Code for the GymPilot Marketplace.
 */
@Document(collection = "vouchers")
public class Voucher {

    @Id
    private String id;

    @Indexed(unique = true)
    private String code;

    /**
     * PERCENTAGE or FIXED (in TND)
     */
    private String discountType = "PERCENTAGE";

    /**
     * Value of the discount: e.g. 15 for 15% or 20 for 20 TND
     */
    private double discountValue = 0.0;

    /**
     * Minimum order amount required to apply this voucher (in TND)
     */
    private double minOrderAmount = 0.0;

    /**
     * Max discount cap in TND (especially useful for percentage discounts)
     */
    private double maxDiscountAmount = 0.0;

    /**
     * Maximum number of times this voucher can be redeemed (0 = unlimited)
     */
    private int maxUses = 0;

    /**
     * Number of times this voucher has been redeemed
     */
    private int usedCount = 0;

    private boolean active = true;

    private String description;

    private Instant expiresAt;

    private String createdBy;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public Voucher() {}

    public Voucher(String code, String discountType, double discountValue, double minOrderAmount,
                   double maxDiscountAmount, int maxUses, String description, Instant expiresAt, String createdBy) {
        this.code = code != null ? code.trim().toUpperCase() : null;
        this.discountType = discountType != null ? discountType.toUpperCase() : "PERCENTAGE";
        this.discountValue = discountValue;
        this.minOrderAmount = Math.max(0, minOrderAmount);
        this.maxDiscountAmount = Math.max(0, maxDiscountAmount);
        this.maxUses = Math.max(0, maxUses);
        this.usedCount = 0;
        this.active = true;
        this.description = description;
        this.expiresAt = expiresAt;
        this.createdBy = createdBy;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code != null ? code.trim().toUpperCase() : null; }

    public String getDiscountType() { return discountType; }
    public void setDiscountType(String discountType) { this.discountType = discountType; }

    public double getDiscountValue() { return discountValue; }
    public void setDiscountValue(double discountValue) { this.discountValue = discountValue; }

    public double getMinOrderAmount() { return minOrderAmount; }
    public void setMinOrderAmount(double minOrderAmount) { this.minOrderAmount = minOrderAmount; }

    public double getMaxDiscountAmount() { return maxDiscountAmount; }
    public void setMaxDiscountAmount(double maxDiscountAmount) { this.maxDiscountAmount = maxDiscountAmount; }

    public int getMaxUses() { return maxUses; }
    public void setMaxUses(int maxUses) { this.maxUses = maxUses; }

    public int getUsedCount() { return usedCount; }
    public void setUsedCount(int usedCount) { this.usedCount = usedCount; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Instant getExpiresAt() { return expiresAt; }
    public void setExpiresAt(Instant expiresAt) { this.expiresAt = expiresAt; }

    public String getCreatedBy() { return createdBy; }
    public void setCreatedBy(String createdBy) { this.createdBy = createdBy; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
