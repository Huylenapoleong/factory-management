package com.company.factory.sales.dto;

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
public class CreateSalesOrderItemRequest {

    @NotNull(message = "Item ID is required")
    private Long itemId;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    @NotNull(message = "Unit price is required")
    @DecimalMin(value = "0.0", message = "Unit price cannot be negative")
    private BigDecimal unitPrice;
}
