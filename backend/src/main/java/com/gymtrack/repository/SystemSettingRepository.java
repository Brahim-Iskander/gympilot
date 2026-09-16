package com.gymtrack.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.gymtrack.model.SystemSetting;

@Repository
public interface SystemSettingRepository extends MongoRepository<SystemSetting, String> {
    Optional<SystemSetting> findByKey(String key);
    boolean existsByKey(String key);
}
