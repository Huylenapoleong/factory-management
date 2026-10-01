package com.company.factory.production.repository;

import com.company.factory.production.domain.ProductionOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ProductionOrderRepository extends JpaRepository<ProductionOrder, Long>, JpaSpecificationExecutor<ProductionOrder> {
    Optional<ProductionOrder> findByMoNo(String moNo);
    boolean existsByMoNo(String moNo);
    List<ProductionOrder> findByStatus(String status);
    long countByStatus(String status);

    @Query("SELECT COUNT(po) FROM ProductionOrder po WHERE po.status IN ('RELEASED', 'IN_PROGRESS')")
    long countActiveProductionOrders();
}
