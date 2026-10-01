package com.company.factory.production.dto;

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
public class ProductionCompleteRequest {

    @NotNull(message = "Destination warehouse ID is required")
    private Long warehouseId;

    private Long locationId;

    @NotNull(message = "Completed finished goods quantity is required")
    @DecimalMin(value = "0.0001", message = "Completed quantity must be greater than zero")
    private BigDecimal completedQuantity;

    @Builder.Default
    private BigDecimal scrapQuantity = BigDecimal.ZERO;

    private String note;
}
