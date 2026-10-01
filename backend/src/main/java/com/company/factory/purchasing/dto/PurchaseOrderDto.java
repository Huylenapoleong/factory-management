package com.company.factory.purchasing.dto;

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
public class PurchaseOrderDto {
    private Long id;
    private String poNo;
    private Long supplierId;
    private String supplierCode;
    private String supplierName;
    private LocalDate orderDate;
    private LocalDate expectedDate;
    private String status;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private String note;
    private String createdByUsername;
    private Instant createdAt;
    private Instant updatedAt;
    private List<PurchaseOrderItemDto> items;
}
