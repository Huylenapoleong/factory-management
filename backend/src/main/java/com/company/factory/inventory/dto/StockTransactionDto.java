package com.company.factory.inventory.dto;

import com.company.factory.inventory.domain.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockTransactionDto {
    private Long id;
    private String transactionNo;
    private TransactionType transactionType;
    private Long itemId;
    private String itemCode;
    private String itemNameEn;
    private Long warehouseId;
    private String warehouseCode;
    private Long locationId;
    private String locationCode;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private String referenceType;
    private String referenceId;
    private String note;
    private String createdByUsername;
    private Instant createdAt;
}
