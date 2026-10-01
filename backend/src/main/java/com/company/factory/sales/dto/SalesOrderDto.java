package com.company.factory.sales.dto;

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
public class SalesOrderDto {
    private Long id;
    private String soNo;
    private Long customerId;
    private String customerCode;
    private String customerName;
    private LocalDate orderDate;
    private LocalDate expectedDeliveryDate;
    private String status;
    private String currency;
    private BigDecimal subtotal;
    private BigDecimal totalAmount;
    private String note;
    private String createdByUsername;
    private Instant createdAt;
    private Instant updatedAt;
    private List<SalesOrderItemDto> items;
}
