package com.company.factory.production.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OperationReportRequest {

    @NotNull(message = "Completed quantity is required")
    @DecimalMin(value = "0.0", message = "Completed quantity cannot be negative")
    private BigDecimal completedQuantity;

    @Builder.Default
    private BigDecimal scrapQuantity = BigDecimal.ZERO;
}
