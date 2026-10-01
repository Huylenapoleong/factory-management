package com.company.factory.purchasing.repository;

import com.company.factory.purchasing.domain.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long>, JpaSpecificationExecutor<PurchaseOrder> {
    Optional<PurchaseOrder> findByPoNo(String poNo);
    boolean existsByPoNo(String poNo);
    List<PurchaseOrder> findByStatus(String status);
    long countByStatus(String status);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status IN ('CONFIRMED', 'PARTIAL_RECEIVED')")
    long countPendingPurchaseOrders();
}
