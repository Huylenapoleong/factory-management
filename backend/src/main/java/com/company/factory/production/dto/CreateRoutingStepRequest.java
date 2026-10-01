package com.company.factory.production.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoutingStepRequest {

    @NotNull(message = "Sequence number is required")
    @Min(value = 1, message = "Sequence number must be at least 1")
    private Integer sequenceNo;

    @NotBlank(message = "Operation code is required")
    @Size(max = 50, message = "Operation code max 50 characters")
    private String operationCode;

    @NotBlank(message = "English operation name is required")
    @Size(max = 100, message = "Operation name max 100 characters")
    private String operationNameEn;

    private String operationNameZh;

    @Builder.Default
    private Integer standardTime = 0; // minutes
}
