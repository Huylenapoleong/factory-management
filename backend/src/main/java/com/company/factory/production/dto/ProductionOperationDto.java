package com.company.factory.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductionOperationDto {
    private Long id;
    private Integer sequenceNo;
    private String operationCode;
    private String operationNameEn;
    private String operationNameZh;
    private BigDecimal targetQuantity;
    private BigDecimal completedQuantity;
    private BigDecimal scrapQuantity;
    private String status;
}
