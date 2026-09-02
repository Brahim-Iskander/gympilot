package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.gymtrack.dto.AuthResponse;
import com.gymtrack.dto.RegisterRequest;
import com.gymtrack.dto.UserResponse;
import com.gymtrack.model.EmailOtp;
import com.gymtrack.model.User;
import com.gymtrack.repository.EmailOtpRepository;
import com.gymtrack.repository.PasswordResetTokenRepository;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.security.JwtService;

@ExtendWith(MockitoExtension.class)
class EmailOtpServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Mock
    private EmailOtpRepository emailOtpRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private MailService mailService;

    @Mock
    private ReferralService referralService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                passwordResetTokenRepository,
                emailOtpRepository,
                passwordEncoder,
                authenticationManager,
                jwtService,
                mailService,
                referralService);
    }

    @Test
    void testRegister_GeneratesHashedOtpAndSendsEmail() {
        RegisterRequest request = new RegisterRequest("Alex", "Rivera", "alex@example.com", "Secret123!", null);

        when(userRepository.existsByEmail("alex@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenAnswer(invocation -> "hashed_" + invocation.getArgument(0));
        when(referralService.generateUniqueReferralCode(any(User.class))).thenReturn("ALEX1234");
        when(jwtService.generateToken("alex@example.com")).thenReturn("mocked-jwt-token");

        User savedUser = new User("Alex", "Rivera", "alex@example.com", "hashed_password");
        savedUser.setId("user-1");
        savedUser.setVerified(false);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("mocked-jwt-token", response.token());
        assertFalse(response.user().isVerified(), "Newly registered user must have isVerified = false");

        // Verify EmailOtp was saved with expiration and hash
        ArgumentCaptor<EmailOtp> otpCaptor = ArgumentCaptor.forClass(EmailOtp.class);
        verify(emailOtpRepository).save(otpCaptor.capture());
        EmailOtp capturedOtp = otpCaptor.getValue();
        assertEquals("user-1", capturedOtp.getUserId());
        assertEquals("alex@example.com", capturedOtp.getEmail());
        assertTrue(capturedOtp.getCodeHash().startsWith("hashed_"));
        assertFalse(capturedOtp.isUsed());
        assertEquals(0, capturedOtp.getAttempts());
        assertTrue(capturedOtp.getExpiresAt().isAfter(Instant.now()));

        // Verify email was dispatched
        verify(mailService).sendOtpVerificationEmail(eq("alex@example.com"), eq("Alex"), anyString());
    }

    @Test
    void testVerifyOtp_ValidCode_MarksUserVerifiedAndOtpUsed() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("user-1");
        user.setVerified(false);

        EmailOtp otp = new EmailOtp("user-1", "alex@example.com", "hashed_code", Instant.now().plusSeconds(600));

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(emailOtpRepository.findTopByEmailOrderByCreatedAtDesc("alex@example.com")).thenReturn(Optional.of(otp));
        when(passwordEncoder.matches("482910", "hashed_code")).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponse result = authService.verifyOtp("alex@example.com", "482910");

        assertTrue(result.isVerified());
        assertTrue(user.isVerified());
        assertTrue(otp.isUsed());
        verify(userRepository).save(user);
        verify(emailOtpRepository).save(otp);
    }

    @Test
    void testVerifyOtp_AlreadyVerified_ReturnsUserDirectly() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("user-1");
        user.setVerified(true);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));

        UserResponse result = authService.verifyOtp("alex@example.com", "123456");

        assertTrue(result.isVerified());
        verify(emailOtpRepository, never()).findTopByEmailOrderByCreatedAtDesc(anyString());
    }

    @Test
    void testVerifyOtp_InvalidFormat_ThrowsException() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setVerified(false);
        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.verifyOtp("alex@example.com", "123"));
        assertTrue(ex.getMessage().contains("6 digits"));
    }

    @Test
    void testVerifyOtp_IncorrectCode_IncrementsAttemptsAndThrows() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("user-1");
        user.setVerified(false);

        EmailOtp otp = new EmailOtp("user-1", "alex@example.com", "hashed_code", Instant.now().plusSeconds(600));
        otp.setAttempts(1);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(emailOtpRepository.findTopByEmailOrderByCreatedAtDesc("alex@example.com")).thenReturn(Optional.of(otp));
        when(passwordEncoder.matches("999999", "hashed_code")).thenReturn(false);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.verifyOtp("alex@example.com", "999999"));

        assertTrue(ex.getMessage().contains("3 attempts remaining"));
        assertEquals(2, otp.getAttempts());
        assertFalse(user.isVerified());
        verify(emailOtpRepository).save(otp);
    }

    @Test
    void testVerifyOtp_MaxAttemptsLockout_ThrowsException() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("user-1");
        user.setVerified(false);

        EmailOtp otp = new EmailOtp("user-1", "alex@example.com", "hashed_code", Instant.now().plusSeconds(600));
        otp.setAttempts(5);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(emailOtpRepository.findTopByEmailOrderByCreatedAtDesc("alex@example.com")).thenReturn(Optional.of(otp));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.verifyOtp("alex@example.com", "123456"));

        assertTrue(ex.getMessage().contains("Maximum verification attempts exceeded"));
        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void testVerifyOtp_ExpiredOtp_ThrowsException() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("user-1");
        user.setVerified(false);

        EmailOtp otp = new EmailOtp("user-1", "alex@example.com", "hashed_code", Instant.now().minusSeconds(10));

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(emailOtpRepository.findTopByEmailOrderByCreatedAtDesc("alex@example.com")).thenReturn(Optional.of(otp));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.verifyOtp("alex@example.com", "123456"));

        assertTrue(ex.getMessage().contains("expired"));
    }

    @Test
    void testVerifyOtp_AlreadyUsedOtp_ThrowsException() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("user-1");
        user.setVerified(false);

        EmailOtp otp = new EmailOtp("user-1", "alex@example.com", "hashed_code", Instant.now().plusSeconds(600));
        otp.setUsed(true);

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(emailOtpRepository.findTopByEmailOrderByCreatedAtDesc("alex@example.com")).thenReturn(Optional.of(otp));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.verifyOtp("alex@example.com", "123456"));

        assertTrue(ex.getMessage().contains("already been used"));
    }

    @Test
    void testResendOtp_CooldownEnforced_ThrowsException() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setVerified(false);

        EmailOtp otp = new EmailOtp("user-1", "alex@example.com", "hashed_code", Instant.now().plusSeconds(600));
        otp.setLastResentAt(Instant.now().minusSeconds(30)); // only 30s ago

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(emailOtpRepository.findTopByEmailOrderByCreatedAtDesc("alex@example.com")).thenReturn(Optional.of(otp));

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                authService.resendOtp("alex@example.com"));

        assertTrue(ex.getMessage().contains("seconds before requesting another code"));
        verify(mailService, never()).sendOtpVerificationEmail(anyString(), anyString(), anyString());
    }

    @Test
    void testResendOtp_SuccessAfterCooldown_GeneratesNewOtpAndSendsEmail() {
        User user = new User("Alex", "Rivera", "alex@example.com", "pass");
        user.setId("user-1");
        user.setVerified(false);

        EmailOtp oldOtp = new EmailOtp("user-1", "alex@example.com", "old_hash", Instant.now().plusSeconds(300));
        oldOtp.setLastResentAt(Instant.now().minusSeconds(65)); // 65 seconds ago (cooldown passed)

        when(userRepository.findByEmail("alex@example.com")).thenReturn(Optional.of(user));
        when(emailOtpRepository.findTopByEmailOrderByCreatedAtDesc("alex@example.com")).thenReturn(Optional.of(oldOtp));
        when(passwordEncoder.encode(anyString())).thenReturn("new_hashed_otp");

        Map<String, String> response = authService.resendOtp("alex@example.com");

        assertTrue(response.containsKey("message"));
        assertTrue(oldOtp.isUsed(), "Old OTP should be invalidated on resend");

        // Verify new OTP was saved
        verify(emailOtpRepository).save(oldOtp); // saving oldOtp as used
        verify(emailOtpRepository, times(2)).save(any(EmailOtp.class)); // old + new
        verify(mailService).sendOtpVerificationEmail(eq("alex@example.com"), eq("Alex"), anyString());
    }
}
