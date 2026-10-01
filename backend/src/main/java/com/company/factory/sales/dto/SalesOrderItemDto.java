package com.company.factory.sales.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesOrderItemDto {
    private Long id;
    private Long itemId;
    private String itemCode;
    private String itemNameEn;
    private String itemUnitCode;
    private BigDecimal quantity;
    private BigDecimal deliveredQuantity;
    private BigDecimal unitPrice;
    private BigDecimal amount;
}
