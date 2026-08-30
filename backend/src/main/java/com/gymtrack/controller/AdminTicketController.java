package com.gymtrack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.gymtrack.dto.ticket.TicketReplyRequest;
import com.gymtrack.dto.ticket.TicketResponse;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.SupportTicketService;

import jakarta.validation.Valid;

/**
 * Admin-facing endpoints for support ticket triage and response management.
 */
@RestController
@RequestMapping("/api/admin/tickets")
public class AdminTicketController {

    private final SupportTicketService ticketService;
    private final UserRepository userRepository;

    public AdminTicketController(SupportTicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    /** GET /api/admin/tickets - Filterable list of all support tickets */
    @GetMapping
    public List<TicketResponse> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String topic) {
        return ticketService.getAllTickets(status, topic);
    }

    /** GET /api/admin/tickets/stats - Aggregate stats for admin dashboard */
    @GetMapping("/stats")
    public Map<String, Long> getTicketStats() {
        return ticketService.getTicketStats();
    }

    /** GET /api/admin/tickets/unread-count - Unread count for admin navbar badge */
    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount() {
        return Map.of("unreadCount", ticketService.getAdminUnreadCount());
    }

    /** GET /api/admin/tickets/{id} - View full conversation thread */
    @GetMapping("/{id}")
    public TicketResponse getTicketById(@PathVariable String id) {
        TicketResponse response = ticketService.getTicketById(id);
        ticketService.markReadByAdmin(id);
        return response;
    }

    /** POST /api/admin/tickets/{id}/reply - Reply as admin */
    @PostMapping("/{id}/reply")
    public TicketResponse reply(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String id,
            @Valid @RequestBody TicketReplyRequest request) {
        User admin = findUser(principal);
        return ticketService.adminReply(id, admin, request);
    }

    /** POST /api/admin/tickets/{id}/close - Close ticket */
    @PostMapping("/{id}/close")
    public TicketResponse close(@PathVariable String id) {
        return ticketService.adminCloseTicket(id);
    }

    /** POST /api/admin/tickets/{id}/reopen - Reopen ticket */
    @PostMapping("/{id}/reopen")
    public TicketResponse reopen(@PathVariable String id) {
        return ticketService.adminReopenTicket(id);
    }

    /** POST /api/admin/tickets/{id}/read - Mark ticket as read by admin */
    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@PathVariable String id) {
        ticketService.markReadByAdmin(id);
    }

    private User findUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
