package com.company.factory.sales.repository;

import com.company.factory.sales.domain.Delivery;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long>, JpaSpecificationExecutor<Delivery> {
    Optional<Delivery> findByDeliveryNo(String deliveryNo);
    boolean existsByDeliveryNo(String deliveryNo);
}
