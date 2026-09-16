package com.gymtrack.service;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gymtrack.dto.ai.AiCreditPurchaseResponse;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class AiCreditServiceTest {

    @Mock
    private UserRepository userRepository;

    private AiCreditService creditService;
    private User testUser;

    @BeforeEach
    void setUp() {
        creditService = new AiCreditService(userRepository);
        testUser = new User("John", "Doe", "john@example.com", "pass");
        testUser.setId("user-1");
        testUser.setPoints(300);
        testUser.setAiCredits(0);
    }

    @Test
    void testGetAvailablePacks() {
        var packs = creditService.getAvailablePacks();
        assertEquals(3, packs.size());
        assertEquals(3, packs.get(0).credits());
        assertEquals(5.0, packs.get(0).priceTnd());
        assertEquals(5, packs.get(1).credits());
        assertEquals(8.0, packs.get(1).priceTnd());
        assertEquals(10, packs.get(2).credits());
        assertEquals(14.0, packs.get(2).priceTnd());
    }

    @Test
    void testPurchaseInstant_Success() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        AiCreditPurchaseResponse res = creditService.purchaseInstant(testUser, "AI_PACK_5");

        assertTrue(res.success());
        assertEquals(5, res.creditsAdded());
        assertEquals(5, res.newCreditBalance());
        assertEquals(300, res.remainingPoints());
        verify(userRepository).save(testUser);
    }

    @Test
    void testRedeemWithPoints_Success() {
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        // Pack 3 costs 150 points
        AiCreditPurchaseResponse res = creditService.redeemWithPoints(testUser, "AI_PACK_3");

        assertTrue(res.success());
        assertEquals(3, res.creditsAdded());
        assertEquals(3, res.newCreditBalance());
        assertEquals(150, res.remainingPoints());
        verify(userRepository).save(testUser);
    }

    @Test
    void testRedeemWithPoints_InsufficientPoints() {
        testUser.setPoints(50);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                creditService.redeemWithPoints(testUser, "AI_PACK_3"));

        assertTrue(ex.getMessage().contains("Insufficient points"));
    }

    @Test
    void testAddCredits_Success() {
        when(userRepository.findById("user-1")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        User updated = creditService.addCredits("user-1", 10);

        assertNotNull(updated);
        assertEquals(10, updated.getAiCredits());
        verify(userRepository).save(testUser);
    }
}
