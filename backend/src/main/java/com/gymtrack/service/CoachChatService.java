package com.gymtrack.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gymtrack.dto.coach.CoachConversationSummaryResponse;
import com.gymtrack.dto.coach.CoachMessageResponse;
import com.gymtrack.model.CoachMessage;
import com.gymtrack.model.User;
import com.gymtrack.model.UserOnboarding;
import com.gymtrack.repository.CoachMessageRepository;
import com.gymtrack.repository.UserOnboardingRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class CoachChatService {

    private final CoachMessageRepository coachMessageRepository;
    private final UserRepository userRepository;
    private final UserOnboardingRepository userOnboardingRepository;

    public CoachChatService(CoachMessageRepository coachMessageRepository,
                            UserRepository userRepository,
                            UserOnboardingRepository userOnboardingRepository) {
        this.coachMessageRepository = coachMessageRepository;
        this.userRepository = userRepository;
        this.userOnboardingRepository = userOnboardingRepository;
    }

    private User resolveUser(String userIdentifier) {
        if (userIdentifier == null || userIdentifier.isBlank()) return null;
        return userRepository.findByEmail(userIdentifier)
                .or(() -> userRepository.findById(userIdentifier))
                .orElse(null);
    }

    private void verifyActiveMembership(User user) {
        if (user == null || !user.hasActiveMembership()) {
            throw new org.springframework.security.access.AccessDeniedException("Active membership required for live coach chat.");
        }
    }

    /**
     * Get messages for the logged-in user and mark coach messages as read.
     */
    public List<CoachMessageResponse> getMessagesForUser(String userIdentifier) {
        User user = resolveUser(userIdentifier);
        verifyActiveMembership(user);
        String userId = user != null ? user.getId() : userIdentifier;

        List<CoachMessage> messages = coachMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);

        // Mark any unread messages from COACH as read
        boolean updated = false;
        for (CoachMessage msg : messages) {
            if ("COACH".equalsIgnoreCase(msg.getSenderRole()) && !msg.isReadByUser()) {
                msg.setReadByUser(true);
                updated = true;
            }
        }
        if (updated) {
            coachMessageRepository.saveAll(messages);
        }

        // If no messages exist yet, send a welcoming initial message from GymTrack staff
        if (messages.isEmpty()) {
            String fullName = user != null ? (user.getFirstName() + " " + user.getLastName()).trim() : "Athlete";
            String email = user != null ? user.getEmail() : "";

            CoachMessage welcomeMsg = new CoachMessage(
                    userId,
                    fullName,
                    email,
                    "COACH",
                    "GymTrack staff",
                    "Welcome " + fullName + "! 👋 We're the GymTrack staff. Feel free to ask us anything about your workout program, progressive overload, nutrition macros, or form cues. We're here to support your fitness journey!"
            );
            welcomeMsg.setReadByUser(true);
            CoachMessage saved = coachMessageRepository.save(welcomeMsg);
            messages.add(saved);
        }

        return messages.stream()
                .map(CoachMessageResponse::fromModel)
                .collect(Collectors.toList());
    }

    /**
     * User sends a message to the Coach team.
     */
    public CoachMessageResponse sendMessageFromUser(String userIdentifier, String messageText) {
        User user = resolveUser(userIdentifier);
        verifyActiveMembership(user);
        String userId = user != null ? user.getId() : userIdentifier;
        String fullName = user != null ? (user.getFirstName() + " " + user.getLastName()).trim() : "Athlete";
        String email = user != null ? user.getEmail() : "";

        CoachMessage message = new CoachMessage(
                userId,
                fullName,
                email,
                "USER",
                fullName,
                messageText.trim()
        );

        CoachMessage saved = coachMessageRepository.save(message);
        return CoachMessageResponse.fromModel(saved);
    }

    /**
     * Get unread message count for a regular user.
     */
    public long getUnreadCountForUser(String userIdentifier) {
        User user = resolveUser(userIdentifier);
        if (user == null || !user.hasActiveMembership()) {
            return 0L;
        }
        String userId = user.getId();
        return coachMessageRepository.countByUserIdAndSenderRoleAndIsReadByUserFalse(userId, "COACH");
    }

    /**
     * Get all active conversations for the coach/admin panel.
     */
    public List<CoachConversationSummaryResponse> getAllConversationsForCoach() {
        List<CoachMessage> allMessages = coachMessageRepository.findAll();

        // Group messages by userId
        Map<String, List<CoachMessage>> grouped = new HashMap<>();
        for (CoachMessage msg : allMessages) {
            if (msg.getUserId() != null) {
                grouped.computeIfAbsent(msg.getUserId(), k -> new ArrayList<>()).add(msg);
            }
        }

        List<CoachConversationSummaryResponse> summaries = new ArrayList<>();

        for (Map.Entry<String, List<CoachMessage>> entry : grouped.entrySet()) {
            String userId = entry.getKey();
            List<CoachMessage> userMsgs = entry.getValue();
            userMsgs.sort(Comparator.comparing(CoachMessage::getCreatedAt));

            CoachMessage lastMsg = userMsgs.get(userMsgs.size() - 1);
            long unreadCount = userMsgs.stream()
                    .filter(m -> "USER".equalsIgnoreCase(m.getSenderRole()) && !m.isReadByCoach())
                    .count();

            User user = userRepository.findById(userId).orElse(null);
            String fullName = user != null ? (user.getFirstName() + " " + user.getLastName()).trim() : lastMsg.getUserFullName();
            String email = user != null ? user.getEmail() : lastMsg.getUserEmail();

            CoachConversationSummaryResponse summary = new CoachConversationSummaryResponse();
            summary.setUserId(userId);
            summary.setUserFullName(fullName);
            summary.setUserEmail(email);
            summary.setLastMessage(lastMsg.getMessage());
            summary.setLastMessageAt(lastMsg.getCreatedAt());
            summary.setLastSenderRole(lastMsg.getSenderRole());
            summary.setUnreadCount(unreadCount);

            // Fetch user profile / onboarding for extra coach context
            Optional<UserOnboarding> onboardingOpt = userOnboardingRepository.findByUserId(userId);
            if (onboardingOpt.isPresent()) {
                UserOnboarding onboarding = onboardingOpt.get();
                summary.setGoal(onboarding.getGoal());
                summary.setWeightKg(onboarding.getWeightKg());
                summary.setExperienceLevel(onboarding.getExperienceLevel());
            }

            summaries.add(summary);
        }

        // Sort by most recent message first
        summaries.sort((a, b) -> {
            if (a.getLastMessageAt() == null) return 1;
            if (b.getLastMessageAt() == null) return -1;
            return b.getLastMessageAt().compareTo(a.getLastMessageAt());
        });

        return summaries;
    }

    /**
     * Coach views messages for a specific athlete and marks them as read.
     */
    public List<CoachMessageResponse> getMessagesForCoach(String userId) {
        List<CoachMessage> messages = coachMessageRepository.findByUserIdOrderByCreatedAtAsc(userId);

        boolean updated = false;
        for (CoachMessage msg : messages) {
            if ("USER".equalsIgnoreCase(msg.getSenderRole()) && !msg.isReadByCoach()) {
                msg.setReadByCoach(true);
                updated = true;
            }
        }
        if (updated) {
            coachMessageRepository.saveAll(messages);
        }

        return messages.stream()
                .map(CoachMessageResponse::fromModel)
                .collect(Collectors.toList());
    }

    /**
     * Coach / Admin sends a response to an athlete.
     */
    public CoachMessageResponse sendMessageFromCoach(String coachIdentifier, String targetUserId, String messageText) {
        User targetUser = resolveUser(targetUserId);
        String finalUserId = targetUser != null ? targetUser.getId() : targetUserId;
        String targetFullName = targetUser != null ? (targetUser.getFirstName() + " " + targetUser.getLastName()).trim() : "Athlete";
        String targetEmail = targetUser != null ? targetUser.getEmail() : "";

        User coachUser = resolveUser(coachIdentifier);
        String coachName = coachUser != null ? (coachUser.getFirstName() + " " + coachUser.getLastName()).trim() : "GymTrack staff";
        if (coachName.isBlank()) {
            coachName = "GymTrack staff";
        }

        CoachMessage message = new CoachMessage(
                finalUserId,
                targetFullName,
                targetEmail,
                "COACH",
                coachName,
                messageText.trim()
        );

        CoachMessage saved = coachMessageRepository.save(message);
        return CoachMessageResponse.fromModel(saved);
    }

    /**
     * Get total unread count from users for the coach dashboard badge.
     */
    public long getUnreadCountForCoach() {
        return coachMessageRepository.countBySenderRoleAndIsReadByCoachFalse("USER");
    }
}
