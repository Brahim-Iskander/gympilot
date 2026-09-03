package com.gymtrack.service;

import java.time.Duration;
import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.RedeemMembershipRequest;
import com.gymtrack.dto.UserResponse;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.PointTransaction;
import com.gymtrack.model.User;
import com.gymtrack.repository.PointTransactionRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class MembershipService {

    private static final Logger log = LoggerFactory.getLogger(MembershipService.class);

    public static final int BASIC_PLAN_POINTS = 250;
    public static final int PREMIUM_PLAN_POINTS = 500;
    public static final int SUBSCRIPTION_DURATION_DAYS = 30;

    private final UserRepository userRepository;
    private final PointTransactionRepository pointTransactionRepository;

    public MembershipService(UserRepository userRepository,
                             PointTransactionRepository pointTransactionRepository) {
        this.userRepository = userRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    public UserResponse redeemPlanWithPoints(String userEmail, RedeemMembershipRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        String tier = request.tier().trim().toUpperCase();
        int requiredPoints;
        if ("BASIC".equals(tier)) {
            requiredPoints = BASIC_PLAN_POINTS;
        } else if ("PREMIUM".equals(tier)) {
            requiredPoints = PREMIUM_PLAN_POINTS;
        } else {
            throw new IllegalArgumentException("Invalid membership tier. Choose BASIC or PREMIUM.");
        }

        if (user.getPoints() < requiredPoints) {
            throw new IllegalArgumentException("Insufficient points balance. You need " + requiredPoints
                    + " points to redeem the " + tier + " plan, but you have " + user.getPoints() + " points.");
        }

        // Deduct points
        user.setPoints(user.getPoints() - requiredPoints);

        // Calculate subscription expiration (extend if already on the same active tier)
        Instant baseTime = Instant.now();
        if (tier.equalsIgnoreCase(user.getMembershipTier())
                && user.getMembershipExpiresAt() != null
                && user.getMembershipExpiresAt().isAfter(baseTime)) {
            baseTime = user.getMembershipExpiresAt();
        }

        Instant expiresAt = baseTime.plus(Duration.ofDays(SUBSCRIPTION_DURATION_DAYS));

        user.setMembershipTier(tier);
        user.setMembershipStatus("ACTIVE");
        user.setMembershipExpiresAt(expiresAt);

        User saved = userRepository.save(user);

        // Record point debit transaction in points history
        PointTransaction tx = new PointTransaction(
                saved.getId(),
                -requiredPoints,
                "membership_redeem_" + tier.toLowerCase(),
                "Purchased 1 Month " + tier + " Plan (" + requiredPoints + " points redeemed)",
                null,
                null
        );
        pointTransactionRepository.save(tx);

        log.info("User {} successfully redeemed {} points for 1 Month {} plan until {}",
                userEmail, requiredPoints, tier, expiresAt);

        return UserResponse.from(saved);
    }
}
