package com.company.factory.production.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoutingStepDto {
    private Long id;
    private Integer sequenceNo;
    private String operationCode;
    private String operationNameEn;
    private String operationNameZh;
    private Integer standardTime;
}
