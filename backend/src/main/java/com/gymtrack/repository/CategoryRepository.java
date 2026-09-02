package com.gymtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.Category;

public interface CategoryRepository extends MongoRepository<Category, String> {
    Optional<Category> findBySlug(String slug);
    List<Category> findAllByOrderByDisplayOrderAsc();
    boolean existsBySlug(String slug);
}
