package com.gymtrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisRequest;
import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisResponse;
import com.gymtrack.service.GoalPhotoAnalysisService;
import com.gymtrack.util.IpRateLimiter;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class GoalAnalysisController {

    private final GoalPhotoAnalysisService goalPhotoAnalysisService;
    private final IpRateLimiter ipRateLimiter;

    public GoalAnalysisController(GoalPhotoAnalysisService goalPhotoAnalysisService,
                                  IpRateLimiter ipRateLimiter) {
        this.goalPhotoAnalysisService = goalPhotoAnalysisService;
        this.ipRateLimiter = ipRateLimiter;
    }

    /**
     * Public, no-login endpoint: analyze a user-uploaded photo + goal description.
     * Ephemeral in-memory processing. Photos are never stored or persisted.
     */
    @PostMapping("/analyze")
    public ResponseEntity<PhotoAnalysisResponse> analyzeGoalPhoto(
            @Valid @RequestBody PhotoAnalysisRequest request,
            HttpServletRequest httpRequest
    ) {
        String clientIp = IpRateLimiter.extractClientIp(httpRequest);
        ipRateLimiter.checkAllowedOrThrow(clientIp);

        PhotoAnalysisResponse response = goalPhotoAnalysisService.analyze(request);
        return ResponseEntity.ok(response);
    }
}
