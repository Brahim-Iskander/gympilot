package com.gymtrack.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.AiAnalyticsResponse;
import com.gymtrack.dto.ChatRequest;
import com.gymtrack.dto.ChatResponse;
import com.gymtrack.dto.onboarding.OnboardingResponse;
import com.gymtrack.model.UserOnboarding;
import com.gymtrack.repository.UserOnboardingRepository;
import com.gymtrack.service.AiService;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final UserOnboardingRepository onboardingRepository;

    public AiController(AiService aiService, UserOnboardingRepository onboardingRepository) {
        this.aiService = aiService;
        this.onboardingRepository = onboardingRepository;
    }

    @PostMapping("/chat")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String responseText = aiService.chatWithAi(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(responseText));
    }

    /** POST /api/ai/analyze-food - AI Food Vision & Calorie Recognition */
    @PostMapping("/analyze-food")
    public ResponseEntity<Map<String, Object>> analyzeFood(@RequestBody Map<String, String> request) {
        String prompt = request.getOrDefault("prompt", "");
        String imageBase64 = request.getOrDefault("image", "");
        Map<String, Object> result = aiService.analyzeFood(prompt, imageBase64);
        return ResponseEntity.ok(result);
    }

    /** GET /api/ai/analytics - Personalized AI progress & performance analysis */
    @GetMapping("/analytics")
    public ResponseEntity<AiAnalyticsResponse> getAnalytics(Authentication authentication) {
        String userId = authentication.getName();
        UserOnboarding onboarding = onboardingRepository.findByUserId(userId).orElse(null);
        AiAnalyticsResponse analytics = aiService.generateAnalytics(onboarding);
        return ResponseEntity.ok(analytics);
    }
}

