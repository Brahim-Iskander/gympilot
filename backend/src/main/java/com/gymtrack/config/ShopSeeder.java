package com.gymtrack.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.gymtrack.model.Category;
import com.gymtrack.model.Product;
import com.gymtrack.repository.CategoryRepository;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.UserRepository;

/**
 * Seeds store categories and cleans up any unowned/static sample products.
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
        cleanupStaticProducts();
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

    /**
     * Removes static or seeded sample products that are not owned by an actual registered seller.
     */
    public void cleanupStaticProducts() {
        List<Product> allProducts = productRepository.findAll();
        int deletedCount = 0;
        for (Product product : allProducts) {
            boolean isStatic = "gympilot-official".equals(product.getSellerId())
                    || "GymPilot Pro Shop".equals(product.getSellerStoreName())
                    || product.getSellerId() == null
                    || product.getSellerId().isBlank()
                    || !userRepository.existsById(product.getSellerId());

            if (isStatic) {
                productRepository.delete(product);
                deletedCount++;
                log.info("Deleted static/unowned product: {} (id: {})", product.getName(), product.getId());
            }
        }
        if (deletedCount > 0) {
            log.info("Cleaned up {} static/unowned products from marketplace", deletedCount);
        }
    }
}
