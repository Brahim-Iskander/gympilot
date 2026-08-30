package com.gymtrack.exception;

/**
 * Thrown when credentials are missing or wrong.
 * Mapped to HTTP 401 UNAUTHORIZED by {@link GlobalExceptionHandler}.
 */
public class InvalidCredentialsException extends RuntimeException {

    public InvalidCredentialsException() {
        super("Invalid email or password.");
    }

    public InvalidCredentialsException(String message) {
        super(message);
    }
}
