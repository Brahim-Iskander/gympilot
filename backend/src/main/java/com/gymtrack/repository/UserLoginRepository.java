package com.gymtrack.repository;

import java.time.Instant;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.UserLogin;

public interface UserLoginRepository extends MongoRepository<UserLogin, String> {

    long countByLoggedAtAfter(Instant after);
}
