package com.gymtrack.config;

import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.gymtrack.model.User;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.GhaithImporterService;

/**
 * Automatically seeds the Ghaith Nutrition store catalog into MongoDB Atlas
 * for the seller account iskander.skan05@gmail.com.
 */
@Component
@Order(4)
public class GhaithDataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(GhaithDataSeeder.class);

    private final GhaithImporterService ghaithImporterService;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    public GhaithDataSeeder(GhaithImporterService ghaithImporterService,
                            UserRepository userRepository,
                            ProductRepository productRepository) {
        this.ghaithImporterService = ghaithImporterService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
    }

    @Override
    public void run(String... args) {
        try {
            Optional<User> sellerOpt = userRepository.findByEmail("iskander.skan05@gmail.com");
            if (sellerOpt.isPresent() && productRepository.countBySellerId(sellerOpt.get().getId()) > 0) {
                log.info("GhaithDataSeeder: Products already seeded for seller iskander.skan05@gmail.com ({} found). Skipping auto-sync.",
                        productRepository.countBySellerId(sellerOpt.get().getId()));
                return;
            }
            int imported = ghaithImporterService.importProductsForSeller("iskander.skan05@gmail.com", "Topadmin2005");
            log.info("GhaithDataSeeder finished: {} products processed in MongoDB Atlas for iskander.skan05@gmail.com", imported);
        } catch (Exception e) {
            log.error("Error in GhaithDataSeeder", e);
        }
    }
}
