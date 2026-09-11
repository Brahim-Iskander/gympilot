package com.gymtrack.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.AiAnalyticsResponse;
import com.gymtrack.dto.AiUsageStatusResponse;
import com.gymtrack.dto.ChatRequest;
import com.gymtrack.dto.ChatResponse;
import com.gymtrack.dto.nutrition.MealPlannerDtos.MealPlannerRequest;
import com.gymtrack.dto.nutrition.MealPlannerDtos.MealPlannerResponse;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.User;
import com.gymtrack.model.UserOnboarding;
import com.gymtrack.repository.UserOnboardingRepository;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.AiService;
import com.gymtrack.service.AiUsageService;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiService aiService;
    private final UserOnboardingRepository onboardingRepository;
    private final AiUsageService aiUsageService;
    private final UserRepository userRepository;

    public AiController(AiService aiService,
                        UserOnboardingRepository onboardingRepository,
                        AiUsageService aiUsageService,
                        UserRepository userRepository) {
        this.aiService = aiService;
        this.onboardingRepository = onboardingRepository;
        this.aiUsageService = aiUsageService;
        this.userRepository = userRepository;
    }

    /** GET /api/ai/usage - Get current user's AI quotas and remaining usage */
    @GetMapping("/usage")
    public ResponseEntity<AiUsageStatusResponse> getUsageStatus(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new InvalidCredentialsException("Authentication required.");
        }
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return ResponseEntity.ok(aiUsageService.getUsageStatus(user));
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

    /** POST /api/ai/meal-planner/generate - Customized meal plan based on onboarding & budget in TND */
    @PostMapping("/meal-planner/generate")
    public ResponseEntity<MealPlannerResponse> generateMealPlan(
            Authentication authentication,
            @RequestBody(required = false) MealPlannerRequest request
    ) {
        String userId = (authentication != null) ? authentication.getName() : null;
        UserOnboarding onboarding = (userId != null)
                ? onboardingRepository.findByUserId(userId).orElse(null)
                : null;

        MealPlannerResponse response = aiService.generateCustomMealPlan(onboarding, request);
        return ResponseEntity.ok(response);
    }
}
