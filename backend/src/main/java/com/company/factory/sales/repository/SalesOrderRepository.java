package com.company.factory.sales.repository;

import com.company.factory.sales.domain.SalesOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SalesOrderRepository extends JpaRepository<SalesOrder, Long>, JpaSpecificationExecutor<SalesOrder> {
    Optional<SalesOrder> findBySoNo(String soNo);
    boolean existsBySoNo(String soNo);
    List<SalesOrder> findByStatus(String status);
    long countByStatus(String status);

    @Query("SELECT COUNT(so) FROM SalesOrder so WHERE so.status IN ('CONFIRMED', 'DRAFT')")
    long countOpenSalesOrders();
}
