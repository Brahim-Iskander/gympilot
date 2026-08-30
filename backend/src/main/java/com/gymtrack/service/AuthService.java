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
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.security.JwtService;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
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
