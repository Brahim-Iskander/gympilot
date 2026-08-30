package com.gymtrack.security;

import java.io.IOException;
import java.time.Instant;

import org.springframework.lang.NonNull;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.gymtrack.model.SiteVisit;
import com.gymtrack.repository.SiteVisitRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * Logs each API request to the site_visits collection for analytics.
 * Runs after the JWT filter so it can capture the authenticated userId.
 * Only tracks /api/** requests and skips admin analytics endpoints to avoid recursion.
 */
@Component
public class VisitTrackingFilter extends OncePerRequestFilter {

    private final SiteVisitRepository siteVisitRepository;

    public VisitTrackingFilter(SiteVisitRepository siteVisitRepository) {
        this.siteVisitRepository = siteVisitRepository;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Continue the filter chain first, then log asynchronously
        filterChain.doFilter(request, response);

        // Only track API calls, skip admin analytics and health checks to prevent unwanted log inflation
        String path = request.getRequestURI();
        if (!path.startsWith("/api/") || path.startsWith("/api/admin/analytics") || path.equals("/api/health") || path.equals("/health")) {
            return;
        }

        try {
            String userId = null;
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.isAuthenticated() && !"anonymousUser".equals(auth.getPrincipal())) {
                userId = auth.getName();
            }

            String ip = request.getHeader("X-Forwarded-For");
            if (ip == null || ip.isBlank()) {
                ip = request.getRemoteAddr();
            }

            SiteVisit visit = new SiteVisit(
                    userId,
                    path,
                    request.getMethod(),
                    ip,
                    request.getHeader("User-Agent"),
                    Instant.now());

            siteVisitRepository.save(visit);
        } catch (Exception ignored) {
            // Never let analytics tracking break the actual request
        }
    }
}
