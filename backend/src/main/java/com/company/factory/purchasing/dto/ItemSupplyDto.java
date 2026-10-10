package com.company.factory.purchasing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemSupplyDto {
    private Long itemId;
    private BigDecimal onOrderQuantity;
    private LocalDate nextExpectedDate;
    private Long lastSupplierId;
    private String lastSupplierName;
    private BigDecimal lastUnitPrice;
    private Integer leadTimeDays;
}
