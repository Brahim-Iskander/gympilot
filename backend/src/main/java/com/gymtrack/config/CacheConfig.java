package com.gymtrack.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.concurrent.ConcurrentMapCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.Scheduled;

/**
 * In-memory caching configuration for high-frequency queries.
 * Eliminates redundant network round-trips from the VPS to MongoDB Atlas.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    private static final Logger log = LoggerFactory.getLogger(CacheConfig.class);

    public static final String CACHE_USER_DETAILS = "userDetails";
    public static final String CACHE_CATEGORIES = "categories";
    public static final String CACHE_PARTNERS = "partners";
    public static final String CACHE_ACTIVE_PACKS = "activePacks";

    @Bean
    public CacheManager cacheManager() {
        ConcurrentMapCacheManager cacheManager = new ConcurrentMapCacheManager();
        cacheManager.setCacheNames(List.of(
                CACHE_USER_DETAILS,
                CACHE_CATEGORIES,
                CACHE_PARTNERS,
                CACHE_ACTIVE_PACKS
        ));
        return cacheManager;
    }

    /**
     * Periodically clear cached user details every 10 minutes to guarantee
     * role changes or status updates are picked up promptly.
     */
    @Scheduled(fixedRate = 600000)
    public void evictUserDetailsCache() {
        CacheManager cm = cacheManager();
        var cache = cm.getCache(CACHE_USER_DETAILS);
        if (cache != null) {
            cache.clear();
            log.debug("Cleared userDetails cache.");
        }
    }
}
