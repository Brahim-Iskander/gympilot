package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Audit log recording each user login event for administration metrics.
 */
@Document(collection = "user_logins")
public class UserLogin {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String email;

    @Indexed
    private Instant loggedAt;

    public UserLogin() {
    }

    public UserLogin(String userId, String email, Instant loggedAt) {
        this.userId = userId;
        this.email = email;
        this.loggedAt = loggedAt;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Instant getLoggedAt() {
        return loggedAt;
    }

    public void setLoggedAt(Instant loggedAt) {
        this.loggedAt = loggedAt;
    }
}
