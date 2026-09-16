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
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymtrack.model.Order;
import com.gymtrack.model.OrderItem;

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

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    /**
     * Returns the absolute URL to the GymPilot logo hosted on the frontend.
     */
    private String getLogoUrl() {
        String base = (frontendUrl != null ? frontendUrl.replaceAll("/+$", "") : "https://gympilot.tn");
        return base + "/favicon1.png";
    }

    /**
     * Builds an HTML block with the GymPilot logo image + brand name for emails.
     */
    private String getLogoHtml() {
        return """
            <div style="text-align: center; margin-bottom: 24px;">
              <img src="%s" alt="GymPilot Logo" width="48" height="48" style="display: block; margin: 0 auto 8px auto; border-radius: 10px;" />
              <span style="font-size: 22px; font-weight: 900; letter-spacing: -0.5px;"><span style="color: #F4F6F8;">Gym</span><span style="color: #C6FF3E;">Pilot</span></span>
            </div>
            """.formatted(getLogoUrl());
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
     * Sends a rich HTML password reset email asynchronously to the given recipient.
     *
     * @param to recipient email address
     * @param resetLink direct link with password reset token
     */
    @Async("taskExecutor")
    public void sendResetPasswordEmail(String to, String resetLink) {
        String subject = "Reset Your GymPilot Password";
        String htmlBody = buildResetPasswordHtml(resetLink);

        if (hasBrevoApi()) {
            boolean sent = sendViaBrevo(to, subject, htmlBody);
            if (sent) return;
            log.warn("Brevo API failed, checking next provider...");
        }

        if (hasResendApi()) {
            boolean sent = sendViaResend(to, subject, htmlBody);
            if (sent) return;
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
        } catch (Exception ex) {
            log.error("Failed to send password reset email to: {}", to, ex);
            log.warn("=== [FALLBACK LOG] PASSWORD RESET LINK FOR [{}]: {} ===", to, resetLink);
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
                  """ + getLogoHtml() + """
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
                      <strong>Security Notice:</strong> This reset link is valid for <strong>30 minutes</strong> and can only be used once.
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
     * Sends a 6-digit email verification OTP asynchronously to the given recipient.
     *
     * @param to recipient email address
     * @param firstName recipient's first name
     * @param otpCode 6-digit numeric verification code
     */
    @Async("taskExecutor")
    public void sendOtpVerificationEmail(String to, String firstName, String otpCode) {
        String subject = otpCode + " is your GymPilot verification code";
        String htmlBody = buildOtpVerificationHtml(firstName, otpCode);

        if (hasBrevoApi()) {
            boolean sent = sendViaBrevo(to, subject, htmlBody);
            if (sent) return;
            log.warn("Brevo API failed, checking next provider...");
        }

        if (hasResendApi()) {
            boolean sent = sendViaResend(to, subject, htmlBody);
            if (sent) return;
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
        } catch (Exception ex) {
            log.error("Failed to send OTP verification email to: {}", to, ex);
            log.warn("=== [FALLBACK LOG] EMAIL OTP CODE FOR [{}]: {} ===", to, otpCode);
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
                  """ + getLogoHtml() + """
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
                      <strong>Security Notice:</strong> This code expires in <strong>10 minutes</strong> and can only be used once. Never share this code with anyone.
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

    /**
     * Sends a rich HTML order confirmation email asynchronously to the buyer after completing checkout.
     *
     * @param order the created Order object
     */
    @Async("taskExecutor")
    public void sendOrderConfirmationEmail(Order order) {
        if (order == null || order.getBuyerEmail() == null || order.getBuyerEmail().isBlank()) {
            log.warn("Cannot send order confirmation: missing buyer email or order");
            return;
        }

        String to = order.getBuyerEmail().trim();
        String subject = "Order Confirmed #" + order.getOrderNumber() + " — GymPilot Store";
        String htmlBody = buildOrderConfirmationHtml(order);

        if (hasBrevoApi()) {
            boolean sent = sendViaBrevo(to, subject, htmlBody);
            if (sent) return;
            log.warn("Brevo API failed for order confirmation, trying next provider...");
        }

        if (hasResendApi()) {
            boolean sent = sendViaResend(to, subject, htmlBody);
            if (sent) return;
            log.warn("Resend API failed for order confirmation, falling back to SMTP...");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Order confirmation email sent successfully via SMTP to: {}", to);
        } catch (Exception ex) {
            log.error("Failed to send order confirmation email via SMTP to: {}", to, ex);
            log.warn("=== [FALLBACK LOG] ORDER CONFIRMATION FOR [{}]: Order #{} Total {} TND ===",
                    to, order.getOrderNumber(), order.getTotalAmount());
        }
    }

    private String escapeHtml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;");
    }

    private String buildOrderConfirmationHtml(Order order) {
        String buyerName = order.getBuyerName() != null && !order.getBuyerName().isBlank()
                ? escapeHtml(order.getBuyerName()) : "Athlete";

        StringBuilder itemsRows = new StringBuilder();
        double itemsSubtotal = 0.0;

        if (order.getItems() != null) {
            for (OrderItem item : order.getItems()) {
                itemsSubtotal += item.getSubtotal();
                itemsRows.append("<tr>")
                    .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; color: #F4F6F8; font-weight: 600;\">")
                    .append(escapeHtml(item.getProductName())).append("</td>")
                    .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; text-align: center; color: #98A1AC;\">")
                    .append(item.getQuantity()).append("</td>")
                    .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; text-align: right; color: #98A1AC;\">")
                    .append(String.format("%.2f TND", item.getPrice())).append("</td>")
                    .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; text-align: right; color: #C6FF3E; font-weight: 700;\">")
                    .append(String.format("%.2f TND", item.getSubtotal())).append("</td>")
                    .append("</tr>");
            }
        }

        Map<String, String> addr = order.getShippingAddress() != null ? order.getShippingAddress() : Map.of();
        String shipName = escapeHtml(addr.getOrDefault("fullName", buyerName));
        String shipPhone = escapeHtml(addr.getOrDefault("phone", "Not provided"));
        String shipStreet = escapeHtml(addr.getOrDefault("address", ""));
        String shipCity = escapeHtml(addr.getOrDefault("city", ""));
        String shipPostal = escapeHtml(addr.getOrDefault("postalCode", ""));
        String shipCountry = escapeHtml(addr.getOrDefault("country", "Tunisia"));

        String deliveryFeeText = order.getShippingFee() <= 0
                ? "<span style=\"color: #C6FF3E; font-weight: 700;\">FREE (Order &ge; 150 TND)</span>"
                : String.format("%.2f TND", order.getShippingFee());

        String discountRow = "";
        if (order.getDiscountAmount() > 0) {
            discountRow = "<tr><td colspan=\"3\" style=\"padding: 8px 10px; text-align: right; color: #98A1AC; font-size: 14px;\">Points Discount:</td>"
                    + "<td style=\"padding: 8px 10px; text-align: right; color: #C6FF3E; font-weight: 700; font-size: 14px;\">-"
                    + String.format("%.2f TND", order.getDiscountAmount()) + "</td></tr>";
        }

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>Order Confirmation</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F6F8; }
                .wrapper { width: 100%%; max-width: 640px; margin: 0 auto; padding: 32px 16px; box-sizing: border-box; }
                .card { background-color: #12151B; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .title { font-size: 22px; font-weight: 800; color: #F4F6F8; margin-top: 0; margin-bottom: 8px; text-align: center; }
                .subtitle { font-size: 14px; color: #98A1AC; text-align: center; margin-bottom: 24px; }
                .order-badge { display: inline-block; background: rgba(198,255,62,0.12); color: #C6FF3E; border: 1px solid rgba(198,255,62,0.3); border-radius: 8px; padding: 6px 14px; font-weight: 800; font-size: 13px; margin-bottom: 20px; }
                .section-header { font-size: 15px; font-weight: 700; color: #C6FF3E; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 24px; margin-bottom: 12px; }
                table.order-table { width: 100%%; border-collapse: collapse; margin-bottom: 16px; }
                table.order-table th { font-size: 12px; text-transform: uppercase; color: #64748B; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.12); text-align: left; }
                .address-box { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; font-size: 14px; line-height: 1.6; color: #98A1AC; }
                .address-box strong { color: #F4F6F8; }
                .total-row td { padding: 14px 10px; border-top: 2px solid rgba(255,255,255,0.14); font-size: 16px; font-weight: 800; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  """ + getLogoHtml() + """
                  <h1 class="title">Thank You For Your Order!</h1>
                  <p class="subtitle">Hi %s, your order has been received and is being prepared.</p>

                  <div style="text-align: center;">
                    <span class="order-badge">Order Reference: #%s</span>
                  </div>

                  <div class="section-header">&#128230; Order Items</div>
                  <table class="order-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Price</th>
                        <th style="text-align: right;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      %s
                      <tr>
                        <td colspan="3" style="padding: 8px 10px; text-align: right; color: #98A1AC; font-size: 14px;">Items Subtotal:</td>
                        <td style="padding: 8px 10px; text-align: right; color: #F4F6F8; font-weight: 700; font-size: 14px;">%.2f TND</td>
                      </tr>
                      %s
                      <tr>
                        <td colspan="3" style="padding: 8px 10px; text-align: right; color: #98A1AC; font-size: 14px;">Delivery Fee:</td>
                        <td style="padding: 8px 10px; text-align: right; color: #F4F6F8; font-size: 14px;">%s</td>
                      </tr>
                      <tr class="total-row">
                        <td colspan="3" style="text-align: right; color: #F4F6F8;">Total Amount:</td>
                        <td style="text-align: right; color: #C6FF3E; font-size: 20px;">%.2f TND</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="section-header">&#128666; Delivery Details</div>
                  <div class="address-box">
                    <strong>Recipient:</strong> %s<br>
                    <strong>Phone:</strong> %s<br>
                    <strong>Address:</strong> %s, %s %s, %s<br>
                    <strong>Estimated Delivery:</strong> 2 &ndash; 4 Business Days (Express Courier)<br>
                    <strong>Payment Method:</strong> Cash on Delivery
                  </div>

                  <p style="font-size: 13px; color: #98A1AC; margin-top: 24px; line-height: 1.6;">
                    Our logistics partner will contact you via phone before arrival to ensure smooth handoff. You can pay cash directly to the delivery agent.
                  </p>
                </div>

                <div class="footer">
                  &copy; %d GymPilot. All rights reserved.<br>
                  Need assistance? Reply to this email or visit our Support Portal at support@gympilot.tn.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                buyerName,
                order.getOrderNumber(),
                itemsRows.toString(),
                itemsSubtotal,
                discountRow,
                deliveryFeeText,
                order.getTotalAmount(),
                shipName,
                shipPhone,
                shipStreet,
                shipCity,
                shipPostal,
                shipCountry,
                java.time.Year.now().getValue()
            );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Seller New-Order Notification
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Sends a rich HTML notification email to a seller when a new order containing
     * their products is placed. Only includes the line items belonging to that seller.
     *
     * @param order         the full order
     * @param sellerEmail   the seller's email address
     * @param sellerName    the seller's display name / store name
     * @param sellerItems   the subset of OrderItems belonging to this seller
     */
    @Async("taskExecutor")
    public void sendNewOrderNotificationToSeller(Order order, String sellerEmail,
                                                  String sellerName, List<OrderItem> sellerItems) {
        if (order == null || sellerEmail == null || sellerEmail.isBlank() || sellerItems == null || sellerItems.isEmpty()) {
            log.warn("Cannot send seller notification: missing data (sellerEmail={}, items={})",
                    sellerEmail, sellerItems != null ? sellerItems.size() : 0);
            return;
        }

        String to = sellerEmail.trim();
        String subject = "New Order Received #" + order.getOrderNumber() + " — GymPilot Marketplace";
        String htmlBody = buildSellerOrderNotificationHtml(order, sellerName, sellerItems);

        if (hasBrevoApi()) {
            boolean sent = sendViaBrevo(to, subject, htmlBody);
            if (sent) return;
            log.warn("Brevo API failed for seller order notification, trying next provider...");
        }

        if (hasResendApi()) {
            boolean sent = sendViaResend(to, subject, htmlBody);
            if (sent) return;
            log.warn("Resend API failed for seller order notification, falling back to SMTP...");
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Seller order notification email sent successfully via SMTP to: {}", to);
        } catch (Exception ex) {
            log.error("Failed to send seller order notification email via SMTP to: {}", to, ex);
            log.warn("=== [FALLBACK LOG] SELLER ORDER NOTIFICATION FOR [{}]: Order #{} ===",
                    to, order.getOrderNumber());
        }
    }

    /**
     * Builds a modern HTML email template notifying a seller about a new order.
     */
    private String buildSellerOrderNotificationHtml(Order order, String sellerName, List<OrderItem> sellerItems) {
        String safeSeller = escapeHtml(sellerName != null && !sellerName.isBlank() ? sellerName : "Seller");
        String safeBuyer = escapeHtml(order.getBuyerName() != null ? order.getBuyerName() : "Customer");

        StringBuilder itemsRows = new StringBuilder();
        double sellerSubtotal = 0.0;
        int totalUnits = 0;

        for (OrderItem item : sellerItems) {
            sellerSubtotal += item.getSubtotal();
            totalUnits += item.getQuantity();
            itemsRows.append("<tr>")
                .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; color: #F4F6F8; font-weight: 600;\">")
                .append(escapeHtml(item.getProductName())).append("</td>")
                .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; text-align: center; color: #98A1AC;\">")
                .append(item.getQuantity()).append("</td>")
                .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; text-align: right; color: #98A1AC;\">")
                .append(String.format("%.2f TND", item.getPrice())).append("</td>")
                .append("<td style=\"padding: 12px 10px; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: 14px; text-align: right; color: #C6FF3E; font-weight: 700;\">")
                .append(String.format("%.2f TND", item.getSubtotal())).append("</td>")
                .append("</tr>");
        }

        Map<String, String> addr = order.getShippingAddress() != null ? order.getShippingAddress() : Map.of();
        String shipName = escapeHtml(addr.getOrDefault("fullName", safeBuyer));
        String shipPhone = escapeHtml(addr.getOrDefault("phone", "Not provided"));
        String shipStreet = escapeHtml(addr.getOrDefault("address", ""));
        String shipCity = escapeHtml(addr.getOrDefault("city", ""));
        String shipPostal = escapeHtml(addr.getOrDefault("postalCode", ""));
        String shipCountry = escapeHtml(addr.getOrDefault("country", "Tunisia"));

        String paymentMethod = order.getPaymentMethod() != null ? order.getPaymentMethod() : "CASH_ON_DELIVERY";
        String paymentDisplay = switch (paymentMethod.toUpperCase()) {
            case "CREDIT_CARD" -> "Credit Card";
            case "PAYPAL" -> "PayPal";
            default -> "Cash on Delivery";
        };

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>New Order Notification</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F6F8; }
                .wrapper { width: 100%%; max-width: 640px; margin: 0 auto; padding: 32px 16px; box-sizing: border-box; }
                .card { background-color: #12151B; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px 28px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .title { font-size: 22px; font-weight: 800; color: #F4F6F8; margin-top: 0; margin-bottom: 8px; text-align: center; }
                .subtitle { font-size: 14px; color: #98A1AC; text-align: center; margin-bottom: 24px; }
                .order-badge { display: inline-block; background: rgba(198,255,62,0.12); color: #C6FF3E; border: 1px solid rgba(198,255,62,0.3); border-radius: 8px; padding: 6px 14px; font-weight: 800; font-size: 13px; margin-bottom: 20px; }
                .stats-row { display: flex; justify-content: center; gap: 16px; margin-bottom: 24px; }
                .stat-card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 14px 20px; text-align: center; flex: 1; max-width: 180px; }
                .stat-value { font-size: 22px; font-weight: 900; color: #C6FF3E; display: block; }
                .stat-label { font-size: 11px; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 4px; display: block; }
                .section-header { font-size: 15px; font-weight: 700; color: #C6FF3E; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 24px; margin-bottom: 12px; }
                table.order-table { width: 100%%; border-collapse: collapse; margin-bottom: 16px; }
                table.order-table th { font-size: 12px; text-transform: uppercase; color: #64748B; padding: 8px 10px; border-bottom: 1px solid rgba(255,255,255,0.12); text-align: left; }
                .info-box { background-color: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 16px; font-size: 14px; line-height: 1.6; color: #98A1AC; margin-bottom: 16px; }
                .info-box strong { color: #F4F6F8; }
                .total-row td { padding: 14px 10px; border-top: 2px solid rgba(255,255,255,0.14); font-size: 16px; font-weight: 800; }
                .action-notice { background: rgba(198,255,62,0.06); border-left: 3px solid #C6FF3E; border-radius: 6px; padding: 14px 18px; margin-top: 24px; }
                .action-notice p { font-size: 13px; color: #C6FF3E; margin: 0; line-height: 1.5; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; line-height: 1.6; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  """ + getLogoHtml() + """
                  <h1 class="title">New Order Received!</h1>
                  <p class="subtitle">Hi %s, a customer just placed an order containing your products.</p>

                  <div style="text-align: center;">
                    <span class="order-badge">Order #%s</span>
                  </div>

                  <table style="width: 100%%; border-collapse: collapse; margin-bottom: 20px;">
                    <tr>
                      <td style="text-align: center; padding: 10px;">
                        <div class="stat-card" style="display: inline-block;">
                          <span class="stat-value">%d</span>
                          <span class="stat-label">Items</span>
                        </div>
                      </td>
                      <td style="text-align: center; padding: 10px;">
                        <div class="stat-card" style="display: inline-block;">
                          <span class="stat-value">%.2f</span>
                          <span class="stat-label">Revenue (TND)</span>
                        </div>
                      </td>
                    </tr>
                  </table>

                  <div class="section-header">Your Items in This Order</div>
                  <table class="order-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th style="text-align: center;">Qty</th>
                        <th style="text-align: right;">Unit Price</th>
                        <th style="text-align: right;">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      %s
                      <tr class="total-row">
                        <td colspan="3" style="text-align: right; color: #F4F6F8;">Your Total:</td>
                        <td style="text-align: right; color: #C6FF3E; font-size: 20px;">%.2f TND</td>
                      </tr>
                    </tbody>
                  </table>

                  <div class="section-header">Customer Information</div>
                  <div class="info-box">
                    <strong>Name:</strong> %s<br>
                    <strong>Email:</strong> %s<br>
                    <strong>Payment:</strong> %s
                  </div>

                  <div class="section-header">Shipping Address</div>
                  <div class="info-box">
                    <strong>Recipient:</strong> %s<br>
                    <strong>Phone:</strong> %s<br>
                    <strong>Address:</strong> %s, %s %s, %s
                  </div>

                  <div class="action-notice">
                    <p>
                      <strong>Action Required:</strong> Please prepare and ship the items listed above.
                      You can manage this order from your <strong>Seller Dashboard</strong> on GymPilot.
                    </p>
                  </div>
                </div>

                <div class="footer">
                  &copy; %d GymPilot Marketplace. All rights reserved.<br>
                  This is an automated notification — please do not reply directly to this email.
                </div>
              </div>
            </body>
            </html>
            """.formatted(
                safeSeller,
                order.getOrderNumber(),
                totalUnits,
                sellerSubtotal,
                itemsRows.toString(),
                sellerSubtotal,
                safeBuyer,
                escapeHtml(order.getBuyerEmail()),
                paymentDisplay,
                shipName,
                shipPhone,
                shipStreet,
                shipCity,
                shipPostal,
                shipCountry,
                java.time.Year.now().getValue()
            );
    }

    // ──────────────────────────────────────────────────────────────────────────
    // Admin Bulk / Single Email
    // ──────────────────────────────────────────────────────────────────────────

    /**
     * Sends a single admin-composed email (text or HTML).
     * Plain-text bodies are automatically wrapped in the GymPilot branded template.
     *
     * @return true if the email was sent successfully via at least one provider
     */
    public boolean sendAdminEmail(String to, String subject, String body, boolean isHtml) {
        String htmlBody = isHtml ? body : wrapPlainTextInTemplate(body);

        if (hasBrevoApi()) {
            boolean sent = sendViaBrevo(to, subject, htmlBody);
            if (sent) return true;
            log.warn("Brevo API failed for admin email to {}, trying next provider...", to);
        }

        if (hasResendApi()) {
            boolean sent = sendViaResend(to, subject, htmlBody);
            if (sent) return true;
            log.warn("Resend API failed for admin email to {}, falling back to SMTP...", to);
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(new InternetAddress(fromAddress, fromName));
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Admin email sent successfully via SMTP to: {}", to);
            return true;
        } catch (Exception ex) {
            log.error("Failed to send admin email via SMTP to: {}", to, ex);
            return false;
        }
    }

    /**
     * Sends bulk admin emails asynchronously to a list of recipients.
     * Includes a 100ms delay between sends to prevent rate-limiting.
     *
     * @param recipients list of email addresses
     * @param subject    email subject
     * @param body       email content (text or HTML)
     * @param isHtml     whether the body is HTML
     */
    @Async("taskExecutor")
    public void sendBulkAdminEmail(List<String> recipients, String subject, String body, boolean isHtml) {
        log.info("Starting bulk admin email to {} recipients, subject: {}", recipients.size(), subject);
        int success = 0;
        int failed = 0;

        for (String to : recipients) {
            try {
                boolean sent = sendAdminEmail(to, subject, body, isHtml);
                if (sent) {
                    success++;
                } else {
                    failed++;
                }
                // Small delay between sends to avoid hitting provider rate limits
                Thread.sleep(100);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("Bulk email interrupted after {}/{} emails", success + failed, recipients.size());
                break;
            } catch (Exception ex) {
                failed++;
                log.error("Bulk email failed for recipient: {}", to, ex);
            }
        }

        log.info("Bulk admin email completed: {} sent, {} failed out of {} total",
                success, failed, recipients.size());
    }

    /**
     * Wraps a plain-text body in the GymPilot branded HTML email template.
     */
    private String wrapPlainTextInTemplate(String plainText) {
        // Escape HTML special chars and convert newlines to <br>
        String escaped = plainText
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("\n", "<br>");

        return """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <title>GymPilot</title>
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #F4F6F8; }
                .wrapper { width: 100%%; max-width: 600px; margin: 0 auto; padding: 40px 20px; box-sizing: border-box; }
                .card { background-color: #12151B; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 32px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); }
                .text { font-size: 15px; line-height: 1.7; color: #D1D5DB; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  """ + getLogoHtml() + """
                  <div class="text">%s</div>
                </div>
                <div class="footer">
                  &copy; %d GymPilot. All rights reserved.<br>
                  You are receiving this email because you have an account on GymPilot.
                </div>
              </div>
            </body>
            </html>
            """.formatted(escaped, java.time.Year.now().getValue());
    }

    /**
     * Sends confirmation that a D17 payment proof was received and is pending verification.
     */
    @Async
    public void sendD17PaymentProofReceived(String to, String userName, String referenceNumber, double amount, String type) {
        String subject = "Payment Proof Received — Ticket #" + referenceNumber + " (GymPilot D17)";
        String greeting = userName != null && !userName.isBlank() ? "Hi " + userName : "Hello";
        String typeLabel = "SUBSCRIPTION".equalsIgnoreCase(type) ? "Membership Subscription" : "Marketplace Order";

        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, sans-serif; color: #F4F6F8; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background-color: #12151B; border: 1px solid rgba(198,255,62,0.25); border-radius: 16px; padding: 36px 32px; }
                .badge { display: inline-block; padding: 6px 14px; background: rgba(198,255,62,0.12); color: #C6FF3E; border-radius: 8px; font-weight: 800; font-size: 13px; }
                .box { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 20px; margin: 24px 0; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  %s
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span class="badge">D17 PAYMENT PROOF RECEIVED</span>
                    <h2 style="font-size: 24px; font-weight: 800; margin: 16px 0 8px 0; color: #FFFFFF;">Verification in Progress</h2>
                    <p style="color: #94A3B8; font-size: 14px; margin: 0;">Ticket Reference: <strong style="color: #C6FF3E;">%s</strong></p>
                  </div>
                  <p style="font-size: 15px; color: #D1D5DB; line-height: 1.6;">%s,</p>
                  <p style="font-size: 15px; color: #D1D5DB; line-height: 1.6;">
                    We have successfully received your D17 payment screenshot proof for your <strong>%s</strong> in the amount of <strong style="color: #C6FF3E;">%.2f TND</strong>.
                  </p>
                  <div class="box">
                    <p style="margin: 0 0 8px 0; font-size: 14px; color: #94A3B8;"><strong>What happens next?</strong></p>
                    <p style="margin: 0; font-size: 14px; color: #E2E8F0; line-height: 1.6;">
                      Our finance &amp; operations team verifies manual D17 transfers within <strong>24 to 48 hours</strong>. Once confirmed, your subscription or order will be automatically activated and you will receive an instant confirmation.
                    </p>
                  </div>
                  <p style="font-size: 14px; color: #94A3B8; line-height: 1.6;">
                    You can track your support ticket conversation anytime by logging into your GymPilot account under <strong>Support Tickets</strong>.
                  </p>
                </div>
                <div class="footer">&copy; %d GymPilot Tunisia. All rights reserved.</div>
              </div>
            </body>
            </html>
            """;

        String html = template.formatted(getLogoHtml(), referenceNumber, greeting, typeLabel, amount, java.time.Year.now().getValue());
        sendAdminEmail(to, subject, html, true);
    }

    /**
     * Sends notification that D17 payment was approved and activated.
     */
    @Async
    public void sendD17PaymentApproved(String to, String userName, String referenceNumber, double amount, String type, String details) {
        String subject = "Payment Confirmed! Your " + ("SUBSCRIPTION".equalsIgnoreCase(type) ? "Subscription is Active" : "Order is Processing") + " (GymPilot D17)";
        String greeting = userName != null && !userName.isBlank() ? "Hi " + userName : "Hello";

        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, sans-serif; color: #F4F6F8; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background-color: #12151B; border: 1px solid #00E676; border-radius: 16px; padding: 36px 32px; }
                .badge { display: inline-block; padding: 6px 14px; background: rgba(0,230,118,0.15); color: #00E676; border-radius: 8px; font-weight: 800; font-size: 13px; }
                .box { background: rgba(0,230,118,0.06); border: 1px solid rgba(0,230,118,0.25); border-radius: 12px; padding: 20px; margin: 24px 0; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; }
                .btn { display: inline-block; background-color: #C6FF3E; color: #000000; font-weight: 800; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  %s
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span class="badge">PAYMENT CONFIRMED</span>
                    <h2 style="font-size: 24px; font-weight: 800; margin: 16px 0 8px 0; color: #FFFFFF;">Your D17 Payment Has Been Approved!</h2>
                    <p style="color: #94A3B8; font-size: 14px; margin: 0;">Ticket: <strong style="color: #00E676;">%s</strong></p>
                  </div>
                  <p style="font-size: 15px; color: #D1D5DB; line-height: 1.6;">%s,</p>
                  <p style="font-size: 15px; color: #D1D5DB; line-height: 1.6;">
                    Great news! Your manual D17 payment of <strong style="color: #00E676;">%.2f TND</strong> has been verified and confirmed by our team.
                  </p>
                  <div class="box">
                    <p style="margin: 0 0 6px 0; font-size: 14px; color: #00E676; font-weight: 700;">Status: ACTIVATED</p>
                    <p style="margin: 0; font-size: 14px; color: #E2E8F0; line-height: 1.6;">%s</p>
                  </div>
                  <div style="text-align: center;">
                    <a href="%s/dashboard" class="btn">Open GymPilot Dashboard</a>
                  </div>
                </div>
                <div class="footer">&copy; %d GymPilot Tunisia. All rights reserved.</div>
              </div>
            </body>
            </html>
            """;

        String html = template.formatted(getLogoHtml(), referenceNumber, greeting, amount,
                details != null ? details : "Your purchase is now fully active.",
                frontendUrl, java.time.Year.now().getValue());
        sendAdminEmail(to, subject, html, true);
    }

    /**
     * Sends notification when a D17 payment proof was rejected.
     */
    @Async
    public void sendD17PaymentRejected(String to, String userName, String referenceNumber, double amount, String reason) {
        String subject = "Action Required: D17 Payment Verification — Ticket #" + referenceNumber;
        String greeting = userName != null && !userName.isBlank() ? "Hi " + userName : "Hello";

        String template = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <style>
                body { margin: 0; padding: 0; background-color: #0A0C0F; font-family: 'Segoe UI', Roboto, sans-serif; color: #F4F6F8; }
                .wrapper { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                .card { background-color: #12151B; border: 1px solid #FF5252; border-radius: 16px; padding: 36px 32px; }
                .badge { display: inline-block; padding: 6px 14px; background: rgba(255,82,82,0.15); color: #FF5252; border-radius: 8px; font-weight: 800; font-size: 13px; }
                .box { background: rgba(255,82,82,0.06); border: 1px solid rgba(255,82,82,0.25); border-radius: 12px; padding: 20px; margin: 24px 0; }
                .footer { text-align: center; margin-top: 32px; font-size: 12px; color: #64748B; }
                .btn { display: inline-block; background-color: #FF5252; color: #FFFFFF; font-weight: 800; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px; }
              </style>
            </head>
            <body>
              <div class="wrapper">
                <div class="card">
                  %s
                  <div style="text-align: center; margin-bottom: 24px;">
                    <span class="badge">VERIFICATION UNSUCCESSFUL</span>
                    <h2 style="font-size: 24px; font-weight: 800; margin: 16px 0 8px 0; color: #FFFFFF;">Unable to Verify D17 Payment</h2>
                    <p style="color: #94A3B8; font-size: 14px; margin: 0;">Ticket: <strong style="color: #FF5252;">%s</strong></p>
                  </div>
                  <p style="font-size: 15px; color: #D1D5DB; line-height: 1.6;">%s,</p>
                  <p style="font-size: 15px; color: #D1D5DB; line-height: 1.6;">
                    Our team was unable to verify your D17 payment of <strong style="color: #FF5252;">%.2f TND</strong> for the following reason:
                  </p>
                  <div class="box">
                    <p style="margin: 0; font-size: 14px; color: #FFCDD2; line-height: 1.6;"><strong>Reason:</strong> %s</p>
                  </div>
                  <p style="font-size: 14px; color: #94A3B8; line-height: 1.6;">
                    Please reply directly to your support ticket with a clear, readable screenshot, or retry the payment flow. If you have questions, our support desk is ready to help.
                  </p>
                  <div style="text-align: center;">
                    <a href="%s/support" class="btn">View Ticket &amp; Reply</a>
                  </div>
                </div>
                <div class="footer">&copy; %d GymPilot Tunisia. All rights reserved.</div>
              </div>
            </body>
            </html>
            """;

        String html = template.formatted(getLogoHtml(), referenceNumber, greeting, amount,
                reason != null ? reason : "Payment details could not be matched.",
                frontendUrl, java.time.Year.now().getValue());
        sendAdminEmail(to, subject, html, true);
    }
}
