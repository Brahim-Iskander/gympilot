package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.dto.progress.ProgressAnalysisResponse;
import com.gymtrack.dto.progress.ProgressEntryRequest;
import com.gymtrack.dto.progress.ProgressEntryResponse;
import com.gymtrack.service.ProgressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping
    public List<ProgressEntryResponse> getEntries(Authentication authentication) {
        return progressService.getEntriesForUser(authentication.getName());
    }

    @GetMapping("/{id}")
    public ProgressEntryResponse getEntry(Authentication authentication, @PathVariable String id) {
        return progressService.getEntryById(authentication.getName(), id);
    }

    @PostMapping
    public ResponseEntity<ProgressEntryResponse> createEntry(Authentication authentication,
                                                            @Valid @RequestBody ProgressEntryRequest request) {
        ProgressEntryResponse response = progressService.createEntry(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ProgressEntryResponse updateEntry(Authentication authentication,
                                            @PathVariable String id,
                                            @Valid @RequestBody ProgressEntryRequest request) {
        return progressService.updateEntry(authentication.getName(), id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteEntry(Authentication authentication, @PathVariable String id) {
        progressService.deleteEntry(authentication.getName(), id);
    }

    @PostMapping("/analyze")
    public ProgressAnalysisResponse analyzeProgress(Authentication authentication) {
        return progressService.analyzeProgress(authentication.getName());
    }
}
