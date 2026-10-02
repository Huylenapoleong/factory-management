package com.company.factory.purchasing.repository;

import com.company.factory.purchasing.domain.PurchaseOrder;
import com.company.factory.purchasing.domain.PurchaseOrderItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long>, JpaSpecificationExecutor<PurchaseOrder> {
    Optional<PurchaseOrder> findByPoNo(String poNo);
    boolean existsByPoNo(String poNo);
    List<PurchaseOrder> findByStatus(String status);

    @Query("SELECT i FROM PurchaseOrderItem i JOIN FETCH i.purchaseOrder po JOIN FETCH po.supplier " +
            "WHERE i.item.id IN :itemIds AND po.status <> 'CANCELLED' ORDER BY po.orderDate DESC, po.id DESC")
    List<PurchaseOrderItem> findActiveLinesByItemIds(@Param("itemIds") Collection<Long> itemIds);

    long countByStatus(String status);

    @Query("SELECT COUNT(po) FROM PurchaseOrder po WHERE po.status IN ('CONFIRMED', 'PARTIAL_RECEIVED')")
    long countPendingPurchaseOrders();
}
