package com.gymtrack.service;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.AdminDashboardResponse;
import com.gymtrack.dto.AdminUserResponse;
import com.gymtrack.dto.AnalyticsChartResponse;
import com.gymtrack.dto.AnalyticsChartResponse.DataPoint;
import com.gymtrack.dto.PagedResponse;
import com.gymtrack.dto.RoleAuditLogResponse;
import com.gymtrack.dto.UpdateUserRolesRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.RoleAuditLog;
import com.gymtrack.model.User;
import com.gymtrack.repository.RoleAuditLogRepository;
import com.gymtrack.repository.SiteVisitRepository;
import com.gymtrack.repository.UserRepository;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final SiteVisitRepository siteVisitRepository;
    private final RoleAuditLogRepository roleAuditLogRepository;
    private final MongoTemplate mongoTemplate;

    public AdminService(UserRepository userRepository,
                        SiteVisitRepository siteVisitRepository,
                        RoleAuditLogRepository roleAuditLogRepository,
                        MongoTemplate mongoTemplate) {
        this.userRepository = userRepository;
        this.siteVisitRepository = siteVisitRepository;
        this.roleAuditLogRepository = roleAuditLogRepository;
        this.mongoTemplate = mongoTemplate;
    }

    public AdminDashboardResponse getDashboardStats() {
        Instant now = Instant.now();
        Instant todayStart = now.truncatedTo(ChronoUnit.DAYS);
        Instant weekAgo = now.minus(7, ChronoUnit.DAYS);
        Instant monthAgo = now.minus(30, ChronoUnit.DAYS);
        Instant yearAgo = now.minus(365, ChronoUnit.DAYS);

        long totalUsers = userRepository.count();
        long newUsersToday = userRepository.countByCreatedAtAfter(todayStart);
        long newUsersThisWeek = userRepository.countByCreatedAtAfter(weekAgo);
        long newUsersThisMonth = userRepository.countByCreatedAtAfter(monthAgo);
        long bannedUsers = userRepository.countByBannedTrue();

        long visitsToday = siteVisitRepository.countByVisitedAtAfter(todayStart);
        long visitsThisMonth = siteVisitRepository.countByVisitedAtAfter(monthAgo);
        long visitsThisYear = siteVisitRepository.countByVisitedAtAfter(yearAgo);

        long basicMembers = userRepository.countByMembershipTierAndMembershipStatus("BASIC", "ACTIVE");
        long premiumMembers = userRepository.countByMembershipTierAndMembershipStatus("PREMIUM", "ACTIVE");
        long activeMembers = userRepository.countByMembershipStatus("ACTIVE");
        long inactiveMembers = userRepository.countByMembershipStatus("INACTIVE");
        long freeUsers = userRepository.countByMembershipTier("FREE");
        long totalMembers = basicMembers + premiumMembers;

        return new AdminDashboardResponse(
                totalUsers,
                newUsersToday,
                newUsersThisWeek,
                newUsersThisMonth,
                bannedUsers,
                visitsToday,
                visitsThisMonth,
                visitsThisYear,
                totalMembers,
                freeUsers,
                basicMembers,
                premiumMembers,
                activeMembers,
                inactiveMembers
        );
    }

    public PagedResponse<AdminUserResponse> getUsers(String search, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<User> userPage;

        if (search != null && !search.trim().isEmpty()) {
            userPage = userRepository.searchUsers(search.trim(), pageRequest);
        } else {
            userPage = userRepository.findAll(pageRequest);
        }

        List<AdminUserResponse> content = userPage.getContent().stream()
                .map(AdminUserResponse::from)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                userPage.getNumber(),
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages()
        );
    }

    public AdminUserResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        return AdminUserResponse.from(user);
    }

    public AdminUserResponse banUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        user.setBanned(true);
        user.setBannedAt(Instant.now());
        User saved = userRepository.save(user);
        log.info("Banned user: {}", saved.getEmail());
        return AdminUserResponse.from(saved);
    }

    public AdminUserResponse unbanUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));
        user.setBanned(false);
        user.setBannedAt(null);
        User saved = userRepository.save(user);
        log.info("Unbanned user: {}", saved.getEmail());
        return AdminUserResponse.from(saved);
    }

    public AdminUserResponse updateUserRole(String id, String role) {
        if (role == null || (!role.equalsIgnoreCase("USER") && !role.equalsIgnoreCase("COACH") && !role.equalsIgnoreCase("SELLER") && !role.equalsIgnoreCase("ADMIN"))) {
            throw new IllegalArgumentException("Invalid role. Allowed roles: USER, COACH, SELLER, ADMIN");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        java.util.Set<String> prevRoles = new java.util.HashSet<>(user.getRoles());
        user.setRole(role.toUpperCase());
        User saved = userRepository.save(user);

        // Record audit log
        RoleAuditLog auditLog = new RoleAuditLog(
                user.getId(),
                user.getEmail(),
                (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim(),
                "system-admin",
                "admin@gympilot.com",
                prevRoles,
                saved.getRoles(),
                "UPDATED_ROLE_" + role.toUpperCase(),
                "Updated primary role to " + role.toUpperCase()
        );
        roleAuditLogRepository.save(auditLog);

        log.info("Updated user {} role to {}", saved.getEmail(), role.toUpperCase());
        return AdminUserResponse.from(saved);
    }

    public AdminUserResponse updateUserCapabilities(String id, UpdateUserRolesRequest request, String adminEmail) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        User admin = adminEmail != null ? userRepository.findByEmail(adminEmail).orElse(null) : null;
        String adminId = admin != null ? admin.getId() : "system-admin";
        String adminEmailStr = admin != null ? admin.getEmail() : "admin@gympilot.com";

        java.util.Set<String> prevRoles = new java.util.HashSet<>(user.getRoles());
        java.util.Set<String> newRoles = new java.util.HashSet<>(user.getRoles());

        if (request.roles() != null) {
            newRoles = new java.util.HashSet<>(request.roles());
        }

        if (request.isSeller() != null) {
            if (request.isSeller()) {
                newRoles.add("SELLER");
            } else {
                newRoles.remove("SELLER");
            }
        }

        if (request.isCoach() != null) {
            if (request.isCoach()) {
                newRoles.add("COACH");
            } else {
                newRoles.remove("COACH");
            }
        }

        if (request.isAdmin() != null) {
            if (request.isAdmin()) {
                newRoles.add("ADMIN");
            } else {
                newRoles.remove("ADMIN");
            }
        }

        if (newRoles.isEmpty()) {
            newRoles.add("USER");
        }

        user.setRoles(newRoles);
        User saved = userRepository.save(user);

        // Determine action label
        String action = "UPDATED_CAPABILITIES";
        if (newRoles.contains("SELLER") && !prevRoles.contains("SELLER")) {
            action = "GRANTED_SELLER";
        } else if (!newRoles.contains("SELLER") && prevRoles.contains("SELLER")) {
            action = "REVOKED_SELLER";
        } else if (newRoles.contains("COACH") && !prevRoles.contains("COACH")) {
            action = "GRANTED_COACH";
        } else if (!newRoles.contains("COACH") && prevRoles.contains("COACH")) {
            action = "REVOKED_COACH";
        } else if (newRoles.contains("ADMIN") && !prevRoles.contains("ADMIN")) {
            action = "PROMOTED_ADMIN";
        }

        String userDisplayName = (user.getFirstName() + " " + (user.getLastName() != null ? user.getLastName() : "")).trim();
        RoleAuditLog auditLog = new RoleAuditLog(
                user.getId(),
                user.getEmail(),
                userDisplayName,
                adminId,
                adminEmailStr,
                prevRoles,
                newRoles,
                action,
                request.notes() != null ? request.notes() : "Updated user capabilities: " + newRoles
        );
        roleAuditLogRepository.save(auditLog);

        log.info("Admin {} updated user {} capabilities from {} to {}", adminEmailStr, user.getEmail(), prevRoles, newRoles);
        return AdminUserResponse.from(saved);
    }

    public PagedResponse<RoleAuditLogResponse> getRoleAuditLogs(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<RoleAuditLog> logPage = roleAuditLogRepository.findAllByOrderByCreatedAtDesc(pageRequest);

        List<RoleAuditLogResponse> content = logPage.getContent().stream()
                .map(RoleAuditLogResponse::from)
                .collect(Collectors.toList());

        return new PagedResponse<>(
                content,
                logPage.getNumber(),
                logPage.getSize(),
                logPage.getTotalElements(),
                logPage.getTotalPages()
        );
    }

    public AdminUserResponse updateUserMembership(String id, com.gymtrack.dto.UpdateMembershipRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        if (request.membershipTier() != null) {
            String tier = request.membershipTier().toUpperCase();
            if (!tier.equals("FREE") && !tier.equals("BASIC") && !tier.equals("PREMIUM")) {
                throw new IllegalArgumentException("Invalid membership tier. Allowed tiers: FREE, BASIC, PREMIUM");
            }
            user.setMembershipTier(tier);
        }

        if (request.membershipStatus() != null) {
            String status = request.membershipStatus().toUpperCase();
            if (!status.equals("ACTIVE") && !status.equals("INACTIVE")) {
                throw new IllegalArgumentException("Invalid membership status. Allowed statuses: ACTIVE, INACTIVE");
            }
            user.setMembershipStatus(status);
        }

        User saved = userRepository.save(user);
        log.info("Updated user {} membership: tier={}, status={}", saved.getEmail(), saved.getMembershipTier(), saved.getMembershipStatus());
        return AdminUserResponse.from(saved);
    }

    public AnalyticsChartResponse getVisitorAnalytics(String period) {
        Instant from = getPeriodStartInstant(period);

        Criteria criteria = Criteria.where("visitedAt").gte(from);
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.project("visitedAt")
                        .andExpression("dateToString('%Y-%m-%d', visitedAt)").as("dateGroup"),
                Aggregation.group("dateGroup").count().as("count"),
                Aggregation.project("count").and("_id").as("date")
        );

        AggregationResults<AggregationDataPoint> results = mongoTemplate.aggregate(
                aggregation, "site_visits", AggregationDataPoint.class
        );

        Map<String, Long> countByDate = results.getMappedResults().stream()
                .collect(Collectors.toMap(AggregationDataPoint::date, AggregationDataPoint::count));

        List<DataPoint> dataPoints = fillMissingDates(period, countByDate);
        return new AnalyticsChartResponse(dataPoints);
    }

    public AnalyticsChartResponse getRegistrationAnalytics(String period) {
        Instant from = getPeriodStartInstant(period);

        Criteria criteria = Criteria.where("createdAt").gte(from);
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(criteria),
                Aggregation.project("createdAt")
                        .andExpression("dateToString('%Y-%m-%d', createdAt)").as("dateGroup"),
                Aggregation.group("dateGroup").count().as("count"),
                Aggregation.project("count").and("_id").as("date")
        );

        AggregationResults<AggregationDataPoint> results = mongoTemplate.aggregate(
                aggregation, "users", AggregationDataPoint.class
        );

        Map<String, Long> countByDate = results.getMappedResults().stream()
                .collect(Collectors.toMap(AggregationDataPoint::date, AggregationDataPoint::count));

        List<DataPoint> dataPoints = fillMissingDates(period, countByDate);
        return new AnalyticsChartResponse(dataPoints);
    }

    private Instant getPeriodStartInstant(String period) {
        Instant now = Instant.now();
        if ("monthly".equalsIgnoreCase(period)) {
            return now.minus(30, ChronoUnit.DAYS);
        } else if ("yearly".equalsIgnoreCase(period)) {
            return now.minus(365, ChronoUnit.DAYS);
        }
        // default daily: last 14 days
        return now.minus(14, ChronoUnit.DAYS);
    }

    private List<DataPoint> fillMissingDates(String period, Map<String, Long> countByDate) {
        List<DataPoint> points = new ArrayList<>();
        int days = "yearly".equalsIgnoreCase(period) ? 365 : ("monthly".equalsIgnoreCase(period) ? 30 : 14);
        LocalDate endDate = LocalDate.now(ZoneId.of("UTC"));
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        for (int i = days - 1; i >= 0; i--) {
            String dateStr = endDate.minusDays(i).format(formatter);
            long count = countByDate.getOrDefault(dateStr, 0L);
            points.add(new DataPoint(dateStr, count));
        }

        return points;
    }

    private record AggregationDataPoint(String date, long count) {}
}
