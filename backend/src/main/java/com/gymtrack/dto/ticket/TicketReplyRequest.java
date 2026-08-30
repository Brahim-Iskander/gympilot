package com.gymtrack.dto.ticket;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Request body for replying to a support ticket.
 */
public class TicketReplyRequest {

    @NotBlank(message = "Message is required")
    @Size(max = 5000, message = "Message must be 5000 characters or less")
    private String message;

    /** Optional Base64-encoded image data */
    private String imageBase64;

    /** Optional mime type: image/jpeg, image/png, etc. */
    private String imageType;

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getImageBase64() { return imageBase64; }
    public void setImageBase64(String imageBase64) { this.imageBase64 = imageBase64; }

    public String getImageType() { return imageType; }
    public void setImageType(String imageType) { this.imageType = imageType; }
}
