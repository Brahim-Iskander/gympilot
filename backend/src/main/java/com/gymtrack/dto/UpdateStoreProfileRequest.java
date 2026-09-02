package com.gymtrack.dto;

public record UpdateStoreProfileRequest(
        String storeName,
        String storeBio,
        String storeLogo
) {
}
