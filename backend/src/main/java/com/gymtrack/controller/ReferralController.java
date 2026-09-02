package com.gymtrack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.ReferralStatsResponse;
import com.gymtrack.service.ReferralService;

@RestController
@RequestMapping("/api/referrals")
public class ReferralController {

    private final ReferralService referralService;

    public ReferralController(ReferralService referralService) {
        this.referralService = referralService;
    }

    /**
     * Protected - Returns referral link, stats, friends list, and points ledger for the authenticated user.
     */
    @GetMapping("/stats")
    public ResponseEntity<ReferralStatsResponse> getReferralStats(Authentication authentication) {
        String userEmail = authentication.getName();
        ReferralStatsResponse stats = referralService.getReferralStats(userEmail);
        return ResponseEntity.ok(stats);
    }

    /**
     * Public - Validates a referral code for frontend preview during registration.
     */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateReferralCode(@RequestParam(name = "code", required = false) String code) {
        Map<String, Object> result = referralService.validateReferralCode(code);
        return ResponseEntity.ok(result);
    }
}
