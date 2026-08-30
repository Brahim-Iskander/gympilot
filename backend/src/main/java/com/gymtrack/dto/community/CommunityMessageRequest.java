package com.gymtrack.dto.community;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CommunityMessageRequest {

    @NotBlank(message = "Message text cannot be blank")
    @Size(max = 1000, message = "Message must not exceed 1000 characters")
    private String message;

    public CommunityMessageRequest() {
    }

    public CommunityMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
