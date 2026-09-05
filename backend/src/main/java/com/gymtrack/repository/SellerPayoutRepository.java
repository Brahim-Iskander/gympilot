package com.gymtrack.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.model.SellerPayout;

public interface SellerPayoutRepository extends MongoRepository<SellerPayout, String> {

    List<SellerPayout> findBySellerIdOrderByCreatedAtDesc(String sellerId);

    List<SellerPayout> findAllByOrderByCreatedAtDesc();

    long countBySellerId(String sellerId);
}
