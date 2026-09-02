package com.gymtrack.config;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.gymtrack.model.Category;
import com.gymtrack.model.Product;
import com.gymtrack.model.User;
import com.gymtrack.repository.CategoryRepository;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.UserRepository;

/**
 * Seeds initial store categories and sample supplements/equipment for GymPilot Marketplace.
 */
@Component
@Order(3)
public class ShopSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ShopSeeder.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public ShopSeeder(CategoryRepository categoryRepository,
                      ProductRepository productRepository,
                      UserRepository userRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedProducts();
    }

    private void seedCategories() {
        if (categoryRepository.count() > 0) {
            return;
        }

        List<Category> categories = List.of(
                new Category("Whey Protein", "whey-protein", "Premium isolate, hydrolysate & concentrate protein powders for muscle recovery", "protein", 1),
                new Category("Creatine", "creatine", "Micronized & pure creatine monohydrate to boost explosive strength and power", "creatine", 2),
                new Category("Mass Gainer", "mass-gainer", "High-calorie, nutrient-dense formulas for rapid bulking and muscle mass", "gainer", 3),
                new Category("Vitamins & Supplements", "vitamins-supplements", "Daily multivitamins, fish oil Omega-3, magnesium & pre-workouts", "vitamins", 4),
                new Category("Equipment & Tools", "equipment-tools", "Resistance bands, steppers, lifting belts, straps & recovery rollers", "equipment", 5)
        );

        categoryRepository.saveAll(categories);
        log.info("Seeded {} shop categories successfully", categories.size());
    }

    private void seedProducts() {
        if (productRepository.count() > 0) {
            return;
        }

        User adminOrSeller = userRepository.findByEmail("admin@gympilot.com")
                .or(() -> userRepository.findAll().stream().findFirst())
                .orElse(null);

        String sellerId = adminOrSeller != null ? adminOrSeller.getId() : "gympilot-official";
        String sellerName = adminOrSeller != null ? adminOrSeller.getFirstName() + " " + adminOrSeller.getLastName() : "GymPilot Official";
        String sellerStore = "GymPilot Pro Shop";

        Category proteinCat = categoryRepository.findBySlug("whey-protein").orElse(null);
        Category creatineCat = categoryRepository.findBySlug("creatine").orElse(null);
        Category gainerCat = categoryRepository.findBySlug("mass-gainer").orElse(null);
        Category vitaminsCat = categoryRepository.findBySlug("vitamins-supplements").orElse(null);
        Category equipCat = categoryRepository.findBySlug("equipment-tools").orElse(null);

        List<Product> products = new ArrayList<>();

        if (proteinCat != null) {
            Map<String, String> specs1 = new HashMap<>();
            specs1.put("Serving Size", "32g (1 Scoop)");
            specs1.put("Protein per Serving", "25g");
            specs1.put("BCAA Content", "5.5g");
            specs1.put("Flavor", "Double Rich Chocolate");
            specs1.put("Total Servings", "74 Servings (2.27 kg)");

            Product p1 = new Product(
                    "GymPilot 100% Pure Whey Isolate (2.27 kg)",
                    "gympilot-100-pure-whey-isolate",
                    "Ultra-filtered whey protein isolate delivering 25g of fast-absorbing protein with zero added sugar and rapid muscle synthesis.",
                    proteinCat.getId(),
                    proteinCat.getName(),
                    64.99,
                    79.99,
                    45,
                    List.of(
                            "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80",
                            "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80"
                    ),
                    specs1,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p1.setFeatured(true);
            p1.setRating(4.9);
            p1.setReviewCount(38);
            p1.setUnitsSold(120);
            products.add(p1);

            Map<String, String> specs2 = new HashMap<>();
            specs2.put("Protein", "24g");
            specs2.put("Carbs", "3g");
            specs2.put("Flavor", "Vanilla Bean");
            specs2.put("Weight", "1 kg");
            Product p2 = new Product(
                    "Hydrolyzed Whey Matrix — Vanilla Bean (1 kg)",
                    "hydrolyzed-whey-matrix-vanilla",
                    "Enzymatically pre-digested hydrolyzed whey protein designed for immediate post-workout absorption and zero bloating.",
                    proteinCat.getId(),
                    proteinCat.getName(),
                    39.99,
                    49.99,
                    30,
                    List.of("https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800&auto=format&fit=crop&q=80"),
                    specs2,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p2.setRating(4.8);
            p2.setReviewCount(19);
            p2.setUnitsSold(65);
            products.add(p2);
        }

        if (creatineCat != null) {
            Map<String, String> specs = new HashMap<>();
            specs.put("Creatine Type", "100% Micronized Monohydrate (Creapure)");
            specs.put("Serving Size", "5g");
            specs.put("Total Servings", "100 Servings (500g)");
            specs.put("Purity", "99.99% Tested");

            Product p = new Product(
                    "Creapure® Ultra-Micronized Creatine Monohydrate (500g)",
                    "creapure-ultra-micronized-creatine-500g",
                    "Pharmaceutical grade Creapure® creatine for explosive strength, cell volumization, and enhanced power output across all compound lifts.",
                    creatineCat.getId(),
                    creatineCat.getName(),
                    29.99,
                    36.00,
                    80,
                    List.of("https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80"),
                    specs,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p.setFeatured(true);
            p.setRating(5.0);
            p.setReviewCount(52);
            p.setUnitsSold(210);
            products.add(p);
        }

        if (gainerCat != null) {
            Map<String, String> specs = new HashMap<>();
            specs.put("Calories per Serving", "1,250 kcal");
            specs.put("Protein per Serving", "50g Blend");
            specs.put("Complex Carbs", "252g");
            specs.put("Flavor", "Cookies & Cream");
            specs.put("Weight", "5.4 kg (12 lbs)");

            Product p = new Product(
                    "Anabolic Mass Gainer Pro — 1,250 Calorie Fuel (5.4 kg)",
                    "anabolic-mass-gainer-pro-5-4kg",
                    "Massive caloric density engineered for hardgainers, stacked with 50g protein and digestive enzymes for optimal muscle bulk without excess fat.",
                    gainerCat.getId(),
                    gainerCat.getName(),
                    74.99,
                    89.99,
                    25,
                    List.of("https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=800&auto=format&fit=crop&q=80"),
                    specs,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p.setRating(4.7);
            p.setReviewCount(24);
            p.setUnitsSold(45);
            products.add(p);
        }

        if (vitaminsCat != null) {
            Map<String, String> specs1 = new HashMap<>();
            specs1.put("Capsules", "120 Veggie Caps");
            specs1.put("EPA/DHA", "1,200mg / 900mg");
            specs1.put("Source", "Wild Deep Sea Fish Oil");

            Product p1 = new Product(
                    "Triple Strength Omega-3 Fish Oil (120 Softgels)",
                    "triple-strength-omega-3-fish-oil",
                    "High-potency molecularly distilled Omega-3 fatty acids to lubricate joints, accelerate recovery, and support cardiovascular health.",
                    vitaminsCat.getId(),
                    vitaminsCat.getName(),
                    24.99,
                    29.99,
                    60,
                    List.of("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=80"),
                    specs1,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p1.setRating(4.9);
            p1.setReviewCount(41);
            p1.setUnitsSold(98);
            products.add(p1);

            Map<String, String> specs2 = new HashMap<>();
            specs2.put("Caffeine Content", "275mg");
            specs2.put("Beta-Alanine", "3.2g");
            specs2.put("L-Citrulline", "6.0g");
            specs2.put("Flavor", "Blue Raspberry Ice");

            Product p2 = new Product(
                    "Ignition Pre-Workout High-Stim Formula (30 Servings)",
                    "ignition-pre-workout-high-stim",
                    "Laser focus, skin-splitting pumps, and sustained energy without the post-workout crash. Clinically dosed pump enhancers.",
                    vitaminsCat.getId(),
                    vitaminsCat.getName(),
                    34.99,
                    42.00,
                    50,
                    List.of("https://images.unsplash.com/photo-1546483875-ad9014c88eba?w=800&auto=format&fit=crop&q=80"),
                    specs2,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p2.setFeatured(true);
            p2.setRating(4.8);
            p2.setReviewCount(33);
            p2.setUnitsSold(87);
            products.add(p2);
        }

        if (equipCat != null) {
            Map<String, String> specs1 = new HashMap<>();
            specs1.put("Levels", "5 Resistance Bands (10 to 50 lbs / 150 lbs total stack)");
            specs1.put("Includes", "2 Handles, 2 Ankle Straps, 1 Door Anchor, 1 Carry Bag");
            specs1.put("Material", "100% Natural Latex");

            Product p1 = new Product(
                    "Heavy-Duty Multi-Resistance Bands Set (150 lbs Stack)",
                    "heavy-duty-multi-resistance-bands-set",
                    "Complete home gym & gym warm-up system with stackable latex tubes for progressive overload anywhere, anytime.",
                    equipCat.getId(),
                    equipCat.getName(),
                    32.99,
                    45.00,
                    40,
                    List.of("https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80"),
                    specs1,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p1.setFeatured(true);
            p1.setRating(4.9);
            p1.setReviewCount(67);
            p1.setUnitsSold(160);
            products.add(p1);

            Map<String, String> specs2 = new HashMap<>();
            specs2.put("Height Adjustments", "4 inches, 6 inches, 8 inches");
            specs2.put("Non-Slip Surface", "Shock-Absorbing Textured Top");
            specs2.put("Max Weight Capacity", "250 kg");

            Product p2 = new Product(
                    "Pro Aerobic Fitness Stepper with 3 Height Risers",
                    "pro-aerobic-fitness-stepper-3-risers",
                    "Commercial-grade aerobic stepper platform for HIIT, explosive calf/quad training, and home cardio endurance workouts.",
                    equipCat.getId(),
                    equipCat.getName(),
                    49.99,
                    65.00,
                    20,
                    List.of("https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80"),
                    specs2,
                    sellerId,
                    sellerName,
                    sellerStore
            );
            p2.setRating(4.8);
            p2.setReviewCount(29);
            p2.setUnitsSold(54);
            products.add(p2);
        }

        productRepository.saveAll(products);
        log.info("Seeded {} marketplace products successfully", products.size());
    }
}
