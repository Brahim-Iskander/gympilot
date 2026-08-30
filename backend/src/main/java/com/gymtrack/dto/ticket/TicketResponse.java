package com.gymtrack.dto.ticket;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import com.gymtrack.model.SupportTicket;

/**
 * Response DTO for a support ticket including all messages.
 */
public record TicketResponse(
        String id,
        String userId,
        String userFullName,
        String userEmail,
        String subject,
        String topic,
        String status,
        String closedBy,
        boolean unreadByUser,
        boolean unreadByAdmin,
        int messageCount,
        Instant createdAt,
        Instant updatedAt,
        List<MessageResponse> messages) {

    public record MessageResponse(
            String id,
            String senderRole,
            String senderName,
            String message,
            String imageBase64,
            String imageType,
            Instant createdAt) {

        public static MessageResponse from(SupportTicket.TicketMessage msg) {
            return new MessageResponse(
                    msg.getId(),
                    msg.getSenderRole(),
                    msg.getSenderName(),
                    msg.getMessage(),
                    msg.getImageBase64(),
                    msg.getImageType(),
                    msg.getCreatedAt());
        }
    }

    public static TicketResponse from(SupportTicket ticket) {
        return new TicketResponse(
                ticket.getId(),
                ticket.getUserId(),
                ticket.getUserFullName(),
                ticket.getUserEmail(),
                ticket.getSubject(),
                ticket.getTopic(),
                ticket.getStatus(),
                ticket.getClosedBy(),
                ticket.isUnreadByUser(),
                ticket.isUnreadByAdmin(),
                ticket.getMessages() != null ? ticket.getMessages().size() : 0,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                ticket.getMessages() != null
                        ? ticket.getMessages().stream()
                                .map(MessageResponse::from)
                                .collect(Collectors.toList())
                        : List.of());
    }

    /** Lightweight version without message details (for list views) */
    public static TicketResponse summary(SupportTicket ticket) {
        String lastMessagePreview = "";
        if (ticket.getMessages() != null && !ticket.getMessages().isEmpty()) {
            String lastMsg = ticket.getMessages().get(ticket.getMessages().size() - 1).getMessage();
            lastMessagePreview = lastMsg != null && lastMsg.length() > 100
                    ? lastMsg.substring(0, 100) + "..."
                    : lastMsg;
        }

        return new TicketResponse(
                ticket.getId(),
                ticket.getUserId(),
                ticket.getUserFullName(),
                ticket.getUserEmail(),
                ticket.getSubject(),
                ticket.getTopic(),
                ticket.getStatus(),
                ticket.getClosedBy(),
                ticket.isUnreadByUser(),
                ticket.isUnreadByAdmin(),
                ticket.getMessages() != null ? ticket.getMessages().size() : 0,
                ticket.getCreatedAt(),
                ticket.getUpdatedAt(),
                List.of(new MessageResponse(null, null, null, lastMessagePreview, null, null, null)));
    }
}
