package com.gymtrack.repository;

import java.time.Instant;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.gymtrack.model.User;

/**
 * Spring Data MongoDB repository (no JPA).
 * Query methods are derived from method names.
 */
public interface UserRepository extends MongoRepository<User, String> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /** Search users by first name, last name, or email (case-insensitive partial match). */
    @Query("{ '$or': [ " +
            "{ 'firstName': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'lastName': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'email': { '$regex': ?0, '$options': 'i' } } " +
            "] }")
    Page<User> searchUsers(String query, Pageable pageable);

    /** Count users created after a given timestamp (for dashboard stats). */
    long countByCreatedAtAfter(Instant after);

    /** Count banned users. */
    long countByBannedTrue();

    long countByMembershipTier(String membershipTier);

    long countByMembershipStatus(String membershipStatus);

    long countByMembershipTierAndMembershipStatus(String membershipTier, String membershipStatus);
}
