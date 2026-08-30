package com.gymtrack.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.SupportTicket;

/**
 * Repository for support tickets.
 */
public interface SupportTicketRepository extends MongoRepository<SupportTicket, String> {

    List<SupportTicket> findByUserIdOrderByUpdatedAtDesc(String userId);

    List<SupportTicket> findAllByOrderByUpdatedAtDesc();

    List<SupportTicket> findByStatusOrderByUpdatedAtDesc(String status);

    List<SupportTicket> findByStatusAndTopicOrderByUpdatedAtDesc(String status, String topic);

    List<SupportTicket> findByTopicOrderByUpdatedAtDesc(String topic);

    long countByUnreadByAdminTrue();

    long countByStatus(String status);
}
