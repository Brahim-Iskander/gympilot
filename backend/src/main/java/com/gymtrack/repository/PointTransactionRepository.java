package com.gymtrack.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.gymtrack.model.PointTransaction;

@Repository
public interface PointTransactionRepository extends MongoRepository<PointTransaction, String> {

    List<PointTransaction> findByUserIdOrderByCreatedAtDesc(String userId);

    boolean existsByUserIdAndReasonAndRelatedUserId(String userId, String reason, String relatedUserId);
}
