package com.gymtrack.controller;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.service.CloudinaryService;

/**
 * Handles image uploads to Cloudinary for product images, store logos, etc.
 * Requires SELLER or ADMIN role (configured in SecurityConfig).
 */
@RestController
@RequestMapping("/api/upload")
public class ImageUploadController {

    private final CloudinaryService cloudinaryService;

    public ImageUploadController(CloudinaryService cloudinaryService) {
        this.cloudinaryService = cloudinaryService;
    }

    /**
     * Upload a single image (base64) to Cloudinary.
     * Request body: { "imageBase64": "data:image/...", "folder": "gympilot/products" }
     * Response: { "url": "https://res.cloudinary.com/..." }
     */
    @PostMapping("/image")
    public ResponseEntity<?> uploadSingleImage(@RequestBody Map<String, String> request) {
        String imageBase64 = request.get("imageBase64");
        String folder = request.getOrDefault("folder", "gympilot/products");

        if (imageBase64 == null || imageBase64.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("message", "imageBase64 is required."));
        }

        if (!cloudinaryService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("message", "Image hosting service is not configured."));
        }

        String url = cloudinaryService.uploadBase64Image(imageBase64, folder);
        return ResponseEntity.ok(Map.of("url", url));
    }

    /**
     * Upload multiple images (base64) to Cloudinary.
     * Request body: { "images": ["data:image/...", "data:image/..."], "folder": "gympilot/products" }
     * Response: { "urls": ["https://...", "https://..."] }
     */
    @PostMapping("/images")
    public ResponseEntity<?> uploadMultipleImages(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<String> images = (List<String>) request.get("images");
        String folder = (String) request.getOrDefault("folder", "gympilot/products");

        if (images == null || images.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "images array is required."));
        }

        if (images.size() > 10) {
            return ResponseEntity.badRequest().body(Map.of("message", "Maximum 10 images per upload."));
        }

        if (!cloudinaryService.isConfigured()) {
            return ResponseEntity.status(503).body(Map.of("message", "Image hosting service is not configured."));
        }

        List<String> urls = new ArrayList<>();
        for (String img : images) {
            if (img != null && !img.isBlank()) {
                urls.add(cloudinaryService.uploadBase64Image(img, folder));
            }
        }

        return ResponseEntity.ok(Map.of("urls", urls));
    }
}
