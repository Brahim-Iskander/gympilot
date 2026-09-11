package com.gymtrack.controller;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.gymtrack.model.Announcement;
import com.gymtrack.repository.AnnouncementRepository;

/**
 * Public endpoint for active announcements + admin CRUD.
 */
@RestController
public class AnnouncementController {

    private final AnnouncementRepository repo;

    public AnnouncementController(AnnouncementRepository repo) {
        this.repo = repo;
    }

    // ── Public ─────────────────────────────────────────────────

    /** GET /api/announcements/active — no auth required. Filters out expired. */
    @GetMapping("/api/announcements/active")
    public List<Announcement> getActiveAnnouncements() {
        Instant now = Instant.now();
        return repo.findByActiveTrueOrderByCreatedAtDesc().stream()
                .filter(a -> a.getExpiresAt() == null || a.getExpiresAt().isAfter(now))
                .collect(Collectors.toList());
    }

    // ── Admin ──────────────────────────────────────────────────

    /** GET /api/admin/announcements — list all (admin). */
    @GetMapping("/api/admin/announcements")
    public List<Announcement> getAllAnnouncements() {
        return repo.findAllByOrderByCreatedAtDesc();
    }

    /** POST /api/admin/announcements — create (admin). */
    @PostMapping("/api/admin/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public Announcement createAnnouncement(@RequestBody Announcement body) {
        body.setId(null); // let Mongo generate
        return repo.save(body);
    }

    /** PATCH /api/admin/announcements/{id} — update (admin). */
    @PatchMapping("/api/admin/announcements/{id}")
    public Announcement updateAnnouncement(@PathVariable String id, @RequestBody Map<String, Object> updates) {
        Announcement existing = repo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found"));

        if (updates.containsKey("message")) {
            existing.setMessage((String) updates.get("message"));
        }
        if (updates.containsKey("type")) {
            existing.setType((String) updates.get("type"));
        }
        if (updates.containsKey("linkUrl")) {
            existing.setLinkUrl((String) updates.get("linkUrl"));
        }
        if (updates.containsKey("linkLabel")) {
            existing.setLinkLabel((String) updates.get("linkLabel"));
        }
        if (updates.containsKey("active")) {
            existing.setActive((Boolean) updates.get("active"));
        }
        if (updates.containsKey("expiresAt")) {
            Object val = updates.get("expiresAt");
            existing.setExpiresAt(val != null && !val.toString().isEmpty() ? Instant.parse(val.toString()) : null);
        }

        return repo.save(existing);
    }

    /** DELETE /api/admin/announcements/{id} — delete (admin). */
    @DeleteMapping("/api/admin/announcements/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAnnouncement(@PathVariable String id) {
        if (!repo.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Announcement not found");
        }
        repo.deleteById(id);
    }
}
