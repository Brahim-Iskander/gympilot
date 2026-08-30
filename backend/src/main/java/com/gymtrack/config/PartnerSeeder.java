package com.gymtrack.config;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.gymtrack.model.Partner;
import com.gymtrack.repository.PartnerRepository;

/**
 * Seeds initial default partners into MongoDB if the collection is empty.
 */
@Component
public class PartnerSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PartnerSeeder.class);

    private final PartnerRepository partnerRepository;

    public PartnerSeeder(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    @Override
    public void run(String... args) {
        if (partnerRepository.count() == 0) {
            List<Partner> defaultPartners = List.of(
                    new Partner("Gymshark", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=300&q=80", "Official Apparel & Fitness Gear", "https://www.gymshark.com"),
                    new Partner("Rogue Fitness", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=300&q=80", "Strength & Conditioning Equipment", "https://www.roguefitness.com"),
                    new Partner("Optimum Nutrition", "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&w=300&q=80", "Premium Protein & Supplements", "https://www.optimumnutrition.com"),
                    new Partner("Technogym", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=300&q=80", "Smart Gym Equipment & Hardware", "https://www.technogym.com"),
                    new Partner("MyProtein", "https://images.unsplash.com/photo-1593095948071-474c5cc2989d?auto=format&fit=crop&w=300&q=80", "Sports Nutrition & Activewear", "https://www.myprotein.com"),
                    new Partner("Hyperice", "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=300&q=80", "Performance Recovery & Tech", "https://www.hyperice.com")
            );
            partnerRepository.saveAll(defaultPartners);
            log.info("Seeded {} default partners.", defaultPartners.size());
        }
    }
}
