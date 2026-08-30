package com.gymtrack.dto.coach;

import java.time.Instant;
import com.gymtrack.model.CoachMessage;

public class CoachMessageResponse {

    private String id;
    private String userId;
    private String userFullName;
    private String userEmail;
    private String senderRole;
    private String senderName;
    private String message;
    private boolean isReadByUser;
    private boolean isReadByCoach;
    private Instant createdAt;

    public CoachMessageResponse() {
    }

    public static CoachMessageResponse fromModel(CoachMessage model) {
        CoachMessageResponse dto = new CoachMessageResponse();
        dto.setId(model.getId());
        dto.setUserId(model.getUserId());
        dto.setUserFullName(model.getUserFullName());
        dto.setUserEmail(model.getUserEmail());
        dto.setSenderRole(model.getSenderRole());
        dto.setSenderName(model.getSenderName());
        dto.setMessage(model.getMessage());
        dto.setReadByUser(model.isReadByUser());
        dto.setReadByCoach(model.isReadByCoach());
        dto.setCreatedAt(model.getCreatedAt());
        return dto;
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
