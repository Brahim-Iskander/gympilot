package com.gymtrack.controller;

import java.util.List;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.payment.AdminPaymentMethodResponse;
import com.gymtrack.dto.payment.PaymentMethodResponse;
import com.gymtrack.dto.payment.UpdatePaymentMethodRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.PaymentConfigService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class PaymentMethodController {

    private final PaymentConfigService paymentConfigService;
    private final UserRepository userRepository;

    public PaymentMethodController(PaymentConfigService paymentConfigService, UserRepository userRepository) {
        this.paymentConfigService = paymentConfigService;
        this.userRepository = userRepository;
    }

    /**
     * Public endpoint: retrieve available payment methods filtered by user's detected country.
     * Example: /api/payments/methods?country=TN or /api/payments/methods?country=US
     */
    @GetMapping("/payments/methods")
    public List<PaymentMethodResponse> getActiveMethods(
            @RequestParam(required = false, defaultValue = "TN") String country) {
        return paymentConfigService.getActiveMethodsForCountry(country);
    }

    /**
     * Admin endpoint: retrieve all payment methods with global and regional toggles.
     */
    @GetMapping("/admin/payments/methods")
    public List<AdminPaymentMethodResponse> getAllAdminMethods() {
        return paymentConfigService.getAllMethodsForAdmin();
    }

    /**
     * Admin endpoint: update wallet address, recipient name, instructions, and regional toggles.
     */
    @PutMapping("/admin/payments/methods/{code}")
    public AdminPaymentMethodResponse updatePaymentMethod(
            @AuthenticationPrincipal UserDetails principal,
            @PathVariable String code,
            @Valid @RequestBody UpdatePaymentMethodRequest request) {
        User admin = findUser(principal);
        return paymentConfigService.updateMethod(code, request, admin);
    }

    private User findUser(UserDetails principal) {
        if (principal == null) {
            throw new InvalidCredentialsException("Authentication required.");
        }
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("User not found: " + principal.getUsername()));
    }
}
