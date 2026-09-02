package com.gymtrack.controller;

import java.security.Principal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.CreateProductRequest;
import com.gymtrack.dto.PagedResponse;
import com.gymtrack.dto.ProductResponse;
import com.gymtrack.dto.UpdateProductRequest;
import com.gymtrack.service.ProductService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    /** GET /api/products - Search & filter catalog */
    @GetMapping
    public PagedResponse<ProductResponse> getProducts(
            @RequestParam(required = false) String categoryId,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {
        return productService.getActiveProducts(categoryId, search, sort, page, size);
    }

    /** GET /api/products/featured - Featured storefront picks */
    @GetMapping("/featured")
    public List<ProductResponse> getFeaturedProducts() {
        return productService.getFeaturedProducts();
    }

    /** GET /api/products/bestsellers - Best selling products */
    @GetMapping("/bestsellers")
    public List<ProductResponse> getBestSellers() {
        return productService.getBestSellers();
    }

    /** GET /api/products/{id} - Single product detail */
    @GetMapping("/{id}")
    public ProductResponse getProductById(@PathVariable String id) {
        return productService.getProductById(id);
    }

    /** GET /api/products/{id}/related - Related category recommendations */
    @GetMapping("/{id}/related")
    public List<ProductResponse> getRelatedProducts(
            @PathVariable String id,
            @RequestParam(defaultValue = "4") int limit) {
        return productService.getRelatedProducts(id, limit);
    }

    /** POST /api/products - Create product (Seller / Admin only) */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProductResponse createProduct(
            @Valid @RequestBody CreateProductRequest request,
            Principal principal) {
        return productService.createProduct(request, principal.getName());
    }

    /** PUT /api/products/{id} - Update product */
    @PutMapping("/{id}")
    public ProductResponse updateProduct(
            @PathVariable String id,
            @RequestBody UpdateProductRequest request,
            Principal principal) {
        // Will be verified in service whether user is admin or seller owner
        return productService.updateProduct(id, request, principal.getName(), false);
    }

    /** PATCH /api/products/{id}/toggle-active - Soft toggle visibility */
    @PatchMapping("/{id}/toggle-active")
    public ProductResponse toggleActive(
            @PathVariable String id,
            Principal principal) {
        return productService.toggleProductActive(id, principal.getName(), false);
    }

    /** DELETE /api/products/{id} - Delete product */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProduct(
            @PathVariable String id,
            Principal principal) {
        productService.deleteProduct(id, principal.getName(), false);
    }
}
