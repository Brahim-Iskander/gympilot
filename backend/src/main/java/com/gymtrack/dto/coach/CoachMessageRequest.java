package com.gymtrack.dto.coach;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CoachMessageRequest {

    @NotBlank(message = "Message content cannot be blank")
    @Size(max = 2000, message = "Message cannot exceed 2000 characters")
    private String message;

    public CoachMessageRequest() {
    }

    public CoachMessageRequest(String message) {
        this.message = message;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
