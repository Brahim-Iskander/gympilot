package com.gymtrack.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for creating a new support ticket.
 */
public class CreateTicketRequest {

    @NotBlank(message = "Subject is required")
    @Size(max = 200, message = "Subject must be 200 characters or less")
    private String subject;

    /** GENERAL, PAYMENT, MEMBERSHIP, TECHNICAL, COMPLAINT */
    private String topic = "GENERAL";

    @NotBlank(message = "Message is required")
    @Size(max = 5000, message = "Message must be 5000 characters or less")
    private String message;

    /** Optional Base64-encoded image data */
    private String imageBase64;

    /** Optional mime type: image/jpeg, image/png, etc. */
    private String imageType;

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getTopic() { return topic; }
    public void setTopic(String topic) { this.topic = topic; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }
}
