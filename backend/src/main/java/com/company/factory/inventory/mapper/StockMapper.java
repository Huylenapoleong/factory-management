package com.company.factory.inventory.mapper;

import com.company.factory.inventory.domain.InventoryBalance;
import com.company.factory.inventory.domain.StockTransaction;
import com.company.factory.inventory.dto.InventoryBalanceDto;
import com.company.factory.inventory.dto.StockTransactionDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;

@Mapper(componentModel = "spring")
public interface StockMapper {

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "warehouseNameEn", source = "warehouse.nameEn")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "locationCode", source = "location.code")
    @Mapping(target = "itemId", source = "item.id")
    @Mapping(target = "itemCode", source = "item.code")
    @Mapping(target = "itemNameEn", source = "item.nameEn")
    @Mapping(target = "itemUnitCode", source = "item.unit.code")
    @Mapping(target = "minStock", source = "item.minStock")
    @Mapping(target = "availableQuantity", expression = "java(balance.computeAvailableQuantity())")
    @Mapping(target = "isLowStock", expression = "java(isLowStock(balance))")
    InventoryBalanceDto toBalanceDto(InventoryBalance balance);

    default Boolean isLowStock(InventoryBalance balance) {
        if (balance == null || balance.getItem() == null || balance.getItem().getMinStock() == null) {
            return false;
        }
        BigDecimal available = balance.computeAvailableQuantity();
        return available.compareTo(balance.getItem().getMinStock()) <= 0;
    }

    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "locationCode", source = "location.code")
    @Mapping(target = "itemId", source = "item.id")
    @Mapping(target = "itemCode", source = "item.code")
    @Mapping(target = "itemNameEn", source = "item.nameEn")
    @Mapping(target = "createdByUsername", source = "createdBy.username")
    StockTransactionDto toTransactionDto(StockTransaction transaction);
}
