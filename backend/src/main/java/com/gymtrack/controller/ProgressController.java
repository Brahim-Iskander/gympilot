package com.gymtrack.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
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
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.AiFeature;
import com.gymtrack.model.User;
import com.gymtrack.repository.UserRepository;
import com.gymtrack.service.AiUsageService;
import com.gymtrack.service.ProgressService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/progress")
public class ProgressController {

    private final ProgressService progressService;
    private final AiUsageService aiUsageService;
    private final UserRepository userRepository;

    public ProgressController(ProgressService progressService,
                              AiUsageService aiUsageService,
                              UserRepository userRepository) {
        this.progressService = progressService;
        this.aiUsageService = aiUsageService;
        this.userRepository = userRepository;
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
    @ResponseStatus(HttpStatus.CREATED)
    public ProgressEntryResponse createEntry(Authentication authentication,
                                             @Valid @RequestBody ProgressEntryRequest request) {
        return progressService.createEntry(authentication.getName(), request);
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
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new InvalidCredentialsException("User not found"));

        // Enforce quota limits for PROGRESS_ANALYSIS (Free: 3 lifetime, Basic: 5/mo, Premium: 15/mo)
        aiUsageService.checkAndIncrementUsage(user, AiFeature.PROGRESS_ANALYSIS);

        return progressService.analyzeProgress(authentication.getName());
    }
}
