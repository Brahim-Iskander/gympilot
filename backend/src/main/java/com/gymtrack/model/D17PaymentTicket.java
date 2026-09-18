package com.gymtrack.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Record of a manual D17 (Tunisian mobile payment) transfer submitted by a customer.
 */
@Document(collection = "d17_payments")
@CompoundIndexes({
    @CompoundIndex(name = "d17_status_created_idx", def = "{ 'status': 1, 'createdAt': 1 }"),
    @CompoundIndex(name = "d17_user_created_idx", def = "{ 'userId': 1, 'createdAt': -1 }")
})
public class D17PaymentTicket {

    @Id
    private String id;

    @Indexed(unique = true)
    private String ticketNumber; // e.g. D17-20260916-1234

    @Indexed
    private String userId;
    private String userFullName;
    private String userEmail;
    private String userPhone;

    /** SUBSCRIPTION, ORDER, or AI_CREDIT */
    @Indexed
    private String type;

    // Target reference
    private String orderId;
    private String orderNumber;
    private String subscriptionTier; // BASIC or PREMIUM
    private int aiCredits; // Number of AI credits purchased when type == AI_CREDIT

    private double amount;
    private String currency = "TND";

    /** D17, USDT_TRC20, BTC, ETH */
    @Indexed
    private String paymentMethod = "D17";

    /** Blockchain Transaction ID / hash */
    @Indexed(sparse = true)
    private String txid;

    /** Receiving wallet address or phone number */
    private String walletAddress;

    /** Formatted crypto amount (e.g., 49.00 USDT) */
    private String cryptoAmount;

    private String senderPhoneNumber; // phone number user used to transfer
    private String userNotes; // optional notes or reference code from user

    private String screenshotBase64;
    private String screenshotType;
    private String screenshotUrl;

    /**
     * PENDING_VERIFICATION, APPROVED, REJECTED
     */
    @Indexed
    private String status = "PENDING_VERIFICATION";

    private String rejectionReason;
    private String adminNotes;

    private String verifiedByAdminId;
    private String verifiedByAdminEmail;
    private Instant verifiedAt;

    /** Linked SupportTicket ID in support_tickets collection */
    private String supportTicketId;

    /** Full audit trail of status changes */
    private List<PaymentStatusAuditLog> auditLogs = new ArrayList<>();

    @CreatedDate
    private Instant createdAt = Instant.now();

    @LastModifiedDate
    private Instant updatedAt = Instant.now();

    public D17PaymentTicket() {
    }

    public D17PaymentTicket(String ticketNumber, String userId, String userFullName, String userEmail,
                            String userPhone, String type, String orderId, String orderNumber,
                            String subscriptionTier, double amount, String senderPhoneNumber,
                            String userNotes, String screenshotBase64, String screenshotType) {
        this.ticketNumber = ticketNumber;
        this.userId = userId;
        this.userFullName = userFullName;
        this.userEmail = userEmail;
        this.userPhone = userPhone;
        this.type = type;
        this.orderId = orderId;
        this.orderNumber = orderNumber;
        this.subscriptionTier = subscriptionTier;
        this.amount = amount;
        this.currency = "TND";
        this.senderPhoneNumber = senderPhoneNumber;
        this.userNotes = userNotes;
        this.screenshotBase64 = screenshotBase64;
        this.screenshotType = screenshotType;
        this.status = "PENDING_VERIFICATION";
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public void addAuditLog(String fromStatus, String toStatus, String adminId,
                            String adminEmail, String action, String notes) {
        PaymentStatusAuditLog log = new PaymentStatusAuditLog(
                fromStatus, toStatus, adminId, adminEmail, action, notes, Instant.now());
        this.auditLogs.add(log);
    }

    // ===== Embedded Audit Log =====

    public static class PaymentStatusAuditLog {
        private String fromStatus;
        private String toStatus;
        private String adminId;
        private String adminEmail;
        private String action; // SUBMITTED, APPROVED, REJECTED, UPDATED
        private String notes;
        private Instant timestamp = Instant.now();

        public PaymentStatusAuditLog() {
        }

        public PaymentStatusAuditLog(String fromStatus, String toStatus, String adminId,
                                     String adminEmail, String action, String notes, Instant timestamp) {
            this.fromStatus = fromStatus;
            this.toStatus = toStatus;
            this.adminId = adminId;
            this.adminEmail = adminEmail;
            this.action = action;
            this.notes = notes;
            this.timestamp = timestamp != null ? timestamp : Instant.now();
        }

        public String getFromStatus() { return fromStatus; }
        public void setFromStatus(String fromStatus) { this.fromStatus = fromStatus; }

        public String getToStatus() { return toStatus; }
        public void setToStatus(String toStatus) { this.toStatus = toStatus; }

        public String getAdminId() { return adminId; }
        public void setAdminId(String adminId) { this.adminId = adminId; }

        public String getAdminEmail() { return adminEmail; }
        public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

        public String getAction() { return action; }
        public void setAction(String action) { this.action = action; }

        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }

        public Instant getTimestamp() { return timestamp; }
        public void setTimestamp(Instant timestamp) { this.timestamp = timestamp; }
    }

