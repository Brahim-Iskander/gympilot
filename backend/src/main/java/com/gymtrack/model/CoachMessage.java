package com.gymtrack.model;

import java.time.Instant;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Live Coach Chat message exchanged between an athlete (User) and the coaching staff.
 */
@Document(collection = "coach_messages")
public class CoachMessage {

    @Id
    private String id;

    /** ID of the user / athlete */
    @Indexed
    private String userId;

    private String userFullName;
    private String userEmail;

    /** "USER" or "COACH" */
    private String senderRole;

    /** Name of the sender (e.g. "John Doe" or "GymTrack staff") */
    private String senderName;

    /** Text content of the message */
    private String message;

    private boolean isReadByUser;
    private boolean isReadByCoach;

    @CreatedDate
    private Instant createdAt;

    public CoachMessage() {
    }

    public CoachMessage(String userId, String userFullName, String userEmail, String senderRole, String senderName, String message) {
        this.userId = userId;
        this.userFullName = userFullName;
        this.userEmail = userEmail;
        this.senderRole = senderRole;
        this.senderName = senderName;
        this.message = message;
        this.createdAt = Instant.now();
        this.isReadByUser = "COACH".equalsIgnoreCase(senderRole) ? false : true;
        this.isReadByCoach = "USER".equalsIgnoreCase(senderRole) ? false : true;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserFullName() {
        return userFullName;
    }

    public void setUserFullName(String userFullName) {
        this.userFullName = userFullName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isReadByUser() {
        return isReadByUser;
    }

    public void setReadByUser(boolean readByUser) {
        isReadByUser = readByUser;
    }

    public boolean isReadByCoach() {
        return isReadByCoach;
    }

    public void setReadByCoach(boolean readByCoach) {
        isReadByCoach = readByCoach;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
