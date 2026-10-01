package com.company.factory.supplier.mapper;

import com.company.factory.supplier.domain.Supplier;
import com.company.factory.supplier.dto.CreateSupplierRequest;
import com.company.factory.supplier.dto.SupplierDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SupplierMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Supplier toEntity(CreateSupplierRequest request);

    SupplierDto toDto(Supplier supplier);
}
