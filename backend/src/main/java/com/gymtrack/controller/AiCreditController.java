package com.gymtrack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.ai.AiCreditPack;
import com.gymtrack.dto.ai.AiCreditPurchaseResponse;
import com.gymtrack.dto.ai.PurchaseAiCreditRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.AiCreditService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/ai/credits")
public class AiCreditController {

    private final AiCreditService aiCreditService;
    private final UserRepository userRepository;

    public AiCreditController(AiCreditService aiCreditService, UserRepository userRepository) {
        this.aiCreditService = aiCreditService;
        this.userRepository = userRepository;
    }

    /**
     * GET /api/ai/credits/packs
     * List available AI credit packs with prices in TND and reward points.
     */
    @GetMapping("/packs")
    public ResponseEntity<List<AiCreditPack>> getPacks() {
        return ResponseEntity.ok(aiCreditService.getAvailablePacks());
    }

    /**
     * GET /api/ai/credits/balance
     * Returns current user's AI credits & points balance.
     */
    @GetMapping("/balance")
    public ResponseEntity<Map<String, Object>> getBalance(Authentication authentication) {
        User user = getUser(authentication);
        return ResponseEntity.ok(Map.of(
                "aiCredits", user.getAiCredits(),
                "points", user.getPoints(),
                "email", user.getEmail()
        ));
    }

    /**
     * POST /api/ai/credits/purchase-instant
     * Instant simulated purchase adding credits immediately.
     */
    @PostMapping("/purchase-instant")
    public ResponseEntity<AiCreditPurchaseResponse> purchaseInstant(
            Authentication authentication,
            @Valid @RequestBody PurchaseAiCreditRequest request
    ) {
        User user = getUser(authentication);
        AiCreditPurchaseResponse response = aiCreditService.purchaseInstant(user, request.packId());
        return ResponseEntity.ok(response);
    }

    /**
     * POST /api/ai/credits/redeem-points
     * Exchange reward points for AI credits.
     */
    @PostMapping("/redeem-points")
    public ResponseEntity<AiCreditPurchaseResponse> redeemPoints(
            Authentication authentication,
            @Valid @RequestBody PurchaseAiCreditRequest request
    ) {
        User user = getUser(authentication);
        AiCreditPurchaseResponse response = aiCreditService.redeemWithPoints(user, request.packId());
        return ResponseEntity.ok(response);
    }

    private User getUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new InvalidCredentialsException("Authentication required.");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new InvalidCredentialsException("User not found: " + authentication.getName()));
    }
}
