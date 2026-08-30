package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

import com.gymtrack.dto.AdminDashboardResponse;
import com.gymtrack.dto.AdminUserResponse;
import com.gymtrack.dto.AnalyticsChartResponse;
import com.gymtrack.dto.CreatePartnerRequest;
import com.gymtrack.dto.PagedResponse;
import com.gymtrack.model.Partner;
import com.gymtrack.service.AdminService;
import com.gymtrack.service.PartnerService;

import jakarta.validation.Valid;

/**
 * Controller for admin-only endpoints under /api/admin.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;
    private final PartnerService partnerService;

    public AdminController(AdminService adminService, PartnerService partnerService) {
        this.adminService = adminService;
        this.partnerService = partnerService;
    }

    /** GET /api/admin/dashboard - High-level metrics */
    @GetMapping("/dashboard")
    public AdminDashboardResponse getDashboardStats() {
        return adminService.getDashboardStats();
    }

    /** GET /api/admin/users - Search & paginate users */
    @GetMapping("/users")
    public PagedResponse<AdminUserResponse> getUsers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return adminService.getUsers(search, page, size);
    }

    /** GET /api/admin/users/{id} - Single user detail */
    @GetMapping("/users/{id}")
    public AdminUserResponse getUserById(@PathVariable String id) {
        return adminService.getUserById(id);
    }

    /** PATCH /api/admin/users/{id}/role - Update user role (USER, COACH, ADMIN) */
    @PatchMapping("/users/{id}/role")
    public AdminUserResponse updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        String role = body != null ? body.get("role") : null;
        return adminService.updateUserRole(id, role);
    }

    /** PATCH /api/admin/users/{id}/membership - Update user membership (tier & status) */
    @PatchMapping("/users/{id}/membership")
    public AdminUserResponse updateUserMembership(@PathVariable String id, @RequestBody com.gymtrack.dto.UpdateMembershipRequest request) {
        return adminService.updateUserMembership(id, request);
    }

    /** POST /api/admin/users/{id}/ban - Ban user account */
    @PostMapping("/users/{id}/ban")
    public AdminUserResponse banUser(@PathVariable String id) {
        return adminService.banUser(id);
    }

    /** POST /api/admin/users/{id}/unban - Unban user account */
    @PostMapping("/users/{id}/unban")
    public AdminUserResponse unbanUser(@PathVariable String id) {
        return adminService.unbanUser(id);
    }

    /** GET /api/admin/analytics/visitors - Visitor trend data */
    @GetMapping("/analytics/visitors")
    public AnalyticsChartResponse getVisitorAnalytics(
            @RequestParam(defaultValue = "daily") String period) {
        return adminService.getVisitorAnalytics(period);
    }

    /** GET /api/admin/analytics/registrations - New signups trend data */
    @GetMapping("/analytics/registrations")
    public AnalyticsChartResponse getRegistrationAnalytics(
            @RequestParam(defaultValue = "daily") String period) {
        return adminService.getRegistrationAnalytics(period);
    }

    /** GET /api/admin/partners - List partners */
    @GetMapping("/partners")
    public List<Partner> getPartners() {
        return partnerService.getAllPartners();
    }

    /** POST /api/admin/partners - Create a new partner */
    @PostMapping("/partners")
    @ResponseStatus(HttpStatus.CREATED)
    public Partner createPartner(@Valid @RequestBody CreatePartnerRequest request) {
        return partnerService.createPartner(request);
    }

    /** DELETE /api/admin/partners/{id} - Delete partner */
    @DeleteMapping("/partners/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePartner(@PathVariable String id) {
        partnerService.deletePartner(id);
    }
}
