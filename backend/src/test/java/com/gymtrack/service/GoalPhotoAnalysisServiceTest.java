package com.gymtrack.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.web.reactive.function.client.WebClient;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisRequest;
import com.gymtrack.dto.analyze.PhotoAnalysisDtos.PhotoAnalysisResponse;
import com.gymtrack.model.Product;
import com.gymtrack.repository.ProductRepository;
import com.gymtrack.util.IpRateLimiter;

@ExtendWith(MockitoExtension.class)
class GoalPhotoAnalysisServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private WebClient.Builder webClientBuilder;

    private ObjectMapper objectMapper;
    private GoalPhotoAnalysisService service;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        service = new GoalPhotoAnalysisService(productRepository, webClientBuilder, objectMapper);
    }

    @Test
    void analyze_validatesMissingGoal() {
        PhotoAnalysisRequest request = new PhotoAnalysisRequest("data:image/jpeg;base64,123", "");
        assertThrows(IllegalArgumentException.class, () -> service.analyze(request));
    }

    @Test
    void analyze_validatesMissingImage() {
        PhotoAnalysisRequest request = new PhotoAnalysisRequest("", "Build muscle");
        assertThrows(IllegalArgumentException.class, () -> service.analyze(request));
    }

    @Test
    void analyze_muscleGoal_returnsFallbackAndMatchedProducts() {
        Product p1 = new Product();
        p1.setId("p1");
        p1.setName("Gold Standard 100% Whey");
        p1.setSlug("gold-standard-whey");
        p1.setPrice(189.0);
        p1.setStockQuantity(15);
        p1.setCategoryName("Whey Protein");

        Product p2 = new Product();
        p2.setId("p2");
        p2.setName("Micronized Creatine Monohydrate");
        p2.setSlug("micronized-creatine");
        p2.setPrice(85.0);
        p2.setStockQuantity(20);
        p2.setCategoryName("Creatine");

        Product pOutOfStock = new Product();
        pOutOfStock.setId("p3");
        pOutOfStock.setName("Out of Stock Pre-Workout");
        pOutOfStock.setStockQuantity(0);

        when(productRepository.searchActiveProducts(any(), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(p1, p2, pOutOfStock)));

        PhotoAnalysisRequest request = new PhotoAnalysisRequest(
                "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
                "I want to build lean muscle and increase bench press"
        );

        PhotoAnalysisResponse response = service.analyze(request);

        assertNotNull(response);
        assertNotNull(response.summary());
        assertTrue(response.summary().toLowerCase().contains("muscle") || response.summary().toLowerCase().contains("physique"));
        assertFalse(response.nutritionTips().isEmpty());
        assertFalse(response.adviceSteps().isEmpty());
        assertNotNull(response.disclaimer());
        assertTrue(response.disclaimer().contains("medical advice"));

        // Verify out of stock was filtered out and real in-stock products returned
        assertEquals(2, response.recommendedProducts().size());
        assertEquals("p1", response.recommendedProducts().get(0).id());
        assertEquals("p2", response.recommendedProducts().get(1).id());
    }

    @Test
    void ipRateLimiter_enforcesLimit() {
        IpRateLimiter limiter = new IpRateLimiter(3, java.time.Duration.ofMinutes(10));
        String ip = "192.168.1.100";

        assertTrue(limiter.isAllowed(ip));
        assertTrue(limiter.isAllowed(ip));
        assertTrue(limiter.isAllowed(ip));
        assertFalse(limiter.isAllowed(ip)); // 4th request blocked

        assertThrows(IllegalArgumentException.class, () -> limiter.checkAllowedOrThrow(ip));
    }
}
