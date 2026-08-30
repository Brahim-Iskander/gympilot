package com.gymtrack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.coach.CoachConversationSummaryResponse;
import com.gymtrack.dto.coach.CoachMessageRequest;
import com.gymtrack.dto.coach.CoachMessageResponse;
import com.gymtrack.service.CoachChatService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/coach-chat")
public class AdminCoachChatController {

    private final CoachChatService coachChatService;

    public AdminCoachChatController(CoachChatService coachChatService) {
        this.coachChatService = coachChatService;
    }

    /**
     * List all user conversations for the coach desk.
     */
    @GetMapping("/conversations")
    public ResponseEntity<List<CoachConversationSummaryResponse>> getConversations() {
        List<CoachConversationSummaryResponse> conversations = coachChatService.getAllConversationsForCoach();
        return ResponseEntity.ok(conversations);
    }

    /**
     * Get all messages for a specific athlete conversation.
     */
    @GetMapping("/conversations/{userId}/messages")
    public ResponseEntity<List<CoachMessageResponse>> getConversationMessages(
            @PathVariable String userId) {
        List<CoachMessageResponse> messages = coachChatService.getMessagesForCoach(userId);
        return ResponseEntity.ok(messages);
    }

    /**
     * Send a response from the coach to an athlete.
     */
    @PostMapping("/conversations/{userId}/messages")
    public ResponseEntity<CoachMessageResponse> sendCoachMessage(
            @PathVariable String userId,
            Authentication authentication,
            @Valid @RequestBody CoachMessageRequest request) {
        CoachMessageResponse response = coachChatService.sendMessageFromCoach(
                authentication != null ? authentication.getName() : null,
                userId,
                request.getMessage()
        );
        return ResponseEntity.ok(response);
    }

    /**
     * Get total unread messages count for coach dashboard badge.
     */
    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Long>> getCoachUnreadCount() {
        long count = coachChatService.getUnreadCountForCoach();
        return ResponseEntity.ok(Map.of("unreadCount", count));
    }
}
