package com.company.factory.production.mapper;

import com.company.factory.production.domain.*;
import com.company.factory.production.dto.*;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface ProductionMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productNameEn", source = "product.nameEn")
    BomDto toBomDto(Bom bom);

    @Mapping(target = "materialId", source = "material.id")
    @Mapping(target = "materialCode", source = "material.code")
    @Mapping(target = "materialNameEn", source = "material.nameEn")
    @Mapping(target = "materialUnitCode", source = "material.unit.code")
    BomItemDto toBomItemDto(BomItem item);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productNameEn", source = "product.nameEn")
    RoutingDto toRoutingDto(Routing routing);

    RoutingStepDto toRoutingStepDto(RoutingStep step);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.code")
    @Mapping(target = "productNameEn", source = "product.nameEn")
    @Mapping(target = "productUnitCode", source = "product.unit.code")
    @Mapping(target = "bomId", source = "bom.id")
    @Mapping(target = "bomCode", source = "bom.code")
    @Mapping(target = "routingId", source = "routing.id")
    @Mapping(target = "routingCode", source = "routing.code")
    @Mapping(target = "createdByUsername", source = "createdBy.username")
    ProductionOrderDto toMoDto(ProductionOrder mo);

    @Mapping(target = "materialId", source = "material.id")
    @Mapping(target = "materialCode", source = "material.code")
    @Mapping(target = "materialNameEn", source = "material.nameEn")
    @Mapping(target = "materialUnitCode", source = "material.unit.code")
    @Mapping(target = "remainingQuantity", expression = "java(computeRemaining(material))")
    ProductionMaterialDto toMaterialDto(ProductionMaterial material);

    default BigDecimal computeRemaining(ProductionMaterial material) {
        if (material == null || material.getRequiredQuantity() == null) return BigDecimal.ZERO;
        BigDecimal issued = material.getIssuedQuantity() != null ? material.getIssuedQuantity() : BigDecimal.ZERO;
        return material.getRequiredQuantity().subtract(issued).max(BigDecimal.ZERO);
    }

    ProductionOperationDto toOperationDto(ProductionOperation operation);
}
