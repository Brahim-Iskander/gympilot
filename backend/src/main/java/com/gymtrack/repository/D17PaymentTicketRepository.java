package com.gymtrack.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.gymtrack.model.D17PaymentTicket;

@Repository
public interface D17PaymentTicketRepository extends MongoRepository<D17PaymentTicket, String> {

    List<D17PaymentTicket> findByUserIdOrderByCreatedAtDesc(String userId);

    List<D17PaymentTicket> findByStatusOrderByCreatedAtAsc(String status);

    List<D17PaymentTicket> findByStatus(String status, Sort sort);

    Optional<D17PaymentTicket> findByTicketNumber(String ticketNumber);

    Optional<D17PaymentTicket> findByOrderId(String orderId);

    Optional<D17PaymentTicket> findBySupportTicketId(String supportTicketId);

    // Duplicate submission check: check if user already has an active pending ticket for the same order or subscription tier
    boolean existsByUserIdAndOrderIdAndStatus(String userId, String orderId, String status);

    boolean existsByUserIdAndTypeAndSubscriptionTierAndStatus(String userId, String type, String subscriptionTier, String status);

    long countByStatus(String status);

    long countByStatusAndCreatedAtBefore(String status, Instant threshold);
}
