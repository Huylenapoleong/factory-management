package com.company.factory.inventory.dto;

import com.company.factory.inventory.domain.WarehouseType;
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
public class CreateWarehouseRequest {

    @NotBlank(message = "Warehouse code is required")
    @Size(max = 50, message = "Warehouse code max 50 characters")
    private String code;

    @NotBlank(message = "Warehouse English name is required")
    @Size(max = 150, message = "Warehouse name max 150 characters")
    private String nameEn;

    private String nameZh;

    @NotNull(message = "Warehouse type is required")
    private WarehouseType type;

    private String address;

    @Builder.Default
    private String status = "ACTIVE";
}
