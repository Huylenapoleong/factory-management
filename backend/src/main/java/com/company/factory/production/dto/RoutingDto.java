package com.company.factory.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutingDto {
    private Long id;
    private String code;
    private Long productId;
    private String productCode;
    private String productNameEn;
    private String version;
    private String status;
    private Instant createdAt;
    private Instant updatedAt;
    private List<RoutingStepDto> steps;
}
