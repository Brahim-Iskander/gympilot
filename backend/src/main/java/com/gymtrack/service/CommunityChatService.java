package com.gymtrack.service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.community.CommunityMessageResponse;
import com.gymtrack.model.CommunityMessage;
import com.gymtrack.model.User;
import com.gymtrack.repository.CommunityMessageRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class CommunityChatService {

    private static final Logger log = LoggerFactory.getLogger(CommunityChatService.class);

    private final CommunityMessageRepository communityMessageRepository;
    private final UserRepository userRepository;

    public CommunityChatService(CommunityMessageRepository communityMessageRepository, UserRepository userRepository) {
        this.communityMessageRepository = communityMessageRepository;
        this.userRepository = userRepository;
    }

    /**
     * Get messages from the last 24 hours (daily community chat).
     * Messages older than 24h are excluded from the response.
     */
    public List<CommunityMessageResponse> getRecentMessages() {
        Instant since = Instant.now().minus(24, ChronoUnit.HOURS);
        return communityMessageRepository.findByCreatedAtAfterOrderByCreatedAtAsc(since)
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

    /**
     * Scheduled cleanup: delete community messages older than 24 hours.
     * Runs every hour to keep the chat fresh and daily.
     */
    @Scheduled(fixedRate = 3600000) // every 1 hour (in milliseconds)
    public void purgeExpiredMessages() {
        Instant cutoff = Instant.now().minus(24, ChronoUnit.HOURS);
        communityMessageRepository.deleteByCreatedAtBefore(cutoff);
        log.info("Community chat cleanup: purged messages older than {}", cutoff);
    }
}
