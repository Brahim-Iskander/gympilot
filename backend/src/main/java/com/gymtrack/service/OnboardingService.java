package com.gymtrack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.gymtrack.dto.onboarding.OnboardingResponse;
import com.gymtrack.dto.onboarding.OnboardingStep1Request;
import com.gymtrack.dto.onboarding.OnboardingStep2Request;
import com.gymtrack.dto.onboarding.OnboardingStep3Request;
import com.gymtrack.dto.onboarding.OnboardingStep4Request;
import com.gymtrack.dto.onboarding.OnboardingStep5Request;
import com.gymtrack.dto.onboarding.OnboardingStep6Request;
import com.gymtrack.dto.onboarding.OnboardingStep7Request;
import com.gymtrack.dto.onboarding.UpdateOnboardingProfileRequest;
import com.gymtrack.model.UserOnboarding;
import com.gymtrack.repository.UserOnboardingRepository;

@Service
public class OnboardingService {

    private static final Logger log = LoggerFactory.getLogger(OnboardingService.class);

    private final UserOnboardingRepository onboardingRepository;
    private final AiService aiService;

    public OnboardingService(UserOnboardingRepository onboardingRepository, AiService aiService) {
        this.onboardingRepository = onboardingRepository;
        this.aiService = aiService;
    }

    public OnboardingResponse getOrCreate(String userId) {
        return onboardingRepository.findByUserId(userId)
                .map(onboarding -> {
                    if (Boolean.TRUE.equals(onboarding.getCompleted()) && (onboarding.getAiGeneratedPlan() == null || onboarding.getAiGeneratedPlan().isBlank())) {
                        log.info("Generating missing AI plan for completed user: {}", userId);
                        String plan = aiService.generatePlan(onboarding);
                        onboarding.setAiGeneratedPlan(plan);
                        onboarding = onboardingRepository.save(onboarding);
                    }
                    return OnboardingResponse.from(onboarding);
                })
                .orElseGet(() -> {
                    UserOnboarding created = onboardingRepository.save(new UserOnboarding(userId));
                    log.info("Created new onboarding for user: {}", userId);
                    return OnboardingResponse.from(created);
                });
    }

    @Transactional
    public OnboardingResponse saveStep1(String userId, OnboardingStep1Request request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setAge(request.age());
        onboarding.setSex(request.sex());
        onboarding.setHeightCm(request.heightCm());
        onboarding.setWeightKg(request.weightKg());
        onboarding.setCurrentStep(Math.max(onboarding.getCurrentStep(), 2));
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse saveStep2(String userId, OnboardingStep2Request request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setGoal(request.goal());
        onboarding.setCurrentStep(Math.max(onboarding.getCurrentStep(), 3));
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse saveStep3(String userId, OnboardingStep3Request request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setExperienceLevel(request.experienceLevel());
        onboarding.setTrainingMonths(request.trainingMonths());
        onboarding.setCurrentStep(Math.max(onboarding.getCurrentStep(), 4));
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse saveStep4(String userId, OnboardingStep4Request request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setDaysPerWeek(request.daysPerWeek());
        onboarding.setPreferredDays(request.preferredDays());
        onboarding.setMinutesPerSession(request.minutesPerSession());
        onboarding.setCurrentStep(Math.max(onboarding.getCurrentStep(), 5));
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse saveStep5(String userId, OnboardingStep5Request request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setEquipment(request.equipment());
        onboarding.setCurrentStep(Math.max(onboarding.getCurrentStep(), 6));
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse saveStep6(String userId, OnboardingStep6Request request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setCurrentRoutine(request.currentRoutine());
        onboarding.setStrengthLevels(request.strengthLevels());
        onboarding.setLikedExercises(request.likedExercises());
        onboarding.setDislikedExercises(request.dislikedExercises());
        onboarding.setCurrentStep(Math.max(onboarding.getCurrentStep(), 7));
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse saveStep7(String userId, OnboardingStep7Request request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setInjuries(request.injuries());
        onboarding.setCannotDoExercises(request.cannotDoExercises());
        onboarding.setCompleted(true);
        onboarding.setCurrentStep(7);
        
        // Auto-generate AI plan upon completing step 7
        String plan = aiService.generatePlan(onboarding);
        onboarding.setAiGeneratedPlan(plan);

        log.info("Onboarding completed and AI plan generated for user: {}", userId);
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse updateCurrentStep(String userId, int step) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setCurrentStep(Math.max(onboarding.getCurrentStep(), step));
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    @Transactional
    public OnboardingResponse generateAiPlan(String userId) {
        UserOnboarding onboarding = getOnboarding(userId);
        
        // Generate the plan using the AI service
        String plan = aiService.generatePlan(onboarding);
        onboarding.setAiGeneratedPlan(plan);
        
        log.info("Generated AI plan for user: {}", userId);
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    /** Full replace of training-profile fields (Settings page). Keeps completed=true. */
    @Transactional
    public OnboardingResponse updateProfile(String userId, UpdateOnboardingProfileRequest request) {
        UserOnboarding onboarding = getOnboarding(userId);
        onboarding.setAge(request.age());
        onboarding.setSex(request.sex());
        onboarding.setHeightCm(request.heightCm());
        onboarding.setWeightKg(request.weightKg());
        onboarding.setGoal(request.goal());
        onboarding.setExperienceLevel(request.experienceLevel());
        onboarding.setTrainingMonths(request.trainingMonths());
        onboarding.setDaysPerWeek(request.daysPerWeek());
        onboarding.setPreferredDays(request.preferredDays());
        onboarding.setMinutesPerSession(request.minutesPerSession());
        onboarding.setEquipment(request.equipment());
        onboarding.setCurrentRoutine(request.currentRoutine());
        onboarding.setStrengthLevels(request.strengthLevels());
        onboarding.setLikedExercises(request.likedExercises());
        onboarding.setDislikedExercises(request.dislikedExercises());
        onboarding.setInjuries(request.injuries());
        onboarding.setCannotDoExercises(request.cannotDoExercises());
        onboarding.setCompleted(true);
        onboarding.setCurrentStep(7);
        
        // Regenerate plan when profile is updated
        String plan = aiService.generatePlan(onboarding);
        onboarding.setAiGeneratedPlan(plan);

        log.info("Updated onboarding profile and regenerated AI plan for user: {}", userId);
        return OnboardingResponse.from(onboardingRepository.save(onboarding));
    }

    private UserOnboarding getOnboarding(String userId) {
        return onboardingRepository.findByUserId(userId)
                .orElseGet(() -> onboardingRepository.save(new UserOnboarding(userId)));
    }
}