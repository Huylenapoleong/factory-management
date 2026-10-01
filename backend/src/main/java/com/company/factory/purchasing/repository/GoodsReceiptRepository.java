package com.company.factory.purchasing.repository;

import com.company.factory.purchasing.domain.GoodsReceipt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;

public interface GoodsReceiptRepository extends JpaRepository<GoodsReceipt, Long>, JpaSpecificationExecutor<GoodsReceipt> {
    Optional<GoodsReceipt> findByReceiptNo(String receiptNo);
    boolean existsByReceiptNo(String receiptNo);
}
