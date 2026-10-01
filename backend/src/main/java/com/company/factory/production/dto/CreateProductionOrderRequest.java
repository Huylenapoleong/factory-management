package com.company.factory.production.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
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
public class CreateProductionOrderRequest {

    private String moNo;

    @NotNull(message = "Product ID is required")
    private Long productId;

    private Long bomId;
    private Long routingId;

    @NotNull(message = "Planned quantity is required")
    @DecimalMin(value = "0.0001", message = "Planned quantity must be greater than zero")
    private BigDecimal plannedQuantity;

    private LocalDate startDate;
    private LocalDate dueDate;
}
