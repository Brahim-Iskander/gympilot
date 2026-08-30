package com.gymtrack.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gymtrack.dto.community.CommunityMessageResponse;
import com.gymtrack.model.CommunityMessage;
import com.gymtrack.model.User;
import com.gymtrack.repository.CommunityMessageRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class CommunityChatService {

    private final CommunityMessageRepository communityMessageRepository;
    private final UserRepository userRepository;

    public CommunityChatService(CommunityMessageRepository communityMessageRepository, UserRepository userRepository) {
        this.communityMessageRepository = communityMessageRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get recent messages from the community chat.
     */
    public List<CommunityMessageResponse> getRecentMessages() {
        return communityMessageRepository.findTop100ByOrderByCreatedAtAsc()
                .stream()
                .map(CommunityMessageResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Send a public message from an authenticated user.
     */
    public CommunityMessageResponse sendMessage(String userEmail, String messageText) {
        User user = userRepository.findByEmail(userEmail.trim().toLowerCase())
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userEmail));

        String fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        if (fullName.isEmpty()) {
            fullName = "Athlete";
        }

        CommunityMessage message = new CommunityMessage(
                user.getId(),
                fullName,
                user.getEmail(),
                user.getAvatar(),
                user.getRole(),
                messageText.trim()
        );

        CommunityMessage saved = communityMessageRepository.save(message);
        return CommunityMessageResponse.from(saved);
    }
}
