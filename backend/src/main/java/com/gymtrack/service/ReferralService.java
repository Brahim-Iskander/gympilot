package com.gymtrack.service;

import java.security.SecureRandom;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.PointTransactionResponse;
import com.gymtrack.dto.ReferralStatsResponse;
import com.gymtrack.dto.ReferredFriendResponse;
import com.gymtrack.model.PointTransaction;
import com.gymtrack.model.User;
import com.gymtrack.repository.PointTransactionRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class ReferralService {

    private static final Logger log = LoggerFactory.getLogger(ReferralService.class);

    public static final int SIGNUP_BONUS_POINTS = 10;
    public static final int INVITE_BONUS_POINTS = 5;

    public static final String REASON_SIGNUP_BONUS = "referral_signup_bonus";
    public static final String REASON_INVITE_BONUS = "referral_invite_bonus";

    private static final String ALPHANUMERIC = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private final UserRepository userRepository;
    private final PointTransactionRepository pointTransactionRepository;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public ReferralService(UserRepository userRepository, PointTransactionRepository pointTransactionRepository) {
        this.userRepository = userRepository;
        this.pointTransactionRepository = pointTransactionRepository;
    }

    /**
     * Generates a unique referral code for a user (e.g. ALEX8392).
     */
    public String generateUniqueReferralCode(User user) {
        String baseName = "";
        if (user != null && user.getFirstName() != null) {
            baseName = user.getFirstName().replaceAll("[^a-zA-Z]", "").toUpperCase();
        }
        if (baseName.length() > 4) {
            baseName = baseName.substring(0, 4);
        } else if (baseName.length() < 3) {
            baseName = "GYM";
        }

        String code;
        int attempts = 0;
        do {
            StringBuilder sb = new StringBuilder(baseName);
            for (int i = 0; i < 4; i++) {
                sb.append(ALPHANUMERIC.charAt(RANDOM.nextInt(ALPHANUMERIC.length())));
            }
            code = sb.toString();
            attempts++;
            if (attempts > 50) {
                code = "GP" + System.currentTimeMillis() % 1000000;
                break;
            }
        } while (userRepository.existsByReferralCode(code));

        return code;
    }

    /**
     * Ensures the user has a valid referral code assigned.
     */
    public String ensureReferralCode(User user) {
        if (user.getReferralCode() != null && !user.getReferralCode().isBlank()) {
            return user.getReferralCode();
        }
        String newCode = generateUniqueReferralCode(user);
        user.setReferralCode(newCode);
        userRepository.save(user);
        log.info("Assigned unique referral code '{}' to user '{}'", newCode, user.getEmail());
        return newCode;
    }

    /**
     * Awards referral points to the new user (+10) and referrer (+5).
     *
     * @param newUser           the newly registered user
     * @param rawReferralCode   the referral code provided at registration
     * @return true if points were successfully awarded, false otherwise
     */
    public boolean awardReferralPoints(User newUser, String rawReferralCode) {
        if (rawReferralCode == null || rawReferralCode.isBlank()) {
            return false;
        }

        String code = rawReferralCode.trim().toUpperCase();

        // 1. Check self-referral
        if (newUser.getReferralCode() != null && newUser.getReferralCode().equalsIgnoreCase(code)) {
            log.warn("Self-referral attempt blocked for user: {}", newUser.getEmail());
            return false;
        }

        // 2. Lookup referrer by code
        Optional<User> referrerOpt = userRepository.findByReferralCode(code);
        if (referrerOpt.isEmpty()) {
            log.warn("Invalid referral code provided during registration for user {}: {}", newUser.getEmail(), code);
            return false;
        }

        User referrer = referrerOpt.get();

        // Prevent self-referral if referrer id matches new user id
        if (referrer.getId() != null && referrer.getId().equals(newUser.getId())) {
            log.warn("Self-referral attempt blocked for user id: {}", newUser.getId());
            return false;
        }

        // 3. Prevent duplicate bonus crediting
        boolean alreadyCredited = pointTransactionRepository.existsByUserIdAndReasonAndRelatedUserId(
                newUser.getId(), REASON_SIGNUP_BONUS, referrer.getId());
        if (alreadyCredited) {
            log.warn("Duplicate referral bonus attempt detected for user: {}", newUser.getId());
            return false;
        }

        try {
            // Update invitee (new user)
            newUser.setReferredBy(code);
            newUser.setPoints(newUser.getPoints() + SIGNUP_BONUS_POINTS);
            userRepository.save(newUser);

            PointTransaction inviteeTx = new PointTransaction(
                    newUser.getId(),
                    SIGNUP_BONUS_POINTS,
                    REASON_SIGNUP_BONUS,
                    "Welcome bonus for joining via friend invite (" + maskName(referrer) + ")",
                    referrer.getId(),
                    code
            );
            pointTransactionRepository.save(inviteeTx);

            // Update referrer
            referrer.setPoints(referrer.getPoints() + INVITE_BONUS_POINTS);
            userRepository.save(referrer);

            PointTransaction referrerTx = new PointTransaction(
                    referrer.getId(),
                    INVITE_BONUS_POINTS,
                    REASON_INVITE_BONUS,
                    "Referral bonus for inviting " + maskName(newUser),
                    newUser.getId(),
                    code
            );
            pointTransactionRepository.save(referrerTx);

            log.info("Successfully processed referral code '{}': awarded {} pts to invitee {} and {} pts to referrer {}",
                    code, SIGNUP_BONUS_POINTS, newUser.getEmail(), INVITE_BONUS_POINTS, referrer.getEmail());
            return true;
        } catch (Exception e) {
            log.error("Failed to credit referral points for user {}: {}", newUser.getEmail(), e.getMessage(), e);
            return false;
        }
    }

    /**
     * Retrieves referral statistics, shareable link, referred friends, and points history for a user.
     */
    public ReferralStatsResponse getReferralStats(String userEmail) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        String referralCode = ensureReferralCode(user);

        String cleanFrontendUrl = (frontendUrl != null ? frontendUrl.replaceAll("/+$", "") : "http://localhost:5173");
        String referralLink = cleanFrontendUrl + "/register?ref=" + referralCode;

        // Referred friends list
        List<User> referredUsers = userRepository.findByReferredByOrderByCreatedAtDesc(referralCode);
        List<ReferredFriendResponse> friends = referredUsers.stream()
                .map(friend -> new ReferredFriendResponse(
                        maskName(friend),
                        friend.getCreatedAt(),
                        INVITE_BONUS_POINTS
                ))
                .collect(Collectors.toList());

        // Points ledger
        List<PointTransaction> transactions = pointTransactionRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        List<PointTransactionResponse> transactionResponses = transactions.stream()
                .map(PointTransactionResponse::from)
                .collect(Collectors.toList());

        int pointsFromReferrals = transactions.stream()
                .filter(t -> REASON_INVITE_BONUS.equals(t.getReason()) || REASON_SIGNUP_BONUS.equals(t.getReason()))
                .mapToInt(PointTransaction::getPoints)
                .sum();

        return new ReferralStatsResponse(
                referralCode,
                referralLink,
                user.getPoints(),
                friends.size(),
                pointsFromReferrals,
                friends,
                transactionResponses
        );
    }

    /**
     * Validates a referral code for frontend preview during signup.
     */
    public Map<String, Object> validateReferralCode(String rawCode) {
        if (rawCode == null || rawCode.isBlank()) {
            return Map.of("valid", false, "message", "Referral code is required");
        }
        String code = rawCode.trim().toUpperCase();
        Optional<User> referrerOpt = userRepository.findByReferralCode(code);
        if (referrerOpt.isPresent()) {
            User referrer = referrerOpt.get();
            return Map.of(
                    "valid", true,
                    "code", code,
                    "referrerName", maskName(referrer),
                    "bonusPoints", SIGNUP_BONUS_POINTS,
                    "message", "Valid referral! You will receive " + SIGNUP_BONUS_POINTS + " bonus points on registration."
            );
        } else {
            return Map.of(
                    "valid", false,
                    "code", code,
                    "message", "Invalid referral code. You can still sign up normally."
            );
        }
    }

    private String maskName(User user) {
        if (user == null) return "Friend";
        String first = (user.getFirstName() != null && !user.getFirstName().isBlank()) ? user.getFirstName() : "Member";
        String lastInitial = (user.getLastName() != null && !user.getLastName().isBlank()) ? user.getLastName().substring(0, 1).toUpperCase() + "." : "";
        return (first + " " + lastInitial).trim();
    }
}
