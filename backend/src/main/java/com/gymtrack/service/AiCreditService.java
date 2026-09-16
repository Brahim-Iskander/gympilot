package com.gymtrack.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtrack.dto.ai.AiCreditPack;
import com.gymtrack.dto.ai.AiCreditPurchaseResponse;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;

@Service
public class AiCreditService {

    private static final Logger log = LoggerFactory.getLogger(AiCreditService.class);

    private static final List<AiCreditPack> PACKS = List.of(
            new AiCreditPack(
                    "AI_PACK_3",
                    "Starter Pack",
                    "Popular",
                    3,
                    5.00,
                    150,
                    1.67,
                    0,
                    "3 AI Body Scans & Progress Analyses"
            ),
            new AiCreditPack(
                    "AI_PACK_5",
                    "Pro Pack",
                    "Best Value",
                    5,
                    8.00,
                    240,
                    1.60,
                    20,
                    "5 AI Body Scans & Progress Analyses"
            ),
            new AiCreditPack(
                    "AI_PACK_10",
                    "Power Pack",
                    "Max Savings",
                    10,
                    14.00,
                    400,
                    1.40,
                    30,
                    "10 AI Body Scans & Progress Analyses"
            )
    );

    private final UserRepository userRepository;

    public AiCreditService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AiCreditPack> getAvailablePacks() {
        return PACKS;
    }

    public AiCreditPack getPackById(String packId) {
        return PACKS.stream()
                .filter(p -> p.id().equalsIgnoreCase(packId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Invalid credit pack ID: " + packId));
    }

    /**
     * Instant simulated purchase (adds credits immediately).
     */
    @Transactional
    public AiCreditPurchaseResponse purchaseInstant(User user, String packId) {
        AiCreditPack pack = getPackById(packId);

        user.setAiCredits(user.getAiCredits() + pack.credits());
        User saved = userRepository.save(user);

        log.info("User {} purchased {} (added {} AI credits, new balance: {})",
                user.getEmail(), pack.title(), pack.credits(), saved.getAiCredits());

        return new AiCreditPurchaseResponse(
                true,
                pack.credits(),
                saved.getAiCredits(),
                saved.getPoints(),
                "Successfully purchased " + pack.credits() + " AI Credits! You can now continue your AI analysis."
        );
    }

    /**
     * Redeem loyalty reward points for AI credits.
     */
    @Transactional
    public AiCreditPurchaseResponse redeemWithPoints(User user, String packId) {
        AiCreditPack pack = getPackById(packId);

        if (user.getPoints() < pack.pointsPrice()) {
            throw new IllegalArgumentException(
                    "Insufficient points balance. You have " + user.getPoints() +
                    " points, but " + pack.pointsPrice() + " points are required for this pack."
            );
        }

        user.setPoints(user.getPoints() - pack.pointsPrice());
        user.setAiCredits(user.getAiCredits() + pack.credits());
        User saved = userRepository.save(user);

        log.info("User {} redeemed {} points for {} AI credits (new points: {}, new credits: {})",
                user.getEmail(), pack.pointsPrice(), pack.credits(), saved.getPoints(), saved.getAiCredits());

        return new AiCreditPurchaseResponse(
                true,
                pack.credits(),
                saved.getAiCredits(),
                saved.getPoints(),
                "Redeemed " + pack.pointsPrice() + " points for " + pack.credits() + " AI Credits! Enjoy your scans."
        );
    }

    /**
     * Directly credit a user (called when Admin approves a D17 manual payment for AI credits).
     */
    @Transactional
    public User addCredits(String userId, int credits) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new InvalidCredentialsException("User not found: " + userId));

        user.setAiCredits(user.getAiCredits() + credits);
        User saved = userRepository.save(user);
        log.info("Credited {} AI credits to user {} via D17 approval (new balance: {})",
                credits, user.getEmail(), saved.getAiCredits());
        return saved;
    }
}
