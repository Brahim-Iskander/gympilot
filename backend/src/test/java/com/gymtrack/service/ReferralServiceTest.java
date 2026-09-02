package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gymtrack.model.PointTransaction;
import com.gymtrack.model.User;
import com.gymtrack.repository.PointTransactionRepository;
import com.gymtrack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class ReferralServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    private ReferralService referralService;

    @BeforeEach
    void setUp() {
        referralService = new ReferralService(userRepository, pointTransactionRepository);
    }

    @Test
    void testAwardReferralPoints_ValidReferral() {
        // Given
        User referrer = new User("Jane", "Doe", "jane@example.com", "hash");
        referrer.setId("ref-123");
        referrer.setReferralCode("JANE1234");
        referrer.setPoints(0);

        User newUser = new User("John", "Smith", "john@example.com", "hash");
        newUser.setId("new-456");
        newUser.setReferralCode("JOHN5678");
        newUser.setPoints(0);

        when(userRepository.findByReferralCode("JANE1234")).thenReturn(Optional.of(referrer));
        when(pointTransactionRepository.existsByUserIdAndReasonAndRelatedUserId("new-456", ReferralService.REASON_SIGNUP_BONUS, "ref-123"))
                .thenReturn(false);

        // When
        boolean success = referralService.awardReferralPoints(newUser, "JANE1234");

        // Then
        assertTrue(success);
        assertEquals(10, newUser.getPoints());
        assertEquals(5, referrer.getPoints());
        assertEquals("JANE1234", newUser.getReferredBy());

        verify(userRepository).save(newUser);
        verify(userRepository).save(referrer);
        verify(pointTransactionRepository, times(2)).save(any(PointTransaction.class));
    }

    @Test
    void testAwardReferralPoints_InvalidCode() {
        // Given
        User newUser = new User("John", "Smith", "john@example.com", "hash");
        newUser.setId("new-456");

        when(userRepository.findByReferralCode("INVALID99")).thenReturn(Optional.empty());

        // When
        boolean success = referralService.awardReferralPoints(newUser, "INVALID99");

        // Then
        assertFalse(success);
        assertEquals(0, newUser.getPoints());
        verify(userRepository, never()).save(any());
        verify(pointTransactionRepository, never()).save(any());
    }

    @Test
    void testAwardReferralPoints_SelfReferralBlocked() {
        // Given
        User newUser = new User("John", "Smith", "john@example.com", "hash");
        newUser.setId("user-100");
        newUser.setReferralCode("JOHN1000");

        // When (passing own code)
        boolean success = referralService.awardReferralPoints(newUser, "JOHN1000");

        // Then
        assertFalse(success);
        assertEquals(0, newUser.getPoints());
        verify(userRepository, never()).findByReferralCode(any());
        verify(pointTransactionRepository, never()).save(any());
    }

    @Test
    void testAwardReferralPoints_DuplicateBlocked() {
        // Given
        User referrer = new User("Jane", "Doe", "jane@example.com", "hash");
        referrer.setId("ref-123");
        referrer.setReferralCode("JANE1234");

        User newUser = new User("John", "Smith", "john@example.com", "hash");
        newUser.setId("new-456");

        when(userRepository.findByReferralCode("JANE1234")).thenReturn(Optional.of(referrer));
        when(pointTransactionRepository.existsByUserIdAndReasonAndRelatedUserId("new-456", ReferralService.REASON_SIGNUP_BONUS, "ref-123"))
                .thenReturn(true);

        // When
        boolean success = referralService.awardReferralPoints(newUser, "JANE1234");

        // Then
        assertFalse(success);
        verify(pointTransactionRepository, never()).save(any());
    }

    @Test
    void testValidateReferralCode() {
        User referrer = new User("Jane", "Doe", "jane@example.com", "hash");
        referrer.setReferralCode("JANE1234");

        when(userRepository.findByReferralCode("JANE1234")).thenReturn(Optional.of(referrer));
        when(userRepository.findByReferralCode("UNKNOWN")).thenReturn(Optional.empty());

        Map<String, Object> validResult = referralService.validateReferralCode("JANE1234");
        assertTrue((Boolean) validResult.get("valid"));
        assertEquals(10, validResult.get("bonusPoints"));

        Map<String, Object> invalidResult = referralService.validateReferralCode("UNKNOWN");
        assertFalse((Boolean) invalidResult.get("valid"));
    }
}
