package com.company.factory.inventory.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockAdjustmentRequest {

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    private Long locationId;

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Quantity difference is required")
    private BigDecimal quantity; // positive for addition, negative for reduction

    private BigDecimal unitPrice;

    private String note;
}
