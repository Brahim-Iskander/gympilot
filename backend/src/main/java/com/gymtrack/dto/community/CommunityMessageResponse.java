package com.gymtrack.dto.community;

import java.time.Instant;
import com.gymtrack.model.CommunityMessage;

public class CommunityMessageResponse {

    private String id;
    private String userId;
    private String userFullName;
    private String userEmail;
    private String userAvatar;
    private String userRole;
    private String message;
    private Instant createdAt;

    public CommunityMessageResponse() {
    }

    public CommunityMessageResponse(String id, String userId, String userFullName, String userEmail, String userAvatar, String userRole, String message, Instant createdAt) {
        this.id = id;
        this.userId = userId;
        this.userFullName = userFullName;
        this.userEmail = userEmail;
        this.userAvatar = userAvatar;
        this.userRole = userRole;
        this.message = message;
        this.createdAt = createdAt;
    }

    public static CommunityMessageResponse from(CommunityMessage msg) {
        return new CommunityMessageResponse(
                msg.getId(),
                msg.getUserId(),
                msg.getUserFullName(),
                msg.getUserEmail(),
                msg.getUserAvatar(),
                msg.getUserRole(),
                msg.getMessage(),
                msg.getCreatedAt()
        );
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

    public String getUserAvatar() {
        return userAvatar;
    }

    public void setUserAvatar(String userAvatar) {
        this.userAvatar = userAvatar;
    }

    public String getUserRole() {
        return userRole;
    }

    public void setUserRole(String userRole) {
        this.userRole = userRole;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}
