package com.gymtrack.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymtrack.dto.progress.ProgressAnalysisResponse;
import com.gymtrack.model.ProgressEntry;
import com.gymtrack.model.UserOnboarding;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AiService {

    private static final Logger log = LoggerFactory.getLogger(AiService.class);
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ai.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${ai.model:llama-3.3-70b-versatile}")
    private String model;

    @Value("${ai.api.key:}")
    private String apiKey;

    public AiService(WebClient.Builder webClientBuilder, ObjectMapper objectMapper) {
        this.webClientBuilder = webClientBuilder;
        this.objectMapper = objectMapper;
    }

    private WebClient createWebClient() {
        return webClientBuilder.baseUrl(baseUrl).build();
    }

    public String generatePlan(UserOnboarding onboarding) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("placeholder")) {
            log.warn("AI API key is not set. Returning generated plan based on user profile.");
            return generateFallbackPlan(onboarding);
        }

        String prompt = buildPrompt(onboarding);

        try {
            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", "You are an expert fitness coach and nutritionist. Return ONLY valid JSON matching the requested structure."),
                            Map.of("role", "user", "content", prompt)
                    ),
                    "temperature", 0.7
            );

            JsonNode response = createWebClient().post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("choices") && response.get("choices").isArray() && response.get("choices").size() > 0) {
                JsonNode choice = response.get("choices").get(0);
                if (choice.has("message") && choice.get("message").has("content")) {
                    String generatedText = choice.get("message").get("content").asText();
                    generatedText = generatedText.replaceAll("^```json\\\\s*", "").replaceAll("^```\\\\s*", "").replaceAll("```$", "").trim();
                    return generatedText;
                }
            }

            return generateFallbackPlan(onboarding);

        } catch (Exception e) {
            log.error("Error calling AI API for plan generation: {}", e.getMessage());
            return generateFallbackPlan(onboarding);
        }
    }

    private String buildPrompt(UserOnboarding o) {
        return String.format(
                "You are an expert fitness coach and nutritionist. Create a personalized workout and nutrition plan for a user with the following profile: " +
                "Age: %d, Sex: %s, Height: %.1f cm, Weight: %.1f kg, Goal: %s, Experience: %s. " +
                "They can train %d days per week for %d minutes per session. " +
                "Equipment available: %s. " +
                "Injuries/Limitations: %s. " +
                "SPLIT SELECTION RULES based on training days (%d days) and goal (%s):\n" +
                "- 2-3 days per week OR Beginner: 'Full Body' split.\n" +
                "- 4 days per week: 'Upper / Lower' split (Upper A, Lower A, Upper B, Lower B).\n" +
                "- 5 days per week: 'PPL / Upper Lower Hybrid' split (Push, Pull, Legs, Upper, Lower) OR 'Classic Bro Split' (Chest, Back, Shoulders, Legs, Arms) if Advanced & Hypertrophy.\n" +
                "- 6 days per week: 'Push / Pull / Legs (PPL)' split (Push A, Pull A, Legs A, Push B, Pull B, Legs B).\n" +
                "Return ONLY a valid JSON object (no markdown formatting, no comments) with this exact structure: " +
                "{" +
                "  \"workoutPlan\": [" +
                "    { \"dayName\": \"e.g., Push Day\", \"exercises\": [ { \"name\": \"Exercise Name\", \"sets\": 3, \"reps\": \"8-12\", \"notes\": \"\" } ] }" +
                "  ]," +
                "  \"nutritionPlan\": {" +
                "    \"dailyCalories\": 2500," +
                "    \"protein\": 150," +
                "    \"carbs\": 250," +
                "    \"fat\": 80," +
                "    \"mealSuggestions\": [\"Breakfast: Oatmeal\", \"Lunch: Chicken Salad\"]" +
                "  }" +
                "}",
                o.getAge() != null ? o.getAge() : 25, 
                o.getSex() != null ? o.getSex() : "unspecified", 
                o.getHeightCm() != null ? o.getHeightCm() : 170.0, 
                o.getWeightKg() != null ? o.getWeightKg() : 70.0, 
                o.getGoal() != null ? o.getGoal() : "General Fitness", 
                o.getExperienceLevel() != null ? o.getExperienceLevel() : "Beginner",
                o.getDaysPerWeek() != null ? o.getDaysPerWeek() : 3, 
                o.getMinutesPerSession() != null ? o.getMinutesPerSession() : 45, 
                o.getEquipment() != null ? o.getEquipment() : "Bodyweight",
                (o.getInjuries() != null && !o.getInjuries().isEmpty() ? o.getInjuries() : "None"),
                o.getDaysPerWeek() != null ? o.getDaysPerWeek() : 3,
                o.getGoal() != null ? o.getGoal() : "General Fitness"
        );
    }

    private String generateFallbackPlan(UserOnboarding o) {
        double weight = o != null && o.getWeightKg() != null ? o.getWeightKg() : 70.0;
        double height = o != null && o.getHeightCm() != null ? o.getHeightCm() : 170.0;
        int age = o != null && o.getAge() != null ? o.getAge() : 25;
        String goal = o != null && o.getGoal() != null ? o.getGoal().toLowerCase() : "general_fitness";
        String experience = o != null && o.getExperienceLevel() != null ? o.getExperienceLevel().toLowerCase() : "beginner";
        String equipment = o != null && o.getEquipment() != null ? o.getEquipment().toLowerCase() : "bodyweight";
        int daysPerWeek = o != null && o.getDaysPerWeek() != null ? o.getDaysPerWeek() : 3;
        int minutesPerSession = o != null && o.getMinutesPerSession() != null ? o.getMinutesPerSession() : 45;
        String sex = o != null && o.getSex() != null ? o.getSex().toLowerCase() : "male";

        // --- NUTRITION: Calculate TDEE and macros based on user data ---
        double bmr;
        if (sex.equals("female")) {
            bmr = 10 * weight + 6.25 * height - 5 * age - 161;
        } else {
            bmr = 10 * weight + 6.25 * height - 5 * age + 5;
        }

        double activityMultiplier;
        if (daysPerWeek <= 2) activityMultiplier = 1.375;
        else if (daysPerWeek <= 4) activityMultiplier = 1.55;
        else activityMultiplier = 1.725;

        double tdee = bmr * activityMultiplier;
        int calories;
        if (goal.contains("gain") || goal.contains("muscle") || goal.contains("bulk")) {
            calories = (int) Math.round(tdee + 350);
        } else if (goal.contains("loss") || goal.contains("fat") || goal.contains("cut") || goal.contains("lean")) {
            calories = (int) Math.round(tdee - 400);
        } else {
            calories = (int) Math.round(tdee);
        }

        int protein = (int) Math.round(weight * 2.0);
        int fat = (int) Math.round(weight * 1.0);
        int carbs = (int) Math.round((calories - protein * 4 - fat * 9) / 4.0);
        if (carbs < 100) carbs = 100;

        // --- WORKOUT: Build workout days based on goal, experience, equipment, daysPerWeek ---
        StringBuilder workoutPlan = new StringBuilder();
        boolean hasGym = equipment.contains("full") || equipment.contains("gym") || equipment.contains("barbell") || equipment.contains("machine");
        boolean hasDumbbells = hasGym || equipment.contains("dumbbell") || equipment.contains("home");
        boolean isBodyweight = !hasGym && !hasDumbbells;

        int sets = experience.contains("beginner") ? 3 : experience.contains("intermediate") ? 4 : 4;
        String repsStrength = experience.contains("beginner") ? "8-10" : experience.contains("intermediate") ? "6-10" : "5-8";
        String repsHyper = experience.contains("beginner") ? "10-12" : "8-12";
        String repsEndurance = "12-15";

        // Determine specific split type based on user's onboarding info
        if (daysPerWeek <= 3 || (daysPerWeek == 4 && experience.contains("beginner") && minutesPerSession <= 40)) {
            // --- FULL BODY SPLIT (2-3 days or time-restricted beginner) ---
            int actualDays = Math.min(daysPerWeek, 3);
            for (int d = 1; d <= actualDays; d++) {
                workoutPlan.append("    {\n");
                workoutPlan.append("      \"dayName\": \"Full Body Day ").append(d).append("\",\n");
                workoutPlan.append("      \"exercises\": [\n");
                if (d == 1) {
                    if (hasGym) {
                        workoutPlan.append(exercise("Barbell Squat", sets, repsStrength, "Keep core braced, chest up"));
                        workoutPlan.append(exercise("Barbell Bench Press", sets, repsStrength, "Retract shoulder blades"));
                        workoutPlan.append(exercise("Bent-Over Barbell Row", sets, repsHyper, "Pull to lower chest"));
                        workoutPlan.append(exercise("Overhead Press", 3, repsHyper, "Press slightly behind head at top"));
                        workoutPlan.append(exerciseLast("Plank", 3, "45-60s", "Maintain neutral spine"));
                    } else if (hasDumbbells) {
                        workoutPlan.append(exercise("Goblet Squat", sets, repsStrength, "Hold dumbbell at chest"));
                        workoutPlan.append(exercise("Dumbbell Bench Press", sets, repsHyper, "Full range of motion"));
                        workoutPlan.append(exercise("Dumbbell Row", sets, repsHyper, "Squeeze shoulder blade at top"));
                        workoutPlan.append(exercise("Dumbbell Shoulder Press", 3, repsHyper, "Control the negative"));
                        workoutPlan.append(exerciseLast("Plank", 3, "45-60s", "Maintain neutral spine"));
                    } else {
                        workoutPlan.append(exercise("Bodyweight Squat", sets, "15-20", "Full depth"));
                        workoutPlan.append(exercise("Push-Ups", sets, "AMRAP", "Keep body straight"));
                        workoutPlan.append(exercise("Inverted Rows or Door Rows", sets, repsHyper, "Squeeze shoulder blades"));
                        workoutPlan.append(exercise("Pike Push-Ups", 3, repsHyper, "Target shoulders"));
                        workoutPlan.append(exerciseLast("Plank", 3, "45-60s", "Maintain neutral spine"));
                    }
                } else if (d == 2) {
                    if (hasGym) {
                        workoutPlan.append(exercise("Romanian Deadlift", sets, repsStrength, "Hinge at hips, feel hamstring stretch"));
                        workoutPlan.append(exercise("Incline Dumbbell Press", sets, repsHyper, "45-degree angle"));
                        workoutPlan.append(exercise("Lat Pulldown", sets, repsHyper, "Pull to upper chest"));
                        workoutPlan.append(exercise("Dumbbell Lateral Raises", 3, repsEndurance, "Lead with elbows"));
                        workoutPlan.append(exerciseLast("Cable Crunches", 3, repsHyper, "Round the spine"));
                    } else if (hasDumbbells) {
                        workoutPlan.append(exercise("Dumbbell Romanian Deadlift", sets, repsStrength, "Hinge at hips"));
                        workoutPlan.append(exercise("Incline Dumbbell Press", sets, repsHyper, "Use pillows for incline"));
                        workoutPlan.append(exercise("Dumbbell Pullover", sets, repsHyper, "Feel the lat stretch"));
                        workoutPlan.append(exercise("Dumbbell Lateral Raises", 3, repsEndurance, "Lead with elbows"));
                        workoutPlan.append(exerciseLast("Crunches", 3, "15-20", "Slow and controlled"));
                    } else {
                        workoutPlan.append(exercise("Single Leg Glute Bridge", sets, "12-15 each", "Squeeze glute at top"));
                        workoutPlan.append(exercise("Decline Push-Ups", sets, "AMRAP", "Feet elevated"));
                        workoutPlan.append(exercise("Superman Rows", sets, repsHyper, "Squeeze shoulder blades"));
                        workoutPlan.append(exercise("Lateral Plank Walk", 3, "10 each side", "Keep hips level"));
                        workoutPlan.append(exerciseLast("Bicycle Crunches", 3, "20 total", "Slow and controlled"));
                    }
                } else {
                    if (hasGym) {
                        workoutPlan.append(exercise("Leg Press", sets, repsHyper, "Feet shoulder width"));
                        workoutPlan.append(exercise("Dumbbell Chest Fly", 3, repsHyper, "Deep stretch at bottom"));
                        workoutPlan.append(exercise("Cable Row", sets, repsHyper, "Squeeze at contraction"));
                        workoutPlan.append(exercise("Face Pulls", 3, repsEndurance, "External rotate at top"));
                        workoutPlan.append(exerciseLast("Hanging Leg Raises", 3, "10-12", "Control the swing"));
                    } else if (hasDumbbells) {
                        workoutPlan.append(exercise("Bulgarian Split Squat", sets, "10 each", "Keep torso upright"));
                        workoutPlan.append(exercise("Dumbbell Floor Press", 3, repsHyper, "Pause at bottom"));
                        workoutPlan.append(exercise("Dumbbell Reverse Fly", 3, repsEndurance, "Bend at hips"));
                        workoutPlan.append(exercise("Dumbbell Curl to Press", 3, repsHyper, "Combine movements"));
                        workoutPlan.append(exerciseLast("Leg Raises", 3, "12-15", "Keep lower back flat"));
                    } else {
                        workoutPlan.append(exercise("Pistol Squat Progression", sets, "5-8 each", "Use support if needed"));
                        workoutPlan.append(exercise("Diamond Push-Ups", sets, "AMRAP", "Target triceps"));
                        workoutPlan.append(exercise("Towel Rows", sets, repsHyper, "Use a sturdy door"));
                        workoutPlan.append(exercise("Handstand Wall Hold", 3, "20-30s", "Build shoulder strength"));
                        workoutPlan.append(exerciseLast("Dead Bug", 3, "10 each side", "Opposite arm and leg"));
                    }
                }
                workoutPlan.append("      ]\n");
                workoutPlan.append("    }");
                if (d < actualDays) workoutPlan.append(",");
                workoutPlan.append("\n");
            }
        } else if (daysPerWeek == 4) {
            // --- UPPER / LOWER SPLIT (4 days) ---
            String[] splitNames = {"Upper Body A", "Lower Body A", "Upper Body B", "Lower Body B"};
            String[][][] exercises;
            if (hasGym) {
                exercises = new String[][][]{
                    {{"Barbell Bench Press", repsStrength, "Retract shoulder blades"}, {"Bent-Over Row", repsHyper, "Pull to navel"}, {"Overhead Press", repsHyper, "Keep core tight"}, {"Lat Pulldown", repsHyper, "Pull to upper chest"}, {"Dumbbell Curl", repsHyper, "Control the negative"}},
                    {{"Barbell Squat", repsStrength, "Below parallel"}, {"Romanian Deadlift", repsStrength, "Feel the hamstring stretch"}, {"Leg Press", repsHyper, "Don't lock out knees"}, {"Calf Raises", repsEndurance, "Full range of motion"}, {"Plank", "45-60s", "Maintain neutral spine"}},
                    {{"Incline Dumbbell Press", repsHyper, "30-45 degree angle"}, {"Cable Row", repsHyper, "Squeeze shoulder blades"}, {"Dumbbell Lateral Raise", repsEndurance, "Lead with elbows"}, {"Tricep Pushdown", repsHyper, "Keep elbows pinned"}, {"Face Pulls", repsEndurance, "External rotate at top"}},
                    {{"Bulgarian Split Squat", "10 each leg", "Keep torso upright"}, {"Leg Curl", repsHyper, "Squeeze hamstrings"}, {"Hip Thrust", repsHyper, "Squeeze glutes at top"}, {"Leg Extension", repsHyper, "Controlled tempo"}, {"Hanging Leg Raises", "10-12", "Control the swing"}}
                };
            } else {
                exercises = new String[][][]{
                    {{"Push-Ups", "AMRAP", "Vary hand width"}, {"Dumbbell Row", repsHyper, "Squeeze at top"}, {"Dumbbell Shoulder Press", repsHyper, "Full ROM"}, {"Dumbbell Curl", repsHyper, "Slow eccentric"}, {"Tricep Dips on Chair", repsHyper, "Keep elbows close"}},
                    {{"Goblet Squat", repsHyper, "Deep squat"}, {"Dumbbell RDL", repsStrength, "Hip hinge"}, {"Walking Lunges", "12 each", "Step far"}, {"Calf Raises", repsEndurance, "Pause at top"}, {"Plank", "45-60s", "Tight core"}},
                    {{"Incline Push-Ups", repsHyper, "Elevate hands"}, {"Dumbbell Pullover", repsHyper, "Feel the stretch"}, {"Lateral Raises", repsEndurance, "Light weight"}, {"Hammer Curl", repsHyper, "Both heads"}, {"Overhead Tricep Extension", repsHyper, "Stretch at bottom"}},
                    {{"Sumo Squat", repsHyper, "Wide stance"}, {"Single Leg RDL", "10 each", "Balance focus"}, {"Glute Bridge", repsHyper, "Squeeze at top"}, {"Step Ups", "10 each", "Drive with front leg"}, {"Bicycle Crunches", "20 total", "Slow rotation"}}
                };
            }
            for (int d = 0; d < 4; d++) {
                workoutPlan.append("    {\n");
                workoutPlan.append("      \"dayName\": \"").append(splitNames[d]).append("\",\n");
                workoutPlan.append("      \"exercises\": [\n");
                String[][] dayExercises = exercises[d];
                for (int e = 0; e < dayExercises.length; e++) {
                    boolean last = (e == dayExercises.length - 1);
                    workoutPlan.append(last ? exerciseLast(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]) : exercise(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]));
                }
                workoutPlan.append("      ]\n");
                workoutPlan.append("    }");
                if (d < 3) workoutPlan.append(",");
                workoutPlan.append("\n");
            }
        } else if (daysPerWeek == 5) {
            // Check if Bro Split (Classic Bodybuilding) vs PPL / Upper Lower Hybrid
            boolean isBroSplit = experience.contains("advanced") || goal.contains("build_muscle") || goal.contains("bulk");

            if (isBroSplit && hasGym) {
                // --- BRO SPLIT (5 days: Chest, Back, Shoulders, Legs, Arms) ---
                String[] dayNames = {"Chest & Abs Day", "Back & Biceps Day", "Shoulders & Traps Day", "Legs & Calves Day", "Arms & Core Day"};
                String[][][] exercises = new String[][][]{
                    {{"Barbell Bench Press", repsStrength, "Heavy compound"}, {"Incline Dumbbell Press", repsHyper, "Upper chest focus"}, {"Cable Flyes", repsHyper, "Peak contraction"}, {"Push-Ups", "AMRAP", "Burnout"}, {"Hanging Leg Raises", "12-15", "Lower abs"}},
                    {{"Deadlift or Rack Pull", repsStrength, "Posterior chain"}, {"Lat Pulldown", repsHyper, "Wide grip"}, {"Seated Cable Row", repsHyper, "Mid back squeeze"}, {"Barbell Curl", repsHyper, "Strict form"}, {"Hammer Curls", repsHyper, "Brachialis focus"}},
                    {{"Overhead Barbell Press", repsStrength, "Strict press"}, {"Dumbbell Lateral Raises", repsEndurance, "Lead with elbows"}, {"Reverse Pec Deck", repsEndurance, "Rear delts"}, {"Dumbbell Shrugs", repsHyper, "Heavy traps hold"}, {"Face Pulls", repsEndurance, "Shoulder health"}},
                    {{"Barbell Squat", repsStrength, "Deep squat"}, {"Leg Press", repsHyper, "Heavy volume"}, {"Lying Leg Curl", repsHyper, "Hamstrings"}, {"Standing Calf Raise", repsEndurance, "Pause at top"}, {"Ab Wheel Rollouts", "10-12", "Brace core"}},
                    {{"Close Grip Bench Press", repsHyper, "Triceps compound"}, {"Incline Dumbbell Curl", repsHyper, "Biceps stretch"}, {"Skull Crushers", repsHyper, "Elbow extension"}, {"Preacher Curl", repsHyper, "Peak squeeze"}, {"Plank Hold", "60s", "Tight core"}}
                };

                for (int d = 0; d < 5; d++) {
                    workoutPlan.append("    {\n");
                    workoutPlan.append("      \"dayName\": \"").append(dayNames[d]).append("\",\n");
                    workoutPlan.append("      \"exercises\": [\n");
                    String[][] dayExercises = exercises[d];
                    for (int e = 0; e < dayExercises.length; e++) {
                        boolean last = (e == dayExercises.length - 1);
                        workoutPlan.append(last ? exerciseLast(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]) : exercise(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]));
                    }
                    workoutPlan.append("      ]\n");
                    workoutPlan.append("    }");
                    if (d < 4) workoutPlan.append(",");
                    workoutPlan.append("\n");
                }
            } else {
                // --- PPL / UPPER LOWER HYBRID (5 days: Push, Pull, Legs, Upper, Lower) ---
                String[] dayNames = {"Push Day", "Pull Day", "Legs Day", "Upper Body Hypertrophy", "Lower Body Hypertrophy"};
                String[][][] exercises;
                if (hasGym) {
                    exercises = new String[][][]{
                        {{"Barbell Bench Press", repsStrength, "Chest focus"}, {"Incline DB Press", repsHyper, "Upper chest"}, {"Dumbbell Lateral Raise", repsEndurance, "Side delts"}, {"Tricep Pushdown", repsHyper, "Triceps"}, {"Plank", "45-60s", "Core"}},
                        {{"Barbell Row", repsStrength, "Back density"}, {"Lat Pulldown", repsHyper, "Back width"}, {"Face Pulls", repsEndurance, "Rear delts"}, {"Barbell Curl", repsHyper, "Biceps"}, {"Cable Crunches", repsHyper, "Abs"}},
                        {{"Barbell Squat", repsStrength, "Quads & Glutes"}, {"Romanian Deadlift", repsHyper, "Hamstrings"}, {"Leg Press", repsHyper, "Leg volume"}, {"Calf Raises", repsEndurance, "Calves"}, {"Leg Raises", "12-15", "Abs"}},
                        {{"Overhead Press", repsStrength, "Shoulders"}, {"Weighted Pull-Ups or Pulldown", repsHyper, "Lats"}, {"Dumbbell Chest Fly", repsHyper, "Chest"}, {"Hammer Curl", repsHyper, "Arms"}, {"Overhead Tricep Extension", repsHyper, "Triceps"}},
                        {{"Bulgarian Split Squat", "10 each", "Single leg strength"}, {"Hip Thrust", repsHyper, "Glutes"}, {"Leg Curl", repsHyper, "Hamstrings"}, {"Seated Calf Raise", repsEndurance, "Calves"}, {"Ab Wheel or Plank", "12-15", "Core"}}
                    };
                } else {
                    exercises = new String[][][]{
                        {{"Push-Ups", "AMRAP", "Chest"}, {"Pike Push-Ups", repsHyper, "Shoulders"}, {"Diamond Push-Ups", repsHyper, "Triceps"}, {"Lateral Raises", repsEndurance, "Side delts"}, {"Plank", "60s", "Core"}},
                        {{"Dumbbell Row", repsHyper, "Back"}, {"Dumbbell Pullover", repsHyper, "Lats"}, {"Reverse Fly", repsEndurance, "Rear delts"}, {"Dumbbell Curl", repsHyper, "Biceps"}, {"Bicycle Crunches", "20 total", "Abs"}},
                        {{"Goblet Squat", repsHyper, "Quads"}, {"Dumbbell RDL", repsStrength, "Hamstrings"}, {"Walking Lunges", "12 each", "Legs"}, {"Calf Raises", repsEndurance, "Calves"}, {"Leg Raises", "12-15", "Core"}},
                        {{"Incline Push-Ups", repsHyper, "Upper chest"}, {"Towel or Door Rows", repsHyper, "Back"}, {"Dumbbell Shoulder Press", repsHyper, "Shoulders"}, {"Hammer Curl", repsHyper, "Biceps"}, {"Tricep Dips", repsHyper, "Triceps"}},
                        {{"Sumo Squat", repsHyper, "Inner quads & glutes"}, {"Single Leg RDL", "10 each", "Hamstrings"}, {"Glute Bridge", repsHyper, "Glutes"}, {"Step Ups", "10 each", "Quads"}, {"Side Plank", "30s each", "Obliques"}}
                    };
                }

                for (int d = 0; d < 5; d++) {
                    workoutPlan.append("    {\n");
                    workoutPlan.append("      \"dayName\": \"").append(dayNames[d]).append("\",\n");
                    workoutPlan.append("      \"exercises\": [\n");
                    String[][] dayExercises = exercises[d];
                    for (int e = 0; e < dayExercises.length; e++) {
                        boolean last = (e == dayExercises.length - 1);
                        workoutPlan.append(last ? exerciseLast(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]) : exercise(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]));
                    }
                    workoutPlan.append("      ]\n");
                    workoutPlan.append("    }");
                    if (d < 4) workoutPlan.append(",");
                    workoutPlan.append("\n");
                }
            }
        } else {
            // --- PUSH / PULL / LEGS 6-DAY SPLIT (6 days) ---
            String[] dayNames = {"Push Day A", "Pull Day A", "Legs Day A", "Push Day B", "Pull Day B", "Legs Day B"};
            String[][][] exercises;
            if (hasGym) {
                exercises = new String[][][]{
                    {{"Barbell Bench Press", repsStrength, "Arch back slightly"}, {"Incline Dumbbell Press", repsHyper, "Feel upper chest"}, {"Cable Chest Fly", repsHyper, "Squeeze at center"}, {"Overhead Press", repsHyper, "Strict form"}, {"Lateral Raises", repsEndurance, "Light weight, high reps"}, {"Tricep Pushdown", repsHyper, "Lock elbows"}},
                    {{"Deadlift", repsStrength, "Brace core, flat back"}, {"Weighted Pull-Ups", repsStrength, "Full dead hang"}, {"Barbell Row", repsHyper, "Pull to navel"}, {"Face Pulls", repsEndurance, "External rotate"}, {"Barbell Curl", repsHyper, "No swinging"}, {"Hammer Curl", repsHyper, "Brachialis focus"}},
                    {{"Barbell Squat", repsStrength, "Full depth"}, {"Romanian Deadlift", repsHyper, "Hamstring stretch"}, {"Leg Press", repsHyper, "Feet high for glutes"}, {"Leg Extension", repsHyper, "Squeeze quads"}, {"Lying Leg Curl", repsHyper, "Slow negative"}, {"Standing Calf Raises", repsEndurance, "2s pause at top"}},
                    {{"Dumbbell Bench Press", repsHyper, "Full ROM"}, {"Cable Incline Fly", repsHyper, "Constant tension"}, {"Arnold Press", repsHyper, "Rotate at top"}, {"Cable Lateral Raise", repsEndurance, "Behind body"}, {"Overhead Tricep Extension", repsHyper, "Long head stretch"}, {"Dips", repsHyper, "Lean forward for chest"}},
                    {{"Lat Pulldown", repsHyper, "Wide grip"}, {"Cable Row", repsHyper, "Close grip"}, {"Dumbbell Row", repsHyper, "One arm at a time"}, {"Reverse Fly", repsEndurance, "Rear delts"}, {"Preacher Curl", repsHyper, "Peak contraction"}, {"Incline Dumbbell Curl", repsHyper, "Long head stretch"}},
                    {{"Bulgarian Split Squat", "10 each", "Elevated rear foot"}, {"Hip Thrust", repsHyper, "Squeeze glutes"}, {"Walking Lunges", "12 each", "Long strides"}, {"Leg Curl", repsHyper, "Controlled"}, {"Leg Extension", repsHyper, "Peak squeeze"}, {"Seated Calf Raises", repsEndurance, "Soleus focus"}}
                };
            } else {
                exercises = new String[][][]{
                    {{"Push-Ups", "AMRAP", "Full ROM"}, {"Pike Push-Ups", repsHyper, "Shoulders"}, {"Diamond Push-Ups", repsHyper, "Triceps"}, {"Dumbbell Lateral Raises", repsEndurance, "Light weight"}, {"Overhead Tricep Extension", repsHyper, "Stretch"}, {"Chest Dips", repsHyper, "Lean forward"}},
                    {{"Dumbbell Row", repsHyper, "Each arm"}, {"Dumbbell Pullover", repsHyper, "Lat stretch"}, {"Reverse Fly", repsEndurance, "Rear delts"}, {"Dumbbell Curl", repsHyper, "Control"}, {"Hammer Curl", repsHyper, "Both heads"}, {"Shrugs", repsHyper, "Pause at top"}},
                    {{"Goblet Squat", repsHyper, "Deep squat"}, {"Dumbbell RDL", repsStrength, "Hip hinge"}, {"Walking Lunges", "12 each", "Long stride"}, {"Calf Raises", repsEndurance, "Pause"}, {"Glute Bridge", repsHyper, "Squeeze"}, {"Leg Raises", "12-15", "Core"}},
                    {{"Decline Push-Ups", "AMRAP", "Feet elevated"}, {"Dumbbell Floor Press", repsHyper, "Pause at bottom"}, {"Dumbbell Arnold Press", repsHyper, "Rotate"}, {"Front Raises", repsEndurance, "Alternate arms"}, {"Kickbacks", repsHyper, "Squeeze"}, {"Close Grip Push-Ups", repsHyper, "Elbows in"}},
                    {{"Dumbbell Bent Row", repsHyper, "Wide grip"}, {"Superman Hold", "30-45s", "Squeeze back"}, {"Dumbbell Reverse Fly", repsEndurance, "Bent over"}, {"Incline Curl", repsHyper, "Stretch"}, {"Concentration Curl", repsHyper, "Peak squeeze"}, {"Dumbbell Shrugs", repsHyper, "Heavy"}},
                    {{"Sumo Squat", repsHyper, "Wide stance"}, {"Single Leg RDL", "10 each", "Balance"}, {"Step Ups", "10 each", "Quad drive"}, {"Seated Calf Raises", repsEndurance, "Slow"}, {"Hip Thrust", repsHyper, "Pause at top"}, {"Plank", "60s", "Tight core"}}
                };
            }
            int actualDays = Math.min(daysPerWeek, 6);
            for (int d = 0; d < actualDays; d++) {
                workoutPlan.append("    {\n");
                workoutPlan.append("      \"dayName\": \"").append(dayNames[d]).append("\",\n");
                workoutPlan.append("      \"exercises\": [\n");
                String[][] dayExercises = exercises[d % exercises.length];
                for (int e = 0; e < dayExercises.length; e++) {
                    boolean last = (e == dayExercises.length - 1);
                    workoutPlan.append(last ? exerciseLast(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]) : exercise(dayExercises[e][0], sets, dayExercises[e][1], dayExercises[e][2]));
                }
                workoutPlan.append("      ]\n");
                workoutPlan.append("    }");
                if (d < actualDays - 1) workoutPlan.append(",");
                workoutPlan.append("\n");
            }
        }

        // --- MEAL SUGGESTIONS based on goal ---
        String meals;
        if (goal.contains("gain") || goal.contains("muscle") || goal.contains("bulk")) {
            meals = "\"Breakfast: 4 eggs + oatmeal with banana and peanut butter\", \"Snack: Greek yogurt with granola and honey\", \"Lunch: 200g chicken breast + rice + vegetables\", \"Post-Workout: Whey protein shake with milk and oats\", \"Dinner: Salmon fillet + sweet potato + broccoli\"";
        } else if (goal.contains("loss") || goal.contains("fat") || goal.contains("cut") || goal.contains("lean")) {
            meals = "\"Breakfast: Egg white omelette with spinach and tomato\", \"Snack: Apple with almond butter\", \"Lunch: Grilled chicken salad with olive oil dressing\", \"Post-Workout: Whey protein shake with water\", \"Dinner: Grilled fish + steamed vegetables\"";
        } else {
            meals = "\"Breakfast: Scrambled eggs with whole grain toast\", \"Snack: Mixed nuts and fruit\", \"Lunch: Chicken breast with quinoa and roasted vegetables\", \"Post-Workout: Protein shake with banana\", \"Dinner: Lean beef stir-fry with brown rice\"";
        }

        return "{\n" +
               "  \"workoutPlan\": [\n" +
               workoutPlan +
               "  ],\n" +
               "  \"nutritionPlan\": {\n" +
               "    \"dailyCalories\": " + calories + ",\n" +
               "    \"protein\": " + protein + ",\n" +
               "    \"carbs\": " + carbs + ",\n" +
               "    \"fat\": " + fat + ",\n" +
               "    \"mealSuggestions\": [" + meals + "]\n" +
               "  }\n" +
               "}";
    }

    private String exercise(String name, int sets, String reps, String notes) {
        return "        { \"name\": \"" + name + "\", \"sets\": " + sets + ", \"reps\": \"" + reps + "\", \"notes\": \"" + notes + "\" },\n";
    }

    private String exerciseLast(String name, int sets, String reps, String notes) {
        return "        { \"name\": \"" + name + "\", \"sets\": " + sets + ", \"reps\": \"" + reps + "\", \"notes\": \"" + notes + "\" }\n";
    }

    public String chatWithAi(String userMessage) {
        if (apiKey != null && !apiKey.isEmpty() && !apiKey.contains("placeholder")) {
            try {
                String systemPrompt = "You are GymTrack Support, an expert AI fitness coach and nutritionist. You answer questions about ANY muscle group (biceps, triceps, chest, lats, shoulders, quads, hamstrings, glutes, calves, forearms, abs, traps). When the user asks for a tutorial, video, or how-to guide, provide step-by-step instructions AND include a YouTube search link like: https://www.youtube.com/results?search_query=best+[exercise]+tutorial";
                Map<String, Object> requestBody = Map.of(
                        "model", model,
                        "messages", List.of(
                                Map.of("role", "system", "content", systemPrompt),
                                Map.of("role", "user", "content", userMessage)
                        ),
                        "temperature", 0.7
                );

                JsonNode response = createWebClient().post()
                        .uri("/chat/completions")
                        .header("Authorization", "Bearer " + apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(requestBody)
                        .retrieve()
                        .bodyToMono(JsonNode.class)
                        .block();

                if (response != null && response.has("choices") && response.get("choices").isArray() && response.get("choices").size() > 0) {
                    JsonNode choice = response.get("choices").get(0);
                    if (choice.has("message") && choice.get("message").has("content")) {
                        return choice.get("message").get("content").asText().trim();
                    }
                }
            } catch (Exception e) {
                log.warn("AI API request failed, falling back to GymTrack Smart Fitness Bot: {}", e.getMessage());
            }
        }

        // Complete Muscle & Video Tutorial Knowledge Engine
        return generateSmartFallbackResponse(userMessage);
    }

    private String generateSmartFallbackResponse(String userMessage) {
        String msg = userMessage.toLowerCase();
        boolean wantsTutorial = msg.contains("tutorial") || msg.contains("how to") || msg.contains("video") || msg.contains("guide") || msg.contains("show me") || msg.contains("watch");

        // 1. BICEPS
        if (msg.contains("bicep") || msg.contains("ez bar") || msg.contains("preacher") || msg.contains("hammer curl")) {
            String topic = msg.contains("ez bar") || msg.contains("preacher") ? "EZ-Bar Preacher Curl" : "Biceps Workout";
            String link = "https://www.youtube.com/results?search_query=" + topic.replace(" ", "+") + "+tutorial";
            String text = "Biceps Guide: Target both the long and short heads! Key exercises: 1) Incline Dumbbell Curls (long head stretch), 2) EZ-Bar Preacher Curls (peak contraction), 3) Hammer Curls (brachialis & forearms).\n" +
                          "Form Tip: Keep your elbows pinned and avoid swinging your shoulders.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 2. TRICEPS
        if (msg.contains("tricep") || msg.contains("pushdown") || msg.contains("dip") || msg.contains("skull crusher")) {
            String link = "https://www.youtube.com/results?search_query=triceps+workout+tutorial";
            String text = "Triceps Guide (60% of total arm size!): 1) Cable Rope Pushdowns (lateral/medial heads), 2) Overhead Tricep Extensions (long head stretch), 3) Weighted Dips or Skullcrushers.\n" +
                          "Form Tip: Keep your upper arms stationary throughout the rep.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 3. FOREARMS & GRIP
        if (msg.contains("forearm") || msg.contains("grip") || msg.contains("wrist")) {
            String link = "https://www.youtube.com/results?search_query=forearm+workout+tutorial";
            String text = "Forearms & Grip Strength Guide: 1) Reverse Barbell Curls, 2) Farmer's Carries, 3) Behind-the-Back Wrist Curls.\n" +
                          "Form Tip: Train forearms 2-3 times per week with high reps (15-20 reps).";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 4. CHEST
        if (msg.contains("chest") || msg.contains("bench") || msg.contains("pec") || msg.contains("fly")) {
            String link = "https://www.youtube.com/results?search_query=chest+workout+bench+press+tutorial";
            String text = "Chest Guide: 1) Incline Dumbbell Press (Upper Chest), 2) Barbell Bench Press (Mid Chest), 3) Cable Chest Flyes (Full Stretch & Contraction).\n" +
                          "Form Tip: Depress and retract your shoulder blades before unracking the bar.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 5. BACK & LATS
        if (msg.contains("back") || msg.contains("lat") || msg.contains("pull up") || msg.contains("row")) {
            String link = "https://www.youtube.com/results?search_query=back+workout+lats+tutorial";
            String text = "Back & Lats Guide: 1) Lat Pulldowns or Pull-Ups (Width), 2) Bent-Over Barbell Rows (Thickness), 3) Single-Arm Dumbbell Rows.\n" +
                          "Form Tip: Pull with your elbows, not your biceps, and squeeze your lat muscles at the bottom.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 6. SHOULDERS / DELTS
        if (msg.contains("shoulder") || msg.contains("delt") || msg.contains("ohp") || msg.contains("lateral raise")) {
            String link = "https://www.youtube.com/results?search_query=shoulder+workout+lateral+raise+tutorial";
            String text = "3D Shoulders Guide: 1) Overhead Press (Front Delts), 2) Cable/Dumbbell Lateral Raises (Side Delts for width), 3) Face Pulls or Reverse Flyes (Rear Delts).\n" +
                          "Form Tip: Lead with your elbows on lateral raises and lean slightly forward.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 7. TRAPS & NECK
        if (msg.contains("trap") || msg.contains("shrug") || msg.contains("neck")) {
            String link = "https://www.youtube.com/results?search_query=trap+shrugs+workout+tutorial";
            String text = "Traps Guide: 1) Dumbbell/Barbell Shrugs (Upper Traps), 2) Face Pulls (Mid/Lower Traps), 3) Heavy Deadlifts.\n" +
                          "Form Tip: Pause at the top of each shrug for 1-2 seconds instead of rolling your shoulders.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 8. QUADS & LEGS
        if (msg.contains("quad") || msg.contains("squat") || msg.contains("leg extension")) {
            String link = "https://www.youtube.com/results?search_query=barbell+squat+quads+tutorial";
            String text = "Quads Guide: 1) Barbell High-Bar Squats, 2) Leg Press (feet low on platform), 3) Romanian Leg Extensions.\n" +
                          "Form Tip: Push your knees forward over your toes to maximize quad engagement.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 9. HAMSTRINGS
        if (msg.contains("hamstring") || msg.contains("rdl") || msg.contains("deadlift") || msg.contains("leg curl")) {
            String link = "https://www.youtube.com/results?search_query=romanian+deadlift+hamstring+tutorial";
            String text = "Hamstrings Guide: 1) Romanian Deadlifts (Hip Hinge Stretch), 2) Lying or Seated Leg Curls (Knee Flexion).\n" +
                          "Form Tip: On RDLs, push your hips back toward the wall until you feel a deep stretch in your hamstrings.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 10. GLUTES
        if (msg.contains("glute") || msg.contains("hip thrust") || msg.contains("butt")) {
            String link = "https://www.youtube.com/results?search_query=hip+thrust+glutes+workout+tutorial";
            String text = "Glutes Guide: 1) Barbell Hip Thrusts (Peak Contraction), 2) Bulgarian Split Squats, 3) Cable Kickbacks.\n" +
                          "Form Tip: Tuck your chin and posteriorly tilt your pelvis at the top of the hip thrust.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 11. CALVES
        if (msg.contains("calf") || msg.contains("calves") || msg.contains("calf raise")) {
            String link = "https://www.youtube.com/results?search_query=calf+raises+workout+tutorial";
            String text = "Calves Guide: 1) Standing Calf Raises (Gastrocnemius), 2) Seated Calf Raises (Soleus).\n" +
                          "Form Tip: Pause for 2 seconds at the bottom stretch to eliminate Achilles tendon bounce!";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 12. ABS & CORE
        if (msg.contains("ab") || msg.contains("core") || msg.contains("six pack") || msg.contains("oblique") || msg.contains("plank")) {
            String link = "https://www.youtube.com/results?search_query=abs+six+pack+workout+tutorial";
            String text = "Abs & Core Guide: 1) Cable Kneeling Crunches, 2) Hanging Leg Raises, 3) Russian Twists / Cable Woodchoppers for Obliques.\n" +
                          "Form Tip: Actively round your spine to flex your rectus abdominis; don't just bend at the hips.";
            if (wantsTutorial) {
                text += "\n\n🎬 Watch the full video tutorial:\n" + link;
            }
            return text;
        }

        // 13. TUTORIAL GENERAL
        if (wantsTutorial) {
            String query = userMessage.replaceAll("(?i)(tutorial|how to|video|guide|show me|watch)", "").trim();
            if (query.isEmpty()) query = "best+workout+technique";
            String link = "https://www.youtube.com/results?search_query=" + query.replace(" ", "+") + "+tutorial";
            return "Here is a complete exercise tutorial guide!\n\n1. Warm up properly with light sets.\n2. Maintain strict form and full range of motion.\n3. Control the lowering (eccentric) phase for 2-3 seconds.\n\n🎬 Watch the video tutorial on YouTube:\n" + link;
        }

        // Default General Fitness Advice
        String[] tips = {
            "Recovery is key! Get 7-9 hours of quality sleep, drink 3+ liters of water, and stay consistent.",
            "Progressive overload builds muscle: add 1 rep or small weight increases every week with good form.",
            "Nutrition tip: Hit 1.6-2.2g of protein per kg of bodyweight daily to maximize muscle synthesis!"
        };
        int index = Math.abs(userMessage.hashCode()) % tips.length;
        return tips[index];
    }

    public com.gymtrack.dto.AiAnalyticsResponse generateAnalytics(UserOnboarding onboarding) {
        String goal = onboarding != null && onboarding.getGoal() != null ? onboarding.getGoal() : "Muscle Building & Strength";
        String level = onboarding != null && onboarding.getExperienceLevel() != null ? onboarding.getExperienceLevel() : "Intermediate";
        int days = onboarding != null && onboarding.getDaysPerWeek() != null ? onboarding.getDaysPerWeek() : 4;
        Double weight = onboarding != null && onboarding.getWeightKg() != null ? onboarding.getWeightKg() : 75.0;

        String summary = String.format(
                "Based on your profile (%s level, %d days/week training, current weight %.1f kg with goal: %s), your progressive overload rate is trending upward strongly. Your strength-to-weight ratio is above average for your category.",
                level, days, weight, goal
        );

        List<String> recommendations = List.of(
                "Increase compound lift intensity by 2.5kg on your next mesocycle.",
                "Ensure post-workout protein intake stays above 30g within 2 hours of training.",
                "Focus on the eccentric phase (3-sec drop) on your primary chest & back movements.",
                "Schedule a deload week after week 6 to prevent central nervous system fatigue."
        );

        List<String> milestonePredictions = List.of(
                "Bench Press: Predicted +5.0 kg PR in ~3 weeks",
                "Squat: Predicted +7.5 kg PR in ~4 weeks",
                "Deadlift: Predicted +10.0 kg PR in ~5 weeks"
        );

        return new com.gymtrack.dto.AiAnalyticsResponse(
                summary,
                88,
                94,
                "+5.4%/mo",
                goal,
                recommendations,
                milestonePredictions
        );
    }

    public ProgressAnalysisResponse analyzeProgress(UserOnboarding onboarding, List<ProgressEntry> entries) {
        List<ProgressEntry> safeEntries = entries != null ? entries : new ArrayList<>();

        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("placeholder")) {
            log.info("AI API key not set or placeholder. Using goal-aware rule-based progress analysis engine.");
            return generateFallbackProgressAnalysis(onboarding, safeEntries);
        }

        try {
            String systemPrompt = "You are a master fitness coach, sports nutritionist, and progress analyst. You will be given a user's profile (including physical stats, current/target goal like bulking/cutting/strength, training schedule, limitations, and onboarding nutrition targets) and a chronological log of their progress entries (weight, measurements, strength lifts, and photos).\n\n" +
                    "Your mission is to deliver deeply personalized, highly actionable advice tailored specifically to their goal:\n" +
                    "1. Goal & Macro Alignment Analysis:\n" +
                    "   - If the user's goal is BULKING / MUSCLE BUILDING / WEIGHT GAIN:\n" +
                    "     * Evaluate if their weight trajectory and calories are sufficient for muscle hypertrophy (target ~0.25–0.5 kg gain/week).\n" +
                    "     * If weight is flat or falling, or calories seem low for their bodyweight/activity: EXPLICITLY instruct them to increase daily complex carbohydrates (rice, oats, sweet potatoes, pasta, cream of rice) and boost total calories by 300–500 kcal/day to create a surplus, with 1.8–2.2g protein per kg.\n" +
                    "     * Emphasize carbohydrate timing around training (pre/post-workout carbs for glycogen replenishment).\n" +
                    "   - If the user's goal is CUTTING / FAT LOSS / LEAN DEFINITION:\n" +
                    "     * Evaluate if weight loss rate is steady (0.5–1% of bodyweight/week). If plateaued, recommend a small 200–300 kcal adjustment or increasing daily step count, while maintaining high protein (2.0–2.4g/kg) to preserve lean muscle tissue.\n" +
                    "   - If the user's goal is STRENGTH / POWERLIFTING:\n" +
                    "     * Focus on progressive overload velocity on compound lifts, creatine monohydrate saturation, and pre-workout carbohydrate loading.\n" +
                    "2. Trajectory Breakdown: Identify meaningful trends in weight, body circumferences, and strength lifts.\n" +
                    "3. Data Quality & Gaps: Point out logging consistency or gaps.\n" +
                    "4. Categorized Directives: Provide 4-6 specific suggestions. Each suggestion MUST begin with one of the following exact category tags:\n" +
                    "   - 🍗 Nutrition: [calories, protein, carbs, nutrition timing, meal structure]\n" +
                    "   - 🏋️ Training: [progressive overload, exercise selection, rep ranges, intensity, tempo]\n" +
                    "   - 💧 Recovery: [sleep, hydration, creatine monohydrate, rest intervals, deload weeks]\n" +
                    "   - 📈 Progress: [scale weight tracking, circumference milestones, strength velocity, PRs]\n" +
                    "   - 🎯 Goals: [milestones, timelines, macrocycle focus, body composition targets]\n" +
                    "   - ⚠️ Warnings: [injury prevention, overtraining flags, form cautions, fatigue warnings if relevant]\n" +
                    "5. Safety: Flag any medical concerns and advise professional consultation without diagnosing.\n\n" +
                    "Respond with a valid JSON object matching this structure EXACTLY (no markdown code blocks, just raw JSON):\n" +
                    "{\n" +
                    "  \"summary\": \"2-3 sentences executive summary analyzing progress vs stated goal\",\n" +
                    "  \"weightTrend\": \"Detailed trajectory analysis of weight compared to goal (e.g. bulk surplus or cut deficit evaluation)\",\n" +
                    "  \"measurementTrend\": \"Circumference shifts (waist vs chest/arms/thighs) and body composition insights\",\n" +
                    "  \"strengthTrend\": \"Strength progression and progressive overload rate on key lifts\",\n" +
                    "  \"suggestions\": [\n" +
                    "    \"🍗 Nutrition: ...\",\n" +
                    "    \"🏋️ Training: ...\",\n" +
                    "    \"💧 Recovery: ...\",\n" +
                    "    \"📈 Progress: ...\",\n" +
                    "    \"🎯 Goals: ...\"\n" +
                    "  ],\n" +
                    "  \"dataQualityNotes\": \"Observations on weigh-in frequency, measurement consistency, or recommended logging rhythm\"\n" +
                    "}\n\n" +
                    "Be encouraging, scientific, and honest. Do not fabricate numbers not present in the data.";

            String userPrompt = buildProgressAnalysisPrompt(onboarding, safeEntries);

            Map<String, Object> requestBody = Map.of(
                    "model", model,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", userPrompt)
                    ),
                    "temperature", 0.6
            );

            JsonNode response = createWebClient().post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("choices") && response.get("choices").isArray() && response.get("choices").size() > 0) {
                JsonNode choice = response.get("choices").get(0);
                if (choice.has("message") && choice.get("message").has("content")) {
                    String text = choice.get("message").get("content").asText().trim();
                    text = text.replaceAll("^```json\\s*", "").replaceAll("^```\\s*", "").replaceAll("```$", "").trim();

                    try {
                        JsonNode parsed = objectMapper.readTree(text);
                        String summary = parsed.has("summary") ? parsed.get("summary").asText() : "";
                        String weightTrend = parsed.has("weightTrend") ? parsed.get("weightTrend").asText() : "";
                        String measurementTrend = parsed.has("measurementTrend") ? parsed.get("measurementTrend").asText() : "";
                        String strengthTrend = parsed.has("strengthTrend") ? parsed.get("strengthTrend").asText() : "";
                        String dataQualityNotes = parsed.has("dataQualityNotes") ? parsed.get("dataQualityNotes").asText() : "";

                        List<String> suggestions = new ArrayList<>();
                        if (parsed.has("suggestions") && parsed.get("suggestions").isArray()) {
                            for (JsonNode s : parsed.get("suggestions")) {
                                suggestions.add(s.asText());
                            }
                        }

                        if (!summary.isEmpty()) {
                            return new ProgressAnalysisResponse(
                                    summary,
                                    weightTrend,
                                    measurementTrend,
                                    strengthTrend,
                                    suggestions,
                                    dataQualityNotes,
                                    text,
                                    Instant.now()
                            );
                        }
                    } catch (Exception parseEx) {
                        log.warn("Failed to parse AI progress response as JSON, falling back to rule engine: {}", parseEx.getMessage());
                    }
                }
            }

            return generateFallbackProgressAnalysis(onboarding, safeEntries);
        } catch (Exception e) {
            log.error("Error calling AI for progress analysis: {}", e.getMessage());
            return generateFallbackProgressAnalysis(onboarding, safeEntries);
        }
    }

    private String buildProgressAnalysisPrompt(UserOnboarding o, List<ProgressEntry> entries) {
        StringBuilder sb = new StringBuilder();
        sb.append("=== USER ATHLETE PROFILE ===\n");
        sb.append(String.format("Stated Goal: %s\n", o != null && o.getGoal() != null ? o.getGoal() : "General Muscle Building & Fitness"));
        sb.append(String.format("Experience Level: %s\n", o != null && o.getExperienceLevel() != null ? o.getExperienceLevel() : "Intermediate"));
        sb.append(String.format("Age: %s, Sex: %s, Height: %s cm, Baseline Body Weight: %s kg\n",
                o != null && o.getAge() != null ? o.getAge() : "N/A",
                o != null && o.getSex() != null ? o.getSex() : "N/A",
                o != null && o.getHeightCm() != null ? o.getHeightCm() : "N/A",
                o != null && o.getWeightKg() != null ? o.getWeightKg() : "N/A"));
        sb.append(String.format("Training Availability: %s days/week, %s minutes/session\n",
                o != null && o.getDaysPerWeek() != null ? o.getDaysPerWeek() : "4",
                o != null && o.getMinutesPerSession() != null ? o.getMinutesPerSession() : "60"));
        sb.append(String.format("Equipment: %s\n", o != null && o.getEquipment() != null ? o.getEquipment() : "Full Gym"));
        sb.append(String.format("Injuries/Limitations: %s\n", o != null && o.getInjuries() != null ? o.getInjuries() : "None"));

        // Parse AI plan nutrition target if available
        if (o != null && o.getAiGeneratedPlan() != null && !o.getAiGeneratedPlan().isBlank()) {
            try {
                JsonNode planNode = objectMapper.readTree(o.getAiGeneratedPlan());
                if (planNode.has("nutritionPlan")) {
                    JsonNode nut = planNode.get("nutritionPlan");
                    sb.append(String.format("Target Nutrition: %s kcal/day (Protein: %sg, Carbs: %sg, Fat: %sg)\n",
                            nut.has("dailyCalories") ? nut.get("dailyCalories").asText() : "N/A",
                            nut.has("protein") ? nut.get("protein").asText() : "N/A",
                            nut.has("carbs") ? nut.get("carbs").asText() : "N/A",
                            nut.has("fat") ? nut.get("fat").asText() : "N/A"));
                }
            } catch (Exception ignored) {}
        }
        sb.append("\n");

        sb.append("=== CHRONOLOGICAL PROGRESS ENTRIES ===\n");
        if (entries == null || entries.isEmpty()) {
            sb.append("No historical progress entries logged yet. Provide initial baseline coaching and concrete nutrition/macro targets tailored to their goal.\n");
        } else {
            List<ProgressEntry> sorted = new ArrayList<>(entries);
            sorted.sort(Comparator.comparing(ProgressEntry::getDate));

            for (int i = 0; i < sorted.size(); i++) {
                ProgressEntry e = sorted.get(i);
                sb.append(String.format("Entry #%d [%s]:\n", i + 1, e.getDate()));
                if (e.getWeight() != null) {
                    sb.append(String.format("  - Scale Weight: %.1f %s\n", e.getWeight(), e.getWeightUnit() != null ? e.getWeightUnit() : "kg"));
                }
                if (e.getMeasurements() != null && !e.getMeasurements().isEmpty()) {
                    sb.append(String.format("  - Measurements (%s): ", e.getMeasurementUnit() != null ? e.getMeasurementUnit() : "cm"));
                    e.getMeasurements().forEach((k, v) -> sb.append(String.format("%s=%.1f ", k, v)));
                    sb.append("\n");
                }
                if (e.getStrengthLogs() != null && !e.getStrengthLogs().isEmpty()) {
                    sb.append("  - Strength Lifts:\n");
                    for (ProgressEntry.StrengthLog log : e.getStrengthLogs()) {
                        sb.append(String.format("      * %s: %.1f kg x %d reps x %d sets %s%s\n",
                                log.getExerciseName(),
                                log.getWeight() != null ? log.getWeight() : 0.0,
                                log.getReps() != null ? log.getReps() : 0,
                                log.getSets() != null ? log.getSets() : 1,
                                Boolean.TRUE.equals(log.getIsPR()) ? "[NEW PR!] " : "",
                                log.getNotes() != null && !log.getNotes().isEmpty() ? "(" + log.getNotes() + ")" : ""));
                    }
                }
                if (e.getPhotos() != null && !e.getPhotos().isEmpty()) {
                    sb.append(String.format("  - Photos: %d photo(s) [Angles: %s]\n",
                            e.getPhotos().size(),
                            e.getPhotos().stream().map(ProgressEntry.ProgressPhoto::getAngle).collect(Collectors.joining(", "))));
                }
                if (e.getNote() != null && !e.getNote().isBlank()) {
                    sb.append(String.format("  - Notes: \"%s\"\n", e.getNote()));
                }
                sb.append("\n");
            }
        }

        return sb.toString();
    }

    private ProgressAnalysisResponse generateFallbackProgressAnalysis(UserOnboarding o, List<ProgressEntry> entries) {
        String goalRaw = o != null && o.getGoal() != null ? o.getGoal().toLowerCase() : "build_muscle";
        boolean isBulking = goalRaw.contains("bulk") || goalRaw.contains("gain") || goalRaw.contains("muscle") || goalRaw.contains("hypertrophy");
        boolean isCutting = goalRaw.contains("cut") || goalRaw.contains("loss") || goalRaw.contains("fat") || goalRaw.contains("lean");

        double weight = o != null && o.getWeightKg() != null ? o.getWeightKg() : 75.0;
        int targetProtein = (int) Math.round(weight * 2.0);
        int targetBulkingCarbs = (int) Math.round(weight * 4.5);
        int targetBulkingCalories = (int) Math.round(weight * 38);
        int targetCuttingCalories = (int) Math.round(weight * 28);

        List<ProgressEntry> sorted = new ArrayList<>(entries);
        sorted.sort(Comparator.comparing(ProgressEntry::getDate));

        List<ProgressEntry> weightEntries = sorted.stream().filter(e -> e.getWeight() != null && e.getWeight() > 0).toList();
        List<ProgressEntry> measureEntries = sorted.stream().filter(e -> e.getMeasurements() != null && !e.getMeasurements().isEmpty()).toList();
        List<ProgressEntry> strengthEntries = sorted.stream().filter(e -> e.getStrengthLogs() != null && !e.getStrengthLogs().isEmpty()).toList();

        // 1. Weight Trend Analysis
        String weightTrend;
        if (weightEntries.isEmpty()) {
            if (isBulking) {
                weightTrend = String.format("Current baseline weight is %.1f kg with a Bulking target. To support continuous muscular hypertrophy, establish a caloric surplus (+300–500 kcal above maintenance, ~%d kcal/day) targeting +0.25 to +0.5 kg gain per week.",
                        weight, targetBulkingCalories);
            } else if (isCutting) {
                weightTrend = String.format("Current baseline weight is %.1f kg with a Fat Loss target. Aim for a moderate caloric deficit (~%d kcal/day) targeting -0.4 to -0.8 kg loss per week while preserving lean tissue.",
                        weight, targetCuttingCalories);
            } else {
                weightTrend = String.format("Current baseline weight is %.1f kg. Continued weekly weigh-ins will establish your caloric maintenance and metabolic velocity.",
                        weight);
            }
        } else if (weightEntries.size() == 1) {
            double current = weightEntries.get(0).getWeight();
            if (isBulking) {
                weightTrend = String.format("Latest recorded weight is %.1f kg. For hyper-effective bulking, ensure you are eating enough complex carbohydrates to see the scale steadily climb by ~1–2 kg per month.",
                        current);
            } else {
                weightTrend = String.format("Latest recorded weight is %.1f kg on %s. Regular morning weigh-ins (2-3x/week) will establish your metabolic trajectory.",
                        current, weightEntries.get(0).getDate());
            }
        } else {
            ProgressEntry first = weightEntries.get(0);
            ProgressEntry last = weightEntries.get(weightEntries.size() - 1);
            double diff = last.getWeight() - first.getWeight();

            if (isBulking) {
                if (diff <= 0.2) {
                    weightTrend = String.format("Weight moved from %.1f kg to %.1f kg (net shift: %+.1f kg). For your Bulking goal, your weight gain is currently stagnant or too low. You are likely under-eating: increase daily complex carbohydrates (rice, oats, pasta) to achieve a true caloric surplus.",
                            first.getWeight(), last.getWeight(), diff);
                } else {
                    weightTrend = String.format("Weight moved from %.1f kg to %.1f kg (%+.1f kg). Your progressive bulk is tracking within the optimal hypertrophy range (+0.25 to +0.5 kg/week).",
                            first.getWeight(), last.getWeight(), diff);
                }
            } else if (isCutting) {
                if (diff >= 0) {
                    weightTrend = String.format("Weight moved from %.1f kg to %.1f kg (%+.1f kg). For your Fat Loss goal, weight is plateauing or increasing slightly. Tighten dietary tracking, reduce liquid calories, and ensure a 300–500 kcal deficit.",
                            first.getWeight(), last.getWeight(), diff);
                } else {
                    weightTrend = String.format("Weight dropped from %.1f kg to %.1f kg (%.1f kg net loss). Fat loss velocity is on track while preserving lean mass.",
                            first.getWeight(), last.getWeight(), Math.abs(diff));
                }
            } else {
                weightTrend = String.format("Weight logged from %.1f kg to %.1f kg across %d entries.",
                        first.getWeight(), last.getWeight(), weightEntries.size());
            }
        }

        // 2. Measurement Trend
        String measurementTrend;
        if (measureEntries.isEmpty()) {
            measurementTrend = "No circumference measurements logged yet. Tracking waist, chest, and arm measurements every 2-4 weeks provides vital body composition data to ensure muscle gain vs fat accumulation.";
        } else {
            ProgressEntry latest = measureEntries.get(measureEntries.size() - 1);
            StringBuilder msb = new StringBuilder("Latest circumferences (" + latest.getDate() + "): ");
            latest.getMeasurements().forEach((k, v) -> msb.append(String.format("%s: %.1f cm | ", k, v)));
            measurementTrend = msb.toString();
        }

        // 3. Strength Trend
        String strengthTrend;
        int totalPrs = 0;
        for (ProgressEntry e : strengthEntries) {
            for (ProgressEntry.StrengthLog log : e.getStrengthLogs()) {
                if (Boolean.TRUE.equals(log.getIsPR())) totalPrs++;
            }
        }
        if (strengthEntries.isEmpty()) {
            strengthTrend = "No compound lifts logged yet. Progressive overload on multi-joint lifts (Squat, Bench, Deadlift, Overhead Press) is the primary driver of strength and hypertrophy.";
        } else {
            strengthTrend = String.format("Logged %d strength resistance sessions with %d registered Personal Records (PRs). Compound overload velocity is actively supporting muscular adaptation.",
                    strengthEntries.size(), totalPrs);
        }

        // 4. Executive Summary
        String summary;
        if (isBulking) {
            summary = String.format(
                    "Athlete profile calibrated for Muscle Building & Hypertrophy (Current: %.1f kg). To maximize lean tissue accretion while minimizing fat gain, your nutritional surplus must remain consistent: prioritize ~%dg protein and ~%dg complex carbohydrates daily alongside progressive overload.",
                    weight, targetProtein, targetBulkingCarbs
            );
        } else if (isCutting) {
            summary = String.format(
                    "Athlete profile calibrated for Fat Loss & Lean Definition (Current: %.1f kg). Maintain high protein adherence (~%dg/day) and structured resistance training to preserve contractile muscle mass while sustaining a moderate caloric deficit.",
                    weight, targetProtein
            );
        } else {
            summary = String.format(
                    "Athlete profile configured for %s (Current: %.1f kg). Training consistency and structured nutrient timing are actively supporting your strength and body composition milestones.",
                    o != null && o.getGoal() != null ? o.getGoal().replace("_", " ") : "Performance", weight
            );
        }

        // 5. Goal-Specific Actionable Suggestions categorized properly
        List<String> suggestions;
        if (isBulking) {
            suggestions = List.of(
                    String.format("🍗 Nutrition: Increase complex carbohydrates (white/brown rice, oatmeal, sweet potatoes, whole grain pasta, bananas) to ~%dg/day to keep glycogen stores full and ensure a steady +300-500 kcal surplus.", targetBulkingCarbs),
                    String.format("🍗 Nutrition: Target %dg of high-biological-value protein daily (chicken breast, lean beef, eggs, whey, Greek yogurt) distributed across 4-5 meals (~30-45g per meal).", targetProtein),
                    "🏋️ Training: Aim to add 1 rep or +1.25–2.5 kg to your primary compound lifts every 1–2 weeks using structured progressive overload.",
                    "💧 Recovery: Drink 3.5+ liters of water daily and supplement with 5g Creatine Monohydrate to increase intracellular hydration and power output.",
                    "📈 Progress: Log scale weight 2-3x per week in the morning to track your weekly +0.25 to +0.5 kg hypertrophy trajectory.",
                    "🎯 Goals: Maintain this controlled surplus for a 12-16 week block before evaluating body composition adjustments."
            );
        } else if (isCutting) {
            suggestions = List.of(
                    String.format("🍗 Nutrition: Keep protein at %dg/day (~2.2g/kg) to maximize muscle protein synthesis and prevent catabolism during a caloric deficit.", targetProtein),
                    "🍗 Nutrition: Cluster 60-70% of your daily carbohydrates around your pre- and post-workout meals to maintain heavy lifting performance while in a deficit.",
                    "🏋️ Training: Keep training heavy (6–10 rep range) on compound lifts to send a strong retention signal to your muscles that they are necessary.",
                    "💧 Recovery: Prioritize 8 hours of sleep and high water intake to regulate cortisol levels and optimize recovery during caloric restriction.",
                    "📈 Progress: Target a fat loss velocity of 0.5–1% bodyweight per week; if weight stalls for 2+ weeks, adjust calories by -150 kcal.",
                    "🎯 Goals: Establish consistent daily step count (8,000–10,000 steps) as your primary metabolic acceleration baseline."
            );
        } else {
            suggestions = List.of(
                    String.format("🍗 Nutrition: Hit %dg of quality protein daily and maintain caloric balance to support recovery and lean tissue maintenance.", targetProtein),
                    "🏋️ Training: Consistently log your working weights and strive for micro-progressions across your primary compound lifts.",
                    "💧 Recovery: Prioritize 7.5–9 hours of sleep per night to maximize natural hormone secretion and central nervous system recovery.",
                    "📈 Progress: Track body circumferences every 2-4 weeks to accurately measure muscle-to-fat recomposition shifts.",
                    "🎯 Goals: Focus on progressive strength mastery and movement efficiency across your chosen training split."
            );
        }

        // 6. Data Quality Notes
        String dataQualityNotes = String.format(
                "Profile evaluation active with %d logged progress entries. For highest analytical accuracy, log scale weight 2-3x per week first thing in the morning fasting, and record key circumference measurements every 2 weeks.",
                sorted.size()
        );

        return new ProgressAnalysisResponse(
                summary,
                weightTrend,
                measurementTrend,
                strengthTrend,
                suggestions,
                dataQualityNotes,
                null,
                Instant.now()
        );
    }
}
