package com.gymtrack.util;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;

@Component
public class IpRateLimiter {

    private final int maxRequests;
    private final Duration windowDuration;
    private final ConcurrentHashMap<String, List<Instant>> requestLog = new ConcurrentHashMap<>();

    public IpRateLimiter() {
        // Default: 5 requests per 1 hour per IP
        this(5, Duration.ofHours(1));
    }

    public IpRateLimiter(int maxRequests, Duration windowDuration) {
        this.maxRequests = maxRequests;
        this.windowDuration = windowDuration;
    }

    public static String extractClientIp(HttpServletRequest request) {
        if (request == null) {
            return "unknown";
        }
        String forwarded = request.getHeader("X-Forwarded-For");
        if (forwarded != null && !forwarded.isBlank()) {
            // Can contain a comma-separated list of proxies; first is the real client
            return forwarded.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (realIp != null && !realIp.isBlank()) {
            return realIp.trim();
        }
        String remoteAddr = request.getRemoteAddr();
        return remoteAddr != null ? remoteAddr.trim() : "unknown";
    }

    public synchronized boolean isAllowed(String ip) {
        if (ip == null || ip.isBlank() || "unknown".equalsIgnoreCase(ip)) {
            return true;
        }

        Instant now = Instant.now();
        Instant cutoff = now.minus(windowDuration);

        List<Instant> timestamps = requestLog.computeIfAbsent(ip, k -> new ArrayList<>());
        // Remove expired entries
        timestamps.removeIf(time -> time.isBefore(cutoff));

        if (timestamps.size() >= maxRequests) {
            return false;
        }

        timestamps.add(now);
        return true;
    }

    public void checkAllowedOrThrow(String ip) {
        if (!isAllowed(ip)) {
            throw new IllegalArgumentException(
                    String.format("Rate limit reached. You can perform up to %d photo analyses per hour. Please try again later.", maxRequests)
            );
        }
    }

    public void reset(String ip) {
        requestLog.remove(ip);
    }
}
