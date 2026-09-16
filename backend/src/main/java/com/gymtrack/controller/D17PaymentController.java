package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.payment.D17ConfigResponse;
import com.gymtrack.dto.payment.D17PaymentResponse;
import com.gymtrack.dto.payment.SubmitD17PaymentRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.D17PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments/d17")
public class D17PaymentController {

    private final D17PaymentService paymentService;
    private final UserRepository userRepository;

    public D17PaymentController(D17PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    /**
     * Public endpoint to get dynamic D17 payment parameters (phone number, recipient name, instructions).
     */
    @GetMapping("/config")
    public D17ConfigResponse getConfig() {
        return paymentService.getConfig();
    }

    /**
     * Submit payment proof for an order or subscription.
     */
    @PostMapping("/submit")
    @ResponseStatus(HttpStatus.CREATED)
    public D17PaymentResponse submitPayment(
            @AuthenticationPrincipal UserDetails principal,
            @Valid @RequestBody SubmitD17PaymentRequest request) {
        User user = findUser(principal);
        return paymentService.submitPayment(user, request);
    }

    /**
     * Get user's own submitted D17 payment tickets.
     */
    @GetMapping("/my-tickets")
    public List<D17PaymentResponse> getMyPayments(@AuthenticationPrincipal UserDetails principal) {
        User user = findUser(principal);
        return paymentService.getUserPayments(user.getId());
    }

    private User findUser(UserDetails principal) {
        if (principal == null) {
            throw new InvalidCredentialsException("Authentication required.");
        }
        return userRepository.findByEmail(principal.getUsername())
                .orElseThrow(() -> new InvalidCredentialsException("User not found: " + principal.getUsername()));
    }
}
