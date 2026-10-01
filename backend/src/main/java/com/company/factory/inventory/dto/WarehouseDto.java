package com.company.factory.inventory.dto;

import com.company.factory.inventory.domain.WarehouseType;
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
public class WarehouseDto {
    private Long id;
    private String code;
    private String nameEn;
    private String nameZh;
    private WarehouseType type;
    private String address;
    private String status;
    private Instant createdAt;
    private List<WarehouseLocationDto> locations;
}
