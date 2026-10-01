package com.company.factory.purchasing.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoodsReceiptDto {
    private Long id;
    private String receiptNo;
    private Long purchaseOrderId;
    private String poNo;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseNameEn;
    private LocalDate receiptDate;
    private String status;
    private String note;
    private String createdByUsername;
    private Instant createdAt;
    private List<GoodsReceiptItemDto> items;
}
