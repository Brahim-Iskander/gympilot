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
        // 1. Seed / Update Dedicated Super Admin Account
        String adminEmail = "iskanderbrahim2024@gmail.com";
        Optional<User> existingAdmin = userRepository.findByEmail(adminEmail);
        if (existingAdmin.isEmpty()) {
            User admin = new User(
                    "Iskander",
                    "Brahim",
                    adminEmail,
                    passwordEncoder.encode("Topadmin2005")
            );
            admin.setRole("ADMIN");
            admin.setVerified(true);
            admin.setCreatedAt(Instant.now());
            userRepository.save(admin);
            log.info("Successfully created dedicated Admin account: {}", adminEmail);
        } else {
            User admin = existingAdmin.get();
            admin.setPassword(passwordEncoder.encode("Topadmin2005"));
            admin.setRole("ADMIN");
            admin.setVerified(true);
            userRepository.save(admin);
            log.info("Updated Admin account credentials and verified status for: {}", adminEmail);
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
            coach.setVerified(true);
            coach.setCreatedAt(Instant.now());
            userRepository.save(coach);
            log.info("Successfully created dedicated Coach account: {} / CoachPassword123!", coachEmail);
        } else {
            User coach = existingCoach.get();
            if (!"COACH".equalsIgnoreCase(coach.getRole()) || !coach.isVerified()) {
                coach.setRole("COACH");
                coach.setVerified(true);
                userRepository.save(coach);
                log.info("Updated coach account {} to COACH role and verified status.", coachEmail);
            }
        }

        // 3. Ensure legacy users created before OTP verification are not locked out
        try {
            userRepository.findAll().forEach(u -> {
                if (!u.isVerified() && (
                        "ADMIN".equalsIgnoreCase(u.getRole()) ||
                        "COACH".equalsIgnoreCase(u.getRole()) ||
                        "SELLER".equalsIgnoreCase(u.getRole()) ||
                        (u.getCreatedAt() != null && u.getCreatedAt().isBefore(Instant.parse("2026-09-02T00:00:00Z")))
                )) {
                    u.setVerified(true);
                    userRepository.save(u);
                    log.info("Auto-verified legacy user account: {}", u.getEmail());
                }
            });
        } catch (Exception ex) {
            log.warn("Could not check legacy users verification status: {}", ex.getMessage());
        }
    }
}
