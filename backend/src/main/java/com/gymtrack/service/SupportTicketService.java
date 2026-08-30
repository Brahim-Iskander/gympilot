package com.gymtrack.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gymtrack.dto.ticket.CreateTicketRequest;
import com.gymtrack.dto.ticket.TicketReplyRequest;
import com.gymtrack.dto.ticket.TicketResponse;
import com.gymtrack.model.SupportTicket;
import com.gymtrack.model.User;
import com.gymtrack.repository.SupportTicketRepository;

/**
 * Business logic for the support ticket system.
 */
@Service
public class SupportTicketService {

    private final SupportTicketRepository ticketRepo;

    public SupportTicketService(SupportTicketRepository ticketRepo) {
        this.ticketRepo = ticketRepo;
    }

    // ===== USER OPERATIONS =====

    /** Create a new ticket with the first message */
    public TicketResponse createTicket(User user, CreateTicketRequest req) {
        validateImage(req.getImageBase64(), req.getImageType());

        SupportTicket ticket = new SupportTicket(
                user.getId(),
                user.getFirstName() + " " + user.getLastName(),
                user.getEmail(),
                req.getSubject(),
                req.getTopic(),
                req.getMessage(),
                req.getImageBase64(),
                req.getImageType());

        ticket = ticketRepo.save(ticket);
        return TicketResponse.from(ticket);
    }

    /** Get all tickets belonging to a user */
    public List<TicketResponse> getUserTickets(String userId) {
        return ticketRepo.findByUserIdOrderByUpdatedAtDesc(userId)
                .stream()
                .map(TicketResponse::summary)
                .collect(Collectors.toList());
    }

    /** Get a single ticket by ID (user must own it) */
    public TicketResponse getUserTicketById(String ticketId, String userId) {
        SupportTicket ticket = findTicketOrThrow(ticketId);

        if (!ticket.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You do not have access to this ticket.");
        }

        return TicketResponse.from(ticket);
    }

    /** User replies to their own ticket */
    public TicketResponse userReply(String ticketId, User user, TicketReplyRequest req) {
        validateImage(req.getImageBase64(), req.getImageType());

        SupportTicket ticket = findTicketOrThrow(ticketId);

        if (!ticket.getUserId().equals(user.getId())) {
            throw new IllegalArgumentException("You do not have access to this ticket.");
        }

        if ("CLOSED".equals(ticket.getStatus())) {
            throw new IllegalStateException("This ticket has been resolved and closed. No further messages can be sent.");
        }

        ticket.addReply("USER",
                user.getFirstName() + " " + user.getLastName(),
                req.getMessage(), req.getImageBase64(), req.getImageType());

        ticket = ticketRepo.save(ticket);
        return TicketResponse.from(ticket);
    }

    /** User closes their own ticket */
    public TicketResponse userCloseTicket(String ticketId, String userId) {
        SupportTicket ticket = findTicketOrThrow(ticketId);

        if (!ticket.getUserId().equals(userId)) {
            throw new IllegalArgumentException("You do not have access to this ticket.");
        }

        ticket.setStatus("CLOSED");
        ticket.setClosedBy("USER");
        ticket = ticketRepo.save(ticket);
        return TicketResponse.from(ticket);
    }

    /** User reopens their own ticket - DISABLED: tickets cannot be reopened once closed */
    public TicketResponse userReopenTicket(String ticketId, String userId) {
        throw new IllegalStateException("Resolved tickets cannot be reopened. Please open a new ticket.");
    }

    /** Mark ticket as read by the user */
    public void markReadByUser(String ticketId, String userId) {
        SupportTicket ticket = findTicketOrThrow(ticketId);
        if (ticket.getUserId().equals(userId)) {
            ticket.setUnreadByUser(false);
            ticketRepo.save(ticket);
        }
    }

    // ===== ADMIN OPERATIONS =====

