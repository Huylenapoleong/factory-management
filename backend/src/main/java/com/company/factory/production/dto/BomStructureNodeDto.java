package com.company.factory.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BomStructureNodeDto {
    private Long itemId;
    private String itemCode;
    private String itemNameEn;
    private String itemNameZh;
    private String unitCode;
    private String makeOrBuy;
    private BigDecimal quantityPer;
    private BigDecimal scrapRate;
    private BigDecimal requiredQuantity;
    private BigDecimal makeQuantity;
    private List<BomStructureNodeDto> children;
}
