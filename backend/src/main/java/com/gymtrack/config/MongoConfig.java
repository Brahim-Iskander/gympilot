package com.gymtrack.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * Enables MongoDB auditing so {@code @CreatedDate} fields are populated automatically.
 */
@Configuration
@EnableMongoAuditing
public class MongoConfig {
}
