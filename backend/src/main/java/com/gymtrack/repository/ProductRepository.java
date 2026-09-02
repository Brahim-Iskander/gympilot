package com.gymtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.gymtrack.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {

    Optional<Product> findBySlug(String slug);

    Page<Product> findByActiveTrue(Pageable pageable);

    Page<Product> findByCategoryIdAndActiveTrue(String categoryId, Pageable pageable);

    @Query("{ 'active': true, '$or': [ " +
            "{ 'name': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'description': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'categoryName': { '$regex': ?0, '$options': 'i' } } " +
            "] }")
    Page<Product> searchActiveProducts(String keyword, Pageable pageable);

    @Query("{ 'active': true, 'categoryId': ?1, '$or': [ " +
            "{ 'name': { '$regex': ?0, '$options': 'i' } }, " +
            "{ 'description': { '$regex': ?0, '$options': 'i' } } " +
            "] }")
    Page<Product> searchActiveProductsInCategory(String keyword, String categoryId, Pageable pageable);

    Page<Product> findBySellerId(String sellerId, Pageable pageable);

    List<Product> findBySellerId(String sellerId);

    long countBySellerId(String sellerId);

    long countBySellerIdAndActiveTrue(String sellerId);

    long countBySellerIdAndStockQuantityLessThanEqual(String sellerId, int stockThreshold);

    List<Product> findTop6ByActiveTrueOrderByUnitsSoldDesc();

    List<Product> findTop6ByActiveTrueAndFeaturedTrueOrderByCreatedAtDesc();

    List<Product> findByCategoryIdAndActiveTrueAndIdNot(String categoryId, String excludeId, Pageable pageable);
}
