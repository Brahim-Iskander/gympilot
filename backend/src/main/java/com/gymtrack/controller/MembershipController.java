package com.gymtrack.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.RedeemMembershipRequest;
import com.gymtrack.dto.UserResponse;
import com.gymtrack.service.MembershipService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/membership")
public class MembershipController {

    private final MembershipService membershipService;

    public MembershipController(MembershipService membershipService) {
        this.membershipService = membershipService;
    }

    /**
     * POST /api/membership/redeem-points
     * Redeems reward points for a 1-month Basic or Premium membership plan.
     */
    @PostMapping("/redeem-points")
    public UserResponse redeemPoints(@Valid @RequestBody RedeemMembershipRequest request, Principal principal) {
        return membershipService.redeemPlanWithPoints(principal.getName(), request);
    }
}
