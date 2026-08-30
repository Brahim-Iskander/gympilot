package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import com.gymtrack.dto.ticket.CreateTicketRequest;
import com.gymtrack.dto.ticket.TicketReplyRequest;
import com.gymtrack.dto.ticket.TicketResponse;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.SupportTicketService;

import jakarta.validation.Valid;

/**
 * User-facing endpoints for support tickets.
 */
@RestController
@RequestMapping("/api/tickets")
public class SupportTicketController {

    private final SupportTicketService ticketService;
    private final UserRepository userRepository;

    public SupportTicketController(SupportTicketService ticketService, UserRepository userRepository) {
        this.ticketService = ticketService;
        this.userRepository = userRepository;
    }

    /** POST /api/tickets - Create a new ticket */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TicketResponse createTicket(@AuthenticationPrincipal UserDetails principal,
                                       @Valid @RequestBody CreateTicketRequest request) {
        User user = findUser(principal);
        return ticketService.createTicket(user, request);
    }

    /** GET /api/tickets - List user's own tickets */
    @GetMapping
    public List<TicketResponse> getMyTickets(@AuthenticationPrincipal UserDetails principal) {
        User user = findUser(principal);
        return ticketService.getUserTickets(user.getId());
    }

    /** GET /api/tickets/{id} - View a specific ticket */
    @GetMapping("/{id}")
    public TicketResponse getTicket(@AuthenticationPrincipal UserDetails principal,
                                     @PathVariable String id) {
        User user = findUser(principal);
        TicketResponse response = ticketService.getUserTicketById(id, user.getId());
        // Mark as read when user views
        ticketService.markReadByUser(id, user.getId());
        return response;
    }

    /** POST /api/tickets/{id}/reply - Reply to a ticket */
    @PostMapping("/{id}/reply")
    public TicketResponse reply(@AuthenticationPrincipal UserDetails principal,
                                 @PathVariable String id,
                                 @Valid @RequestBody TicketReplyRequest request) {
        User user = findUser(principal);
        return ticketService.userReply(id, user, request);
    }

    /** POST /api/tickets/{id}/close - Close a ticket */
    @PostMapping("/{id}/close")
    public TicketResponse close(@AuthenticationPrincipal UserDetails principal,
                                 @PathVariable String id) {
        User user = findUser(principal);
        return ticketService.userCloseTicket(id, user.getId());
    }

    /** POST /api/tickets/{id}/reopen - Reopen a closed ticket */
    @PostMapping("/{id}/reopen")
    public TicketResponse reopen(@AuthenticationPrincipal UserDetails principal,
                                  @PathVariable String id) {
        User user = findUser(principal);
        return ticketService.userReopenTicket(id, user.getId());
    }

    /** POST /api/tickets/{id}/read - Mark as read by user */
    @PostMapping("/{id}/read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markRead(@AuthenticationPrincipal UserDetails principal,
                          @PathVariable String id) {
        User user = findUser(principal);
        ticketService.markReadByUser(id, user.getId());
    }

    private User findUser(UserDetails principal) {
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
    }
}