    // ===== Getters and Setters =====

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTicketNumber() { return ticketNumber; }
    public void setTicketNumber(String ticketNumber) { this.ticketNumber = ticketNumber; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getUserPhone() { return userPhone; }
    public void setUserPhone(String userPhone) { this.userPhone = userPhone; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getOrderId() { return orderId; }
    public void setOrderId(String orderId) { this.orderId = orderId; }

    public String getOrderNumber() { return orderNumber; }
    public void setOrderNumber(String orderNumber) { this.orderNumber = orderNumber; }

    public String getSubscriptionTier() { return subscriptionTier; }
    public void setSubscriptionTier(String subscriptionTier) { this.subscriptionTier = subscriptionTier; }

    public double getAmount() { return amount; }
    public void setAmount(double amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getSenderPhoneNumber() { return senderPhoneNumber; }
    public void setSenderPhoneNumber(String senderPhoneNumber) { this.senderPhoneNumber = senderPhoneNumber; }

    public String getUserNotes() { return userNotes; }
    public void setUserNotes(String userNotes) { this.userNotes = userNotes; }

    public String getScreenshotBase64() { return screenshotBase64; }
    public void setScreenshotBase64(String screenshotBase64) { this.screenshotBase64 = screenshotBase64; }

    public String getScreenshotType() { return screenshotType; }
    public void setScreenshotType(String screenshotType) { this.screenshotType = screenshotType; }

    public String getScreenshotUrl() { return screenshotUrl; }
    public void setScreenshotUrl(String screenshotUrl) { this.screenshotUrl = screenshotUrl; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getRejectionReason() { return rejectionReason; }
    public void setRejectionReason(String rejectionReason) { this.rejectionReason = rejectionReason; }

    public String getAdminNotes() { return adminNotes; }
    public void setAdminNotes(String adminNotes) { this.adminNotes = adminNotes; }

    public String getVerifiedByAdminId() { return verifiedByAdminId; }
    public void setVerifiedByAdminId(String verifiedByAdminId) { this.verifiedByAdminId = verifiedByAdminId; }

    public String getVerifiedByAdminEmail() { return verifiedByAdminEmail; }
    public void setVerifiedByAdminEmail(String verifiedByAdminEmail) { this.verifiedByAdminEmail = verifiedByAdminEmail; }

    public Instant getVerifiedAt() { return verifiedAt; }
    public void setVerifiedAt(Instant verifiedAt) { this.verifiedAt = verifiedAt; }

    public String getSupportTicketId() { return supportTicketId; }
    public void setSupportTicketId(String supportTicketId) { this.supportTicketId = supportTicketId; }

    public List<PaymentStatusAuditLog> getAuditLogs() { return auditLogs; }
    public void setAuditLogs(List<PaymentStatusAuditLog> auditLogs) { this.auditLogs = auditLogs; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }

    public int getAiCredits() { return aiCredits; }
    public void setAiCredits(int aiCredits) { this.aiCredits = aiCredits; }

    public String getPaymentMethod() { return paymentMethod != null ? paymentMethod : "D17"; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getTxid() { return txid; }
    public void setTxid(String txid) { this.txid = txid; }

    public String getWalletAddress() { return walletAddress; }
    public void setWalletAddress(String walletAddress) { this.walletAddress = walletAddress; }

    public String getCryptoAmount() { return cryptoAmount; }
    public void setCryptoAmount(String cryptoAmount) { this.cryptoAmount = cryptoAmount; }
}
