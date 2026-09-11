package com.gymtrack.repository;

import java.time.Instant;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.AiUsageLog;

public interface AiUsageLogRepository extends MongoRepository<AiUsageLog, String> {

    /** Lifetime count of uses for a given feature by user */
    long countByUserIdAndFeature(String userId, String feature);

    /** Uses since a given timestamp (e.g. start of month) */
    long countByUserIdAndFeatureAndUsedAtAfter(String userId, String feature, Instant after);
}
