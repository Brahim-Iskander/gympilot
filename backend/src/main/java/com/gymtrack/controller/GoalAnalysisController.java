package com.gymtrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisRequest;
import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisResponse;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.AiFeature;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.AiUsageService;
import com.gymtrack.service.GoalPhotoAnalysisService;
import com.gymtrack.util.IpRateLimiter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class GoalAnalysisController {

    private final GoalPhotoAnalysisService goalPhotoAnalysisService;
    private final IpRateLimiter ipRateLimiter;
    private final AiUsageService aiUsageService;
    private final UserRepository userRepository;

    public GoalAnalysisController(GoalPhotoAnalysisService goalPhotoAnalysisService,
                                  IpRateLimiter ipRateLimiter,
                                  AiUsageService aiUsageService,
                                  UserRepository userRepository) {
        this.goalPhotoAnalysisService = goalPhotoAnalysisService;
        this.ipRateLimiter = ipRateLimiter;
        this.aiUsageService = aiUsageService;
        this.userRepository = userRepository;
    }

    /**
     * Analyze a user-uploaded photo + goal description.
     * Enforces tier quota limits (Free: 3 lifetime, Basic: 5/mo, Premium: 15/mo).
     */
    @PostMapping("/analyze")
    public ResponseEntity<PhotoAnalysisResponse> analyzeGoalPhoto(
            @Valid @RequestBody PhotoAnalysisRequest request,
            Authentication authentication,
            HttpServletRequest httpRequest
    ) {
        String clientIp = IpRateLimiter.extractClientIp(httpRequest);
        ipRateLimiter.checkAllowedOrThrow(clientIp);

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getName())) {
            throw new InvalidCredentialsException("Please log in or create a free account to use the Body Scan (3 free scans included).");
        }

        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new InvalidCredentialsException("User account not found. Please log in again."));

        // Enforce quota limits for BODY_SCAN
        aiUsageService.checkAndIncrementUsage(user, AiFeature.BODY_SCAN);

        PhotoAnalysisResponse response = goalPhotoAnalysisService.analyze(request);
        return ResponseEntity.ok(response);
    }
}
