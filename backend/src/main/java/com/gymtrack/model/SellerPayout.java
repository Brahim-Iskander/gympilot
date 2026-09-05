package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Payout transaction recorded for a seller by platform administration.
 */
@Document(collection = "seller_payouts")
public class SellerPayout {

    @Id
    private String id;

    @Indexed
    private String sellerId;
    private String sellerName;
    private String sellerEmail;

    private double amount;

    /** BANK_TRANSFER, D17, FLOUCI, CASH, CHECK, OTHER */
    private String paymentMethod = "BANK_TRANSFER";

    private String referenceNumber;
    private String notes;

    /** Admin who authorized and processed the payout */
    private String processedByAdmin;

    @CreatedDate
    private Instant createdAt = Instant.now();

    public SellerPayout() {
    }

    public SellerPayout(String sellerId, String sellerName, String sellerEmail, double amount,
                        String paymentMethod, String referenceNumber, String notes, String processedByAdmin) {
        this.sellerId = sellerId;
        this.sellerName = sellerName;
        this.sellerEmail = sellerEmail;
        this.amount = amount;
        this.paymentMethod = paymentMethod != null && !paymentMethod.isBlank() ? paymentMethod : "BANK_TRANSFER";
        this.referenceNumber = referenceNumber;
        this.notes = notes;
        this.processedByAdmin = processedByAdmin;
        this.createdAt = Instant.now();
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSellerId() {
        return sellerId;
    }

    public void setSellerId(String sellerId) {
        this.sellerId = sellerId;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public double getAmount() {
        return amount;
    }

    public void setAmount(double amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getReferenceNumber() {
        return referenceNumber;
    }

    public void setReferenceNumber(String referenceNumber) {
        this.referenceNumber = referenceNumber;
    }

    public String getNotes() {
        return notes;
    }

    public void setNotes(String notes) {
        this.notes = notes;
    }

    public String getProcessedByAdmin() {
        return processedByAdmin;
    }

    public void setProcessedByAdmin(String processedByAdmin) {
        this.processedByAdmin = processedByAdmin;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
