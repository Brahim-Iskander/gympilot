package com.gymtrack.exception;

/**
 * Thrown when a registration attempt uses an email that is already taken.
 * Mapped to HTTP 409 CONFLICT by {@link GlobalExceptionHandler}.
 */
public class EmailAlreadyExistsException extends RuntimeException {

    public EmailAlreadyExistsException() {
        super("An account with this email already exists.");
    }
}
