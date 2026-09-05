package com.gymtrack.controller;

import java.security.Principal;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.AdminSellerOverviewResponse;
import com.gymtrack.dto.RecordPayoutRequest;
import com.gymtrack.dto.SellerEarningsDetailResponse;
import com.gymtrack.dto.UpdateSellerCommissionRequest;
import com.gymtrack.model.SellerPayout;
import com.gymtrack.model.User;
import com.gymtrack.service.SellerEarningsService;

import jakarta.validation.Valid;

/**
 * Admin controller for monitoring seller sales, revenues, commissions, and managing payouts.
 * Protected by Spring Security under /api/admin/** (ROLE_ADMIN only).
 */
@RestController
@RequestMapping("/api/admin/seller-earnings")
public class SellerEarningsAdminController {

    private final SellerEarningsService sellerEarningsService;

    public SellerEarningsAdminController(SellerEarningsService sellerEarningsService) {
        this.sellerEarningsService = sellerEarningsService;
    }

    /**
     * GET /api/admin/seller-earnings
     * Overview platform earnings metrics and list of all sellers with rankings and filters.
     */
    @GetMapping
    public AdminSellerOverviewResponse getOverview(
            @RequestParam(defaultValue = "all") String period,
            @RequestParam(defaultValue = "revenue_desc") String sort,
            @RequestParam(required = false) String search) {
        return sellerEarningsService.getOverview(period, sort, search);
    }

    /**
     * GET /api/admin/seller-earnings/{sellerId}
     * Deep dive details for a single seller: summary, products breakdown, order transactions, payout history.
     */
    @GetMapping("/{sellerId}")
    public SellerEarningsDetailResponse getSellerDetail(
            @PathVariable String sellerId,
            @RequestParam(defaultValue = "all") String period) {
        return sellerEarningsService.getSellerDetail(sellerId, period);
    }

    /**
     * POST /api/admin/seller-earnings/{sellerId}/payouts
     * Record a payout disbursement made to a seller.
     */
    @PostMapping("/{sellerId}/payouts")
    @ResponseStatus(HttpStatus.CREATED)
    public SellerPayout recordPayout(
            @PathVariable String sellerId,
            @Valid @RequestBody RecordPayoutRequest request,
            Principal principal) {
        String adminEmail = principal != null ? principal.getName() : "admin@gympilot.com";
        return sellerEarningsService.recordPayout(sellerId, request, adminEmail);
    }

    /**
     * PATCH /api/admin/seller-earnings/{sellerId}/commission
     * Update a seller's specific platform commission rate (%).
     */
    @PatchMapping("/{sellerId}/commission")
    public User updateSellerCommission(
            @PathVariable String sellerId,
            @Valid @RequestBody UpdateSellerCommissionRequest request) {
        return sellerEarningsService.updateCommissionRate(sellerId, request.commissionRate());
    }
}
