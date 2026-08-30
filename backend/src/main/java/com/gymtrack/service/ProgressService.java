package com.gymtrack.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.gymtrack.dto.progress.ProgressAnalysisResponse;
import com.gymtrack.dto.progress.ProgressEntryRequest;
import com.gymtrack.dto.progress.ProgressEntryResponse;
import com.gymtrack.exception.ResourceNotFoundException;
import com.gymtrack.model.ProgressEntry;
import com.gymtrack.model.ProgressEntry.ProgressPhoto;
import com.gymtrack.model.UserOnboarding;
import com.gymtrack.repository.ProgressEntryRepository;
import com.gymtrack.repository.UserOnboardingRepository;

@Service
public class ProgressService {

    private final ProgressEntryRepository progressEntryRepository;
    private final UserOnboardingRepository onboardingRepository;
    private final AiService aiService;

    public ProgressService(ProgressEntryRepository progressEntryRepository,
                           UserOnboardingRepository onboardingRepository,
                           AiService aiService) {
        this.progressEntryRepository = progressEntryRepository;
        this.onboardingRepository = onboardingRepository;
        this.aiService = aiService;
    }

    public List<ProgressEntryResponse> getEntriesForUser(String userId) {
        return progressEntryRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId)
                .stream()
                .map(ProgressEntryResponse::from)
                .collect(Collectors.toList());
    }

    public ProgressEntryResponse getEntryById(String userId, String entryId) {
        ProgressEntry entry = progressEntryRepository.findById(entryId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Progress entry not found"));
        return ProgressEntryResponse.from(entry);
    }

    public ProgressEntryResponse createEntry(String userId, ProgressEntryRequest request) {
        validateEntryHasContent(request);

        ProgressEntry entry = new ProgressEntry(userId, request.date());
        populateEntryFields(entry, request);

        ProgressEntry saved = progressEntryRepository.save(entry);
        return ProgressEntryResponse.from(saved);
    }

    public ProgressEntryResponse updateEntry(String userId, String entryId, ProgressEntryRequest request) {
        validateEntryHasContent(request);

        ProgressEntry entry = progressEntryRepository.findById(entryId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Progress entry not found"));

        entry.setDate(request.date());
        populateEntryFields(entry, request);

        ProgressEntry saved = progressEntryRepository.save(entry);
        return ProgressEntryResponse.from(saved);
    }

    public void deleteEntry(String userId, String entryId) {
        ProgressEntry entry = progressEntryRepository.findById(entryId)
                .filter(e -> e.getUserId().equals(userId))
                .orElseThrow(() -> new ResourceNotFoundException("Progress entry not found"));
        progressEntryRepository.delete(entry);
    }

    public ProgressAnalysisResponse analyzeProgress(String userId) {
        UserOnboarding onboarding = onboardingRepository.findByUserId(userId).orElse(null);
        List<ProgressEntry> entries = progressEntryRepository.findByUserIdOrderByDateDescCreatedAtDesc(userId);
        return aiService.analyzeProgress(onboarding, entries);
    }

    private void validateEntryHasContent(ProgressEntryRequest request) {
        boolean hasWeight = request.weight() != null && request.weight() > 0;
        boolean hasMeasurements = request.measurements() != null && !request.measurements().isEmpty();
        boolean hasLifts = request.strengthLogs() != null && !request.strengthLogs().isEmpty();
        boolean hasPhotos = request.photos() != null && !request.photos().isEmpty();
        boolean hasNote = request.note() != null && !request.note().trim().isEmpty();

        if (!hasWeight && !hasMeasurements && !hasLifts && !hasPhotos && !hasNote) {
            throw new IllegalArgumentException("At least one progress field (weight, body measurements, strength lifts, progress photos, or note) must be provided.");
        }
    }

    private void populateEntryFields(ProgressEntry entry, ProgressEntryRequest request) {
        entry.setWeight(request.weight());
        if (request.weightUnit() != null && !request.weightUnit().isBlank()) {
            entry.setWeightUnit(request.weightUnit());
        }

        if (request.measurements() != null) {
            entry.setMeasurements(request.measurements());
        } else {
            entry.getMeasurements().clear();
        }

        if (request.measurementUnit() != null && !request.measurementUnit().isBlank()) {
            entry.setMeasurementUnit(request.measurementUnit());
        }

        if (request.strengthLogs() != null) {
            entry.setStrengthLogs(request.strengthLogs());
        } else {
            entry.getStrengthLogs().clear();
        }

        if (request.photos() != null) {
            List<ProgressPhoto> photos = new ArrayList<>();
            for (ProgressPhoto photo : request.photos()) {
                if (photo.getId() == null || photo.getId().isBlank()) {
                    photo.setId(UUID.randomUUID().toString());
                }
                if (photo.getUploadedAt() == null) {
                    photo.setUploadedAt(Instant.now());
                }
                photos.add(photo);
            }
            entry.setPhotos(photos);
        } else {
            entry.getPhotos().clear();
        }

        entry.setNote(request.note() != null ? request.note().trim() : null);
    }
}
