package com.company.factory.production.dto;

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
public class BomDto {
    private Long id;
    private String code;
    private Long productId;
    private String productCode;
    private String productNameEn;
    private String version;
    private String status;
    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;
    private Instant createdAt;
    private Instant updatedAt;
    private List<BomItemDto> items;
}
