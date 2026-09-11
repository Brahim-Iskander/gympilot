package com.gymtrack.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.Announcement;

public interface AnnouncementRepository extends MongoRepository<Announcement, String> {

    /** Return only active announcements (shown to users). */
    List<Announcement> findByActiveTrueOrderByCreatedAtDesc();

    /** Return every announcement newest-first (admin listing). */
    List<Announcement> findAllByOrderByCreatedAtDesc();
}
