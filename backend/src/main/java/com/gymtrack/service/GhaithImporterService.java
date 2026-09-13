package com.gymtrack.service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymtrack.model.Category;
import com.gymtrack.model.Product;
import com.gymtrack.model.User;
import com.gymtrack.repository.CategoryRepository;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class GhaithImporterService {

    private static final Logger log = LoggerFactory.getLogger(GhaithImporterService.class);

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    public GhaithImporterService(UserRepository userRepository,
                                ProductRepository productRepository,
                                CategoryRepository categoryRepository,
                                PasswordEncoder passwordEncoder,
                                ObjectMapper objectMapper) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.objectMapper = objectMapper;
    }

    public synchronized int importProductsForSeller(String sellerEmail, String rawPassword) {
        log.info("Starting Ghaith Nutrition catalog import for seller: {}", sellerEmail);

        // 1. Ensure / update seller user account
        User seller = ensureSellerUser(sellerEmail, rawPassword);

        // 2. Ensure standard categories exist
        Map<String, Category> categories = ensureCategories();

        // 3. Fetch products JSON (try live endpoint, fallback to bundled resource)
        String jsonContent = fetchProductsJson();
        if (jsonContent == null || jsonContent.isBlank()) {
            log.error("Could not obtain products JSON from live site or classpath resource");
            return 0;
        }

        int importedCount = 0;
        try {
            JsonNode root = objectMapper.readTree(jsonContent);
            JsonNode productsNode = root.get("products");
            if (productsNode == null || !productsNode.isArray()) {
                log.error("Invalid JSON format: missing 'products' array");
                return 0;
            }

            for (JsonNode pNode : productsNode) {
                try {
                    boolean success = importSingleProduct(pNode, seller, categories);
                    if (success) {
                        importedCount++;
                    }
                } catch (Exception ex) {
                    log.warn("Failed to import individual product: {}", ex.getMessage());
                }
            }

            log.info("Successfully imported/updated {} products for seller {} ({})",
                    importedCount, seller.getEmail(), seller.getStoreName());

        } catch (Exception e) {
            log.error("Failed to parse and import products JSON", e);
        }

        return importedCount;
    }

    private User ensureSellerUser(String email, String password) {
        Optional<User> existing = userRepository.findByEmail(email);
        User user;
        if (existing.isPresent()) {
            user = existing.get();
            Set<String> roles = user.getRoles();
            if (roles == null) {
                roles = new HashSet<>();
            }
            roles.add("SELLER");
            roles.add("USER");
            user.setRoles(roles);
            user.setRole("SELLER");
            if (password != null && !password.isBlank()) {
                user.setPassword(passwordEncoder.encode(password));
            }
        } else {
            user = new User("Iskander", "Skan", email, passwordEncoder.encode(password != null ? password : "Topadmin2005"));
            user.setRoles(new HashSet<>(Set.of("SELLER", "USER")));
            user.setRole("SELLER");
            user.setCreatedAt(Instant.now());
        }

        if (user.getStoreName() == null || user.getStoreName().isBlank()) {
            user.setStoreName("Ghaith Nutrition");
        }
        if (user.getStoreBio() == null || user.getStoreBio().isBlank()) {
            user.setStoreBio("Boutique officielle Ghaith Nutrition sur GymPilot — N°1 des compléments alimentaires, protéines et vitamines authentiques en Tunisie avec livraison rapide 24/48h.");
        }
        if (user.getStoreLogo() == null || user.getStoreLogo().isBlank()) {
            user.setStoreLogo("https://ghaithnutrition.com/cdn/shop/files/WhatsApp_Image_2025-10-20_a_16.37.07_05fcc5e5-removebg-preview.png");
        }
        user.setVerified(true);
        if (user.getMembershipTier() == null) {
            user.setMembershipTier("PREMIUM");
        }
        if (user.getMembershipStatus() == null) {
            user.setMembershipStatus("ACTIVE");
        }

        return userRepository.save(user);
    }

    private Map<String, Category> ensureCategories() {
        Map<String, Category> map = new HashMap<>();
        map.put("Whey Protein", ensureCategory("Whey Protein", "whey-protein", "Premium isolate, hydrolysate & concentrate protein powders for muscle recovery", "protein", 1));
        map.put("Creatine", ensureCategory("Creatine", "creatine", "Micronized & pure creatine monohydrate to boost explosive strength and power", "creatine", 2));
        map.put("Mass Gainer", ensureCategory("Mass Gainer", "mass-gainer", "High-calorie, nutrient-dense formulas for rapid bulking and muscle mass", "gainer", 3));
        map.put("Vitamins & Supplements", ensureCategory("Vitamins & Supplements", "vitamins-supplements", "Daily multivitamins, fish oil Omega-3, zinc, magnesium & pre-workouts", "vitamins", 4));
        map.put("Equipment & Tools", ensureCategory("Equipment & Tools", "equipment-tools", "Resistance bands, steppers, lifting belts, straps & recovery rollers", "equipment", 5));
        map.put("Packs & Stacks", ensureCategory("Packs & Stacks", "packs-stacks", "Exclusive bundles, mass gainer stacks & high performance combos", "pack", 6));
        return map;
    }

    private Category ensureCategory(String name, String slug, String desc, String icon, int order) {
        Optional<Category> opt = categoryRepository.findBySlug(slug);
        if (opt.isPresent()) {
            return opt.get();
        }
        Category cat = new Category(name, slug, desc, icon, order);
        return categoryRepository.save(cat);
    }

    private String fetchProductsJson() {
        // Try live website first
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(6))
                    .followRedirects(HttpClient.Redirect.ALWAYS)
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://ghaithnutrition.com/products.json?limit=250"))
                    .header("User-Agent", "GymPilot-CatalogSync/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .GET()
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() == 200 && response.body() != null && response.body().contains("\"products\"")) {
                log.info("Fetched live products JSON directly from ghaithnutrition.com (length: {} bytes)", response.body().length());
                return response.body();
            }
        } catch (Exception e) {
            log.warn("Live fetch from ghaithnutrition.com failed ({}), falling back to bundled classpath file", e.getMessage());
        }

        // Fallback to classpath resource
        try {
            ClassPathResource resource = new ClassPathResource("data/ghaith_products.json");
            if (resource.exists()) {
                try (InputStream is = resource.getInputStream()) {
                    return new String(is.readAllBytes(), java.nio.charset.StandardCharsets.UTF_8);
                }
            }
        } catch (Exception e) {
            log.error("Failed to read bundled ghaith_products.json from classpath", e);
        }

        return null;
    }

    private boolean importSingleProduct(JsonNode pNode, User seller, Map<String, Category> categories) {
        String title = pNode.path("title").asText("").trim();
        if (title.isEmpty()) {
            return false;
        }

        String handle = pNode.path("handle").asText("").trim();
        if (handle.isEmpty()) {
            handle = slugify(title);
        }

        // Clean HTML description
        String bodyHtml = pNode.path("body_html").asText("");
        String cleanDescription = stripHtml(bodyHtml);
        if (cleanDescription.isBlank()) {
            cleanDescription = title + " - Produit officiel disponible chez " + seller.getStoreName() + ".";
        }

        // Extract pricing from variants
        double price = 0.0;
        Double originalPrice = null;
        JsonNode variantsNode = pNode.path("variants");
        List<String> variantTitles = new ArrayList<>();
        if (variantsNode.isArray() && variantsNode.size() > 0) {
            JsonNode firstVariant = variantsNode.get(0);
            try {
                price = Double.parseDouble(firstVariant.path("price").asText("0"));
            } catch (NumberFormatException ignored) {}

            try {
                String compPriceStr = firstVariant.path("compare_at_price").asText("");
                if (!compPriceStr.isBlank() && !compPriceStr.equals("null")) {
                    double compPrice = Double.parseDouble(compPriceStr);
                    if (compPrice > price) {
                        originalPrice = compPrice;
                    }
                }
            } catch (NumberFormatException ignored) {}

            for (JsonNode v : variantsNode) {
                String vTitle = v.path("title").asText("");
                if (!vTitle.equalsIgnoreCase("Default Title") && !vTitle.isBlank()) {
                    variantTitles.add(vTitle);
                }
            }
        }

        if (price <= 0.0) {
            price = 49.0; // fallback if price not set
        }

        // Extract images
        List<String> images = new ArrayList<>();
        JsonNode imagesNode = pNode.path("images");
        if (imagesNode.isArray()) {
            for (JsonNode img : imagesNode) {
                String src = img.path("src").asText("");
                if (!src.isBlank()) {
                    images.add(src);
                }
            }
        }

        // Extract tags
        List<String> tags = new ArrayList<>();
        JsonNode tagsNode = pNode.path("tags");
        if (tagsNode.isArray()) {
            for (JsonNode t : tagsNode) {
                tags.add(t.asText("").trim());
            }
        } else if (tagsNode.isTextual()) {
            String[] parts = tagsNode.asText("").split(",");
            for (String part : parts) {
                if (!part.trim().isEmpty()) {
                    tags.add(part.trim());
                }
            }
        }

        // Determine category
        Category category = determineCategory(title, tags, categories);

        // Build specifications
        Map<String, String> specs = new HashMap<>();
        String vendor = pNode.path("vendor").asText("").trim();
        if (!vendor.isBlank()) {
            specs.put("Brand / Vendor", vendor);
        } else {
            specs.put("Brand / Vendor", "Ghaith Nutrition");
        }
        specs.put("Category", category.getName());
        specs.put("Origin", "100% Genuine & Certified");
        if (!variantTitles.isEmpty()) {
            specs.put("Available Options", String.join(", ", variantTitles));
        }
        if (!tags.isEmpty()) {
            specs.put("Tags", String.join(", ", tags));
        }

        // Check if product already exists for this seller
        Optional<Product> existingOpt = productRepository.findBySlug(handle);
        Product product;
        if (existingOpt.isPresent()) {
            product = existingOpt.get();
        } else {
            product = new Product();
            product.setSlug(handle);
            product.setCreatedAt(Instant.now());
        }

        product.setName(title);
        product.setDescription(cleanDescription);
        product.setCategoryId(category.getId());
        product.setCategoryName(category.getName());
        product.setPrice(price);
        product.setOriginalPrice(originalPrice);
        product.setStockQuantity(50);
        product.setImages(images);
        product.setSpecs(specs);
        product.setSellerId(seller.getId());
        product.setSellerName((seller.getFirstName() + " " + seller.getLastName()).trim());
        product.setSellerStoreName(seller.getStoreName());
        product.setSellerStoreLogo(seller.getStoreLogo());
        product.setActive(true);
        product.setRating(4.9);
        product.setReviewCount(Math.max(5, (title.hashCode() & 0x7FFFFFFF) % 25 + 3));
        product.setUnitsSold(Math.max(12, (title.hashCode() & 0x7FFFFFFF) % 60 + 10));
        product.setViews(Math.max(45, (title.hashCode() & 0x7FFFFFFF) % 200 + 50));
        product.setUpdatedAt(Instant.now());

        // Highlight top packs and gainers as featured
        if (category.getName().equals("Packs & Stacks") || title.toLowerCase().contains("pure performance") || title.toLowerCase().contains("level 10")) {
            product.setFeatured(true);
        }

        productRepository.save(product);
        return true;
    }

    private Category determineCategory(String title, List<String> tags, Map<String, Category> categories) {
        String lowerTitle = title.toLowerCase();
        String lowerTags = String.join(" ", tags).toLowerCase();
        String combined = lowerTitle + " " + lowerTags;

        if (combined.contains("pack") || combined.contains("stack") || combined.contains("offerts") || combined.contains("combo")) {
            return categories.get("Packs & Stacks");
        }
        if (combined.contains("creatine") || combined.contains("créatine")) {
            return categories.get("Creatine");
        }
        if (combined.contains("mass gainer") || combined.contains("gainer") || combined.contains("prise de masse") || combined.contains("prise de poids")) {
            return categories.get("Mass Gainer");
        }
        if (combined.contains("whey") || combined.contains("protein") || combined.contains("protéine") || combined.contains("isolate") || combined.contains("casein")) {
            return categories.get("Whey Protein");
        }
        if (combined.contains("serre-poignet") || combined.contains("gant") || combined.contains("straps") || combined.contains("ceinture") || combined.contains("accessoire") || combined.contains("shaker")) {
            return categories.get("Equipment & Tools");
        }

        return categories.getOrDefault("Vitamins & Supplements", categories.get("Whey Protein"));
    }

    private String stripHtml(String html) {
        if (html == null || html.isBlank()) {
            return "";
        }
        // Replace breaks and paragraph endings with spaces
        String text = html.replaceAll("(?i)<br\\s*/?>", " ")
                .replaceAll("(?i)</p>", " ")
                .replaceAll("(?i)</li>", ", ")
                .replaceAll("<[^>]+>", " ")
                .replaceAll("&nbsp;", " ")
                .replaceAll("&amp;", "&")
                .replaceAll("&quot;", "\"")
                .replaceAll("&#39;", "'")
                .replaceAll("\\s+", " ")
                .trim();
        return text;
    }

    private String slugify(String input) {
        if (input == null) return "product";
        String nowhitespace = input.trim().replaceAll("\\s+", "-");
        String normalized = java.text.Normalizer.normalize(nowhitespace, java.text.Normalizer.Form.NFD);
        String slug = normalized.replaceAll("[^\\w\\-]", "").toLowerCase();
        return slug.replaceAll("-{2,}", "-");
    }
}
