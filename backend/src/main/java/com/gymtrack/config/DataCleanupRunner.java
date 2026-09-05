package com.gymtrack.config;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import com.gymtrack.model.Product;
import com.gymtrack.model.ProductPack;
import com.gymtrack.model.User;
import com.gymtrack.repository.ProductPackRepository;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.repository.UserRepository;

/**
 * Sanitizes large base64 image strings saved as sellerStoreLogo in MongoDB.
 * Only touches the sellerStoreLogo field — never touches user avatars or product images.
 * This prevents OutOfMemoryError and client timeouts from multi-MB JSON responses.
 */
@Component
@Order(0)
public class DataCleanupRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataCleanupRunner.class);
    private static final String DEFAULT_STORE_LOGO = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=200&auto=format&fit=crop&q=80";

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final ProductPackRepository productPackRepository;

    public DataCleanupRunner(UserRepository userRepository,
                             ProductRepository productRepository,
                             ProductPackRepository productPackRepository) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productPackRepository = productPackRepository;
    }

    @Override
    public void run(String... args) {
        log.info("Running DataCleanupRunner: sanitizing oversized sellerStoreLogo fields...");

        // 1. Sanitize User storeLogo only (NOT avatar)
        try {
            List<User> users = userRepository.findAll();
            for (User u : users) {
                if (isBase64Image(u.getStoreLogo())) {
                    log.info("Replacing base64 storeLogo for user: {}", u.getEmail());
                    u.setStoreLogo(DEFAULT_STORE_LOGO);
                    userRepository.save(u);
                }
            }
        } catch (Exception ex) {
            log.error("Failed to clean up user storeLogos: {}", ex.getMessage());
        }

        // 2. Sanitize Product sellerStoreLogo only (NOT product images)
        try {
            List<Product> products = productRepository.findAll();
            int cleaned = 0;
            for (Product p : products) {
                if (isBase64Image(p.getSellerStoreLogo())) {
                    p.setSellerStoreLogo(DEFAULT_STORE_LOGO);
                    productRepository.save(p);
                    cleaned++;
                }
            }
            if (cleaned > 0) {
                log.info("Cleaned base64 sellerStoreLogo from {} products.", cleaned);
            }
        } catch (Exception ex) {
            log.error("Failed to clean up product storeLogos: {}", ex.getMessage());
        }

        // 3. Sanitize ProductPack sellerStoreLogo only (NOT pack images)
        try {
            List<ProductPack> packs = productPackRepository.findAll();
            int cleaned = 0;
            for (ProductPack pack : packs) {
                if (isBase64Image(pack.getSellerStoreLogo())) {
                    pack.setSellerStoreLogo(DEFAULT_STORE_LOGO);
                    productPackRepository.save(pack);
                    cleaned++;
                }
            }
            if (cleaned > 0) {
                log.info("Cleaned base64 sellerStoreLogo from {} packs.", cleaned);
            }
        } catch (Exception ex) {
            log.error("Failed to clean up pack storeLogos: {}", ex.getMessage());
        }

        log.info("DataCleanupRunner finished.");
    }

    /** Only flags actual base64 data URIs — leaves normal URLs and null alone. */
    private boolean isBase64Image(String value) {
        return value != null && value.startsWith("data:image");
    }
}
