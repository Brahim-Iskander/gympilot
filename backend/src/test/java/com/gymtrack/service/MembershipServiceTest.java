package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.gymtrack.dto.RedeemMembershipRequest;
import com.gymtrack.dto.UserResponse;
import com.gymtrack.model.PointTransaction;
import com.gymtrack.model.User;
import com.gymtrack.repository.PointTransactionRepository;
import com.gymtrack.repository.UserRepository;

@ExtendWith(MockitoExtension.class)
class MembershipServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PointTransactionRepository pointTransactionRepository;

    private MembershipService membershipService;

    @BeforeEach
    void setUp() {
        membershipService = new MembershipService(userRepository, pointTransactionRepository);
    }

    @Test
    void testRedeemBasicPlan_Success() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("u-1");
        user.setPoints(300);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse res = membershipService.redeemPlanWithPoints("alex@example.com", new RedeemMembershipRequest("BASIC"));

        assertNotNull(res);
        assertEquals(50, res.points(), "Points should be reduced by 250");
        assertEquals("BASIC", res.membershipTier());
        assertEquals("ACTIVE", res.membershipStatus());
        assertNotNull(res.membershipExpiresAt());

        ArgumentCaptor<PointTransaction> txCaptor = ArgumentCaptor.forClass(PointTransaction.class);
        verify(pointTransactionRepository).save(txCaptor.capture());
        assertEquals(-250, txCaptor.getValue().getPoints());
    }

    @Test
    void testRedeemPremiumPlan_Success() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("u-1");
        user.setPoints(600);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        UserResponse res = membershipService.redeemPlanWithPoints("alex@example.com", new RedeemMembershipRequest("PREMIUM"));

        assertNotNull(res);
        assertEquals(100, res.points(), "Points should be reduced by 500");
        assertEquals("PREMIUM", res.membershipTier());
        assertEquals("ACTIVE", res.membershipStatus());
        assertNotNull(res.membershipExpiresAt());
    }

    @Test
    void testRedeemPlan_InsufficientPoints_ThrowsException() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("u-1");
        user.setPoints(100);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                membershipService.redeemPlanWithPoints("alex@example.com", new RedeemMembershipRequest("BASIC")));

        assertTrue(ex.getMessage().contains("Insufficient points balance"));
    }
}
