package com.company.factory.purchasing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptItemDto {
    private Long id;
    private Long itemId;
    private String itemCode;
    private String itemNameEn;
    private String itemUnitCode;
    private Long locationId;
    private String locationCode;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
}
