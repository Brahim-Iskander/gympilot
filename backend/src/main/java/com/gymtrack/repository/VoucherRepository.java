package com.gymtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.gymtrack.model.Voucher;

@Repository
public interface VoucherRepository extends MongoRepository<Voucher, String> {

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<Voucher> findAllByOrderByCreatedAtDesc();
}
