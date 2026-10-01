package com.company.factory.sales.dto;

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
public class DeliveryDto {
    private Long id;
    private String deliveryNo;
    private Long salesOrderId;
    private String soNo;
    private Long customerId;
    private String customerName;
    private Long warehouseId;
    private String warehouseCode;
    private String warehouseNameEn;
    private LocalDate deliveryDate;
    private String status;
    private String note;
    private String createdByUsername;
    private Instant createdAt;
    private List<DeliveryItemDto> items;
}
