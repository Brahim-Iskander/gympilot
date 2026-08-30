package com.gymtrack.controller;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Public health check controller for uptime monitoring services (e.g., UptimeRobot, Render/Fly.io health checks).
 */
@RestController
public class HealthController {

    @GetMapping({"/api/health", "/health"})
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("message", "GymTrack API is operational");
        health.put("timestamp", Instant.now().toString());
        return ResponseEntity.ok(health);
    }
}
