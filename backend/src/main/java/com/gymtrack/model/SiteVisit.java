package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Tracks individual API visits for analytics.
 * Each request to the API creates one document.
 */
@Document(collection = "site_visits")
public class SiteVisit {

    @Id
    private String id;

    /** Authenticated user id, null for anonymous visits. */
    private String userId;

    /** Request path (e.g. /api/auth/me). */
    private String path;

    /** HTTP method (GET, POST, etc.). */
    private String method;

    /** Client IP address. */
    private String ip;

    /** User-Agent header. */
    private String userAgent;

    /** When the visit occurred - indexed for efficient date-range queries. */
    @Indexed
    private Instant visitedAt;

    public SiteVisit() {
    }

    public SiteVisit(String userId, String path, String method, String ip, String userAgent, Instant visitedAt) {
        this.userId = userId;
        this.path = path;
        this.method = method;
        this.ip = ip;
        this.userAgent = userAgent;
        this.visitedAt = visitedAt;
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

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getMethod() {
        return method;
    }

    public void setMethod(String method) {
        this.method = method;
    }

    public String getIp() {
        return ip;
    }

    public void setIp(String ip) {
        this.ip = ip;
    }

    public String getUserAgent() {
        return userAgent;
    }

    public void setUserAgent(String userAgent) {
        this.userAgent = userAgent;
    }

    public Instant getVisitedAt() {
        return visitedAt;
    }

    public void setVisitedAt(Instant visitedAt) {
        this.visitedAt = visitedAt;
    }
}
