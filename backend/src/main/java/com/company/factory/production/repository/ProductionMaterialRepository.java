package com.company.factory.production.repository;

import com.company.factory.production.domain.ProductionMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductionMaterialRepository extends JpaRepository<ProductionMaterial, Long> {
    List<ProductionMaterial> findByProductionOrderId(Long productionOrderId);
    Optional<ProductionMaterial> findByProductionOrderIdAndMaterialId(Long productionOrderId, Long materialId);
}
