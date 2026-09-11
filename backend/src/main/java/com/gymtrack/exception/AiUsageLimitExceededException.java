package com.gymtrack.exception;

import com.gymtrack.model.AiFeature;

public class AiUsageLimitExceededException extends RuntimeException {

    private final AiFeature feature;
    private final String tier;
    private final int limit;
    private final String period; // "LIFETIME" or "MONTHLY"

    public AiUsageLimitExceededException(AiFeature feature, String tier, int limit, String period) {
        super(String.format("You have reached your limit of %d %s %s uses on the %s tier. Upgrade your membership to continue.",
                limit, period.toLowerCase(), feature.getDisplayName(), tier));
        this.feature = feature;
        this.tier = tier;
        this.limit = limit;
        this.period = period;
    }

    public AiFeature getFeature() {
        return feature;
    }

    public String getTier() {
        return tier;
    }

    public int getLimit() {
        return limit;
    }

    public String getPeriod() {
        return period;
    }
}
