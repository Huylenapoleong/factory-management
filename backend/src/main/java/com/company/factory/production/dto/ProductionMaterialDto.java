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
public class ProductionMaterialDto {
    private Long id;
    private Long materialId;
    private String materialCode;
    private String materialNameEn;
    private String materialUnitCode;
    private BigDecimal requiredQuantity;
    private BigDecimal issuedQuantity;
    private BigDecimal remainingQuantity;
}
