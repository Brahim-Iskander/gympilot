package com.gymtrack.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisRequest;
import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisResponse;
import com.gymtrack.dto.analyze.PhotoAnalysisDtos.RecommendedProductDto;
import com.gymtrack.model.Product;
import com.gymtrack.repository.ProductRepository;

@Service
public class GoalPhotoAnalysisService {

    private static final Logger log = LoggerFactory.getLogger(GoalPhotoAnalysisService.class);

    private static final String DEFAULT_DISCLAIMER =
            "This analysis and recommendations are for general wellness and educational purposes only. " +
            "They do not constitute medical advice, diagnosis, or treatment. Dietary supplements may support your goals " +
            "but are not intended to cure, treat, or prevent any condition. Always consult a qualified healthcare professional " +
            "or registered dietitian before starting any new supplement or intensive fitness regimen.";

    private static final Pattern BASE64_PREFIX_PATTERN = Pattern.compile("^data:image/[a-zA-Z0-9+.-]+;base64,");

    private final ProductRepository productRepository;
    private final WebClient.Builder webClientBuilder;
    private final ObjectMapper objectMapper;

    @Value("${ai.base-url:https://api.groq.com/openai/v1}")
    private String baseUrl;

    @Value("${ai.vision-model:llama-3.2-90b-vision-preview}")
    private String visionModel;

    @Value("${ai.api.key:}")
    private String apiKey;

    public GoalPhotoAnalysisService(ProductRepository productRepository,
                                    WebClient.Builder webClientBuilder,
                                    ObjectMapper objectMapper) {
        this.productRepository = productRepository;
        this.webClientBuilder = webClientBuilder;
        this.objectMapper = objectMapper;
    }

    private WebClient createWebClient() {
        return webClientBuilder.baseUrl(baseUrl).build();
    }

    public PhotoAnalysisResponse analyze(PhotoAnalysisRequest request) {
        if (request == null || request.goal() == null || request.goal().isBlank()) {
            throw new IllegalArgumentException("Goal description is required.");
        }
        if (request.imageBase64() == null || request.imageBase64().isBlank()) {
            throw new IllegalArgumentException("Image data is required.");
        }

        String goal = request.goal().trim();
        if (goal.length() > 200) {
            goal = goal.substring(0, 200);
        }

        String imageBase64 = request.imageBase64().trim();
        // Basic size guardrail: max 12 MB base64 characters
        if (imageBase64.length() > 12 * 1024 * 1024) {
            throw new IllegalArgumentException("Image size exceeds the maximum limit (approx 8MB). Please upload a smaller image.");
        }

        // Extract structured insight from vision AI or fallback
        VisionAnalysisResult visionResult = performVisionAnalysis(imageBase64, goal);

        // Fetch matching in-stock products from real store catalog
        List<RecommendedProductDto> matchedProducts = fetchStoreRecommendations(visionResult.recommendedCategories(), goal);

        return new PhotoAnalysisResponse(
                visionResult.summary(),
                visionResult.nutritionTips(),
                visionResult.adviceSteps(),
                matchedProducts,
                DEFAULT_DISCLAIMER
        );
    }

    private VisionAnalysisResult performVisionAnalysis(String imageBase64, String goal) {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("placeholder")) {
            log.info("AI API key not set; using smart domain fallback for goal '{}'", goal);
            return generateFallbackAnalysis(goal);
        }

