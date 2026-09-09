package com.gymtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request DTO for admin mail sending.
 * If recipientEmail is null/blank, the mail is sent to ALL non-banned users (bulk).
 * If recipientEmail is provided, the mail is sent to that single address.
 */
public record SendMailRequest(

        @NotBlank(message = "Subject is required")
        @Size(max = 200, message = "Subject must be under 200 characters")
        String subject,

        @NotBlank(message = "Body is required")
        String body,

        /** true = body is HTML, false = plain text (will be wrapped in a branded template). */
        boolean isHtml,

        /** Optional: if set, send to this single email. If null/blank, send to ALL users. */
        String recipientEmail
) {
}