    /** Get all tickets with optional status and topic filters */
    public List<TicketResponse> getAllTickets(String statusFilter, String topicFilter) {
        List<SupportTicket> tickets;

        boolean hasStatus = statusFilter != null && !statusFilter.isBlank();
        boolean hasTopic = topicFilter != null && !topicFilter.isBlank();

        if (hasStatus && hasTopic) {
            tickets = ticketRepo.findByStatusAndTopicOrderByUpdatedAtDesc(statusFilter.toUpperCase(), topicFilter.toUpperCase());
        } else if (hasStatus) {
            tickets = ticketRepo.findByStatusOrderByUpdatedAtDesc(statusFilter.toUpperCase());
        } else if (hasTopic) {
            tickets = ticketRepo.findByTopicOrderByUpdatedAtDesc(topicFilter.toUpperCase());
        } else {
            tickets = ticketRepo.findAllByOrderByUpdatedAtDesc();
        }

        return tickets.stream()
                .map(TicketResponse::summary)
                .collect(Collectors.toList());
    }

    /** Admin gets a single ticket by ID */
    public TicketResponse getTicketById(String ticketId) {
        return TicketResponse.from(findTicketOrThrow(ticketId));
    }

    /** Admin replies to a ticket */
    public TicketResponse adminReply(String ticketId, User admin, TicketReplyRequest req) {
        validateImage(req.getImageBase64(), req.getImageType());

        SupportTicket ticket = findTicketOrThrow(ticketId);

        if ("CLOSED".equals(ticket.getStatus())) {
            throw new IllegalStateException("This ticket has been marked as resolved and closed. No further messages can be sent.");
        }

        ticket.addReply("ADMIN",
                admin.getFirstName() + " " + admin.getLastName(),
                req.getMessage(), req.getImageBase64(), req.getImageType());

        // Mark as read by admin since they just replied
        ticket.setUnreadByAdmin(false);

        ticket = ticketRepo.save(ticket);
        return TicketResponse.from(ticket);
    }

    /** Admin closes a ticket */
    public TicketResponse adminCloseTicket(String ticketId) {
        SupportTicket ticket = findTicketOrThrow(ticketId);
        ticket.setStatus("CLOSED");
        ticket.setClosedBy("ADMIN");
        ticket = ticketRepo.save(ticket);
        return TicketResponse.from(ticket);
    }

    /** Admin reopens a ticket - DISABLED: tickets cannot be reopened once closed */
    public TicketResponse adminReopenTicket(String ticketId) {
        throw new IllegalStateException("Resolved tickets cannot be reopened. Please open a new ticket.");
    }

    /** Mark ticket as read by admin */
    public void markReadByAdmin(String ticketId) {
        SupportTicket ticket = findTicketOrThrow(ticketId);
        ticket.setUnreadByAdmin(false);
        ticketRepo.save(ticket);
    }

    /** Count of unread tickets for admin badge */
    public long getAdminUnreadCount() {
        return ticketRepo.countByUnreadByAdminTrue();
    }

    /** Ticket statistics for admin dashboard */
    public Map<String, Long> getTicketStats() {
        long openCount = ticketRepo.countByStatus("OPEN");
        long closedCount = ticketRepo.countByStatus("CLOSED");
        long unreadCount = ticketRepo.countByUnreadByAdminTrue();
        long totalCount = ticketRepo.count();

        return Map.of(
                "open", openCount,
                "closed", closedCount,
                "unread", unreadCount,
                "total", totalCount);
    }

    // ===== HELPERS =====

    private SupportTicket findTicketOrThrow(String ticketId) {
        return ticketRepo.findById(ticketId)
                .orElseThrow(() -> new IllegalArgumentException("Ticket not found: " + ticketId));
    }

    /** Validate image size (max ~2MB in Base64 ≈ 2.67M chars) and type */
    private void validateImage(String imageBase64, String imageType) {
        if (imageBase64 == null || imageBase64.isBlank()) return;

        // ~2MB file = ~2.67M Base64 chars
        if (imageBase64.length() > 2_800_000) {
            throw new IllegalArgumentException("Image size exceeds the 2MB limit.");
        }

        if (imageType == null || (!imageType.equals("image/jpeg")
                && !imageType.equals("image/png")
                && !imageType.equals("image/webp"))) {
            throw new IllegalArgumentException("Only JPEG, PNG, and WebP images are allowed.");
        }
    }
}
