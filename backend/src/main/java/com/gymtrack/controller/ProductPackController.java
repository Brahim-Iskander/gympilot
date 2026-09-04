package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.pack.ProductPackDtos.PackRequestDto;
import com.gymtrack.model.ProductPack;
import com.gymtrack.service.ProductPackService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class ProductPackController {

    private final ProductPackService productPackService;

    public ProductPackController(ProductPackService productPackService) {
        this.productPackService = productPackService;
    }

    /**
     * Public endpoint: retrieve all active special offer packs for Shop and Home.
     */
    @GetMapping("/packs")
    public ResponseEntity<List<ProductPack>> getActivePacks() {
        return ResponseEntity.ok(productPackService.getActivePacks());
    }

    /**
     * Public endpoint: retrieve featured special offer packs.
     */
    @GetMapping("/packs/featured")
    public ResponseEntity<List<ProductPack>> getFeaturedPacks() {
        return ResponseEntity.ok(productPackService.getFeaturedPacks());
    }

    /**
     * Public endpoint: get pack by ID or slug.
     */
    @GetMapping("/packs/{identifier}")
    public ResponseEntity<ProductPack> getPackByIdOrSlug(@PathVariable String identifier) {
        return productPackService.getPackById(identifier)
                .or(() -> productPackService.getPackBySlug(identifier))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // ADMIN CRUD ENDPOINTS
    // ==========================================

    /**
     * Admin: list all packs (including inactive).
     */
    @GetMapping("/admin/packs")
    public ResponseEntity<List<ProductPack>> getAllPacksForAdmin() {
        return ResponseEntity.ok(productPackService.getAllPacks(false));
    }

    /**
     * Admin: create new product pack / offer.
     */
    @PostMapping("/admin/packs")
    public ResponseEntity<ProductPack> createPack(@Valid @RequestBody PackRequestDto dto) {
        ProductPack created = productPackService.createPack(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * Admin: update existing pack / offer.
     */
    @PutMapping("/admin/packs/{id}")
    public ResponseEntity<ProductPack> updatePack(
            @PathVariable String id,
            @Valid @RequestBody PackRequestDto dto
    ) {
        ProductPack updated = productPackService.updatePack(id, dto);
        return ResponseEntity.ok(updated);
    }

    /**
     * Admin: delete pack / offer.
     */
    @DeleteMapping("/admin/packs/{id}")
    public ResponseEntity<Void> deletePack(@PathVariable String id) {
        productPackService.deletePack(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Admin: toggle active status.
     */
    @PatchMapping("/admin/packs/{id}/toggle-active")
    public ResponseEntity<ProductPack> toggleActive(@PathVariable String id) {
        return ResponseEntity.ok(productPackService.toggleActive(id));
    }

    /**
     * Admin: toggle featured status.
     */
    @PatchMapping("/admin/packs/{id}/toggle-featured")
    public ResponseEntity<ProductPack> toggleFeatured(@PathVariable String id) {
        return ResponseEntity.ok(productPackService.toggleFeatured(id));
    }
}
