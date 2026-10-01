package com.company.factory.purchasing.mapper;

import com.company.factory.purchasing.domain.GoodsReceipt;
import com.company.factory.purchasing.domain.GoodsReceiptItem;
import com.company.factory.purchasing.domain.PurchaseOrder;
import com.company.factory.purchasing.domain.PurchaseOrderItem;
import com.company.factory.purchasing.dto.GoodsReceiptDto;
import com.company.factory.purchasing.dto.GoodsReceiptItemDto;
import com.company.factory.purchasing.dto.PurchaseOrderDto;
import com.company.factory.purchasing.dto.PurchaseOrderItemDto;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PurchasingMapper {

    @Mapping(target = "supplierId", source = "supplier.id")
    @Mapping(target = "supplierCode", source = "supplier.code")
    @Mapping(target = "supplierName", source = "supplier.name")
    @Mapping(target = "createdByUsername", source = "createdBy.username")
    PurchaseOrderDto toPoDto(PurchaseOrder po);

    @Mapping(target = "itemId", source = "item.id")
    @Mapping(target = "itemCode", source = "item.code")
    @Mapping(target = "itemNameEn", source = "item.nameEn")
    @Mapping(target = "itemUnitCode", source = "item.unit.code")
    PurchaseOrderItemDto toPoItemDto(PurchaseOrderItem item);

    @Mapping(target = "purchaseOrderId", source = "purchaseOrder.id")
    @Mapping(target = "poNo", source = "purchaseOrder.poNo")
    @Mapping(target = "warehouseId", source = "warehouse.id")
    @Mapping(target = "warehouseCode", source = "warehouse.code")
    @Mapping(target = "warehouseNameEn", source = "warehouse.nameEn")
    @Mapping(target = "createdByUsername", source = "createdBy.username")
    GoodsReceiptDto toReceiptDto(GoodsReceipt receipt);

    @Mapping(target = "itemId", source = "item.id")
    @Mapping(target = "itemCode", source = "item.code")
    @Mapping(target = "itemNameEn", source = "item.nameEn")
    @Mapping(target = "itemUnitCode", source = "item.unit.code")
    @Mapping(target = "locationId", source = "location.id")
    @Mapping(target = "locationCode", source = "location.code")
    GoodsReceiptItemDto toReceiptItemDto(GoodsReceiptItem item);
}
