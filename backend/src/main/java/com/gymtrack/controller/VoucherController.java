package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.VoucherDtos.CreateVoucherRequest;
import com.gymtrack.dto.VoucherDtos.ValidateVoucherRequest;
import com.gymtrack.dto.VoucherDtos.VoucherResponse;
import com.gymtrack.dto.VoucherDtos.VoucherValidationResponse;
import com.gymtrack.service.VoucherService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class VoucherController {

    private final VoucherService voucherService;

    public VoucherController(VoucherService voucherService) {
        this.voucherService = voucherService;
    }

    /**
     * Customer endpoint: validate a voucher code against cart amount.
     */
    @PostMapping("/vouchers/validate")
    public ResponseEntity<VoucherValidationResponse> validateVoucher(@Valid @RequestBody ValidateVoucherRequest request) {
        VoucherValidationResponse response = voucherService.validateVoucher(request.code(), request.orderAmount());
        return ResponseEntity.ok(response);
    }

    /**
     * Admin endpoint: list all vouchers.
     */
    @GetMapping("/admin/vouchers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<VoucherResponse>> getAllVouchers() {
        return ResponseEntity.ok(voucherService.getAllVouchers());
    }

    /**
     * Admin endpoint: create a new voucher.
     */
    @PostMapping("/admin/vouchers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherResponse> createVoucher(
            @Valid @RequestBody CreateVoucherRequest request,
            Authentication authentication
    ) {
        VoucherResponse created = voucherService.createVoucher(request, authentication.getName());
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Admin endpoint: toggle active state of a voucher.
     */
    @PatchMapping("/admin/vouchers/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<VoucherResponse> toggleVoucherActive(@PathVariable String id) {
        return ResponseEntity.ok(voucherService.toggleVoucherActive(id));
    }

    /**
     * Admin endpoint: delete a voucher.
     */
    @DeleteMapping("/admin/vouchers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteVoucher(@PathVariable String id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.noContent().build();
    }
}
