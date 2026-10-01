package com.company.factory.reporting.dto;

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
public class ProductionProgressDto {
    private Long moId;
    private String moNo;
    private String productCode;
    private String productName;
    private BigDecimal plannedQuantity;
    private BigDecimal completedQuantity;
    private double progressPercentage;
    private String status;
    private LocalDate dueDate;
}
