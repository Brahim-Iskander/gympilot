package com.gymtrack.repository;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.Partner;

public interface PartnerRepository extends MongoRepository<Partner, String> {

    List<Partner> findAllBy(Sort sort);
}
