package com.gymtrack.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.model.Partner;
import com.gymtrack.service.PartnerService;

/**
 * Public controller for fetching partners displayed on the main home page.
 */
@RestController
@RequestMapping("/api/partners")
public class PartnerController {

    private final PartnerService partnerService;

    public PartnerController(PartnerService partnerService) {
        this.partnerService = partnerService;
    }

    /** GET /api/partners - Public list of partners for home page */
    @GetMapping
    public List<Partner> getPartners() {
        return partnerService.getAllPartners();
    }
}
