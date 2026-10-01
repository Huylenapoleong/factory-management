package com.company.factory.inventory.mapper;

import com.company.factory.inventory.domain.Warehouse;
import com.company.factory.inventory.domain.WarehouseLocation;
import com.company.factory.inventory.dto.CreateLocationRequest;
import com.company.factory.inventory.dto.CreateWarehouseRequest;
import com.company.factory.inventory.dto.WarehouseDto;
import com.company.factory.inventory.dto.WarehouseLocationDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WarehouseMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "locations", ignore = true)
    Warehouse toEntity(CreateWarehouseRequest request);

    WarehouseDto toDto(Warehouse warehouse);

    @Mapping(target = "warehouseId", source = "warehouse.id")
    WarehouseLocationDto toLocationDto(WarehouseLocation location);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "warehouse", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    WarehouseLocation toLocationEntity(CreateLocationRequest request);
}
