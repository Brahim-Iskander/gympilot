package com.gymtrack.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

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

    public GhaithDataSeeder(GhaithImporterService ghaithImporterService) {
        this.ghaithImporterService = ghaithImporterService;
    }

    @Override
    public void run(String... args) {
        try {
            int imported = ghaithImporterService.importProductsForSeller("iskander.skan05@gmail.com", "Topadmin2005");
            log.info("GhaithDataSeeder finished: {} products processed in MongoDB Atlas for iskander.skan05@gmail.com", imported);
        } catch (Exception e) {
            log.error("Error in GhaithDataSeeder", e);
        }
    }
}
