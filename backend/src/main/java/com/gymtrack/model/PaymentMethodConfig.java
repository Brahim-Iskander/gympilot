package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Configuration and regional routing rule for a payment method.
 */
@Document(collection = "payment_method_configs")
public class PaymentMethodConfig {

    @Id
    private String id;

    /** Unique code: D17, USDT_TRC20, BTC, ETH */
    @Indexed(unique = true)
    private String code;

    /** Display name shown to users (e.g., "USDT (TRC20 Network)") */
    private String name;

    /** Network name: TRC20, Bitcoin, Ethereum, or null */
    private String network;

    /** Receiving wallet address or recipient phone number */
    private String receivingAddress;

    /** Recipient display name / account label */
    private String recipientName;

    /** Instructions displayed to user during checkout */
    private String instructions;

    /** Prominent warning notice (e.g., network selection warning) */
    private String warningNotice;

    /** Master toggle: if false, disabled everywhere regardless of region */
    private boolean isActiveGlobal = true;

    /** Active specifically for Tunisian customers */
    private boolean isActiveTunisia = false;

    /** Active for all international / non-Tunisian customers */
    private boolean isActiveInternational = true;

    /** Blockchain explorer URL prefix for tx verification (e.g. https://tronscan.org/#/transaction/) */
    private String explorerBaseUrl;

    /** Sorting index for display ordering */
    private int displayOrder = 0;

    private String updatedByAdminEmail;

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public PaymentMethodConfig() {
    }

    public PaymentMethodConfig(String code, String name, String network, String receivingAddress,
                               String recipientName, String instructions, String warningNotice,
                               boolean isActiveGlobal, boolean isActiveTunisia, boolean isActiveInternational,
                               String explorerBaseUrl, int displayOrder) {
        this.code = code;
        this.name = name;
        this.network = network;
        this.receivingAddress = receivingAddress;
        this.recipientName = recipientName;
        this.instructions = instructions;
        this.warningNotice = warningNotice;
        this.isActiveGlobal = isActiveGlobal;
        this.isActiveTunisia = isActiveTunisia;
        this.isActiveInternational = isActiveInternational;
        this.explorerBaseUrl = explorerBaseUrl;
        this.displayOrder = displayOrder;
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public boolean isAvailableForCountry(String countryCode) {
        if (!isActiveGlobal) {
            return false;
        }
        boolean isTunisia = countryCode != null && 
                (countryCode.equalsIgnoreCase("TN") || countryCode.equalsIgnoreCase("Tunisia"));
        return isTunisia ? isActiveTunisia : isActiveInternational;
    }

    public String buildExplorerUrl(String txid) {
        if (explorerBaseUrl == null || explorerBaseUrl.isBlank() || txid == null || txid.isBlank()) {
            return null;
        }
        return explorerBaseUrl.endsWith("/") ? explorerBaseUrl + txid.trim() : explorerBaseUrl + "/" + txid.trim();
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getNetwork() {
        return network;
    }

    public void setNetwork(String network) {
        this.network = network;
    }

    public String getReceivingAddress() {
        return receivingAddress;
    }

    public void setReceivingAddress(String receivingAddress) {
        this.receivingAddress = receivingAddress;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getInstructions() {
        return instructions;
    }

    public void setInstructions(String instructions) {
        this.instructions = instructions;
    }

    public String getWarningNotice() {
        return warningNotice;
    }

    public void setWarningNotice(String warningNotice) {
        this.warningNotice = warningNotice;
    }

    public boolean isActiveGlobal() {
        return isActiveGlobal;
    }

    public void setActiveGlobal(boolean activeGlobal) {
        isActiveGlobal = activeGlobal;
    }

    public boolean isActiveTunisia() {
        return isActiveTunisia;
    }

    public void setActiveTunisia(boolean activeTunisia) {
        isActiveTunisia = activeTunisia;
    }

    public boolean isActiveInternational() {
        return isActiveInternational;
    }

    public void setActiveInternational(boolean activeInternational) {
        isActiveInternational = activeInternational;
    }

    public String getExplorerBaseUrl() {
        return explorerBaseUrl;
    }

    public void setExplorerBaseUrl(String explorerBaseUrl) {
        this.explorerBaseUrl = explorerBaseUrl;
    }

    public int getDisplayOrder() {
        return displayOrder;
    }

    public void setDisplayOrder(int displayOrder) {
        this.displayOrder = displayOrder;
    }

    public String getUpdatedByAdminEmail() {
        return updatedByAdminEmail;
    }

    public void setUpdatedByAdminEmail(String updatedByAdminEmail) {
        this.updatedByAdminEmail = updatedByAdminEmail;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
