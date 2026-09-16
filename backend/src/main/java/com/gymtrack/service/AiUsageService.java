package com.gymtrack.service;

import java.time.Instant;
import java.time.YearMonth;
import java.time.ZoneOffset;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.AiUsageStatusResponse;
import com.gymtrack.dto.AiUsageStatusResponse.FeatureUsage;
import com.gymtrack.exception.AiUsageLimitExceededException;
import com.gymtrack.model.AiFeature;
import com.gymtrack.model.AiUsageLog;
import com.gymtrack.model.User;
import com.gymtrack.repository.AiUsageLogRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class AiUsageService {

    private static final Logger log = LoggerFactory.getLogger(AiUsageService.class);

    public static final int FREE_LIFETIME_LIMIT = 3;
    public static final int BASIC_MONTHLY_LIMIT = 5;
    public static final int PREMIUM_MONTHLY_LIMIT = 15;

    private final AiUsageLogRepository aiUsageLogRepository;
    private final UserRepository userRepository;

    public AiUsageService(AiUsageLogRepository aiUsageLogRepository, UserRepository userRepository) {
        this.aiUsageLogRepository = aiUsageLogRepository;
        this.userRepository = userRepository;
    }

    /**
     * Checks if the user is allowed to execute the specified AI feature according to their membership tier
     * or purchased AI credits.
     * If tier quota is exhausted but user has AI credits, 1 credit is consumed.
     * If all quota & credits are exhausted, throws AiUsageLimitExceededException.
     */
    public long checkAndIncrementUsage(User user, AiFeature feature) {
        if (isAdmin(user)) {
            log.info("Admin {} bypasses quota for {}", user.getEmail(), feature);
            recordUsage(user, feature);
            return 0;
        }

        String tier = resolveTier(user);
        int limit = getLimitForTier(tier);
        String period = getPeriodForTier(tier);

        long currentUsage = getCurrentUsage(user.getId(), feature, period);

        if (currentUsage >= limit) {
            int credits = user.getAiCredits();
            if (credits > 0) {
                user.setAiCredits(credits - 1);
                userRepository.save(user);
                log.info("User {} consumed 1 AI credit for {} (credits remaining: {})",
                        user.getEmail(), feature, user.getAiCredits());
                recordUsage(user, feature);
                return currentUsage + 1;
            }
            log.warn("User {} exceeded {} quota (tier: {}, limit: {}, used: {}, credits: 0)",
                    user.getEmail(), feature, tier, limit, currentUsage);
            throw new AiUsageLimitExceededException(feature, tier, limit, period);
        }

        recordUsage(user, feature);
        return currentUsage + 1;
    }

    /**
     * Returns the comprehensive usage status for both AI features for the specified user,
     * including purchased AI credits.
     */
    public AiUsageStatusResponse getUsageStatus(User user) {
        boolean admin = isAdmin(user);
        String tier = resolveTier(user);
        int credits = user != null ? user.getAiCredits() : 0;

        FeatureUsage progressUsage = buildFeatureUsage(user, AiFeature.PROGRESS_ANALYSIS, tier, admin, credits);
        FeatureUsage bodyScanUsage = buildFeatureUsage(user, AiFeature.BODY_SCAN, tier, admin, credits);

        return new AiUsageStatusResponse(tier, admin, credits, progressUsage, bodyScanUsage);
    }

    private FeatureUsage buildFeatureUsage(User user, AiFeature feature, String tier, boolean admin, int credits) {
        if (admin) {
            return new FeatureUsage(feature.name(), 9999, 0, 9999, "UNLIMITED", false, credits, 9999);
        }

        int limit = getLimitForTier(tier);
        String period = getPeriodForTier(tier);
        long used = user != null ? getCurrentUsage(user.getId(), feature, period) : 0;
        long remaining = Math.max(0, limit - used);
        long totalAvailable = remaining + credits;
        boolean isExceeded = remaining <= 0 && credits <= 0;

        return new FeatureUsage(feature.name(), limit, used, remaining, period, isExceeded, credits, totalAvailable);
    }

    private void recordUsage(User user, AiFeature feature) {
        AiUsageLog logEntry = new AiUsageLog(user.getId(), user.getEmail(), feature.name(), Instant.now());
        aiUsageLogRepository.save(logEntry);
    }

    private long getCurrentUsage(String userId, AiFeature feature, String period) {
        if ("LIFETIME".equalsIgnoreCase(period)) {
            return aiUsageLogRepository.countByUserIdAndFeature(userId, feature.name());
        } else {
            Instant startOfMonth = YearMonth.now(ZoneOffset.UTC).atDay(1).atStartOfDay(ZoneOffset.UTC).toInstant();
            return aiUsageLogRepository.countByUserIdAndFeatureAndUsedAtAfter(userId, feature.name(), startOfMonth);
        }
    }

    public static String resolveTier(User user) {
        if (user == null || user.getMembershipTier() == null || user.getMembershipTier().isBlank()) {
            return "FREE";
        }
        String t = user.getMembershipTier().trim().toUpperCase();
        if ("PREMIUM".equals(t) || "BASIC".equals(t)) {
            return t;
        }
        return "FREE";
    }

    public static int getLimitForTier(String tier) {
        if ("PREMIUM".equalsIgnoreCase(tier)) return PREMIUM_MONTHLY_LIMIT;
        if ("BASIC".equalsIgnoreCase(tier)) return BASIC_MONTHLY_LIMIT;
        return FREE_LIFETIME_LIMIT;
    }

    public static String getPeriodForTier(String tier) {
        if ("PREMIUM".equalsIgnoreCase(tier) || "BASIC".equalsIgnoreCase(tier)) {
            return "MONTHLY";
        }
        return "LIFETIME";
    }

    private boolean isAdmin(User user) {
        if (user == null) return false;
        if ("ADMIN".equalsIgnoreCase(user.getRole())) return true;
        return user.getRoles() != null && user.getRoles().contains("ADMIN");
    }
}
