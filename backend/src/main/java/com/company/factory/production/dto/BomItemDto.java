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
public class BomItemDto {
    private Long id;
    private Long materialId;
    private String materialCode;
    private String materialNameEn;
    private String materialUnitCode;
    private BigDecimal quantity;
    private BigDecimal scrapRate;
}
