package com.gymtrack.config;

import java.time.Instant;
import java.util.Optional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;

/**
 * Creates a dedicated super admin account (admin@gymtrack.com) on startup if it does not exist.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        // 1. Seed Admin Account
        String adminEmail = "admin@gymtrack.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        if (existingAdmin.isEmpty()) {
            User admin = new User(
                    "GymTrack",
                    "Admin",
                    adminEmail,
                    passwordEncoder.encode("AdminPassword123!")
            );
            admin.setRole("ADMIN");
            admin.setCreatedAt(Instant.now());
            userRepository.save(admin);
            log.info("Successfully created dedicated Admin account: {} / AdminPassword123!", adminEmail);
        } else {
            User admin = existingAdmin.get();
            if (!"ADMIN".equalsIgnoreCase(admin.getRole())) {
                admin.setRole("ADMIN");
                userRepository.save(admin);
                log.info("Promoted existing account {} to ADMIN role.", adminEmail);
            }
        }

        // 2. Seed Dedicated Coach Account
        String coachEmail = "coach@gymtrack.com";
        Optional<User> existingCoach = userRepository.findByEmail(coachEmail);
        if (existingCoach.isEmpty()) {
            User coach = new User(
                    "Coach",
                    "Alex",
                    coachEmail,
                    passwordEncoder.encode("CoachPassword123!")
            );
            coach.setRole("COACH");
            coach.setCreatedAt(Instant.now());
            userRepository.save(coach);
            log.info("Successfully created dedicated Coach account: {} / CoachPassword123!", coachEmail);
        } else {
            User coach = existingCoach.get();
            if (!"COACH".equalsIgnoreCase(coach.getRole())) {
                coach.setRole("COACH");
                userRepository.save(coach);
                log.info("Updated coach account {} to COACH role.", coachEmail);
            }
        }
    }
}
