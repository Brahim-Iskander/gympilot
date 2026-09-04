package com.gymtrack.config;

import java.util.List;
import java.util.Map;
import java.util.Optional;

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
import com.gymtrack.repository.VoucherRepository;

/**
 * Seeds store categories, products requested by user, and official vouchers.
 */
@Component
@Order(3)
public class ShopSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ShopSeeder.class);

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final VoucherRepository voucherRepository;

    public ShopSeeder(CategoryRepository categoryRepository,
                      ProductRepository productRepository,
                      UserRepository userRepository,
                      VoucherRepository voucherRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.voucherRepository = voucherRepository;
    }

    @Override
    public void run(String... args) {
        seedCategories();
        seedProducts();
        seedVouchers();
    }

    private void seedVouchers() {
        if (!voucherRepository.existsByCodeIgnoreCase("PILOT10")) {
            com.gymtrack.model.Voucher v = new com.gymtrack.model.Voucher(
                    "PILOT10",
                    "PERCENTAGE",
                    10.0,
                    30.0,
                    30.0,
                    1000,
                    "Official GymPilot welcome voucher: 10% discount on orders over 30 TND",
                    java.time.Instant.now().plus(365, java.time.temporal.ChronoUnit.DAYS),
                    "system"
            );
            voucherRepository.save(v);
            log.info("Seeded official welcome voucher: PILOT10 (10% off)");
        }
    }

    private void seedCategories() {
        ensureCategory("Whey Protein", "whey-protein", "Premium isolate, hydrolysate & concentrate protein powders for muscle recovery", "protein", 1);
        ensureCategory("Creatine", "creatine", "Micronized & pure creatine monohydrate to boost explosive strength and power", "creatine", 2);
        ensureCategory("Mass Gainer", "mass-gainer", "High-calorie, nutrient-dense formulas for rapid bulking and muscle mass", "gainer", 3);
        ensureCategory("Vitamins & Supplements", "vitamins-supplements", "Daily multivitamins, fish oil Omega-3, zinc, magnesium & pre-workouts", "vitamins", 4);
        ensureCategory("Equipment & Tools", "equipment-tools", "Resistance bands, steppers, lifting belts, straps & recovery rollers", "equipment", 5);
    }

    private Category ensureCategory(String name, String slug, String desc, String icon, int order) {
        Optional<Category> opt = categoryRepository.findBySlug(slug);
        if (opt.isPresent()) {
            return opt.get();
        }
        Category cat = new Category(name, slug, desc, icon, order);
        return categoryRepository.save(cat);
    }

    private void seedProducts() {
        Optional<User> adminOpt = userRepository.findByEmail("iskanderbrahim2024@gmail.com");
        String sellerId = adminOpt.map(User::getId).orElse("official-seller");
        String sellerName = adminOpt.map(u -> (u.getFirstName() + " " + u.getLastName()).trim()).orElse("Iskander Brahim");
        String storeName = adminOpt.map(User::getStoreName).orElse("GymPilot Official Store");

        Category catCreatine = ensureCategory("Creatine", "creatine", "Micronized & pure creatine monohydrate to boost explosive strength and power", "creatine", 2);
        Category catWhey = ensureCategory("Whey Protein", "whey-protein", "Premium isolate, hydrolysate & concentrate protein powders for muscle recovery", "protein", 1);
        Category catVitamins = ensureCategory("Vitamins & Supplements", "vitamins-supplements", "Daily multivitamins, fish oil Omega-3, zinc, magnesium & pre-workouts", "vitamins", 4);
        Category catMass = ensureCategory("Mass Gainer", "mass-gainer", "High-calorie, nutrient-dense formulas for rapid bulking and muscle mass", "gainer", 3);

        // 1. Quamtrax Pure Creatine Monohydrate
        upsertProduct(
                "Quamtrax Pure Creatine Monohydrate 300g",
                "quamtrax-pure-creatine-monohydrate-300g",
                "High-purity 100% micronized creatine monohydrate by Quamtrax Nutrition. Enhances explosive muscular power, ATP regeneration, and lean muscle mass acceleration with zero additives.",
                catCreatine.getId(),
                catCreatine.getName(),
                79.0,
                89.0,
                35,
                List.of("https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&auto=format&fit=crop&q=80"),
                Map.of("Brand", "Quamtrax Nutrition", "Weight", "300g", "Form", "Micronized Powder", "Servings", "100 (3g per serving)", "Origin", "Spain"),
                sellerId, sellerName, storeName
        );

        // 2. Kevin Levrone Signature Series Gold Creatine
        upsertProduct(
                "Kevin Levrone Gold Creatine 300g",
                "kevin-levrone-gold-creatine-300g",
                "Kevin Levrone Signature Series Gold Creatine is an elite 100% pure micronized creatine monohydrate formula enriched with Vitamin B6 to support energy metabolism and fight fatigue.",
                catCreatine.getId(),
                catCreatine.getName(),
                85.0,
                99.0,
                30,
                List.of("https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80"),
                Map.of("Brand", "Kevin Levrone Signature Series", "Weight", "300g", "Active Ingredient", "Creatine Monohydrate + Vit B6", "Servings", "60 (5g per serving)"),
                sellerId, sellerName, storeName
        );

        // 3. 100% Pure Whey Protein Isolate & Concentrate
        upsertProduct(
                "100% Pure Whey Protein Isolate & Concentrate 2kg",
                "100-pure-whey-protein-isolate-concentrate-2kg",
                "Ultra-filtered whey protein blend delivering 25g of high-BV protein per scoop with 5.5g BCAAs to accelerate muscle protein synthesis, tissue repair, and lean recovery.",
                catWhey.getId(),
                catWhey.getName(),
                195.0,
                225.0,
                25,
                List.of("https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=80"),
                Map.of("Brand", "GymPilot Nutrition", "Weight", "2.0 kg", "Protein per Serving", "25g", "BCAAs", "5.5g", "Flavor", "Double Rich Chocolate"),
                sellerId, sellerName, storeName
        );

        // 4. Zinc 30 Capsules - Price 30 TND
        upsertProduct(
                "Zinc Picolinate 25mg - 30 Capsules",
                "zinc-picolinate-25mg-30-capsules",
                "Essential high-absorption Zinc Picolinate (25mg) to support natural testosterone production, immune defense, protein synthesis, and cellular skin health.",
                catVitamins.getId(),
                catVitamins.getName(),
                30.0,
                35.0,
                50,
                List.of("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"),
                Map.of("Dosage", "25mg Zinc per capsule", "Count", "30 Capsules", "Form", "Vegetarian Capsules", "Key Benefit", "Immunity & Testosterone Support"),
                sellerId, sellerName, storeName
        );

        // 5. Zinc 60 Capsules - Price 40 TND
        upsertProduct(
                "Zinc Picolinate 25mg - 60 Capsules",
                "zinc-picolinate-25mg-60-capsules",
                "Value pack 60 capsules of high-potency Zinc Picolinate (25mg). Supports immune health, cellular repair, hormonal regulation, and metabolic vitality.",
                catVitamins.getId(),
                catVitamins.getName(),
                40.0,
                48.0,
                50,
                List.of("https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80"),
                Map.of("Dosage", "25mg Zinc per capsule", "Count", "60 Capsules", "Form", "Vegetarian Capsules", "Supply", "2 Months"),
                sellerId, sellerName, storeName
        );

        // 6. Omega 3 60 Capsules - Price 80 TND
        upsertProduct(
                "Ultra Pure Omega-3 Fish Oil - 60 Capsules",
                "ultra-pure-omega-3-fish-oil-60-capsules",
                "Pharmaceutical grade wild deep-sea fish oil delivering high-concentration EPA (360mg) & DHA (240mg) per softgel for cardiovascular vitality, joint mobility, and brain health.",
                catVitamins.getId(),
                catVitamins.getName(),
                80.0,
                95.0,
                40,
                List.of("https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80"),
                Map.of("Count", "60 Softgels", "EPA", "360mg", "DHA", "240mg", "Type", "Molecularly Distilled", "Origin", "Norway"),
                sellerId, sellerName, storeName
        );

        // 7. Mass Gainer
        upsertProduct(
                "Hyper Mass Gainer Advanced Calorie Formula 3kg",
                "hyper-mass-gainer-advanced-calorie-formula-3kg",
                "High-density mass gainer providing 1,150 calories and 50g of multi-stage release protein per serving to power through hardgainer bulking phases and build dense muscular size.",
                catMass.getId(),
                catMass.getName(),
                160.0,
                185.0,
                25,
                List.of("https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=600&auto=format&fit=crop&q=80"),
                Map.of("Brand", "GymPilot Nutrition", "Weight", "3.0 kg", "Calories per Serving", "1150 kcal", "Protein", "50g", "Creatine Included", "3g"),
                sellerId, sellerName, storeName
        );
    }

    private void upsertProduct(String name, String slug, String description, String categoryId,
                               String categoryName, double price, Double originalPrice, int stock,
                               List<String> images, Map<String, String> specs,
                               String sellerId, String sellerName, String sellerStoreName) {
        Optional<Product> existing = productRepository.findBySlug(slug);
        if (existing.isPresent()) {
            Product p = existing.get();
            p.setName(name);
            p.setDescription(description);
            p.setCategoryId(categoryId);
            p.setCategoryName(categoryName);
            p.setPrice(price);
            p.setOriginalPrice(originalPrice);
            p.setStockQuantity(stock);
            p.setImages(images);
            p.setSpecs(specs);
            p.setSellerId(sellerId);
            p.setSellerName(sellerName);
            p.setSellerStoreName(sellerStoreName);
            p.setActive(true);
            productRepository.save(p);
            log.info("Updated seeded shop product: {} (Price: {} TND)", name, price);
        } else {
            Product p = new Product(name, slug, description, categoryId, categoryName, price, originalPrice,
                    stock, images, specs, sellerId, sellerName, sellerStoreName);
            p.setActive(true);
            p.setRating(5.0);
            p.setReviewCount(4);
            productRepository.save(p);
            log.info("Seeded new shop product: {} (Price: {} TND)", name, price);
        }
    }
}

