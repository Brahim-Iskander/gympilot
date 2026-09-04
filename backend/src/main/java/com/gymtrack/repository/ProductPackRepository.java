package com.gymtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.ProductPack;

public interface ProductPackRepository extends MongoRepository<ProductPack, String> {

    Optional<ProductPack> findBySlug(String slug);

    List<ProductPack> findByActiveTrueOrderByCreatedAtDesc();

    List<ProductPack> findByFeaturedTrueAndActiveTrueOrderByCreatedAtDesc();

    List<ProductPack> findAllByOrderByCreatedAtDesc();

    boolean existsBySlug(String slug);
}
