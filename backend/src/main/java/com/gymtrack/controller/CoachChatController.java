package com.gymtrack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.coach.CoachMessageRequest;
import com.gymtrack.dto.coach.CoachMessageResponse;
import com.gymtrack.service.CoachChatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/coach-chat")
public class CoachChatController {

    private final CoachChatService coachChatService;

    public CoachChatController(CoachChatService coachChatService) {
        this.coachChatService = coachChatService;
    }

    /**
     * Get all messages for the current authenticated user's conversation with coach.
     */
    @GetMapping("/messages")
    public ResponseEntity<List<CoachMessageResponse>> getMessages(Authentication authentication) {
        List<CoachMessageResponse> messages = coachChatService.getMessagesForUser(authentication.getName());
        return ResponseEntity.ok(messages);
    }

    /**
     * Send a message to the coach from the authenticated user.
     */
    @PostMapping("/messages")
    public ResponseEntity<CoachMessageResponse> sendMessage(
            Authentication authentication,
            @Valid @RequestBody CoachMessageRequest request) {
        CoachMessageResponse response = coachChatService.sendMessageFromUser(
                authentication.getName(),
                request.getMessage()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get unread messages count for the user.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getUnreadCount(Authentication authentication) {
        long count = coachChatService.getUnreadCountForUser(authentication.getName());
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
