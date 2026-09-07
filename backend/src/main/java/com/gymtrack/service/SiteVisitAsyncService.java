package com.gymtrack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.gymtrack.model.SiteVisit;
import com.gymtrack.repository.SiteVisitRepository;

/**
 * Asynchronously persists site visits to MongoDB Atlas in the background,
 * ensuring zero added latency to user HTTP requests.
 */
@Service
public class SiteVisitAsyncService {

    private static final Logger log = LoggerFactory.getLogger(SiteVisitAsyncService.class);
    private final SiteVisitRepository siteVisitRepository;

    public SiteVisitAsyncService(SiteVisitRepository siteVisitRepository) {
        this.siteVisitRepository = siteVisitRepository;
    }

    @Async("taskExecutor")
    public void recordVisitAsync(SiteVisit visit) {
        try {
            siteVisitRepository.save(visit);
        } catch (Exception ex) {
            log.debug("Background visit tracking error: {}", ex.getMessage());
        }
    }
}
