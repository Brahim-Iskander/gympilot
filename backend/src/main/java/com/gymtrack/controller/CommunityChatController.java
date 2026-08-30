package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.community.CommunityMessageRequest;
import com.gymtrack.dto.community.CommunityMessageResponse;
import com.gymtrack.service.CommunityChatService;

import jakarta.validation.Valid;

/**
 * Community Public Chat endpoints — 100% free and open for all users to communicate.
 */
@RestController
@RequestMapping("/api/community-chat")
public class CommunityChatController {

    private final CommunityChatService communityChatService;

    public CommunityChatController(CommunityChatService communityChatService) {
        this.communityChatService = communityChatService;
    }

    /**
     * Get recent messages from the community chat room.
     */
    @GetMapping("/messages")
    public ResponseEntity<List<CommunityMessageResponse>> getMessages() {
        List<CommunityMessageResponse> messages = communityChatService.getRecentMessages();
        return ResponseEntity.ok(messages);
    }

    /**
     * Post a new message to the community chat room.
     */
    @PostMapping("/messages")
    public ResponseEntity<CommunityMessageResponse> sendMessage(
            Authentication authentication,
            @Valid @RequestBody CommunityMessageRequest request) {
        CommunityMessageResponse response = communityChatService.sendMessage(
                authentication.getName(),
                request.getMessage()
        );
        return ResponseEntity.ok(response);
    }
}
