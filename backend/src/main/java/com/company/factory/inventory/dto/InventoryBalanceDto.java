package com.company.factory.inventory.dto;

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
public class InventoryBalanceDto {
    private Long id;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseNameEn;
    private Long locationId;
    private String locationCode;
    private Long itemId;
    private String itemCode;
    private String itemNameEn;
    private String itemUnitCode;
    private BigDecimal quantity;
    private BigDecimal reservedQuantity;
    private BigDecimal availableQuantity;
    private BigDecimal minStock;
    private Boolean isLowStock;
    private Instant updatedAt;
}