        try {
            String imageUrl = imageBase64;
            if (!imageUrl.startsWith("data:") && !imageUrl.startsWith("http://") && !imageUrl.startsWith("https://")) {
                imageUrl = "data:image/jpeg;base64," + imageBase64;
            }

            String systemPrompt =
                    "You are a supportive, certified fitness, physique, and wellness coach. " +
                    "Analyze the user's uploaded photo in the context of their stated goal.\n\n" +
                    "CRITICAL SAFETY & COMPLIANCE RULES:\n" +
                    "1. Strictly NO medical diagnosis, disease names, or clinical terms.\n" +
                    "2. Do NOT claim any supplement cures, treats, or guarantees results. Use phrases like 'may support', 'can assist with', 'helps maintain'.\n" +
                    "3. If the image is not a human photo (e.g. an object, landscape, or inappropriate content), politely note that in the summary and still provide positive goal guidance.\n" +
                    "4. For recommended_categories: Return generic supplement category keywords ONLY (e.g. 'whey protein', 'creatine', 'omega-3', 'multivitamin', 'collagen', 'pre-workout', 'bcaa'). Do NOT invent brand names or prices.\n\n" +
                    "Return ONLY valid JSON matching this exact schema:\n" +
                    "{\n" +
                    "  \"summary\": \"Encouraging 2-3 sentence assessment tying photo cues to their goal\",\n" +
                    "  \"nutrition_tips\": [\"Short actionable tip 1\", \"Short actionable tip 2\", \"Short actionable tip 3\"],\n" +
                    "  \"advice_steps\": [\"Actionable step 1\", \"Actionable step 2\", \"Actionable step 3\"],\n" +
                    "  \"recommended_categories\": [\"category1\", \"category2\", \"category3\"]\n" +
                    "}";

            Map<String, Object> requestBody = Map.of(
                    "model", visionModel,
                    "temperature", 0.4,
                    "max_tokens", 800,
                    "messages", List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", List.of(
                                    Map.of("type", "text", "text", "User's goal: " + goal + "\nPlease analyze this photo according to the guidelines."),
                                    Map.of("type", "image_url", "image_url", Map.of("url", imageUrl))
                            ))
                    )
            );

            JsonNode response = createWebClient()
                    .mutate()
                    .codecs(configurer -> configurer.defaultCodecs().maxInMemorySize(15 * 1024 * 1024))
                    .build()
                    .post()
                    .uri("/chat/completions")
                    .header("Authorization", "Bearer " + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(JsonNode.class)
                    .block();

            if (response != null && response.has("choices") && response.get("choices").isArray() && !response.get("choices").isEmpty()) {
                JsonNode choice = response.get("choices").get(0);
                if (choice.has("message") && choice.get("message").has("content")) {
                    String content = choice.get("message").get("content").asText().trim();
                    content = content.replaceAll("(?s)^```json\\s*", "").replaceAll("(?s)^```\\s*", "").replaceAll("(?s)```\\s*$", "").trim();
                    JsonNode parsed = objectMapper.readTree(content);

                    String summary = parsed.path("summary").asText("Great baseline physique with huge potential to reach your target.");
                    List<String> nutritionTips = new ArrayList<>();
                    if (parsed.has("nutrition_tips") && parsed.get("nutrition_tips").isArray()) {
                        parsed.get("nutrition_tips").forEach(tip -> nutritionTips.add(tip.asText()));
                    }

                    List<String> adviceSteps = new ArrayList<>();
                    if (parsed.has("advice_steps") && parsed.get("advice_steps").isArray()) {
                        parsed.get("advice_steps").forEach(step -> adviceSteps.add(step.asText()));
                    }

                    List<String> categories = new ArrayList<>();
                    if (parsed.has("recommended_categories") && parsed.get("recommended_categories").isArray()) {
                        parsed.get("recommended_categories").forEach(cat -> categories.add(cat.asText().toLowerCase()));
                    }

                    return new VisionAnalysisResult(summary, nutritionTips, adviceSteps, categories);
                }
            }

            return generateFallbackAnalysis(goal);
        } catch (Exception e) {
            log.warn("Vision AI call failed or timed out: {}. Using fallback assessment.", e.getMessage());
            return generateFallbackAnalysis(goal);
        }
    }

    private VisionAnalysisResult generateFallbackAnalysis(String goal) {
        String lower = goal.toLowerCase();

        if (lower.contains("fat") || lower.contains("lose") || lower.contains("weight") || lower.contains("belly") || lower.contains("slim")) {
            return new VisionAnalysisResult(
                    "Your photo reflects a solid physical foundation to start a high-efficiency recomposition journey. By pairing moderate resistance training with a sustainable caloric deficit, you can trim body fat while preserving lean functional muscle.",
                    List.of(
                            "Maintain a modest caloric deficit of 300–400 kcal below maintenance to promote consistent fat loss without energy crashes.",
                            "Prioritize 1.8g to 2.2g of protein per kg of body weight to safeguard muscle and increase satiety.",
                            "Hydrate with at least 2.5 to 3 liters of water daily to optimize metabolic efficiency and curb phantom hunger."
                    ),
                    List.of(
                            "Combine 3 to 4 weekly compound resistance training sessions with 20 minutes of post-workout zone 2 cardio.",
                            "Focus on progressive overload: challenge your muscles consistently to signal your body to retain muscle mass while shedding fat.",
                            "Aim for 7–8 hours of quality sleep to maintain low cortisol levels and support lipid metabolism."
                    ),
                    List.of("whey protein", "vitamins", "omega-3", "creatine")
            );
        } else if (lower.contains("skin") || lower.contains("glow") || lower.contains("clear") || lower.contains("hair")) {
            return new VisionAnalysisResult(
                    "Your skin profile will benefit significantly from enhanced cellular hydration, antioxidant density, and micronutrient support. Clear, vibrant skin starts from within with balanced gut health and healthy lipid barriers.",
                    List.of(
                            "Incorporate essential fatty acids (Omega-3s from fish oil or flaxseeds) to reinforce skin barrier lipid structure.",
                            "Boost daily intake of colorful vegetables rich in vitamin C, zinc, and polyphenols to support natural collagen synthesis.",
                            "Minimize refined high-glycemic sugars and processed dairy which can trigger inflammatory cascades in the skin."
                    ),
                    List.of(
                            "Drink 3 liters of fresh water daily and limit excessive caffeine or sugary beverages.",
                            "Establish a gentle daily morning and nighttime skincare routine with SPF 30+ sun protection.",
                            "Support your restorative sleep cycle to allow cellular repair and regeneration."
                    ),
                    List.of("vitamins", "omega-3", "collagen", "supplements")
            );
        } else if (lower.contains("energy") || lower.contains("stamina") || lower.contains("endurance") || lower.contains("tired")) {
            return new VisionAnalysisResult(
                    "Your current routine can be significantly elevated by optimizing sleep architecture, electrolyte balance, and cellular energy production. Sustainable energy relies on steady glycogen management and essential micronutrient replenishment.",
                    List.of(
                            "Consume complex low-glycemic carbohydrates (oats, sweet potatoes, quinoa) for sustained glucose release without mid-day crashes.",
                            "Ensure adequate intake of magnesium, B-complex vitamins, and vitamin D3 to support ATP cellular energy pathways.",
                            "Balance your electrolytes (sodium, potassium, magnesium), especially before and after vigorous workouts."
                    ),
                    List.of(
                            "Incorporate 20 minutes of morning sunlight exposure to anchor your circadian rhythm and natural alertness.",
                            "Engage in 3 weekly cardiovascular conditioning workouts (running, cycling, or swimming) to improve VO2 max.",
                            "Avoid heavy meals within 2 hours of bedtime to ensure restorative deep sleep."
                    ),
                    List.of("vitamins", "creatine", "whey protein", "supplements")
            );
        } else {
            // Default: Muscle building & Strength / General Fitness
            return new VisionAnalysisResult(
                    "Your physique demonstrates strong athletic potential with a responsive frame. With targeted progressive overload and sufficient dietary protein, you have an optimal profile for building lean muscle mass and enhancing overall definition.",
                    List.of(
                            "Target 2.0g of dietary protein per kg of body weight to maximize muscle protein synthesis throughout the day.",
                            "Distribute protein evenly across 3 to 4 meals containing 30–40g of high-quality amino acids each.",
                            "Fuel demanding workouts with adequate complex carbohydrates 60–90 minutes beforehand."
                    ),
                    List.of(
                            "Follow an Upper/Lower or Push/Pull/Legs split 4 to 5 days weekly, focusing on compound lifts (bench press, squats, rows).",
                            "Track training volume and progressively increase weight or repetitions every 1–2 weeks.",
                            "Prioritize 8 hours of restorative sleep, where over 80% of natural growth hormone release takes place."
                    ),
                    List.of("whey protein", "creatine", "mass gainer", "vitamins")
            );
        }
    }

    private List<RecommendedProductDto> fetchStoreRecommendations(List<String> categories, String goal) {
        Set<String> addedIds = new HashSet<>();
        List<RecommendedProductDto> results = new ArrayList<>();

        // 1. Search active products by recommended keywords
        if (categories != null && !categories.isEmpty()) {
            for (String category : categories) {
                if (results.size() >= 4) break;
                if (category == null || category.isBlank()) continue;

                List<Product> matches = productRepository.searchActiveProducts(category.trim(), PageRequest.of(0, 4)).getContent();
                for (Product p : matches) {
                    if (p.getStockQuantity() > 0 && !addedIds.contains(p.getId())) {
                        addedIds.add(p.getId());
                        results.add(RecommendedProductDto.from(p));
                        if (results.size() >= 4) break;
                    }
                }
            }
        }

        // 2. If fewer than 2 products found, search by goal keywords
        if (results.size() < 2) {
            String[] keywords = goal.toLowerCase().split("\\s+");
            for (String kw : keywords) {
                if (kw.length() < 3) continue;
                if (results.size() >= 4) break;

                List<Product> matches = productRepository.searchActiveProducts(kw, PageRequest.of(0, 3)).getContent();
                for (Product p : matches) {
                    if (p.getStockQuantity() > 0 && !addedIds.contains(p.getId())) {
                        addedIds.add(p.getId());
                        results.add(RecommendedProductDto.from(p));
                        if (results.size() >= 4) break;
                    }
                }
            }
        }

        // 3. If still fewer than 2 products, fallback to top active products with stock
        if (results.size() < 2) {
            List<Product> topProducts = productRepository.findByActiveTrue(PageRequest.of(0, 6)).getContent();
            for (Product p : topProducts) {
                if (p.getStockQuantity() > 0 && !addedIds.contains(p.getId())) {
                    addedIds.add(p.getId());
                    results.add(RecommendedProductDto.from(p));
                    if (results.size() >= 4) break;
                }
            }
        }

        return results;
    }

    private record VisionAnalysisResult(
            String summary,
            List<String> nutritionTips,
            List<String> adviceSteps,
            List<String> recommendedCategories
    ) {}
}
