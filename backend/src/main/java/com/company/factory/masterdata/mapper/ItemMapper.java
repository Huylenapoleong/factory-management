package com.company.factory.masterdata.mapper;

import com.company.factory.masterdata.domain.Item;
import com.company.factory.masterdata.domain.ItemCategory;
import com.company.factory.masterdata.domain.UnitOfMeasurement;
import com.company.factory.masterdata.dto.CreateItemRequest;
import com.company.factory.masterdata.dto.ItemCategoryDto;
import com.company.factory.masterdata.dto.ItemDto;
import com.company.factory.masterdata.dto.UnitOfMeasurementDto;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ItemMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "unit", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Item toEntity(CreateItemRequest request);

    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.nameEn")
    @Mapping(target = "unitId", source = "unit.id")
    @Mapping(target = "unitCode", source = "unit.code")
    ItemDto toDto(Item item);

    ItemCategoryDto toCategoryDto(ItemCategory category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    ItemCategory toCategoryEntity(ItemCategoryDto dto);

    UnitOfMeasurementDto toUnitDto(UnitOfMeasurement unit);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    UnitOfMeasurement toUnitEntity(UnitOfMeasurementDto dto);
}
