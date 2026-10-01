package com.company.factory.masterdata.dto;

import com.company.factory.masterdata.domain.ItemType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemDto {
    private Long id;
    private String code;
    private String nameEn;
    private String nameZh;
    private ItemType type;
    private Long categoryId;
    private String categoryName;
    private Long unitId;
    private String unitCode;
    private BigDecimal purchasePrice;
    private BigDecimal salePrice;
    private BigDecimal minStock;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
}
