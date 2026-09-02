package com.gymtrack.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.gymtrack.model.EmailOtp;

@Repository
public interface EmailOtpRepository extends MongoRepository<EmailOtp, String> {

    Optional<EmailOtp> findTopByUserIdOrderByCreatedAtDesc(String userId);

    Optional<EmailOtp> findTopByEmailOrderByCreatedAtDesc(String email);

    void deleteByUserId(String userId);

    void deleteByEmail(String email);
}
