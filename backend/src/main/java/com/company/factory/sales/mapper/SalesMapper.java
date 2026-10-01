package com.company.factory.sales.mapper;

import com.company.factory.sales.domain.Delivery;
import com.company.factory.sales.domain.DeliveryItem;
import com.company.factory.sales.domain.SalesOrder;
import com.company.factory.sales.domain.SalesOrderItem;
import com.company.factory.sales.dto.DeliveryDto;
import com.company.factory.sales.dto.DeliveryItemDto;
import com.company.factory.sales.dto.SalesOrderDto;
import com.company.factory.sales.dto.SalesOrderItemDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface SalesMapper {

    @Mapping(target = "customerId", source = "customer.id")
    @Mapping(target = "customerCode", source = "customer.code")
    @Mapping(target = "customerName", source = "customer.name")
    @Mapping(target = "createdByUsername", source = "createdBy.username")
    SalesOrderDto toSoDto(SalesOrder so);

    @Mapping(target = "itemId", source = "item.id")
    @Mapping(target = "itemCode", source = "item.code")
    @Mapping(target = "itemNameEn", source = "item.nameEn")
    @Mapping(target = "itemUnitCode", source = "item.unit.code")
    SalesOrderItemDto toSoItemDto(SalesOrderItem item);

    @Mapping(target = "salesOrderId", source = "salesOrder.id")
    @Mapping(target = "soNo", source = "salesOrder.soNo")
    @Mapping(target = "customerId", source = "salesOrder.customer.id")
    @Mapping(target = "customerName", source = "salesOrder.customer.name")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "warehouseNameEn", source = "warehouse.nameEn")
    @Mapping(target = "createdByUsername", source = "createdBy.username")
    DeliveryDto toDeliveryDto(Delivery delivery);

    @Mapping(target = "itemId", source = "item.id")
    @Mapping(target = "itemCode", source = "item.code")
    @Mapping(target = "itemNameEn", source = "item.nameEn")
    @Mapping(target = "itemUnitCode", source = "item.unit.code")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "locationCode", source = "location.code")
    DeliveryItemDto toDeliveryItemDto(DeliveryItem item);
}
