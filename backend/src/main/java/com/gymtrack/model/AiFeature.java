package com.gymtrack.model;

public enum AiFeature {
    PROGRESS_ANALYSIS("AI Progress Analysis"),
    BODY_SCAN("AI Body Scan");

    private final String displayName;

    AiFeature(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}
