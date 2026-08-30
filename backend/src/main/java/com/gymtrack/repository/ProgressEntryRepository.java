package com.gymtrack.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.gymtrack.model.ProgressEntry;

@Repository
public interface ProgressEntryRepository extends MongoRepository<ProgressEntry, String> {

    List<ProgressEntry> findByUserIdOrderByDateDescCreatedAtDesc(String userId);

    List<ProgressEntry> findByUserIdAndDateBetweenOrderByDateAsc(String userId, LocalDate startDate, LocalDate endDate);

    void deleteByUserId(String userId);
}
