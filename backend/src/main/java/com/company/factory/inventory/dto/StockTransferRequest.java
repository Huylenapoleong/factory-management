package com.company.factory.inventory.dto;

import jakarta.validation.constraints.DecimalMin;
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
public class StockTransferRequest {

    @NotNull(message = "Source warehouse ID is required")
    private Long fromWarehouseId;

    private Long fromLocationId;

    @NotNull(message = "Destination warehouse ID is required")
    private Long toWarehouseId;

    private Long toLocationId;

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Transfer quantity is required")
    @DecimalMin(value = "0.0001", message = "Transfer quantity must be greater than zero")
    private BigDecimal quantity;

    private String note;
}
