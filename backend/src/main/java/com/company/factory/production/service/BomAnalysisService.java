package com.company.factory.production.service;

import com.company.factory.common.exception.BusinessException;
import com.company.factory.inventory.service.InventoryService;
import com.company.factory.masterdata.domain.Item;
import com.company.factory.production.domain.Bom;
import com.company.factory.production.domain.BomItem;
import com.company.factory.production.dto.BomAnalysisDto;
import com.company.factory.production.dto.BomAnalysisLineDto;
import com.company.factory.production.repository.BomRepository;
import com.company.factory.purchasing.dto.ItemSupplyDto;
import com.company.factory.purchasing.service.PurchaseOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static com.company.factory.production.dto.BomAnalysisLineDto.*;

@Service
@RequiredArgsConstructor
public class BomAnalysisService {

    private static final int QTY_SCALE = 4;
    private static final int MONEY_SCALE = 2;
    private static final BigDecimal HUNDRED = BigDecimal.valueOf(100);

    private final BomRepository bomRepository;
    private final InventoryService inventoryService;
    private final PurchaseOrderService purchaseOrderService;

    @Transactional(readOnly = true)
    public BomAnalysisDto analyze(Long bomId, BigDecimal plannedQuantity, LocalDate startDate) {
        if (plannedQuantity == null || plannedQuantity.signum() <= 0) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "INVALID_QUANTITY", "Planned quantity must be greater than zero");
        }

        Bom bom = bomRepository.findById(bomId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "BOM_NOT_FOUND", "BOM not found: " + bomId));

        LocalDate today = LocalDate.now();
        LocalDate needBy = startDate != null ? startDate : today;

        List<Long> materialIds = bom.getItems().stream()
                .map(item -> item.getMaterial().getId())
                .distinct()
                .toList();
        Map<Long, BigDecimal> available = inventoryService.getAvailableQuantities(materialIds);
        Map<Long, ItemSupplyDto> supply = purchaseOrderService.getItemSupply(materialIds);

        List<BomAnalysisLineDto> lines = bom.getItems().stream()
                .map(item -> {
                    Long materialId = item.getMaterial().getId();
                    return toLine(item, plannedQuantity, available.getOrDefault(materialId, BigDecimal.ZERO),
                            supply.get(materialId), needBy, today);
                })
                .toList();

        BigDecimal totalCost = lines.stream().map(BomAnalysisLineDto::getLineCost).reduce(BigDecimal.ZERO, BigDecimal::add);
        BigDecimal totalScrapCost = lines.stream().map(BomAnalysisLineDto::getScrapCost).reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal maxBuildable = null;
        BomItem bottleneck = null;
        for (BomItem item : bom.getItems()) {
            BigDecimal perUnit = item.requiredQuantityFor(BigDecimal.ONE);
            if (perUnit.signum() <= 0) {
                continue;
            }
            BigDecimal usable = available.getOrDefault(item.getMaterial().getId(), BigDecimal.ZERO).max(BigDecimal.ZERO);
            BigDecimal buildable = usable.divide(perUnit, 0, RoundingMode.FLOOR);
            if (maxBuildable == null || buildable.compareTo(maxBuildable) < 0) {
                maxBuildable = buildable;
                bottleneck = item;
            }
        }

        Item product = bom.getProduct();
        return BomAnalysisDto.builder()
                .bomId(bom.getId())
                .bomCode(bom.getCode())
                .version(bom.getVersion())
                .status(bom.getStatus())
                .productId(product.getId())
                .productCode(product.getCode())
                .productNameEn(product.getNameEn())
                .productNameZh(product.getNameZh())
                .productUnitCode(product.getUnit() != null ? product.getUnit().getCode() : null)
                .plannedQuantity(plannedQuantity)
                .startDate(needBy)
                .totalMaterialCost(totalCost)
                .totalScrapCost(totalScrapCost)
                .costPerUnit(totalCost.divide(plannedQuantity, QTY_SCALE, RoundingMode.HALF_UP))
                .maxBuildableQuantity(maxBuildable != null ? maxBuildable : BigDecimal.ZERO)
                .bottleneckBomItemId(bottleneck != null ? bottleneck.getId() : null)
                .bottleneckMaterialNameEn(bottleneck != null ? bottleneck.getMaterial().getNameEn() : null)
                .bottleneckMaterialNameZh(bottleneck != null ? bottleneck.getMaterial().getNameZh() : null)
                .sufficientCount(count(lines, STATUS_SUFFICIENT))
                .lowCount(count(lines, STATUS_LOW))
                .shortageCount(count(lines, STATUS_SHORTAGE))
                .toOrderCount((int) lines.stream().filter(l -> PROCUREMENT_TO_ORDER.equals(l.getProcurementStatus())).count())
                .lines(lines)
                .build();
    }

    private BomAnalysisLineDto toLine(BomItem item, BigDecimal plannedQuantity, BigDecimal availableQty,
                                      ItemSupplyDto supply, LocalDate needBy, LocalDate today) {
        Item material = item.getMaterial();
        BigDecimal required = item.requiredQuantityFor(plannedQuantity).setScale(QTY_SCALE, RoundingMode.HALF_UP);
        BigDecimal netRequired = plannedQuantity.multiply(item.getQuantity());
        BigDecimal unitCost = material.getPurchasePrice() != null ? material.getPurchasePrice() : BigDecimal.ZERO;
        BigDecimal minStock = material.getMinStock() != null ? material.getMinStock() : BigDecimal.ZERO;
        BigDecimal usable = availableQty.max(BigDecimal.ZERO);
        BigDecimal shortage = required.subtract(usable).max(BigDecimal.ZERO);

        String status;
        if (shortage.signum() > 0) {
            status = STATUS_SHORTAGE;
        } else if (usable.subtract(required).compareTo(minStock) < 0) {
            status = STATUS_LOW;
        } else {
            status = STATUS_SUFFICIENT;
        }

        BigDecimal coverage = required.signum() == 0
                ? HUNDRED
                : usable.multiply(HUNDRED).divide(required, 1, RoundingMode.HALF_UP).min(HUNDRED);

        BigDecimal onOrder = supply != null ? supply.getOnOrderQuantity() : BigDecimal.ZERO;
        BigDecimal orderQty = shortage.subtract(onOrder).max(BigDecimal.ZERO).setScale(0, RoundingMode.CEILING);
        Integer leadTime = supply != null ? supply.getLeadTimeDays() : null;
        LocalDate orderBy = needBy.minusDays(leadTime != null ? leadTime : 0);
        LocalDate expectedArrival = supply != null ? supply.getNextExpectedDate() : null;

        String procurement;
        String urgency = null;
        if (shortage.signum() == 0) {
            procurement = PROCUREMENT_COVERED;
        } else if (orderQty.signum() == 0) {
            procurement = PROCUREMENT_ORDERED;
            if (expectedArrival != null && expectedArrival.isAfter(needBy)) {
                urgency = URGENCY_LATE;
            }
        } else {
            procurement = PROCUREMENT_TO_ORDER;
            urgency = orderBy.isBefore(today) ? URGENCY_LATE : orderBy.isEqual(today) ? URGENCY_TODAY : URGENCY_UPCOMING;
        }

        return BomAnalysisLineDto.builder()
                .bomItemId(item.getId())
                .materialId(material.getId())
                .materialCode(material.getCode())
                .materialNameEn(material.getNameEn())
                .materialNameZh(material.getNameZh())
                .materialType(material.getType() != null ? material.getType().name() : null)
                .unitCode(material.getUnit() != null ? material.getUnit().getCode() : null)
                .unitQuantity(item.getQuantity())
                .scrapRate(item.getScrapRate() != null ? item.getScrapRate() : BigDecimal.ZERO)
                .requiredQuantity(required)
                .availableQuantity(availableQty)
                .minStock(minStock)
                .shortageQuantity(shortage)
                .surplusQuantity(usable.subtract(required).max(BigDecimal.ZERO))
                .coveragePercent(coverage)
                .status(status)
                .unitCost(unitCost)
                .lineCost(required.multiply(unitCost).setScale(MONEY_SCALE, RoundingMode.HALF_UP))
                .scrapCost(required.subtract(netRequired).multiply(unitCost).setScale(MONEY_SCALE, RoundingMode.HALF_UP))
                .onOrderQuantity(onOrder)
                .orderQuantity(orderQty)
                .procurementStatus(procurement)
                .urgency(urgency)
                .orderByDate(shortage.signum() > 0 ? orderBy : null)
                .expectedArrivalDate(expectedArrival)
                .supplierId(supply != null ? supply.getLastSupplierId() : null)
                .supplierName(supply != null ? supply.getLastSupplierName() : null)
                .leadTimeDays(leadTime)
                .build();
    }

    private int count(List<BomAnalysisLineDto> lines, String status) {
        return (int) lines.stream().filter(line -> status.equals(line.getStatus())).count();
    }
}
