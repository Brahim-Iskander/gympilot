package com.gymtrack.util;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import org.junit.jupiter.api.Test;

class DisposableEmailValidatorTest {

    @Test
    void shouldDetectDirectDisposableDomains() {
        assertTrue(DisposableEmailValidator.isDisposable("test@tempmail.com"));
        assertTrue(DisposableEmailValidator.isDisposable("john@10minutemail.com"));
        assertTrue(DisposableEmailValidator.isDisposable("user@guerrillamail.com"));
        assertTrue(DisposableEmailValidator.isDisposable("user@yopmail.com"));
        assertTrue(DisposableEmailValidator.isDisposable("fake@mailinator.com"));
        assertTrue(DisposableEmailValidator.isDisposable("burn@trashmail.com"));
    }

    @Test
    void shouldDetectSubdomainsOfDisposableProviders() {
        assertTrue(DisposableEmailValidator.isDisposable("test@sub.mailinator.com"));
        assertTrue(DisposableEmailValidator.isDisposable("user@custom.yopmail.com"));
    }

    @Test
    void shouldAllowLegitimateEmails() {
        assertFalse(DisposableEmailValidator.isDisposable("iskander@gmail.com"));
        assertFalse(DisposableEmailValidator.isDisposable("user@outlook.com"));
        assertFalse(DisposableEmailValidator.isDisposable("work@yahoo.fr"));
        assertFalse(DisposableEmailValidator.isDisposable("student@university.edu"));
        assertFalse(DisposableEmailValidator.isDisposable("admin@gympilot.com"));
    }

    @Test
    void validateNotDisposableThrowsOnTempMail() {
        assertThrows(IllegalArgumentException.class, () -> 
            DisposableEmailValidator.validateNotDisposable("badactor@temp-mail.org")
        );
        assertDoesNotThrow(() -> 
            DisposableEmailValidator.validateNotDisposable("realuser@gmail.com")
        );
    }
}
