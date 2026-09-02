package com.gymtrack.repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.RoleAuditLog;

public interface RoleAuditLogRepository extends MongoRepository<RoleAuditLog, String> {
    Page<RoleAuditLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<RoleAuditLog> findTop20ByOrderByCreatedAtDesc();
    List<RoleAuditLog> findByTargetUserIdOrderByCreatedAtDesc(String targetUserId);
}
