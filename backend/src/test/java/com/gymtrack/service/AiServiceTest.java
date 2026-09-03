package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymtrack.model.UserOnboarding;

import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.reactive.function.client.WebClient;

class AiServiceTest {

    private AiService aiService;
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        aiService = new AiService(WebClient.builder(), objectMapper);
    }

    @Test
    void buildPrompt_doesNotThrowFormatStringException() {
        UserOnboarding onboarding = new UserOnboarding("test-user-id");
        onboarding.setAge(24);
        onboarding.setSex("male");
        onboarding.setHeightCm(180.0);
        onboarding.setWeightKg(75.0);
        onboarding.setGoal("Hypertrophy / Muscle Gain");
        onboarding.setExperienceLevel("Intermediate");
        onboarding.setDaysPerWeek(4);
        onboarding.setMinutesPerSession(60);
        onboarding.setEquipment("Full Gym");
        onboarding.setInjuries("None");

        // Verify buildPrompt via reflection
        String prompt = assertDoesNotThrow(() -> 
            (String) ReflectionTestUtils.invokeMethod(aiService, "buildPrompt", onboarding)
        );
        assertNotNull(prompt);
        assertTrue(prompt.contains("+15% Strength"));
    }

    @Test
    void generatePlan_doesNotThrowFormatStringException_andGeneratesValidPlan() {
        UserOnboarding onboarding = new UserOnboarding("test-user-id");
        onboarding.setAge(24);
        onboarding.setSex("male");
        onboarding.setHeightCm(180.0);
        onboarding.setWeightKg(75.0);
        onboarding.setGoal("Hypertrophy / Muscle Gain");
        onboarding.setExperienceLevel("Intermediate");
        onboarding.setDaysPerWeek(4);
        onboarding.setMinutesPerSession(60);
        onboarding.setEquipment("Full Gym");
        onboarding.setInjuries("None");

        String planJson = assertDoesNotThrow(() -> aiService.generatePlan(onboarding));
        assertNotNull(planJson);

        // Verify JSON is valid and contains supplementPlan
        assertDoesNotThrow(() -> {
            JsonNode root = objectMapper.readTree(planJson);
            assertTrue(root.has("workoutPlan"));
            assertTrue(root.has("nutritionPlan"));
            assertTrue(root.has("supplementPlan"));
            assertTrue(root.get("supplementPlan").isArray());
            assertTrue(root.get("supplementPlan").size() > 0);
        });
    }

    @Test
    void generatePlan_worksForFatLossGoal() {
        UserOnboarding onboarding = new UserOnboarding("test-user-cut");
        onboarding.setAge(28);
        onboarding.setSex("female");
        onboarding.setHeightCm(165.0);
        onboarding.setWeightKg(62.0);
        onboarding.setGoal("Fat Loss / Lean Definition");
        onboarding.setExperienceLevel("Beginner");
        onboarding.setDaysPerWeek(3);
        onboarding.setMinutesPerSession(45);
        onboarding.setEquipment("Dumbbells Only");

        String planJson = assertDoesNotThrow(() -> aiService.generatePlan(onboarding));
        assertNotNull(planJson);

        assertDoesNotThrow(() -> {
            JsonNode root = objectMapper.readTree(planJson);
            assertTrue(root.has("supplementPlan"));
            // Verify triceps exercises are included in the workout
            String planString = root.get("workoutPlan").toString();
            assertTrue(planString.toLowerCase().contains("tricep") || planString.toLowerCase().contains("skull crusher") || planString.toLowerCase().contains("dip"));
        });
    }

    @Test
    void generatePlan_includesDedicatedTricepsAndPersonalizedDays() {
        UserOnboarding userA = new UserOnboarding("user-a");
        userA.setAge(22);
        userA.setSex("male");
        userA.setHeightCm(178.0);
        userA.setWeightKg(72.0);
        userA.setGoal("build_muscle");
        userA.setExperienceLevel("intermediate");
        userA.setDaysPerWeek(3);
        userA.setPreferredDays(java.util.List.of("monday", "wednesday", "friday"));
        userA.setEquipment("full_gym");

        String planA = aiService.generatePlan(userA);
        assertNotNull(planA);
        // Verify triceps presence in full-body gym routine
        assertTrue(planA.contains("Tricep") || planA.contains("Skull Crushers"));
        // Verify preferred day names
        assertTrue(planA.contains("Monday"));
        assertTrue(planA.contains("Wednesday"));
        assertTrue(planA.contains("Friday"));

        UserOnboarding userB = new UserOnboarding("user-b");
        userB.setAge(30);
        userB.setSex("male");
        userB.setHeightCm(185.0);
        userB.setWeightKg(90.0);
        userB.setGoal("strength");
        userB.setExperienceLevel("advanced");
        userB.setDaysPerWeek(3);
        userB.setPreferredDays(java.util.List.of("tuesday", "thursday", "saturday"));
        userB.setEquipment("full_gym");

        String planB = aiService.generatePlan(userB);
        assertNotNull(planB);
        assertTrue(planB.contains("Tuesday"));
        assertTrue(planB.contains("Heavy") || planB.contains("Power"));
        assertTrue(planB.contains("Tricep") || planB.contains("Close-Grip") || planB.contains("Skull Crushers"));
    }
}
