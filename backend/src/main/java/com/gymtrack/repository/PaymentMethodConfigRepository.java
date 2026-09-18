package com.gymtrack.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.gymtrack.model.PaymentMethodConfig;

@Repository
public interface PaymentMethodConfigRepository extends MongoRepository<PaymentMethodConfig, String> {

    Optional<PaymentMethodConfig> findByCode(String code);

    boolean existsByCode(String code);

    List<PaymentMethodConfig> findByIsActiveGlobalTrue(Sort sort);
}
