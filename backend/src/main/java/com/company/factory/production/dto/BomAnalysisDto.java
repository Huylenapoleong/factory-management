package com.company.factory.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BomAnalysisDto {
    private Long bomId;
    private String bomCode;
    private String version;
    private String status;
    private Long productId;
    private String productCode;
    private String productNameEn;
    private String productNameZh;
    private String productUnitCode;
    private Long productImageVersion;
    private BigDecimal plannedQuantity;
    private LocalDate startDate;
    private Long bottleneckMaterialId;
    private String bottleneckMaterialNameEn;
    private String bottleneckMaterialNameZh;
    private int toOrderCount;
    private BigDecimal totalMaterialCost;
    private BigDecimal totalScrapCost;
    private BigDecimal costPerUnit;
    private BigDecimal maxBuildableQuantity;
    private int sufficientCount;
    private int lowCount;
    private int shortageCount;
    private int makeCount;
    private int levelCount;
    private List<BomAnalysisLineDto> lines;
    private BomStructureNodeDto structure;
}
