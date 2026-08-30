package com.gymtrack.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.web.bind.annotation.PutMapping;

import com.gymtrack.dto.onboarding.OnboardingResponse;
import com.gymtrack.dto.onboarding.OnboardingStep1Request;
import com.gymtrack.dto.onboarding.OnboardingStep2Request;
import com.gymtrack.dto.onboarding.OnboardingStep3Request;
import com.gymtrack.dto.onboarding.OnboardingStep4Request;
import com.gymtrack.dto.onboarding.OnboardingStep5Request;
import com.gymtrack.dto.onboarding.OnboardingStep6Request;
import com.gymtrack.dto.onboarding.OnboardingStep7Request;
import com.gymtrack.dto.onboarding.UpdateOnboardingProfileRequest;
import com.gymtrack.service.OnboardingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/onboarding")
public class OnboardingController {

    private final OnboardingService onboardingService;

    public OnboardingController(OnboardingService onboardingService) {
        this.onboardingService = onboardingService;
    }

    @GetMapping
    public OnboardingResponse getOnboarding(Authentication authentication) {
        return onboardingService.getOrCreate(authentication.getName());
    }

    @PostMapping("/step1")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse saveStep1(Authentication authentication, @Valid @RequestBody OnboardingStep1Request request) {
        return onboardingService.saveStep1(authentication.getName(), request);
    }

    @PostMapping("/step2")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse saveStep2(Authentication authentication, @Valid @RequestBody OnboardingStep2Request request) {
        return onboardingService.saveStep2(authentication.getName(), request);
    }

    @PostMapping("/step3")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse saveStep3(Authentication authentication, @Valid @RequestBody OnboardingStep3Request request) {
        return onboardingService.saveStep3(authentication.getName(), request);
    }

    @PostMapping("/step4")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse saveStep4(Authentication authentication, @Valid @RequestBody OnboardingStep4Request request) {
        return onboardingService.saveStep4(authentication.getName(), request);
    }

    @PostMapping("/step5")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse saveStep5(Authentication authentication, @Valid @RequestBody OnboardingStep5Request request) {
        return onboardingService.saveStep5(authentication.getName(), request);
    }

    @PostMapping("/step6")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse saveStep6(Authentication authentication, @Valid @RequestBody OnboardingStep6Request request) {
        return onboardingService.saveStep6(authentication.getName(), request);
    }

    @PostMapping("/step7")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse saveStep7(Authentication authentication, @Valid @RequestBody OnboardingStep7Request request) {
        return onboardingService.saveStep7(authentication.getName(), request);
    }

    @PostMapping("/generate-plan")
    @ResponseStatus(HttpStatus.OK)
    public OnboardingResponse generatePlan(Authentication authentication) {
        return onboardingService.generateAiPlan(authentication.getName());
    }

    /** Full training-profile update after onboarding is complete (Settings). */
    @PutMapping
    public OnboardingResponse updateProfile(Authentication authentication,
                                            @Valid @RequestBody UpdateOnboardingProfileRequest request) {
        return onboardingService.updateProfile(authentication.getName(), request);
    }
}