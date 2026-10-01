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
public class MaterialIssueRequest {

    @NotNull(message = "Production order ID is required")
    private Long productionOrderId;

    @NotNull(message = "Warehouse ID is required")
    private Long warehouseId;

    private Long locationId;

    @NotNull(message = "Material item ID is required")
    private Long materialId;

    @NotNull(message = "Quantity to issue is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be greater than zero")
    private BigDecimal quantity;

    private String note;
}
