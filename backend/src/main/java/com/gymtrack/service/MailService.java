package com.gymtrack.service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;

/**
 * Service for sending HTML and transactional emails via Resend HTTP API (Port 443)
 * with graceful fallback to JavaMailSender (SMTP).
 */
@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender mailSender;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    @Value("${brevo.api-key:${BREVO_API_KEY:}}")
    private String brevoApiKey;

    @Value("${resend.api-key:${RESEND_API_KEY:}}")
    private String resendApiKey;

    @Value("${resend.from:${RESEND_FROM:GymPilot <onboarding@resend.dev>}}")
    private String resendFrom;

    @Value("${app.mail.from:gimpilot411@gmail.com}")
    private String fromAddress;

    @Value("${app.mail.from-name:GymPilot Support}")
    private String fromName;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private boolean hasBrevoApi() {
        return brevoApiKey != null && !brevoApiKey.isBlank();
    }

    private boolean hasResendApi() {
        return resendApiKey != null && !resendApiKey.isBlank();
    }

    private boolean sendViaBrevo(String to, String subject, String htmlBody) {
        try {
            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", fromName != null ? fromName : "GymPilot", "email", fromAddress),
                    "to", List.of(Map.of("email", to)),
                    "subject", subject,
                    "htmlContent", htmlBody
            );

            String jsonPayload = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.brevo.com/v3/smtp/email"))
                    .header("api-key", brevoApiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .header("User-Agent", "GymPilot/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent successfully via Brevo API (HTTP 443) to: {}", to);
                return true;
            } else {
                log.error("Brevo API error (HTTP {}): {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception ex) {
            log.error("Failed to send email via Brevo API to: {}", to, ex);
            return false;
        }
    }

    private boolean sendViaResend(String to, String subject, String htmlBody) {
        try {
            String from = (resendFrom != null && !resendFrom.isBlank()) ? resendFrom : "GymPilot <onboarding@resend.dev>";

            Map<String, Object> body = Map.of(
                    "from", from,
                    "to", List.of(to),
                    "subject", subject,
                    "html", htmlBody
            );

            String jsonPayload = objectMapper.writeValueAsString(body);

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create("https://api.resend.com/emails"))
                    .header("Authorization", "Bearer " + resendApiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("User-Agent", "GymPilot/1.0")
                    .timeout(Duration.ofSeconds(10))
                    .POST(HttpRequest.BodyPublishers.ofString(jsonPayload, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                log.info("Email sent successfully via Resend API (HTTP 443) to: {}", to);
                return true;
            } else {
                log.error("Resend API error (HTTP {}): {}", response.statusCode(), response.body());
                return false;
            }
        } catch (Exception ex) {
            log.error("Failed to send email via Resend API to: {}", to, ex);
            return false;
        }
    }

    /**
     * Sends a rich HTML password reset email to the given recipient.
     * Catches and logs any delivery errors so email failures don't crash user requests.
     *
     * @param to recipient email address
     * @param resetLink direct link with password reset token
     * @return true if email sent successfully, false otherwise
     */
    public boolean sendResetPasswordEmail(String to, String resetLink) {
        String subject = "Reset Your GymPilot Password";
        String htmlBody = buildResetPasswordHtml(resetLink);

        if (hasBrevoApi()) {
            boolean sent = sendViaBrevo(to, subject, htmlBody);
            if (sent) return true;
            log.warn("Brevo API failed, checking next provider...");
        }

        if (hasResendApi()) {
            boolean sent = sendViaResend(to, subject, htmlBody);
            if (sent) return true;
            log.warn("Resend API failed, falling back to SMTP...");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Password reset email sent successfully via SMTP to: {}", to);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send password reset email to: {}", to, ex);
            log.warn("=== [FALLBACK LOG] PASSWORD RESET LINK FOR [{}]: {} ===", to, resetLink);
            return false;
        }
    }

    /**
     * Builds a modern, responsive HTML email template for password reset.
     */
    private String buildResetPasswordHtml(String resetLink) {
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Reset Your Password</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F6F8; }
                .wrapper { width: 100%%; max-width: 600px; margin: 0 auto; padding: 40px 20px; box-sizing: border-box; }
                .card { background-color: #12151B; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .logo-text { font-size: 26px; font-weight: 900; color: #C6FF3E; letter-spacing: -0.5px; text-align: center; margin-bottom: 24px; }
                .title { font-size: 20px; font-weight: 700; color: #F4F6F8; margin-top: 0; margin-bottom: 16px; }
                .text { font-size: 15px; line-height: 1.6; color: #98A1AC; margin-bottom: 24px; }
                .btn-container { text-align: center; margin: 32px 0; }
                .btn { display: inline-block; background-color: #C6FF3E; color: #0A0C0F !important; font-weight: 800; font-size: 15px; text-decoration: none; padding: 14px 32px; border-radius: 10px; text-transform: none; }
                .notice-box { background-color: rgba(198,255,62,0.05); border-left: 3px solid #C6FF3E; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; }
                .notice-text { font-size: 13px; color: #C6FF3E; margin: 0; }
                .link-fallback { font-size: 12px; color: #64748B; word-break: break-all; margin-top: 24px; line-height: 1.4; }
                .link-fallback a { color: #8A7CFF; text-decoration: underline; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  <div class="logo-text">⚡ GymPilot</div>
                  <h1 class="title">Password Reset Request</h1>
                  <p class="text">
                    We received a request to reset the password for your GymPilot account.
                    Click the button below to choose a new password:
                  </p>
                  <div class="btn-container">
                    <a href="%s" class="btn" target="_blank">Reset Password</a>
                  </div>
                  <div class="notice-box">
                    <p class="notice-text">
                      ⏱️ <strong>Security Notice:</strong> This reset link is valid for <strong>30 minutes</strong> and can only be used once.
                    </p>
                  </div>
                  <p class="text" style="font-size: 13px; margin-bottom: 0;">
                    If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged and your account is secure.
                  </p>
                  <div class="link-fallback">
                    If the button above doesn't work, copy and paste this link into your browser:<br>
                    <a href="%s">%s</a>
                  </div>
                </div>
                <div class="footer">
                  © 2026 GymPilot. All rights reserved.<br>
                  Automated security message — please do not reply directly to this email.
                </div>
              </div>
            </body>
            </html>
            """.formatted(resetLink, resetLink, resetLink);
    }

    /**
     * Sends a 6-digit email verification OTP to the given recipient.
     *
     * @param to recipient email address
     * @param firstName recipient's first name
     * @param otpCode 6-digit numeric verification code
     * @return true if email sent successfully, false otherwise
     */
    public boolean sendOtpVerificationEmail(String to, String firstName, String otpCode) {
        String subject = otpCode + " is your GymPilot verification code";
        String htmlBody = buildOtpVerificationHtml(firstName, otpCode);

        if (hasBrevoApi()) {
            boolean sent = sendViaBrevo(to, subject, htmlBody);
            if (sent) return true;
            log.warn("Brevo API failed, checking next provider...");
        }

        if (hasResendApi()) {
            boolean sent = sendViaResend(to, subject, htmlBody);
            if (sent) return true;
            log.warn("Resend API failed, falling back to SMTP...");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("OTP verification email sent successfully via SMTP to: {}", to);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send OTP verification email to: {}", to, ex);
            log.warn("=== [FALLBACK LOG] EMAIL OTP CODE FOR [{}]: {} ===", to, otpCode);
            return false;
        }
    }

    /**
     * Builds a modern, responsive HTML email template with the 6-digit OTP code.
     */
    private String buildOtpVerificationHtml(String firstName, String otpCode) {
        String greeting = (firstName != null && !firstName.isBlank()) ? "Hi " + firstName + "," : "Welcome Athlete,";
        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Verify Your Email</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F6F8; }
                .wrapper { width: 100%%; max-width: 600px; margin: 0 auto; padding: 40px 20px; box-sizing: border-box; }
                .card { background-color: #12151B; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .logo-text { font-size: 26px; font-weight: 900; color: #C6FF3E; letter-spacing: -0.5px; text-align: center; margin-bottom: 24px; }
                .title { font-size: 22px; font-weight: 800; color: #F4F6F8; margin-top: 0; margin-bottom: 16px; text-align: center; }
                .text { font-size: 15px; line-height: 1.6; color: #98A1AC; margin-bottom: 24px; }
                .code-box { background: rgba(198, 255, 62, 0.08); border: 2px dashed #C6FF3E; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0; }
                .otp-code { font-size: 40px; font-weight: 900; color: #C6FF3E; letter-spacing: 10px; font-family: 'Courier New', Courier, monospace; display: block; margin: 0; }
                .code-subtext { font-size: 13px; color: #98A1AC; margin-top: 8px; }
                .notice-box { background-color: rgba(198,255,62,0.05); border-left: 3px solid #C6FF3E; border-radius: 6px; padding: 12px 16px; margin-bottom: 24px; }
                .notice-text { font-size: 13px; color: #C6FF3E; margin: 0; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  <div class="logo-text">⚡ GymPilot</div>
                  <h1 class="title">Verify Your Email Address</h1>
                  <p class="text">%s</p>
                  <p class="text">
                    Thank you for joining GymPilot! To complete your registration and unlock your customized fitness questionnaire, enter the 6-digit code below:
                  </p>
                  <div class="code-box">
                    <span class="otp-code">%s</span>
                    <div class="code-subtext">Enter this code on the verification screen</div>
                  </div>
                  <div class="notice-box">
                    <p class="notice-text">
                      ⏱️ <strong>Security Notice:</strong> This code expires in <strong>10 minutes</strong> and can only be used once. Never share this code with anyone.
                    </p>
                  </div>
                  <p class="text" style="font-size: 13px; margin-bottom: 0;">
                    If you didn't create a GymPilot account, you can safely ignore this email.
                  </p>
                </div>
                <div class="footer">
                  © 2026 GymPilot. All rights reserved.<br>
                  Automated security message — please do not reply directly to this email.
                </div>
              </div>
            </body>
            </html>
            """.formatted(greeting, otpCode);
    }
}
