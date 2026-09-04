package com.gymtrack.controller;

import java.security.Principal;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.OrderResponse;
import com.gymtrack.dto.PagedResponse;
import com.gymtrack.dto.ProductResponse;
import com.gymtrack.dto.SellerDashboardStatsResponse;
import com.gymtrack.dto.UpdateOrderStatusRequest;
import com.gymtrack.dto.UpdateStoreProfileRequest;
import com.gymtrack.dto.UserResponse;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.OrderService;
import com.gymtrack.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/seller")
public class SellerController {

    private final ProductService productService;
    private final OrderService orderService;
    private final UserRepository userRepository;
    private final com.gymtrack.repository.ProductRepository productRepository;
    private final com.gymtrack.repository.ProductPackRepository productPackRepository;

    public SellerController(ProductService productService,
                            OrderService orderService,
                            UserRepository userRepository,
                            com.gymtrack.repository.ProductRepository productRepository,
                            com.gymtrack.repository.ProductPackRepository productPackRepository) {
        this.productService = productService;
        this.orderService = orderService;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.productPackRepository = productPackRepository;
    }

    /** GET /api/seller/stats - Overview metrics for Seller Dashboard */
    @GetMapping("/stats")
    public SellerDashboardStatsResponse getStats(Principal principal) {
        return orderService.getSellerStats(principal.getName());
    }

    /** GET /api/seller/orders - List orders containing this seller's products */
    @GetMapping("/orders")
    public PagedResponse<OrderResponse> getSellerOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        return orderService.getSellerOrders(principal.getName(), page, size);
    }

    /** GET /api/seller/products - List products listed by this seller */
    @GetMapping("/products")
    public PagedResponse<ProductResponse> getSellerProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            Principal principal) {
        return productService.getSellerProducts(principal.getName(), page, size);
    }

    /** PATCH /api/seller/orders/{id}/status - Update fulfillment status */
    @PatchMapping("/orders/{id}/status")
    public OrderResponse updateOrderStatus(
            @PathVariable String id,
            @Valid @RequestBody UpdateOrderStatusRequest request,
            Principal principal) {
        return orderService.updateOrderStatus(id, request.status(), request.notes(), principal.getName(), false);
    }

    /** PATCH /api/seller/profile - Update store name and bio */
    @PatchMapping("/profile")
    public UserResponse updateStoreProfile(
            @RequestBody UpdateStoreProfileRequest request,
            Principal principal) {
        User user = userRepository.findByEmail(principal.getName())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (!user.isSeller() && !user.isAdmin()) {
            throw new IllegalArgumentException("User does not hold the Seller capability.");
        }

        if (request.storeName() != null && !request.storeName().isBlank()) {
            user.setStoreName(request.storeName().trim());
        }
        if (request.storeBio() != null) {
            user.setStoreBio(request.storeBio().trim());
        }
        if (request.storeLogo() != null) {
            user.setStoreLogo(request.storeLogo().trim());
        }

        User saved = userRepository.save(user);

        // Synchronize store branding across all products owned by this seller
        java.util.List<com.gymtrack.model.Product> sellerProducts = productRepository.findBySellerId(saved.getId());
        if (!sellerProducts.isEmpty()) {
            for (com.gymtrack.model.Product p : sellerProducts) {
                if (saved.getStoreName() != null && !saved.getStoreName().isBlank()) {
                    p.setSellerStoreName(saved.getStoreName());
                }
                p.setSellerStoreLogo(saved.getStoreLogo());
            }
            productRepository.saveAll(sellerProducts);
        }

        // Synchronize store branding across all product packs owned by this seller
        java.util.List<com.gymtrack.model.ProductPack> sellerPacks = productPackRepository.findBySellerIdOrderByCreatedAtDesc(saved.getId());
        if (!sellerPacks.isEmpty()) {
            for (com.gymtrack.model.ProductPack pack : sellerPacks) {
                if (saved.getStoreName() != null && !saved.getStoreName().isBlank()) {
                    pack.setSellerStoreName(saved.getStoreName());
                }
                pack.setSellerStoreLogo(saved.getStoreLogo());
            }
            productPackRepository.saveAll(sellerPacks);
        }

        return UserResponse.from(saved);
    }
}
