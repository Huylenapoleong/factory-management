package com.company.factory.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionOrderDto {
    private Long id;
    private String moNo;
    private Long productId;
    private String productCode;
    private String productNameEn;
    private String productUnitCode;
    private Long bomId;
    private String bomCode;
    private Long routingId;
    private String routingCode;
    private BigDecimal plannedQuantity;
    private BigDecimal completedQuantity;
    private BigDecimal scrapQuantity;
    private String status;
    private LocalDate startDate;
    private LocalDate dueDate;
    private String createdByUsername;
    private Instant createdAt;
    private Instant updatedAt;
    private List<ProductionMaterialDto> materials;
    private List<ProductionOperationDto> operations;
}
