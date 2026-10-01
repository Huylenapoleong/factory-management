package com.company.factory.inventory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WarehouseLocationDto {
    private Long id;
    private Long warehouseId;

    @NotBlank(message = "Location code is required")
    @Size(max = 50, message = "Location code max 50 characters")
    private String code;

    private String name;
    private String status;
    private Instant createdAt;
}
