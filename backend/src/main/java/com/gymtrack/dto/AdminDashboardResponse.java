package com.gymtrack.dto;

/**
 * Summary statistics for the admin dashboard.
 */
public record AdminDashboardResponse(
        long totalUsers,
        long newUsersToday,
        long newUsersThisWeek,
        long newUsersThisMonth,
        long bannedUsers,
        long totalMembers,
        long freeUsersCount,
        long basicMembersCount,
        long premiumMembersCount,
        long activeMembersCount,
        long inactiveMembersCount
) {
}
