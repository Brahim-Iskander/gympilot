package com.gymtrack.service;

import java.io.IOException;
import java.util.Base64;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;

import jakarta.annotation.PostConstruct;

@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);
    private static final Pattern DATA_URI_PATTERN = Pattern.compile("^data:image/[a-zA-Z0-9+.-]+;base64,(.+)$");

    @Value("${cloudinary.cloud-name:}")
    private String cloudName;

    @Value("${cloudinary.api-key:}")
    private String apiKey;

    @Value("${cloudinary.api-secret:}")
    private String apiSecret;

    private Cloudinary cloudinary;
    private boolean configured = false;

    @PostConstruct
    public void init() {
        if (cloudName != null && !cloudName.isBlank()
                && apiKey != null && !apiKey.isBlank()
                && apiSecret != null && !apiSecret.isBlank()) {
            cloudinary = new Cloudinary(ObjectUtils.asMap(
                    "cloud_name", cloudName,
                    "api_key", apiKey,
                    "api_secret", apiSecret,
                    "secure", true
            ));
            configured = true;
            log.info("Cloudinary configured successfully for cloud: {}", cloudName);
        } else {
            log.warn("Cloudinary credentials not set. Image upload feature will be unavailable.");
        }
    }

    public boolean isConfigured() {
        return configured;
    }

    /**
     * Upload a base64-encoded image to Cloudinary.
     *
     * @param base64Image the base64 string (optionally with data URI prefix)
     * @param folder      the Cloudinary folder (e.g., "gympilot/products")
     * @return the secure URL of the uploaded image
     */
    public String uploadBase64Image(String base64Image, String folder) {
        if (!configured) {
            throw new IllegalStateException("Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET.");
        }

        if (base64Image == null || base64Image.isBlank()) {
            throw new IllegalArgumentException("Image data is required.");
        }

        try {
            // Strip data URI prefix if present to get raw base64
            String rawBase64 = base64Image.trim();
            Matcher matcher = DATA_URI_PATTERN.matcher(rawBase64);
            if (matcher.matches()) {
                rawBase64 = matcher.group(1);
            }

            // Validate it's valid base64
            byte[] imageBytes = Base64.getDecoder().decode(rawBase64);
            if (imageBytes.length > 10 * 1024 * 1024) {
                throw new IllegalArgumentException("Image file is too large (max 10MB).");
            }

            // Upload with the data URI format that Cloudinary expects
            String dataUri = base64Image.trim();
            if (!dataUri.startsWith("data:")) {
                dataUri = "data:image/jpeg;base64," + rawBase64;
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(dataUri, ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", "image",
                    "quality", "auto:good",
                    "fetch_format", "auto"
            ));

            String secureUrl = (String) result.get("secure_url");
            log.info("Image uploaded to Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("Cloudinary upload failed: {}", e.getMessage());
            throw new RuntimeException("Image upload failed. Please try again.", e);
        }
    }
}
