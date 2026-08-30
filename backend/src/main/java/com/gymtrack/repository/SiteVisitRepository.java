package com.gymtrack.repository;

import java.time.Instant;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.SiteVisit;

/**
 * Spring Data MongoDB repository for site visit analytics.
 */
public interface SiteVisitRepository extends MongoRepository<SiteVisit, String> {

    long countByVisitedAtAfter(Instant after);

    long countByVisitedAtBetween(Instant from, Instant to);
}
