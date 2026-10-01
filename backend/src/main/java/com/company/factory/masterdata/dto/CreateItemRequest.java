package com.company.factory.masterdata.dto;

import com.company.factory.masterdata.domain.ItemType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateItemRequest {

    @NotBlank(message = "Item code is required")
    @Size(max = 50, message = "Item code max 50 characters")
    private String code;

    @NotBlank(message = "Item English name is required")
    @Size(max = 200, message = "Item English name max 200 characters")
    private String nameEn;

    private String nameZh;

    @NotNull(message = "Item type is required")
    private ItemType type;

    private Long categoryId;
    private Long unitId;

    @Builder.Default
    private BigDecimal purchasePrice = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal salePrice = BigDecimal.ZERO;

    @Builder.Default
    private BigDecimal minStock = BigDecimal.ZERO;

    @Builder.Default
    private String status = "ACTIVE";
}
