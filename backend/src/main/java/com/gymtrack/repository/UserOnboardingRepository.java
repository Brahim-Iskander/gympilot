package com.gymtrack.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.UserOnboarding;

public interface UserOnboardingRepository extends MongoRepository<UserOnboarding, String> {

    Optional<UserOnboarding> findByUserId(String userId);

    boolean existsByUserId(String userId);
}