package com.gymtrack.controller;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.AuthResponse;
import com.gymtrack.dto.ChangePasswordRequest;
import com.gymtrack.dto.LoginRequest;
import com.gymtrack.dto.RegisterRequest;
import com.gymtrack.dto.UpdateProfileRequest;
import com.gymtrack.dto.UserResponse;
import com.gymtrack.service.AuthService;

import jakarta.validation.Valid;

/**
 * Authentication endpoints. Controllers stay thin - all logic lives in {@link AuthService}.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /** Public - creates an account and returns the first access token. */
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    /** Public - exchanges credentials for a JWT. */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Protected - returns the currently authenticated user (JWT required). */
    @GetMapping("/me")
    public UserResponse me(Authentication authentication) {
        return authService.getCurrentUser(authentication.getName());
    }

    /** Protected - updates first/last name. */
    @PostMapping("/profile")
    public UserResponse updateProfile(Authentication authentication,
                                      @Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(authentication.getName(), request);
    }

    /** Protected - changes password after verifying the current one. */
    @PostMapping("/password")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void changePassword(Authentication authentication,
                               @Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(authentication.getName(), request);
    }

    /** Public - generates a secure token and sends a password reset email via JavaMail. */
    @PostMapping("/forgot-password")
    public java.util.Map<String, String> forgotPassword(@Valid @RequestBody com.gymtrack.dto.ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    /** Public - validates a password reset token before displaying the reset form. */
    @GetMapping("/reset-password/validate")
    public com.gymtrack.dto.ValidateTokenResponse validateResetToken(@org.springframework.web.bind.annotation.RequestParam("token") String token) {
        return authService.validateResetToken(token);
    }

    /** Public - validates token and updates user password. */
    @PostMapping("/reset-password")
    public java.util.Map<String, String> resetPassword(@Valid @RequestBody com.gymtrack.dto.ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }
}
