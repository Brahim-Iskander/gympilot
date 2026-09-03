package com.gymtrack.repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.gymtrack.model.Order;

public interface OrderRepository extends MongoRepository<Order, String> {

    Optional<Order> findByOrderNumber(String orderNumber);

    Page<Order> findByBuyerIdOrderByCreatedAtDesc(String buyerId, Pageable pageable);

    List<Order> findByBuyerIdOrderByCreatedAtDesc(String buyerId);

    @Query("{ 'items.sellerId': ?0 }")
    Page<Order> findOrdersBySellerId(String sellerId, Pageable pageable);

    @Query("{ 'items.sellerId': ?0 }")
    List<Order> findAllOrdersBySellerId(String sellerId);

    @Query("{ 'items.sellerId': ?0, 'createdAt': { '$gte': ?1 } }")
    List<Order> findOrdersBySellerIdAndCreatedAtAfter(String sellerId, Instant after);

    long countByBuyerId(String buyerId);

    @Query(value = "{ 'items.sellerId': ?0 }", count = true)
    long countOrdersBySellerId(String sellerId);

    List<Order> findByVoucherCodeOrderByCreatedAtDesc(String voucherCode);

    long countByVoucherCode(String voucherCode);
}

