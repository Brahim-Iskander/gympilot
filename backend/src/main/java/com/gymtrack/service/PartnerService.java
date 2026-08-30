package com.gymtrack.service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.gymtrack.dto.CreatePartnerRequest;
import com.gymtrack.exception.InvalidCredentialsException;
import com.gymtrack.model.Partner;
import com.gymtrack.repository.PartnerRepository;

@Service
public class PartnerService {

    private static final Logger log = LoggerFactory.getLogger(PartnerService.class);

    private final PartnerRepository partnerRepository;

    public PartnerService(PartnerRepository partnerRepository) {
        this.partnerRepository = partnerRepository;
    }

    public List<Partner> getAllPartners() {
        return partnerRepository.findAllBy(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    public Partner createPartner(CreatePartnerRequest request) {
        Partner partner = new Partner(
                request.name().trim(),
                request.imageUrl().trim(),
                request.description().trim(),
                request.websiteUrl().trim()
        );
        Partner saved = partnerRepository.save(partner);
        log.info("Created partner: {} ({})", saved.getName(), saved.getId());
        return saved;
    }

    public void deletePartner(String id) {
        if (!partnerRepository.existsById(id)) {
            throw new InvalidCredentialsException("Partner not found");
        }
        partnerRepository.deleteById(id);
        log.info("Deleted partner with ID: {}", id);
    }
}
