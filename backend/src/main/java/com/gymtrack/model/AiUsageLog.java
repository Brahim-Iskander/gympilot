package com.gymtrack.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Audit log recording AI feature executions to enforce tier quotas.
 */
@Document(collection = "ai_usage_logs")
@CompoundIndexes({
    @CompoundIndex(name = "user_feature_time_idx", def = "{'userId': 1, 'feature': 1, 'usedAt': -1}")
})
public class AiUsageLog {

    @Id
    private String id;

    @Indexed
    private String userId;

    private String userEmail;

    @Indexed
    private String feature; // PROGRESS_ANALYSIS or BODY_SCAN

    @Indexed
    private Instant usedAt;

    public AiUsageLog() {
    }

    public AiUsageLog(String userId, String userEmail, String feature, Instant usedAt) {
        this.userId = userId;
        this.userEmail = userEmail;
        this.feature = feature;
        this.usedAt = usedAt;
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

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getFeature() {
        return feature;
    }

    public void setFeature(String feature) {
        this.feature = feature;
    }

    public Instant getUsedAt() {
        return usedAt;
    }

    public void setUsedAt(Instant usedAt) {
        this.usedAt = usedAt;
    }
}
