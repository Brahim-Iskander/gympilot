package com.gymtrack.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Support ticket conversation between a user and the admin team.
 * Messages are embedded as a sub-list for easy threaded display.
 */
@Document(collection = "support_tickets")
public class SupportTicket {

    @Id
    private String id;

    /** Owner of the ticket */
    @Indexed
    private String userId;

    /** Denormalized user info for admin convenience */
    private String userFullName;
    private String userEmail;

    /** Ticket subject / title */
    private String subject;

    /** GENERAL, PAYMENT, MEMBERSHIP, TECHNICAL, COMPLAINT */
    private String topic = "GENERAL";

    /** OPEN or CLOSED */
    private String status = "OPEN";

    /** Who closed the ticket: USER, ADMIN, or null */
    private String closedBy;

    /** Embedded conversation thread */
    private List<TicketMessage> messages = new ArrayList<>();

    /** True when admin has replied and user hasn't viewed yet */
    private boolean unreadByUser = false;

    /** True when user has sent a message and admin hasn't viewed yet */
    private boolean unreadByAdmin = true;

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;

    public SupportTicket() {
    }

    public SupportTicket(String userId, String userFullName, String userEmail,
                         String subject, String topic, String message,
                         String imageBase64, String imageType) {
        this.userId = userId;
        this.userFullName = userFullName;
        this.userEmail = userEmail;
        this.subject = subject;
        this.topic = topic != null ? topic : "GENERAL";

        TicketMessage firstMsg = new TicketMessage(
                "USER", userFullName, message, imageBase64, imageType);
        this.messages.add(firstMsg);
    }

    /** Add a reply to the thread */
    public TicketMessage addReply(String senderRole, String senderName,
                                  String message, String imageBase64, String imageType) {
        TicketMessage msg = new TicketMessage(senderRole, senderName, message, imageBase64, imageType);
        this.messages.add(msg);

        if ("USER".equals(senderRole)) {
            this.unreadByAdmin = true;
        } else {
            this.unreadByUser = true;
        }

        return msg;
    }

    // ===== Embedded TicketMessage =====

    public static class TicketMessage {

        private String id;
        private String senderRole; // USER or ADMIN
        private String senderName;
        private String message;
        private String imageBase64;
        private String imageType; // e.g. image/jpeg, image/png
        private Instant createdAt;

        public TicketMessage() {
        }

        public TicketMessage(String senderRole, String senderName, String message,
                             String imageBase64, String imageType) {
            this.id = UUID.randomUUID().toString();
            this.senderRole = senderRole;
            this.senderName = senderName;
            this.message = message;
            this.imageBase64 = imageBase64;
            this.imageType = imageType;
            this.createdAt = Instant.now();
        }

        public String getId() { return id; }
        public void setId(String id) { this.id = id; }

        public String getSenderRole() { return senderRole; }
        public void setSenderRole(String senderRole) { this.senderRole = senderRole; }

        public String getSenderName() { return senderName; }
        public void setSenderName(String senderName) { this.senderName = senderName; }

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public String getImageBase64() { return imageBase64; }
        public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

        public String getImageType() { return imageType; }
        public void setImageType(String imageType) { this.imageType = imageType; }

        public Instant getCreatedAt() { return createdAt; }
        public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    }

    // ===== Getters and Setters =====

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getUserFullName() { return userFullName; }
    public void setUserFullName(String userFullName) { this.userFullName = userFullName; }

    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getClosedBy() { return closedBy; }
    public void setClosedBy(String closedBy) { this.closedBy = closedBy; }

    public List<TicketMessage> getMessages() { return messages; }
    public void setMessages(List<TicketMessage> messages) { this.messages = messages; }

    public boolean isUnreadByUser() { return unreadByUser; }
    public void setUnreadByUser(boolean unreadByUser) { this.unreadByUser = unreadByUser; }

    public boolean isUnreadByAdmin() { return unreadByAdmin; }
    public void setUnreadByAdmin(boolean unreadByAdmin) { this.unreadByAdmin = unreadByAdmin; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
