package com.company.factory.inventory.repository;

import com.company.factory.inventory.domain.StockTransaction;
import com.company.factory.inventory.domain.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface StockTransactionRepository extends JpaRepository<StockTransaction, Long>, JpaSpecificationExecutor<StockTransaction> {
    Page<StockTransaction> findByWarehouseId(Long warehouseId, Pageable pageable);
    Page<StockTransaction> findByItemId(Long itemId, Pageable pageable);
    Page<StockTransaction> findByTransactionType(TransactionType type, Pageable pageable);
    List<StockTransaction> findTop10ByOrderByCreatedAtDesc();
}
