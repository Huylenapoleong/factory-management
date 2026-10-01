package com.company.factory.production.repository;

import com.company.factory.production.domain.ProductionOperation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductionOperationRepository extends JpaRepository<ProductionOperation, Long> {
    List<ProductionOperation> findByProductionOrderIdOrderBySequenceNoAsc(Long productionOrderId);
}
