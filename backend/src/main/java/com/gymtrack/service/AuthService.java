package com.gymtrack.service;

import java.time.Instant;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.AuthResponse;
import com.gymtrack.dto.ChangePasswordRequest;
import com.gymtrack.dto.LoginRequest;
import com.gymtrack.dto.RegisterRequest;
import com.gymtrack.dto.UpdateProfileRequest;
import com.gymtrack.dto.UserResponse;
import com.gymtrack.exception.EmailAlreadyExistsException;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.exception.InvalidPasswordException;
import com.gymtrack.model.PasswordResetToken;
import com.gymtrack.model.User;
import com.gymtrack.repository.PasswordResetTokenRepository;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.security.JwtService;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final MailService mailService;

    @org.springframework.beans.factory.annotation.Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    // Rate limiting map: tracks timestamps of password reset requests per email
    private final java.util.concurrent.ConcurrentHashMap<String, java.util.List<Instant>> rateLimitMap =
            new java.util.concurrent.ConcurrentHashMap<>();

    public AuthService(UserRepository userRepository,
                       PasswordResetTokenRepository passwordResetTokenRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService,
                       MailService mailService) {
        this.userRepository = userRepository;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.mailService = mailService;
    }

    public java.util.Map<String, String> forgotPassword(com.gymtrack.dto.ForgotPasswordRequest request) {
        String email = normalizeEmail(request.email());

        // Basic rate limiting: max 3 requests per 15 minutes per email
        checkRateLimit(email);

        java.util.Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // Invalidate/delete any previous unused reset tokens for this user
            try {
                passwordResetTokenRepository.deleteByUserEmail(email);
            } catch (Exception ex) {
                log.warn("Could not clean old reset tokens for {}: {}", email, ex.getMessage());
            }

            // Generate secure 30-minute token
            String token = java.util.UUID.randomUUID().toString();
            Instant expiryDate = Instant.now().plus(java.time.Duration.ofMinutes(30));

            PasswordResetToken resetToken = new PasswordResetToken(token, user.getEmail(), expiryDate);
            passwordResetTokenRepository.save(resetToken);

            String cleanFrontendUrl = (frontendUrl != null ? frontendUrl.replaceAll("/+$", "") : "http://localhost:5173");
            String resetLink = cleanFrontendUrl + "/reset-password?token=" + token;

            // Send rich HTML email via JavaMailSender (Brevo)
            mailService.sendResetPasswordEmail(user.getEmail(), resetLink);
        } else {
            log.info("Password reset requested for non-existent email: {}", email);
        }

        return java.util.Map.of(
                "message",
                "If an account with that email exists, we have sent a password reset link to your inbox."
        );
    }

    public com.gymtrack.dto.ValidateTokenResponse validateResetToken(String token) {
        if (token == null || token.isBlank()) {
            return new com.gymtrack.dto.ValidateTokenResponse(false, null, "Invalid or missing token.");
        }

        java.util.Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(token);
        if (tokenOpt.isEmpty() || tokenOpt.get().isUsed()) {
            return new com.gymtrack.dto.ValidateTokenResponse(false, null, "This password reset link is invalid or has already been used.");
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.isExpired()) {
            return new com.gymtrack.dto.ValidateTokenResponse(false, null, "This password reset link has expired. Please request a new one.");
        }

        return new com.gymtrack.dto.ValidateTokenResponse(true, resetToken.getUserEmail(), "Token is valid.");
    }

    public java.util.Map<String, String> resetPassword(com.gymtrack.dto.ResetPasswordRequest request) {
        String tokenStr = request.token();
        java.util.Optional<PasswordResetToken> tokenOpt = passwordResetTokenRepository.findByToken(tokenStr);

        if (tokenOpt.isEmpty() || tokenOpt.get().isUsed()) {
            throw new IllegalArgumentException("This password reset link is invalid or has already been used.");
        }

        PasswordResetToken resetToken = tokenOpt.get();
        if (resetToken.isExpired()) {
            throw new IllegalArgumentException("This password reset link has expired. Please request a new one.");
        }

        String email = resetToken.getUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("User associated with this token was not found."));

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        log.info("Successfully reset password for user: {}", email);

        return java.util.Map.of("message", "Your password has been successfully reset. You can now sign in.");
    }

    private void checkRateLimit(String email) {
        Instant now = Instant.now();
        Instant windowStart = now.minus(java.time.Duration.ofMinutes(15));

        rateLimitMap.compute(email, (key, timestamps) -> {
            if (timestamps == null) {
                java.util.List<Instant> list = new java.util.ArrayList<>();
                list.add(now);
                return list;
            }
            // Retain timestamps within the 15-minute window
            timestamps.removeIf(t -> t.isBefore(windowStart));
            if (timestamps.size() >= 3) {
                throw new IllegalArgumentException("Too many password reset requests. Please wait a few minutes before trying again.");
            }
            timestamps.add(now);
            return timestamps;
        });
    }

    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }

        User user = new User(
                request.firstName().trim(),
                request.lastName().trim(),
                email,
                passwordEncoder.encode(request.password()));

        User saved = userRepository.save(user);
        log.info("Registered new user: {}", saved);

        return new AuthResponse(jwtService.generateToken(saved.getEmail()), UserResponse.from(saved));
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalizeEmail(request.email());

        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (DisabledException ex) {
            throw new InvalidCredentialsException("This account has been banned.");
        } catch (BadCredentialsException ex) {
            // Same message for unknown email and wrong password - never leak which one failed.
            throw new InvalidCredentialsException();
        }

        User user = userRepository.findByEmail(email)
                .orElseThrow(InvalidCredentialsException::new);

        // Track last login time
        user.setLastLoginAt(Instant.now());
        userRepository.save(user);

        return new AuthResponse(jwtService.generateToken(user.getEmail()), UserResponse.from(user));
    }

    public UserResponse getCurrentUser(String email) {
        return UserResponse.from(requireUser(email));
    }

    public UserResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = requireUser(email);
        user.setFirstName(request.firstName().trim());
        user.setLastName(request.lastName().trim());
        if (request.avatar() != null) {
            user.setAvatar(request.avatar().isBlank() ? null : request.avatar());
        }
        User saved = userRepository.save(user);
        log.info("Updated profile for user: {}", saved.getEmail());
        return UserResponse.from(saved);
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        User user = requireUser(email);
        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new InvalidPasswordException();
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
        log.info("Password changed for user: {}", user.getEmail());
    }

    private User requireUser(String email) {
        return userRepository.findByEmail(normalizeEmail(email))
                .orElseThrow(InvalidCredentialsException::new);
    }

    /** Emails are always stored and compared lowercase + trimmed. */
    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
