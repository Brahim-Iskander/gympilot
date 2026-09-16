package com.gymtrack.controller;

import java.util.List;
import java.util.Map;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.payment.ApprovePaymentRequest;
import com.gymtrack.dto.payment.D17ConfigResponse;
import com.gymtrack.dto.payment.D17PaymentResponse;
import com.gymtrack.dto.payment.RejectPaymentRequest;
import com.gymtrack.dto.payment.UpdateD17ConfigRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.D17PaymentService;
import com.gymtrack.service.SystemSettingService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/payments/d17")
public class AdminD17PaymentController {

    private final D17PaymentService paymentService;
    private final SystemSettingService settingService;
    private final UserRepository userRepository;

    public AdminD17PaymentController(D17PaymentService paymentService,
                                     SystemSettingService settingService,
                                     UserRepository userRepository) {
        this.paymentService = paymentService;
        this.settingService = settingService;
        this.userRepository = userRepository;
    }

    /**
     * Filterable list of all D17 payments.
     */
    @GetMapping
    public List<D17PaymentResponse> getAllPayments(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "oldest") String sort) {
        return paymentService.getAdminPayments(status, search, sort);
    }

    /**
     * Dashboard statistics including SLA urgency metrics.
     */
    @GetMapping("/stats")
    public Map<String, Object> getPaymentStats() {
        return paymentService.getAdminStats();
    }

    /**
     * Approve a pending payment ticket.
     */
    @PostMapping("/{id}/approve")
    public D17PaymentResponse approvePayment(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String id,
            @RequestBody(required = false) ApprovePaymentRequest request) {
        User admin = findUser(principal);
        return paymentService.approvePayment(id, admin, request);
    }

    /**
     * Reject a pending payment ticket.
     */
    @PostMapping("/{id}/reject")
    public D17PaymentResponse rejectPayment(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String id,
            @Valid @RequestBody RejectPaymentRequest request) {
        User admin = findUser(principal);
        return paymentService.rejectPayment(id, admin, request);
    }

    /**
     * Update the D17 receiving phone number and instructions dynamically.
     */
    @PutMapping("/config")
    public D17ConfigResponse updateConfig(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody UpdateD17ConfigRequest request) {
        User admin = findUser(principal);

        settingService.setSetting(
                SystemSettingService.D17_PHONE_KEY,
                request.phoneNumber().trim(),
                "D17 Receiving Phone Number",
                "Mobile number for receiving customer D17 transfers",
                admin.getEmail()
        );

        if (request.recipientName() != null && !request.recipientName().isBlank()) {
            settingService.setSetting(
                    SystemSettingService.D17_RECIPIENT_KEY,
                    request.recipientName().trim(),
                    "D17 Recipient Name",
                    "Account holder display name shown to customers",
                    admin.getEmail()
            );
        }

        if (request.instructions() != null && !request.instructions().isBlank()) {
            settingService.setSetting(
                    SystemSettingService.D17_INSTRUCTIONS_KEY,
                    request.instructions().trim(),
                    "D17 Instructions",
                    "Step instructions shown to customer",
                    admin.getEmail()
            );
        }

        return paymentService.getConfig();
    }

    private User findUser(UserDetails principal) {
        if (principal == null) {
            throw new InvalidCredentialsException("Authentication required.");
        }
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("User not found: " + principal.getUsername()));
    }
}
