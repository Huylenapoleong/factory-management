package com.company.factory.production.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBomRequest {

    @NotBlank(message = "BOM code is required")
    @Size(max = 50, message = "BOM code max 50 characters")
    private String code;

    @NotNull(message = "Product item ID is required")
    private Long productId;

    @Builder.Default
    private String version = "1.0";

    @Builder.Default
    private String status = "ACTIVE";

    private LocalDate effectiveFrom;
    private LocalDate effectiveTo;

    @NotEmpty(message = "BOM must have at least one component")
    @Valid
    private List<CreateBomItemRequest> items;
}
