package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gymtrack.dto.AiUsageStatusResponse;
import com.gymtrack.exception.AiUsageLimitExceededException;
import com.gymtrack.model.AiFeature;
import com.gymtrack.model.AiUsageLog;
import com.gymtrack.model.User;
import com.gymtrack.repository.AiUsageLogRepository;
import com.gymtrack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AiUsageServiceTest {

    @Mock
    private AiUsageLogRepository aiUsageLogRepository;

    @Mock
    private UserRepository userRepository;

    private AiUsageService aiUsageService;
    private User freeUser;

    @BeforeEach
    void setUp() {
        aiUsageService = new AiUsageService(aiUsageLogRepository, userRepository);

        freeUser = new User("Karim", "Trabelsi", "karim@example.com", "pass");
        freeUser.setId("user-karim");
        freeUser.setMembershipTier("FREE");
        freeUser.setAiCredits(0);
    }

    @Test
    void testCheckAndIncrementUsage_WithinTierLimit() {
        // Free user lifetime limit is 3. Currently used 1.
        when(aiUsageLogRepository.countByUserIdAndFeature("user-karim", "BODY_SCAN")).thenReturn(1L);

        long newUsage = aiUsageService.checkAndIncrementUsage(freeUser, AiFeature.BODY_SCAN);

        assertEquals(2L, newUsage);
        verify(aiUsageLogRepository).save(any(AiUsageLog.class));
    }

    @Test
    void testCheckAndIncrementUsage_QuotaExceeded_UsesAiCredit() {
        // Free user lifetime limit is 3. Currently used 3. But has 2 AI credits!
        freeUser.setAiCredits(2);
        when(aiUsageLogRepository.countByUserIdAndFeature("user-karim", "BODY_SCAN")).thenReturn(3L);

        long newUsage = aiUsageService.checkAndIncrementUsage(freeUser, AiFeature.BODY_SCAN);

        assertEquals(4L, newUsage);
        assertEquals(1, freeUser.getAiCredits()); // 1 credit consumed
        verify(userRepository).save(freeUser);
        verify(aiUsageLogRepository).save(any(AiUsageLog.class));
    }

    @Test
    void testCheckAndIncrementUsage_QuotaExceeded_NoCredits_ThrowsException() {
        // Free user used 3, 0 credits
        freeUser.setAiCredits(0);
        when(aiUsageLogRepository.countByUserIdAndFeature("user-karim", "BODY_SCAN")).thenReturn(3L);

        assertThrows(AiUsageLimitExceededException.class, () ->
                aiUsageService.checkAndIncrementUsage(freeUser, AiFeature.BODY_SCAN));
    }

    @Test
    void testGetUsageStatus_IncludesCredits() {
        freeUser.setAiCredits(4);
        when(aiUsageLogRepository.countByUserIdAndFeature(eq("user-karim"), any())).thenReturn(1L);

        AiUsageStatusResponse status = aiUsageService.getUsageStatus(freeUser);

        assertEquals("FREE", status.tier());
        assertEquals(4, status.aiCredits());
        assertFalse(status.bodyScan().isExceeded());
        assertEquals(6, status.bodyScan().totalAvailable()); // 2 remaining tier + 4 credits
    }
}
